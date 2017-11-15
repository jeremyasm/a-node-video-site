const path = require('path');
var fs = require("fs");
var ffmpeg = require('fluent-ffmpeg');
var logger = require('log4js').getLogger('video-clip-controller');

// GET /helloworld
module.exports.helloWorld = function(req, res) {
  res.send('Hello World!')
}

// GET /:inputFileName/byTime?startTimestamp=***&endTimestamp=***
module.exports.clipByTime = function(req, res, err) {

  logger.info("GET /:inputFileName/byTime?startTimestamp=***&endTimestamp=***");

  var inputFileName = req.params.inputFileName;
  var startTimestamp = req.query.startTimestamp ? req.query.startTimestamp : '00:00:03';
  var endTimestamp = ''; //TODO
  var duration = req.query.duration ? req.query.duration : 10;

  //TODO convert duration to endtime ?
  //moment ???

  //TODO validations
  // if file exists ?
  // if startTimestamp > video.length ?

  logger.info("inputFileName: " + inputFileName);
  logger.info("startTimestamp: " + startTimestamp);
  logger.info("endTimestamp: " + endTimestamp);
  logger.info("duration: " + duration);

  //TODO format the name of output file
  var str = startTimestamp.split(':')[0] + startTimestamp.split(':')[1] + startTimestamp.split(':')[2];
  // var str = ":33:332:231";
  var outputFileName  = inputFileName.split('.')[0] + '-clip-' + str + '+' + duration + '.mp4';
  // var outputFileName  = "output-sample.mp4";

  ffmpeg(path.resolve(process.env.VIDEO_INPUT_PATH, inputFileName))
    .setFfmpegPath(process.env.FFMPEG_PATH)
    // .videoCodec('libx264')
    // .audioCodec('libmp3lame')
    .setStartTime(startTimestamp)
    .setDuration(duration)
    // .size('256x240')
    .on('progress', function(info) {
      logger.info('progress ' + info.percent.toFixed(2) + '%');
    })
    .on('error', function(err) {
      logger.error('An error occurred: ' + err.message);
      res.status(500);
      res.json({
        message: err.message,
      }); // res.json end
    })
    .on('end', function() {
      logger.info('Processing finished !');
      res.status(200);
      res.json({
        message: 'Processing finished !',
        outputLocation: path.resolve(process.env.VIDEO_OUTPUT_PATH, outputFileName)
      }); // res.json end
    })
    .save(path.resolve(process.env.VIDEO_OUTPUT_PATH, outputFileName));

}

