/**=======================================================
 *  PUSH NOTIFICATION SETUP
 *=======================================================*/
var admin = require("firebase-admin");
var moment = require('moment')
// var serviceAccount = require('../../')
var serviceAccount = require("../../firebasetoken.json");    // Note this can be the full relative path to the json file above
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://shn-app.firebaseio.com"
// });



exports.BATCH_PUSH_NOTIFICATION_FRSM = async function(arrayOfFedup){
    return new Promise(async(resolve,reject)=>{
        let response = await loopandsend(arrayOfFedup)   
        resolve(response) 
    })
}
const loopandsend = async function(arrayOfFedup){
    return  new Promise(async(resolve, reject)=>{
        var respData = []
        for(x of arrayOfFedup){
            try {
                var message = {
                    notification: {
                        title: 'SHN & QO Notification',
                        body: `As part of the active monitoring efforts, click here to authenticate yourself.`
                      },
                    data: {
                        content: `link`,
                        link: `${x.link}`,
                    },
                    // ttl: 3600
                };
                var options = {
                    priority :  "high",
                    timeToLive : 60 * 60 * 24,
                    // ttl: 3600
                 };
                 // must put await otherwise suffer
                await admin.messaging().sendToDevice(x.token, message, options)
                 .then(function(response) {
                    //    winston.info(`exports.send_push_notification_frsm:==>>${xpin} ${xtoken}`);
                    // console.log(response)   
                    respData.push({
                           mobile: x.mobile,
                           token: x.token,
                           status: "pass",
                           date: moment().format("DD-MM-YYYY:HH:mm:ss"),
			    link: x.link
                       })
                 })
                 .catch(function(error) {
                    //  winston.error("admin.messaging.catch=>"+ error);
                     respData.push({
                         mobile:x.mobile,
                         token:x.token,
                         status:"fail",
                         date: moment().format("DD-MM-YYYY:HH:mm:ss"),
			 link: x.link
                     })
                 });

            } catch (err){
                console.log("exports.BATCH_PUSH_NOTIFICATION_FRSM.catch::==>>", err)
                respData.push({
                    mobile:x.mobile,
                    token:x.token,
                    status:"fail",
                    desc: "exports.BATCH_PUSH_NOTIFICATION_FRSM.catch::==>>err",
                    date: moment().format("DD-MM-YYYY:HH:mm:ss")
                })
            }
            
        }
        resolve(respData)
    })
}



var message = {
    notification: {
        title: 'SHN & QO Notification',
        body: 'As part of the active monitoring efforts, click here to authenticate yourself.'
      },
    data: {
        content: 'link',
        link: "https",
    },
    // ttl: 3600
  };
 
  var options = {
    priority :  "high",
    timeToLive : 60 * 60 * 24,
    // ttl: 3600
 };
exports.SEND_PUSH_NOTIFICATION_FRSM = async function(xmobile, xtoken, notificationbody, datacontent, datalink){
    return new Promise((resolve,reject)=>{
        var message = {
            notification: {
                title: 'SHN & QO Notification',
                body: `${notificationbody}`
              },
            data: {
                content: `${datacontent}`,
                link: `${datalink}`,
            },
            // ttl: 3600
          };
         
          var options = {
            priority :  "high",
            timeToLive : 60 * 60 * 24,
            // ttl: 3600
         };
         admin.messaging().sendToDevice(xtoken, message, options)
         .then(function(response) {
            //    winston.info(`exports.send_push_notification_frsm:==>>${xpin} ${xtoken}`);
               resolve({
                   mobile: xmobile,
                   token: xtoken,
                   status: "pass",
                   date: moment().format("DD-MM-YYYY:HH:mm:ss")
               })
         })
         .catch(function(error) {
            //  winston.error("admin.messaging.catch=>"+ error);
             reject({
                 mobile:xmobile,
                 token:xtoken,
                 status:"fail",
                 date: moment().format("DD-MM-YYYY:HH:mm:ss")
             })
         });

    })
}
exports.SEND_PUSH_NOTIFICATION_PING = async function(xmobile, xtoken){
    return new Promise((resolve,reject)=>{
        var message = {
            notification: {
                title: 'SHN & QO Notification',
                body: `Please click here to login to the app`
              },
            data: {
                content: `Ping`,
                // link: `${datalink}`,
            },
            // ttl: 3600
          };

          var options = {
            priority :  "high",
            timeToLive : 60 * 60 * 24,
            // ttl: 3600
         };
         admin.messaging().sendToDevice(xtoken, message, options)
         .then(function(response) {
            //    winston.info(`exports.send_push_notification_frsm:==>>${xpin} ${xtoken}`);
               resolve({
                   mobile: xmobile,
                   token: xtoken,
                   status: "pass",
                   date: moment().format("DD-MM-YYYY:HH:mm:ss")
               })
         })
         .catch(function(error) {
            //  winston.error("admin.messaging.catch=>"+ error);
             reject({
                 mobile:xmobile,
                 token:xtoken,
                 status:"fail",
                 date: moment().format("DD-MM-YYYY:HH:mm:ss")
             })
         });

    })
}
