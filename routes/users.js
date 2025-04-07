var express = require('express');
var router = express.Router();
const winstonLogger = require('../config/logger');

/* GET users listing. */
router.get('/', function(req, res, next) {
  winstonLogger.info('Users list accessed', {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  res.send('respond with a resource');
});

module.exports = router;