// GET /:inputFileName/byFrames?startFrame=***&endFrame=***
module.exports.clipByFrames = function(req, res, err) {

  logger.info("GET /:inputFileName/byFrames?startFrame=***&endFrame=***");

  var inputFileName = req.params.inputFileName;
  var startFrame = req.query.startFrame;
  var endFrame = req.query.endFrame;

  logger.info("startFrame: " + startFrame);
  logger.info("endFrame: " + endFrame);

  //TODO validations
  // if file exists ?

  var outputFileName  = inputFileName.split('.')[0] + '-frames-from' + startFrame + 'to' + endFrame + '.mp4';
  // var outputFileName  = "output-frame-test.mp4";

  // STEP 1. get frame rate from metadata of origin video using ffprobe
  ffmpeg.ffprobe(path.resolve(process.env.VIDEO_INPUT_PATH, inputFileName), function(err, metadata) {
    if (err) logger.error(err);
    var videoStreamObj = metadata.streams[0].codec_type === "video" ? metadata.streams[0] : metadata.streams[1];
    var originRFrameRateStr = videoStreamObj.r_frame_rate;
    var originRFrameRate = originRFrameRateStr.split('/')[0] / originRFrameRateStr.split('/')[1];
    var originAvgFrameRateStr = videoStreamObj.avg_frame_rate;
    var originAvgFrameRate =  originAvgFrameRateStr.split('/')[0] / originAvgFrameRateStr.split('/')[1];
    var originFrames = videoStreamObj.nb_frames;
    // logger.info(metadata);
    logger.info("r_frame_rate: " + originRFrameRateStr + " => " + originRFrameRate);
    logger.info("avg_frame_rate: " + originAvgFrameRateStr + " => " + originAvgFrameRate);
    logger.info("nb_frames: " + originFrames);

    // TODO validations
    // if (startFrame, endFrame) is out of the range of nb_frames ?

    var startTimestamp = startFrame / originAvgFrameRate;
    var duration = (endFrame - startFrame)  / originAvgFrameRate;

    logger.info("startTimestamp: " + startTimestamp);
    logger.info("duration: " + duration);

    // STEP 2. get video clip by startTimestamp and duration using ffmpeg
    ffmpeg(path.resolve(process.env.VIDEO_INPUT_PATH, inputFileName))
      .setFfmpegPath(process.env.FFMPEG_PATH)
      .setStartTime(startTimestamp)
      .setDuration(duration)
      .on('progress', function(info) {
        logger.info('progress ' + info.percent.toFixed(2) + '%' + ', ' + 'processed frames: ' + info.frames);
      })
      .on('error', function(err) {
        logger.error('An error occurred: ' + err.message);
        res.status(500);
        res.json({
          message: err.message,
        }); // res.json end
      })
      .on('end', function(stdout, stderr) {
        logger.info('Processing finished !');
        res.status(200);
        res.json({
          message: 'Processing finished !',
          outputLocation: path.resolve(process.env.VIDEO_OUTPUT_PATH, outputFileName)
        }); // res.json end
      })
      .save(path.resolve(process.env.VIDEO_OUTPUT_PATH, outputFileName));

  });

}

// GET /:inputFileName/frames
module.exports.getFrames = function(req, res, err) {

  logger.info("GET /:inputFileName/byFrames?startFrame=***&endFrame=***");

  var inputFileName = req.params.inputFileName;

  ffmpeg.ffprobe(path.resolve(process.env.VIDEO_INPUT_PATH, inputFileName), function(err, metadata) {
    if (err) logger.error(err);
    var videoStreamObj = metadata.streams[0].codec_type === "video" ? metadata.streams[0] : metadata.streams[1];
    var originRFrameRateStr = videoStreamObj.r_frame_rate;
    var originRFrameRate = originRFrameRateStr.split('/')[0] / originRFrameRateStr.split('/')[1];
    var originAvgFrameRateStr = videoStreamObj.avg_frame_rate;
    var originAvgFrameRate =  originAvgFrameRateStr.split('/')[0] / originAvgFrameRateStr.split('/')[1];
    var originFrames = videoStreamObj.nb_frames;
    logger.info(metadata);
    logger.info("r_frame_rate: " + originRFrameRateStr + " => " + originRFrameRate);
    logger.info("avg_frame_rate: " + originAvgFrameRateStr + " => " + originAvgFrameRate);
    logger.info("nb_frames: " + originFrames);
    res.status(200).json({
      "nb_frames" : originFrames
    }); // res.json end
  });
}

// GET /:fileName/select
module.exports.initSelectPage = function(req, res, err) {

  logger.info("GET /:fileName/select");

  var fileName = req.params.fileName;
  res.sendFile(path.resolve(__dirname + '/../public/select_highlights_type.html'));
}

