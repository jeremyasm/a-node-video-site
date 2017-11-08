const path = require('path');
// const cutVideo = require('../util/video-cut');
var fs = require("fs");
var ffmpeg = require('fluent-ffmpeg');

module.exports.helloWorld = function(req, res) {
  res.send('Hello World!')
}

module.exports.clip = function(req, res, err) {

  console.log("Cutting video ...");

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
