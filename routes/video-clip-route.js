var express = require('express');
var router = express.Router();
var videoClipController = require('../controllers/video-clip-controller');

router.get('/helloworld', videoClipController.helloWorld);

router.get('/:inputFileName/byTime', videoClipController.clipByTime);

router.get('/:inputFileName/byFrames', videoClipController.clipByFrames);

router.get('/:inputFileName/frames', videoClipController.getFrames);

router.get('/:fileName/process', videoClipController.initProcessPage);

module.exports = router;
