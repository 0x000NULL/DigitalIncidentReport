var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const winstonLogger = require('./config/logger');
require('dotenv').config();

var indexRouter = require('./routes/index');
var reportRouter = require('./routes/report');
const connectDB = require('./config/database');

var app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Replace with your production domain
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Configure Morgan to use Winston logger
app.use(logger('combined', { stream: winstonLogger.stream }));

app.use(express.json({ limit: '10kb' })); // Body limit
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser(process.env.SESSION_SECRET)); // Use session secret for cookie signing
app.use(express.static(path.join(__dirname, 'public')));

// Log all requests
app.use((req, res, next) => {
  winstonLogger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    referrer: req.get('referer')
  });
  next();
});

app.use('/', indexRouter);
app.use('/report', reportRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  winstonLogger.warn(`404 Not Found: ${req.method} ${req.url}`);
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // Log the error
  winstonLogger.error(`${err.status || 500} - ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Don't leak stack traces in production
  const errorResponse = {
    status: err.status || 500,
    message: err.message || 'Internal Server Error'
  };

  if (req.app.get('env') === 'development') {
    errorResponse.stack = err.stack;
  }

  // render the error page
  res.status(err.status || 500);
  res.render('error', errorResponse);
});

module.exports = app;
