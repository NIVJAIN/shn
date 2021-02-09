var appRoot = require('app-root-path');
var winston = require('winston');
var moment = require('moment')
const {transports, createLogger, format} = require('winston');
// define the custom settings for each transport (file, console)
var options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: true,
    format: format.combine(
      format.splat(), 
      format.json()
  ),
  },
  errorFile: {
    level: 'error',
    name: 'file.error',
    filename: `${appRoot}/logs/error.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 100,
    colorize: true,
    format: format.combine(
      format.splat(), 
      format.json()
  ),
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: true,
    colorize: true,
    format: format.combine(
      format.splat(), 
      format.json()
  ),
  },
};

let date = moment().format("ddd:DD-MM-YYYY:HH:mm:ss")
const logFormat = winston.format.printf(function(info) {
  return `${date}-${info.level}: ${JSON.stringify(info.message, null, 4)}`;
});


// instantiate a new Winston Logger with the settings defined above
var logger =  winston.createLogger({
  format: format.combine(winston.format.colorize(),format.splat(),format.json(), logFormat),
  transports: [
    new winston.transports.File(options.file,),
    new (winston.transports.File)(options.errorFile),
    // new winston.transports.Console(options.console),
    new transports.Console()
    // new winston.transports.Console({
    //     level: "info",
    //     format: winston.format.combine(winston.format.colorize(), logFormat)
    //   })
  ],
  exitOnError: false, // do not exit on handled exceptions
});


// var logger =  winston.createLogger({
//   transports: [
//     new winston.transports.File(options.file),
//     new (winston.transports.File)(options.errorFile),
//     new winston.transports.Console(options.console)
//   ],
//   exitOnError: false, // do not exit on handled exceptions
// });

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

module.exports = logger;