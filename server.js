/* ====================================================
                    GLOBAL IMPORT SETUP
==================================================== */
var express = require('express');
const nocache = require('nocache')
const expressValidator = require('express-validator')
var app = express();
const https = require('https');
const fs = require('fs');
// var io = require('socket.io')(server);
var bodyParser = require('body-parser')
// var kafka = require('kafka-node');
var PORT = process.env.PORT || 8081
var morgan = require('morgan')
// var Primus = require('primus');
// var Emitter = require('primus-emitter');
// const kafka = require('kafka-node');
var winston = require('./config/winston');
//const fs = require('fs');
const mongoose = require('mongoose')
mongoose.Promise = global.Promise;
var path = require('path');
var ca = [fs.readFileSync("rds-combined-ca-bundle.pem")];
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
var server = require('http').createServer(app);
// app.set('port', 8081);
app.set('port', PORT);
app.use(nocache())
//  app.use(morgan('combined'));
// app.use(morgan('combined', { stream: winston.stream }));
// var server = https.createServer(options,app);
/* ====================================================
                    KAFKA SETUP
==================================================== */
// var Consumer = kafka.Consumer,
//  client = new kafka.KafkaClient('localhost:9092'),
//  consumer = new Consumer(
//  client, [ { topic: 'test', partition: 0 } ], { autoCommit: false });


 /* ====================================================
                    PRIMUS WEBSOCKET SETUP
======================================================*/
// var primus = new Primus(server, { transformer: 'websockets' });
// primus.plugin('emitter', Emitter);
// var count = 0;
// app.set('socketio', io);
// app.set('primusio', primus)

 /* ====================================================
                   SWAGGER  SETUP
======================================================*/ 
// Extended: https://swagger.io/specification/#infoObject

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  swaggerDefinition: {
    swaggerOptions: {
      authAction: {
        JWT: {
          name: 'JWT',
          schema: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: ''
          },
          value: 'Bearer <my own JWT token>'
        }
      }
    },
    openapi: "3.0.0",
    info: {
      title: "SHN & QO",
      version: "1.0.0",
      // description:
        // "A test project to understand how easy it is to document and Express API",
      // license: {
      //   name: "MIT",
      //   url: "https://choosealicense.com/licenses/mit/"
      // },
      // contact: {
      //   name: "Swagger",
      //   url: "https://swagger.io",
      //   email: "Info@SmartBear.com"
      // }
    },
    servers: [
      {
        url: "http://localhost:5200/dsl"
        // url: "https://lufthansadsl.tk/dsl",
        // url: "https://www.locationreport.gov.sg"

      }
    ],
  },
  // apis:['./api/routes/*.js']
  apis:['./api/routes/swagger.js','./api/routes/swagger-user.js','./api/routes/swagger-push.js']
};

// const swaggerOptions1 = {
//   swaggerDefinition: {
//     explorer: true,
//     info: {
//       title: "Customer API",
//       version: "1.0",
//       description: "Customer API Information",
//       contact: {
//         name: "Amazing Developer"
//       },
//     },
//     host: ["localhost:4200"],
//     // basePath: "/virusrip/",
//     basePath: "/",
//     securityDefinitons: {
//       tokenAuth: "JWT",
//       name: "Authorization Bearer ",
//       in: "Header"
//     }
//   },
//   apis:['./api/routes/*.js']
//   // apis: ["app.js"]
// };

const specs = swaggerJsDoc(swaggerOptions);
app.use("/docs", swaggerUi.serve);
app.get("/docs", swaggerUi.setup(specs, { explorer: true }));

// const swaggerDocs = swaggerJsDoc(swaggerOptions);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

console.log("jain")
const YAML = require('yamljs');
// const swaggerUi = require('swagger-ui-express');
const swaggerDocumentYAML = YAML.load('./swagger-unicorn.yaml');
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocumentYAML));

 /* ====================================================
                   KAFKA  SETUP
======================================================*/
try {
  /**
   * Kafka Producer Configuration
   */
  // const Producer = kafka.Producer;
  // const client = new kafka.KafkaClient('localhost:2181')
  // const producer = new Producer(client);
  // const kafka_topic = 'corona-topic';

  // producer.on('ready',async function() {
  //   console.log('Kafka Producer is Ready');
  // //   payloads = [
  // //     {topic: kafka_topic, messages: "x", partition:0}
  // // ]
  // // producer.send(payloads, function(err, data) {
  // //   console.log(data);
  // //   // count += 1;
  // // });
  // })

  // producer.on('error', function(err) {
  //   console.log(err);
  //   console.log('[kafka-producer -> '+kafka_topic+']: connection errored');
  //   throw err;
  // });

  // app.set('kafka_producer', producer)
  //const db2 = require('./config/keys').MongoURI;
  const db = 'mongodb://corona2020:Blockchain2019@shn-staging-cluster.cluster-cy0qcdf0pwu1.ap-southeast-1.docdb.amazonaws.com:27018/cor?ssl=true&ssl_ca_certs=rds-combined-ca-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false'
  // const db = "mongodb://localhost:27017/ubuntu"
  mongoose.connect(db, {
    sslCA: ca,
    useNewUrlParser:true,
    useUnifiedTopology: true}
    ).then(function(success){
      console.log("MongoDb Database is connected" + `${db}`)
      // const routesCorona = require('./api/routes/coronaRouter')
      // app.use('/novel', routesCorona.router)
    }).catch(function(error){
      console.log("Database connection error:" , error)
    })
  } catch(e) {
    console.log(e);
  }

