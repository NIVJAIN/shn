const express = require('express');
const app = express();
require('dotenv').config();
var winston = require('winston');
var AWS_KEY = 'AKIAX4CJRX5LJF4SVIVO'
var AWS_SECRET = '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'
var SNS_REGION = 'ap-southeast-1'

var AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: `${AWS_KEY}`,
    secretAccessKey: `${AWS_SECRET}`,
    region: `${SNS_REGION}`
  });
  
//   var sns = new AWS.SNS();
// subject here is coming from.
// message is the content what u see in the sms

exports.SEND_SMS = (req,res,next)=>{
    console.log(req.body)
    console.log("Message = " + req.body.message);
    console.log("Number = " + req.body.mobile);
    console.log("Subject = " + req.body.subject);
    var params = {
        Message: req.body.message,
        PhoneNumber: '+' + req.body.mobile,
        MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
                'DataType': 'String',
                'StringValue': "SHNQO"
            }
        }
    };

    var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
    publishTextPromise.then(function (data) {
        console.log("success::", data.MessageId)
            if(req.body.newotp){
                res.status(200).json({ 
                    MessageID: data.MessageId,
                    // message: req.body.newotp
                });
            } else {
                res.end(JSON.stringify({ MessageID: data.MessageId }));
            }
            
        }).catch(
            function (err) {
                console.log("errorSMS:::::", err)
                res.end(JSON.stringify({ Error: err }));
            });
    }



    exports.SEND_SMS_RESOLVE_REJECT = (message,mobile,pin)=>{
        return new Promise((resolve,reject)=>{
        var params = {
            Message: message,
            PhoneNumber: '+' + mobile,
            MessageAttributes: {
                'AWS.SNS.SMS.SenderID': {
                    'DataType': 'String',
                    'StringValue': "SHNQO"
                }
            }
        };
        var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
        publishTextPromise.then(function (data) {
            console.log("success::", data, "==>>", data.MessageId)
                resolve({
                    message: data.MessageId,
                    pin: pin,
                    mobile: mobile
                })
            }).catch(function (err) {
                console.log("errorSMS:::::", err)
                reject({
                    pin: pin,
                    error: err,
                    mobile: mobile
                })
            });
        })
     }










// exports.SEND_SMS = (req,res,next)=>{
//     console.log("Message = " + req.query.message);
//     console.log("Number = " + req.query.number);
//     console.log("Subject = " + req.query.subject);
//     var params = {
//         Message: req.query.message,
//         PhoneNumber: '+' + req.query.number,
//         MessageAttributes: {
//             'AWS.SNS.SMS.SenderID': {
//                 'DataType': 'String',
//                 'StringValue': req.query.subject
//             }
//         }
//     };

//     var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
//     publishTextPromise.then(function (data) {
//             res.end(JSON.stringify({ MessageID: data.MessageId }));
//         }).catch(
//             function (err) {
//                 res.end(JSON.stringify({ Error: err }));
//             });
//     }
