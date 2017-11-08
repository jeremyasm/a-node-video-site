// const ffmpeg = require('ffmpeg')
// const isVideo = require('is-video')
//
// /**
//  *  Sets video start time based on inputStartTime value
//  */
// function setStartTime (inputFile, time, exportFile) {
//   try {
//     var process = new ffmpeg(inputFile)
//     process.then((video) => {
//       video
//         .setVideoStartTime(time)
//         .save(exportFile, (error, file) => {
//           if (!error) { console.log('OUTPUT: ' + file) }
//         })
//     }, (err) => {
//       console.log('ERROR: ' + err)
//     })
//   } catch (e) {
//     console.log(e.code)
//     console.log(e.msg)
//   }
// }
//
// /**
//  *  Sets video duration based on inputDuration value
//  */
// function setDuration (inputFile, duration, exportFile) {
//   try {
//     var process = new ffmpeg(inputFile)
//
//     process.then((video) => {
//       video
//         .setVideoDuration(duration)
//         .save(exportFile, (error, file) => {
//           if (!error) { console.log('OUTPUT: ' + file) }
//         })
//     }, (err) => {
//       console.log('ERROR: ' + err)
//     })
//   } catch (e) {
//     console.log(e.code)
//     console.log(e.msg)
//   }
// }
//
// function cut(inputFile, inputStartTime, inputDuration, exportFile) {
//   setStartTime(inputFile, inputStartTime, exportFile)
//   setDuration(inputFile, inputDuration, exportFile)
// }
//
// module.exports = (inputFile, inputStartTime, inputDuration, exportFile) => {
//   /**
//    *  Checks if inputFile is a video file
//    *  If false, returns
//    */
//   if (!isVideo(inputFile)) {
//     console.log('ERROR: Not a valid video file')
//   } else {
//     return cut(inputFile, inputStartTime, inputDuration, exportFile)
//   }
// }