/*====================================================
                    WITHOUT KAFKA  SETUP
======================================================*/
// // // const db = "mongodb://localhost/imdaspy"
// // const db = "mongodb://mongo/coronadb"
// const db = "mongodb://localhost:27017/cor"
// mongoose.connect(db, {useNewUrlParser:true,useUnifiedTopology: true})
// .then(function(success){
//     console.log("MongoDb Database is connected" + `${db}`)
// }).catch(function(error){
//   console.log("Database connection error:" , error)
// })
console.log("SDSDFSDF")
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
      return res.status(200).json({});
    }
    next();
});

// primus.on('connection', function (socket) {
//     socket.on('data', function ping(message) {
//         console.log(message)
//     //   socket.write({
//     //     ping: 'pong ' + count++
//     //   });
//     })
//     // Send an initial hello
//     socket.write('Hello user ' + socket.id + '. I am the server communicating to you.')
//     // consumer.on('message', function (message) {
//     //     console.log(message);
//     //     primus.send('chartData',message.value);
//     // });
//   });

//app.use(express.static(__dirname));
app.use(express.static(__dirname + "/views"));
app.use(express.static(__dirname + "/logs"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(__dirname + '/bower_components'));
app.get('/', function(req, res,next) {
  // res.sendFile(__dirname + '/index.html');
 res.sendFile(path.join(__dirname + '/views/index.html'));
});

// const routesJain = require('./api/routes/routes')

//with out kafka
// const routesCorona = require('./api/routes/coronaRouter')
console.log("at kafka")
//kafka enabled
const routesKafkaCorona = require('./api/routes/kafkaCoronaRouter')
console.log("afterkafka")
const smsCoronaUsers = require('./api/routes/messageRouter')
const otpVerification = require('./api/routes/otpVerificationRouter')
console.log("fasfsms")
/*
try {

const otpVerification = require('./api/routes/otpVerificationRouter')
} catch(err){
	console.log(err)
}
*/
console.log("jain")
const orgRoutesCorona = require('./api/routes/orgCoronaRouter');
const userRoutesCorona = require('./api/routes/userRouter');
console.log("orgorugocnrona")
//Routes handler mapping to the router class
// app.use('/call', routesJain.router)
//w/o kafka
// app.use('/novel', routesCorona.router)
//with kafka
console.log("iamoka")
try {
  app.use('/novel', routesKafkaCorona.router)
  app.use('/sendtousers', smsCoronaUsers.router)
  app.use('/otp', otpVerification.router)
  app.use('/org', orgRoutesCorona.router);
  app.use('/user', userRoutesCorona.router);
}
catch (err){
  console.log(err)
}

// io.on('connection', function(client) {
//     console.log('Client connected...' + client.id);
//     client.on('joinJain', function(data) {
//     	console.log(data);
//     });
//     client.on('messagesJain', function(data) {
//         client.emit('broad', data);
//         client.broadcast.emit('broad',data);
//     });
// });

// var server = https.createServer(options, app);
// server.listen(4200, () => {
//   console.log("server starting on port : " + port)
// })

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // add this line to include winston logging
  winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});



winston.error('error', 'hello', { message: 'world' });
winston.info('hello', { message: 'world' });

console.log("ALL GOOD JAIN")
server.listen(PORT, function(){
    console.log(`AppIsRunningOn https://localhost:${PORT}`)
});



// H2TRLUSM
// 55UR41PY
// 99QK55DU
// 39DP31OZ
// 67LK77KG
// 19GB94JQ
// 14KA14TQ
// 31SR01VN
// 55CC65NK
// 57DH44OG
// 13QS19ZQ
// 21MJ82ZH
// 17CS87JR
// 52SN22DA
// 09FY89PX
// 60FR86MJ
// 23XU92HR
// 34KY34KK
// 86QC61UT
// 60JV91SQ
// 93IA93RM
