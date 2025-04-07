var express = require('express');
var router = express.Router();
const winstonLogger = require('../config/logger');

/* GET home page. */
router.get('/', function(req, res, next) {
  winstonLogger.info('Home page accessed', {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  res.render('index', { title: 'Express' });
});

module.exports = router;
