const path = require('path');
// const cutVideo = require('../util/video-cut');
var fs = require("fs");
var ffmpeg = require('fluent-ffmpeg');

module.exports.helloWorld = function(req, res) {
  res.send('Hello World!')
}

module.exports.clipByTime = function(req, res, err) {

  console.log("Get video clip by starttime and endtime ...");

  var inputFileName = req.params.inputFileName;
  var startTimestamp = req.query.startTimestamp ? req.query.startTimestamp : '00:00:03';
  var endTimestamp = ''; //TODO
  var duration = req.query.duration ? req.query.duration : 10;

  // var startTimestamp = '00:00:03';
  // var endTimestamp = '';
  // var duration = 11;
  // var inputFileName = 'sample.mp4';

  //TODO convert duration to endtime ?
  //moment ???

  //TODO validations
  // if file exists ?
  // if startTimestamp > video.length ?

  //TODO format the name of output file

  console.log("inputFileName: " + inputFileName);
  console.log("startTimestamp: " + startTimestamp);
  console.log("endTimestamp: " + endTimestamp);
  console.log("duration: " + duration);

  //TODO to be refined
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
      console.log('progress ' + info.percent.toFixed(2) + '%');
    })
    .on('error', function(err) {
      console.error('An error occurred: ' + err.message);
      res.status(500);
      res.json({
        message: err.message,
      }); // res.json end
    })
    .on('end', function() {
      console.log('Processing finished !');
      res.status(200);
      res.json({
        message: 'Processing finished !',
        outputLocation: path.resolve(process.env.VIDEO_OUTPUT_PATH, outputFileName)
      }); // res.json end
    })
    .save(path.resolve(process.env.VIDEO_OUTPUT_PATH, outputFileName));

}

// TODO
module.exports.clipByFrames = function(req, res, err) {

  console.log("Get video clip by start frame and end frame ...");

  var startFrame = req.query.startFrame;
  var endFrame = req.query.endFrame;

  var inputFileName = req.params.inputFileName;

  console.log("startFrame: " + startFrame);
  console.log("endFrame: " + endFrame);

  //TODO validations
  // if file exists ?
  // if startTimestamp > video.length ?

  var outputFileName  = inputFileName.split('.')[0] + '-frames-from' + startFrame + 'to' + endFrame + '.mp4';
  // var outputFileName  = "output-frame-test.mp4";

  // TODO how to get the originial frame count ???
  // var frameCount = ffmpeg(path.resolve(process.env.VIDEO_INPUT_PATH, inputFileName));

  ffmpeg.ffprobe(path.resolve(process.env.VIDEO_INPUT_PATH, inputFileName), function(err, metadata) {
    if (err) console.log(err);
    var videoStreamObj = metadata.streams[0].codec_type === "video" ? metadata.streams[0] : metadata.streams[1];
    var originRFrameRateStr = videoStreamObj.r_frame_rate;
    var originRFrameRate = originRFrameRateStr.split('/')[0] / originRFrameRateStr.split('/')[1];
    var originAvgFrameRateStr = videoStreamObj.avg_frame_rate;
    var originAvgFrameRate =  originAvgFrameRateStr.split('/')[0] / originAvgFrameRateStr.split('/')[1];
    var originFrames = videoStreamObj.nb_frames;
    // console.log(metadata);
    console.log("r_frame_rate: " + originRFrameRateStr + " => " + originRFrameRate);
    console.log("avg_frame_rate: " + originAvgFrameRateStr + " => " + originAvgFrameRate);
    console.log("nb_frames: " + originFrames);

    var startTimestamp = startFrame / originAvgFrameRate;
    var duration = (endFrame - startFrame)  / originAvgFrameRate;

    console.log("startTimestamp: " + startTimestamp);
    console.log("duration: " + duration);

    ffmpeg(path.resolve(process.env.VIDEO_INPUT_PATH, inputFileName))
      .setFfmpegPath(process.env.FFMPEG_PATH)
      .setStartTime(startTimestamp)
      .setDuration(duration)
      .on('progress', function(info) {
        console.log('progress ' + info.percent.toFixed(2) + '%' + ', ' + 'processed frames: ' + info.frames);
      })
      .on('error', function(err) {
        console.error('An error occurred: ' + err.message);
        res.status(500);
        res.json({
          message: err.message,
        }); // res.json end
      })
      .on('end', function(stdout, stderr) {
        console.log('Processing finished !');
        res.status(200);
        res.json({
          message: 'Processing finished !',
          outputLocation: path.resolve(process.env.VIDEO_OUTPUT_PATH, outputFileName)
        }); // res.json end
      })
      .save(path.resolve(process.env.VIDEO_OUTPUT_PATH, outputFileName));

  });

}

module.exports.getFrames = function(req, res, err) {

  var inputFileName = req.params.inputFileName;
  ffmpeg.ffprobe(path.resolve(process.env.VIDEO_INPUT_PATH, inputFileName), function(err, metadata) {
    if (err) console.log(err);
    var videoStreamObj = metadata.streams[0].codec_type === "video" ? metadata.streams[0] : metadata.streams[1];
    var originRFrameRateStr = videoStreamObj.r_frame_rate;
    var originRFrameRate = originRFrameRateStr.split('/')[0] / originRFrameRateStr.split('/')[1];
    var originAvgFrameRateStr = videoStreamObj.avg_frame_rate;
    var originAvgFrameRate =  originAvgFrameRateStr.split('/')[0] / originAvgFrameRateStr.split('/')[1];
    var originFrames = videoStreamObj.nb_frames;
    console.log(metadata);
    console.log("r_frame_rate: " + originRFrameRateStr + " => " + originRFrameRate);
    console.log("avg_frame_rate: " + originAvgFrameRateStr + " => " + originAvgFrameRate);
    console.log("nb_frames: " + originFrames);
    res.status(200).json({
      "nb_frames" : originFrames
    }); // res.json end
  });
}
