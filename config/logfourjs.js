var appRoot = require('app-root-path');
var log4js = require('log4js'); // include log4js

// log4js.configure({ // configure to use all types in different files.
//     appenders: [
//         cheese: {   type: 'file',
//             filename: "/logs/logerror.log", // specify the path where u want logs folder error.log
//             category: 'error',
//             maxLogSize: 20480,
//             backups: 10
//         },
//         {   type: "file",
//             filename: "/logs/loginfo.log", // specify the path where u want logs folder info.log
//             category: 'info',
//             maxLogSize: 20480,
//             backups: 10
//         },
//         {   type: 'file',
//             filename: "/logs/logdebug.log", // specify the path where u want logs folder debug.log
//             category: 'debug',
//             maxLogSize: 20480,
//             backups: 10
//         },
//     ],
//     categories: { default: 
//         { appenders: ['cheese', 'console'], level:'ALL'},
//     }
// });
log4js.configure({
    appenders: { 
        cheese: { type: 'file', filename: `${appRoot}/logs/cheese.log`,  maxLogSize: 20480,
        backups: 10 } ,
        console: { type: 'console' } 
      },
    categories: { default: 
      { appenders: ['cheese', 'console'], level:'ALL'},
  }
  });
//   const logger = log4js.getLogger('cheese');
const logger = log4js.getLogger('cheese');

module.exports = logger
// log4js.configure({
//     appenders: { 
//         cheese: { type: 'file', filename: 'cheese.log',  maxLogSize: 20480,
//         backups: 10 } ,
//         console: { type: 'console' } 
//       },
//     categories: { default: 
//       { appenders: ['cheese', 'console'], level:'ALL'},
//   }
//   });
//   const logger = log4js.getLogger('cheese');

// loggerinfo.info('This is Information Logger');
// loggererror.info('This is Error Logger');
// loggerdebug.info('This is Debugger');

// module.exports = {loggerinfo, loggerdebug,loggererror}
