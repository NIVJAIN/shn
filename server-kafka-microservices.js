/* ====================================================
                    GLOBAL IMPORT SETUP
==================================================== */ 
var express = require('express');
const expressValidator = require('express-validator')
var app = express();
const https = require('https');
var io = require('socket.io')(server);
var bodyParser = require('body-parser')
// var kafka = require('kafka-node');
var PORT = process.env.PORT || 4200
var morgan = require('morgan')
var Primus = require('primus');
var Emitter = require('primus-emitter');
const kafka = require('kafka-node');
var winston = require('./config/winston');
const mongoose = require('mongoose')
mongoose.Promise = global.Promise;
var path = require('path');
// const shortid = require('shortid');
// console.log(shortid.generate().toUpperCase());
// shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
// var customId = require('custom-id');
// // shortid.characters('ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ①②③④⑤⑥⑦⑧⑨⑩⑪⑫');
// for (var i = 0; i < 20; i++){
//   // console.log(shortid.generate().toUpperCase());
//   console.log(customId({}))
// }
// const logger = new Logger('app')


mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const fs = require('fs');
var key = fs.readFileSync(__dirname + '/selfsigned.key');
var cert = fs.readFileSync(__dirname + '/selfsigned.crt');
var options = {
  key: key,
  cert: cert
};
// var server = require('https').createServer(options,app);
var server = require('http').createServer(app);

 app.use(morgan('combined'));
app.use(morgan('combined', { stream: winston.stream }));
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
var primus = new Primus(server, { transformer: 'websockets' });
primus.plugin('emitter', Emitter);
var count = 0;
app.set('socketio', io);
app.set('primusio', primus)


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
  // const db = "mongodb://localhost:27017/cor"
  const db = "mongodb://localhost:27017/ubuntu"

  mongoose.connect(db, {useNewUrlParser:true,useUnifiedTopology: true})
  .then(function(success){
      console.log("MongoDb Database is connected" + `${db}`)
      // const routesCorona = require('./api/routes/coronaRouter')
      // app.use('/novel', routesCorona.router)


  }).catch(function(error){
    console.log("Database connection error:" , error)
  })
}
catch(e) {

  console.log(e);
}



 /* ====================================================
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

primus.on('connection', function (socket) {
    socket.on('data', function ping(message) {
        console.log(message)
    //   socket.write({
    //     ping: 'pong ' + count++
    //   });
    })
    // Send an initial hello
    socket.write('Hello user ' + socket.id + '. I am the server communicating to you.')
    // consumer.on('message', function (message) {
    //     console.log(message);
    //     primus.send('chartData',message.value);
    // });
  });

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
const userRoutesCorona = require('./api/routes/userRouter');

console.log("fasfsms")
console.log("jain")
// const userRoutesCorona = require('./api/routes/userRouter');
const orgRoutesCorona = require('./api/routes/orgCoronaRouter');
console.log("orgorugocnrona")
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

io.on('connection', function(client) {
    console.log('Client connected...' + client.id);
    client.on('joinJain', function(data) {
    	console.log(data);
    });
    client.on('messagesJain', function(data) {
        client.emit('broad', data);
        client.broadcast.emit('broad',data);
    });
});

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