// GET /:fileName/highlights?highlightsType=***
module.exports.getHighlightsFromVideo =  function(req, res, err) {

  logger.info("GET /:fileName/highlights?highlightsType=***");

  var fileName = req.params.fileName;
  var highlightsType = req.query.highlightsType;

  // TODO process video and get specific type of highlights, return a list of (startFrame, endFrame) tuples
  var framesArr = mockupImageIdentificationService(fileName, highlightsType);
  var tmpStart, tmpEnd, tmpStrArr;
  for(var i = 0; i < framesArr.length; i ++){
    tmpStrArr = framesArr[i].split('-');
    tmpStart = + tmpStrArr[0];
    tmpEnd = + tmpStrArr[1];
    getClipByFrames(fileName, tmpStart, tmpEnd);
  }

  // TODO return complete message when all the clips complete
  res.json({
    "fileName" : fileName,
    "highlightsType" : highlightsType
  });
}


function mockupImageIdentificationService(fileName, highlightsType){

  logger.info("mockupImageIdentificationService is processing video: ");
  logger.info("filename: " + fileName);
  logger.info("highlightsType: " + highlightsType);

  var framesArray = ["5-25", "50-59", "100-200"];
  return framesArray;
}

function getClipByFrames(inputFileName, startFrame, endFrame) {

  logger.info("getClipByFrames:");

  logger.info("inputFileName: " + inputFileName);
  logger.info("startFrame: " + startFrame);
  logger.info("endFrame: " + endFrame);

  var mark = inputFileName + "-" + "from" + startFrame + "to" + endFrame;

  //TODO validations
  // if file exists ?

  var outputFileName  = "HIGHLIGHTS-" + inputFileName.split('.')[0] + '-frames-from' + startFrame + 'to' + endFrame + '.mp4';
  // var outputFileName  = "output-frame-test.mp4";

  // STEP 1. get frame rate from metadata of origin video using ffprobe
  ffmpeg.ffprobe(path.resolve(process.env.FILE_UPLOAD_PATH, inputFileName), function(err, metadata) {
    if (err) logger.error(err);
    var videoStreamObj = metadata.streams[0].codec_type === "video" ? metadata.streams[0] : metadata.streams[1];
    var originRFrameRateStr = videoStreamObj.r_frame_rate;
    var originRFrameRate = originRFrameRateStr.split('/')[0] / originRFrameRateStr.split('/')[1];
    var originAvgFrameRateStr = videoStreamObj.avg_frame_rate;
    var originAvgFrameRate =  originAvgFrameRateStr.split('/')[0] / originAvgFrameRateStr.split('/')[1];
    var originFrames = videoStreamObj.nb_frames;
    // logger.info(metadata);
    logger.info("r_frame_rate: " + originRFrameRateStr + " => " + originRFrameRate);
    logger.info("avg_frame_rate: " + originAvgFrameRateStr + " => " + originAvgFrameRate);
    logger.info("nb_frames: " + originFrames);

    var startTimestamp = startFrame / originAvgFrameRate;
    var duration = (endFrame - startFrame)  / originAvgFrameRate;

    logger.info("startTimestamp: " + startTimestamp);
    logger.info("duration: " + duration);

    // STEP 2. get video clip by startTimestamp and duration using ffmpeg
    ffmpeg(path.resolve(process.env.FILE_UPLOAD_PATH, inputFileName))
      .setFfmpegPath(process.env.FFMPEG_PATH)
      .setStartTime(startTimestamp)
      .setDuration(duration)
      .on('progress', function(info) {
        logger.info(mark + ' ' + 'progress ' + info.percent.toFixed(2) + '%' + ', ' + 'processed frames: ' + info.frames);
      })
      .on('error', function(err) {
        logger.error(mark + ' ' + 'An error occurred: ' + err.message);
        // res.status(500);
        // res.json({
        //   message: err.message,
        // }); // res.json end
      })
      .on('end', function(stdout, stderr) {
        logger.info(mark + ' ' + 'Processing finished !');
        // res.status(200);
        // res.json({
        //   message: 'Processing finished !',
        //   outputLocation: path.resolve(process.env.VIDEO_OUTPUT_PATH, outputFileName)
        // }); // res.json end
      })
      .save(path.resolve(process.env.VIDEO_OUTPUT_PATH, outputFileName));

  });

}
