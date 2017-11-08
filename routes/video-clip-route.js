var express = require('express');
var router = express.Router();
var videoClipController = require('../controllers/video-clip-controller');

router.get('/helloworld', videoClipController.helloWorld);

router.get('/:inputFileName', videoClipController.clip);

module.exports = router;
