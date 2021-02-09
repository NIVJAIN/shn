const mongoose = require("mongoose");
const XCorona = require("../models/coronaModel");
const XOrgid = require('../models/orgidModel')
const UPDATECorona = require("../models/updCoronaModel")
const OTP = require('../models/coronaModelOTP')
const winston = require('../../config/winston')
const PUSH_CONTROLLER = require('../controllers/pushController')
var rp = require('request-promise')
const fs = require('fs')
const { check, validationResult } = require('express-validator');
var rp = require('request-promise')
var moment = require('moment-timezone');
var _MOMENT = require('moment')
var _CONFIG = require('../../config/config')
var CONFIG = require('../models/configModel')
var util = require('util')
// console.log(Date.now())
// var d = new Date(15233223423)
// console.log(d)
//const logger = require('../../config/logfourjs')
const logger = require('../../config/logfive')
var timeString = "1581757699369"
var intString = parseInt(timeString)
var unixepoch = new Date(intString).getTime();
var date = moment(unixepoch).tz('Asia/Singapore').format('DD/MM/YYYY')
logger.error("kafkaCoronaControllerStarted");
logger.info("kafkaCoronaControllerStartedReportingbyInfo")
//console.log("ssss",date)
//
/**=======================================================
 *  PUSH NOTIFICATION SETUP
 *=======================================================*/
var admin = require("firebase-admin");
// var serviceAccount = require('../../')
var serviceAccount = require("../../firebasetoken.json");    // Note this can be the full relative path to the json file above
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://shn-app.firebaseio.com"
});

exports.GLOBAL_CHANGE = async (req,res,next)=>{
    var _PIN_ARRAY = req.body.arrayofpins;
    var _trueorfalse = req.body.value;
    var _fieldname = req.body.fieldname;
    var respData =[];
    var cleanArrayOfPins = []
    for (x of _PIN_ARRAY){
        // winston.info(x.pin +" "+ x.maxdist)
         x = x.trim();
        try {
            if(x == "") {
                throw {
                    status:"fail",
                    pin: x,
                    error: ` {${x}} invalid pin format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }
            } if(x ===" "){
                throw {
                    status:"fail",
                    pin: x,
                    error: ` {${x}} invalid pin format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }

            } if(x ===null ||x === undefined  ){
                throw {
                    status:"fail",
                    pin: x,
                    error: ` {${x}} invalid pin format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }
            }
            if(x !== x.toUpperCase()){
                throw {
                    status:"fail",
                    pin: x,
                    error: ` {${x}} invalid pin format , Must be uppercase`,
                    desc: "fail"
                }
            }
            if (!x.match(/((^[0-9]+[A-Z]+)|(^[A-Z]+[0-9]+))+[0-9A-Z]+$/)){
                throw {
                    status:"fail",
                    pin: x,
                    error: ` {${x}} invalid pin format , Must be ALPHAnumeric and all UPPERCASE `,
                    desc: "fail"
                }
            }

            // respData.push(x)
            cleanArrayOfPins.push(x)
        }catch (err){
            console.log("trycatcherrro",err)
            respData.push(err)
        }
    }
    try {
        var resultams = await fieldname_update_to_true_or_false(cleanArrayOfPins,_trueorfalse,_fieldname )
    } catch(err){
        return res.status(500).json({
            error: err
        })
    }

    res.status(200).json({
        message: cleanArrayOfPins,
        error: respData,
        status: resultams
    })
}

//http://localhost:4200/novel/globalchange

const fieldname_update_to_true_or_false = async function(_CLEAN_ARRAY_OF_PINS,eitherTrueOrFalse,_fieldname){
    return new Promise((resolve,reject)=>{
        console.log("fieldname", _fieldname)
        XCorona.findOne({[_fieldname]: {$exists:true}}).then(function(result){
            console.log("reerer", result)
            if(result==null){
                reject({
                    error: `${_fieldname} doesnt exist`
                })
            } else {
                XCorona.updateMany({
                    pin:{ $in : _CLEAN_ARRAY_OF_PINS },
                    [_fieldname]: {$exists:true},
                },
                {$set: {[_fieldname]: eitherTrueOrFalse}},
                {_id:0,pin:1, mobile:1,issuspended:1,expiry:1,loaend:1,loastart:1, token:1,showtemperature:1,wellness:1}).then(function(result){
                    if(result==null){
                        reject({
                            status: "fail",
                            pin: _CLEAN_ARRAY_OF_PINS,
                            error: `This {${_CLEAN_ARRAY_OF_PINS}} is not a valid pins`
                        })
                    } else {
                        resolve({
                            result: result
                        })
                    }
                }).catch(function(err){
                    console.log("get_token_via_mobile.catch==>>", err)
                    reject({
                        pin: _CLEAN_ARRAY_OF_PINS,
                        error: `catch error {${_CLEAN_ARRAY_OF_PINS}} `
                    })
                })
            }
        })
    })
}
exports.UPDATE_WELLNESS_TRUEORFALSE = async(req,res,next)=>{
    var _PIN_ARRAY = req.body.arrayofpins;
    var _trueorfalse = req.body.value;
    var respData =[];
    var cleanArrayOfPins = []
    for (x of _PIN_ARRAY){
        // winston.info(x.pin +" "+ x.maxdist)
         x = x.trim();
        try {
            if(x == "") {
                throw {
                    status:"fail",
                    pin: x,
                    error: ` {${x}} invalid pin format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }
            } if(x ===" "){ 
                throw {
                    status:"fail",
                    pin: x,
                    error: ` {${x}} invalid pin format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }
                
            } if(x ===null ||x === undefined  ){
                throw {
                    status:"fail",
                    pin: x,
                    error: ` {${x}} invalid pin format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }
            } 
            if(x !== x.toUpperCase()){
                throw {
                    status:"fail",
                    pin: x,
                    error: ` {${x}} invalid pin format , Must be uppercase`,
                    desc: "fail"
                }
            }
            if (!x.match(/((^[0-9]+[A-Z]+)|(^[A-Z]+[0-9]+))+[0-9A-Z]+$/)){
                throw {
                    status:"fail",
                    pin: x,
                    error: ` {${x}} invalid pin format , Must be ALPHAnumeric and all UPPERCASE `,
                    desc: "fail"
                }
            } 

            // respData.push(x)
            cleanArrayOfPins.push(x)
        }catch (err){
            console.log("trycatcherrro",err)
            respData.push(err)
        }  
    }
    var resultams = await wellness_update_to_true_or_false(cleanArrayOfPins,_trueorfalse )

    res.status(200).json({
        message: cleanArrayOfPins,
        error: respData
    })
}

const wellness_update_to_true_or_false = async function(_CLEAN_ARRAY_OF_PINS,eitherTrueOrFalse){
    return new Promise((resolve,reject)=>{
        XCorona.updateMany({
            pin:{ $in : _CLEAN_ARRAY_OF_PINS }
        },
        {$set: {showtemperature: eitherTrueOrFalse}},
        {_id:0,pin:1, mobile:1,issuspended:1,expiry:1,loaend:1,loastart:1, token:1,showtemperature:1,wellness:1}).then(function(result){
            if(result==null){
                reject({
                    status: "fail",
                    pin: _CLEAN_ARRAY_OF_PINS,
                    error: `This {${_CLEAN_ARRAY_OF_PINS}} is not a valid pins`
                })
            } else {
                resolve({
                    result: result
                })
            }
        }).catch(function(err){
            logger.info("get_token_via_mobile.catch==>>", err)
            reject({
                pin: _CLEAN_ARRAY_OF_PINS,
                error: `catch error {${_CLEAN_ARRAY_OF_PINS}} `
            })
        })
    })
}

exports.PING_PUSH_NOTIFICATION = async (req,res,next)=>{
    var _PIN_ARRAY = req.body.arrayofpins;
    // const errors= validationResult(req);
    // console.log("sss",errors)
    // if(!errors.isEmpty()){
    //     res.status(422).json({errors:errors.array()});
    //     return;
    // }
    var respData =[];
    for (x of _PIN_ARRAY){
        // winston.info(x.pin +" "+ x.maxdist)
         x = x.trim();
        try {
            if(x == "") {
                throw {
                    status:"fail",
                    pin: x,
                    error: ` {${x}} invalid pin format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }
            } if(x ===" "){
                throw {
                    status:"fail",
                    pin: x,
                    error: ` {${x}} invalid pin format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }

            } if(x ===null ||x === undefined  ){
                throw {
                    status:"fail",
                    pin: x,
                    error: ` {${x}} invalid pin format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }
            }
            if(x !== x.toUpperCase()){
                throw {
                    status:"fail",
                    pin: x,
                    error: ` {${x}} invalid pin format , Must be uppercase`,
                    desc: "fail"
                }
            }
            if (!x.match(/((^[0-9]+[A-Z]+)|(^[A-Z]+[0-9]+))+[0-9A-Z]+$/)){
                throw {
                    status:"fail",
                    pin: x,
                    error: ` {${x}} invalid pin format , Must be ALPHAnumeric and all UPPERCASE `,
                    desc: "fail"
                }
            }

            // var url_links = await geturlsfromconfig();
            var gettoken = await get_token_by_pin(x)
            var sendpushnot = await PUSH_CONTROLLER.SEND_PUSH_NOTIFICATION_PING(x.mobile, gettoken)
            respData.push(sendpushnot)
        }catch (err){
            console.log("trycatcherrro",err)
            respData.push(err)
        }
    }
    res.status(200).json({
        message: respData
    })
}
exports.DYNAMIC_PUSH_NOTIFICATION = async(req,res,next)=>{
    var _PIN_ARRAY = req.body.arrayofmobiles;
    var respData =[];
    for (x of _PIN_ARRAY){
        // winston.info(x.pin +" "+ x.maxdist)
        //  x.mobile = x.mobile.trim()
         console.log(x.mobile)
        try {
            if(x.mobile == "") {
                throw {
                    status:"fail",
                    mobile: x.mobile,
                    error: ` {${x.mobile}} invalid mobile format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }
            } if(x.mobile ===" "){ 
                throw {
                    status:"fail",
                    mobile: x.mobile,
                    error: ` {${x.mobile}} invalid mobile format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }
                
            } if(x.mobile ===null ||x.mobile === undefined  ){
                throw {
                    status:"fail",
                    mobile: x.mobile,
                    error: ` {${x.mobile}} invalid pin format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }
            } 
            if(x.mobile !== x.mobile.toUpperCase()){
                throw {
                    status:"fail",
                    mobile: x.mobile,
                    error: ` {${x}} invalid mobile format , Must be uppercase`,
                    desc: "fail"
                }
            }
            // if (!x.match(/((^[0-9]+)|(^+[0-9]+))+[0-9A-Z]+$/)){
            if(!x.mobile.match(/^[0-9]+$/)){
                throw {
                    status:"fail",
                    mobile: x.mobile,
                    error: ` {${x}} invalid mobile format , Must be all numbers `,
                    desc: "fail"
                }
            } 

            // var url_links = await geturlsfromconfig();
            var result = await get_token_via_mobile(x.mobile)
            // var sendsms = await blast_sms_to_pin(result, url_links)
            var sendpushnot = await PUSH_CONTROLLER.SEND_PUSH_NOTIFICATION_FRSM(x.mobile, result.result.token,x.notbody,x.datacontent, x.datalink)
            // console.log(result.result.token)
            respData.push(sendpushnot)
        }catch (err){
            console.log("trycatcherrro",err)
            respData.push(err)
        }  
    }
    res.status(200).json({
        message: respData
    })
   
}
exports.FACIAL_RECOGNITION = async (req,res,next)=>{
    var _PIN_ARRAY = req.body.arrayofmobiles;
    var respData =[];
    var arrayofmobilesWithPlus = []
    var arrayOfCleanMobiles = []
    var jwttoken = ""
    try {
        jwttoken = await get_jwt_token_from_dsmt();
    }catch(err){
        return res.status(500).json({
            error: "unable to get jwt token so unable to proceed further to send push notificaitons"
        })
    }

    // console.log(jwttoken)
    // clean up the array for wrong numbers
    for (x of _PIN_ARRAY){
    // winston.info(x.pin +" "+ x.maxdist)
    //  x = x.trim()
    // console.log(x)
    try {
        if(x == "") {
            throw {
                status:"fail",
                mobile: x,
                error: ` {${x}} invalid mobile format , accepted formats ALPHAnumeric`,
                desc: "fail"
            }
        } if(x ===" "){
            throw {
                status:"fail",
                mobile: x,
                error: ` {${x}} invalid mobile format , accepted formats NUMERIC only`,
                desc: "fail"
            }

        } if(x ===null ||x === undefined  ){
            throw {
                status:"fail",
                mobile: x,
                error: ` {${x}} invalid pin format , accepted formats ALPHAnumeric`,
                desc: "fail"
            }
        }
        // if(x !== x.toUpperCase()){
        //     throw {
        //         status:"fail",
        //         mobile: x,
        //         error: ` {${x}} invalid pin format , Must be uppercase`,
        //         desc: "fail"
        //     }
        // }
        // if (!x.match(/((^[0-9]+[A-Z]+)|(^[A-Z]+[0-9]+))+[0-9A-Z]+$/)){
        if(!x.match(/^[0-9]+$/)){
            throw {
                status:"fail",
                mobile: x,
                error: ` {${x}} invalid mobile format , Must be Numeric and all UPPERCASE `,
                desc: "fail"
            }
        }

        // var url_links = await postArrayOfMobile_getDynamicUrls();
        // var result = await get_mobile_with_pin(x)
        // var result = await get_token_via_mobile(x)
        // var sendsms = await blast_sms_to_pin(result, url_links)
        // respData.push(x)
        arrayofmobilesWithPlus.push("+" + x)
        arrayOfCleanMobiles.push(x)
        }catch (err){
            console.log("trycatcherrro",err)
            respData.push(err)
        }
    }
    // get array of tokens for the mobile; this function get_array_of_token_via_mobile
    //returns two types of results, one result is only mobiles with + sign.
    //second result returns with token and everything
    try {
        var getArrayofTokens = await get_array_of_token_via_mobile(arrayOfCleanMobiles)
        var getUrls = await postArrayOfMobile_getDynamicUrls(getArrayofTokens.onlymobiles,jwttoken.access_token);
        const finalArrayWithTokensUrlMobile=[];
        getArrayofTokens.result.forEach((e1)=>getUrls.forEach((e2)=>{
            if(e1.mobile == e2.phone.split("+")[1]){
                finalArrayWithTokensUrlMobile.push({
                    token: e1.token,
                    mobile: e1.mobile,
                    link: e2.link
                })
            }
        }))
        var sendpush = await PUSH_CONTROLLER.BATCH_PUSH_NOTIFICATION_FRSM(finalArrayWithTokensUrlMobile)
        res.status(200).json({
            message: sendpush,
	    error: respData
        })
    }catch(err){
        return res.status(500).json({
            error: err
        })
    }

}
// db.novelmodel.find({ mobile : { $in : ["6597381930", "6598138888"] }})
// db.novelmodel.find({ mobile : { $in : ["6597381930X", "6598138888X", "sfdsf"] }},{token:1}).pretty()
const get_array_of_token_via_mobile = async function(_ARRAYOFMOBILES){
    console.log(_ARRAYOFMOBILES)
    return new Promise((resolve,reject)=>{
        XCorona.find({
            mobile:{ $in : _ARRAYOFMOBILES },
            // mobile: {$exists:true}, // some issue gives duplication in postman
            issuspended:"false",
            expiry:false
        },{_id:0,pin:1, mobile:1,issuspended:1,expiry:1,loaend:1,loastart:1, token:1}).then(function(result){
            if(result==null){
                reject({
                    status: "fail",
                    mobile: _ARRAYOFMOBILES,
                    error: `This {${_ARRAYOFMOBILES}} is not a valid mobile`
                })
            } else {
                //return as array
                var finalArrayofmobiles = result.map(function (obj) {
                        mobile = "+" + obj.mobile;
                    return mobile;
                  });
                resolve({
                    onlymobiles : finalArrayofmobiles,
                    result: result
                })
            }
        }).catch(function(err){
            logger.info("get_token_via_mobile.catch==>>", err)
            reject({
                mobile: _ARRAYOFMOBILES,
                error: `catch error `
            })
        })
    })
}



// var am = ["6597381930","6598138888"];
// var am = ["6597381930" , "6598138888","xx"];
// get_array_of_token_via_mobile(am).then(function(result){
//     console.log("DD", result.onlymobiles)
// }).catch(function(err){
//     console.log("er",err)
// })
const get_jwt_token_from_dsmt = async function(){
    return new Promise((resolve,reject)=>{
        var token = "NmEycGlzM3N0ZDBnaHE3OGFvZnI4aGc1ZG46Z2Jicjlkc2I3ZHMwdjdoOWoybG05M28xcjlybXJnYTYwdWQ1bmRzbXVsYnMwdjEydjB0"
        var options = {
            // uri: 'https://api.github.com/user/repos',
            uri: `https://api.areyouhome.sg/v1/access-token`,
            qs: {
                // access_token: 'xxxxx xxxxx' // -> uri + '?access_token=xxxxx%20xxxxx'
                // Authorization: `Basic ${token}`,
            },
            headers: {
                Authorization: `Basic ${token}`,
                "User-Agent": "Request-Promise",
                "Content-Type": 'application/x-www-form-urlencoded'
            },
            json: true, // Automatically parses the JSON string in the response
        };

    rp.post(options)
        .then(function (repos) {
            // console.log('User has %d repos', repos.length);
            // winston.info(repos)
            resolve(repos)
            // reject("failed to get token")
        }).catch(function (err) {
            // API call failed...
            console.log("err::", "err")
            winston.info(err)
            reject("failed")
            // console.log("err::", err)
        });
    })
}

const postArrayOfMobile_getDynamicUrls = async function(arrayofmobiles, token){
    return new Promise((resolve,reject)=>{
        // var token = "eyJraWQiOiJtN0JvdmM5TnhBUkRZMW81c2R3azlXam1qMUNSRjlSREYyS2twMWVPN1NzPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI2YTJwaXMzc3RkMGdocTc4YW9mcjhoZzVkbiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiaW1kYVwvZ2VuZXJhdGUtbGlua3MgYWxsXC9zY2VuZW1hdGNoZXIiLCJhdXRoX3RpbWUiOjE1ODYxMzM0NDMsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1zb3V0aGVhc3QtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aGVhc3QtMV9CWXB5bjBWNlAiLCJleHAiOjE1ODYxMzcwNDMsImlhdCI6MTU4NjEzMzQ0MywidmVyc2lvbiI6MiwianRpIjoiNDAyNDUyYjktY2Y2OC00NmRjLTkxMjItN2MwZjc5YjVkMTBhIiwiY2xpZW50X2lkIjoiNmEycGlzM3N0ZDBnaHE3OGFvZnI4aGc1ZG4ifQ.S5DqXkotAqS2Jhv6NBR-7K5pFx5FsOfXCE5ofSihwiG8p5GJ1-AT9RpUsK1VSzqaXvA6-Lo-gBlxn-875aLP_xy7zBn7LzZ-AcvGGBaoTBQGBxVA1JHTehMTmS24RjWxD6XGsC5BPgvWUpxTDHulzps-2Zc3F8OjuGRLobLmr61hIER-Hbc5OuC-hXT99wXvfuRbeGBLGnbbnfNjMxG6rj58bTgtPx4BVWtXOCG4inMAxn2vX3PJLj4D-PRqVDBuR2Fz_l2UwQGGkl9nQYyOMwGkdEZ05LTqSX1julJtW10fFpayOu5hBQuVPr5lAn439kWTI_wOBDjHNqn-RV6mWw"
        var options = {
            // uri: 'https://api.github.com/user/repos',
            uri: `https://api.areyouhome.sg/v1/generate-links`,
            qs: {
                // access_token: 'xxxxx xxxxx' // -> uri + '?access_token=xxxxx%20xxxxx'
            },
            headers: {
                'User-Agent': 'Request-Promise',
                "Content-Type": 'application/json',
                Authorization: `${token}`,
            },
            json: true, // Automatically parses the JSON string in the response
            method: 'POST',
            body: arrayofmobiles
            // body: ["+6581397860"]
            // body: JSON.stringify({
            //    ["+6581397860"]
            // })
        };

        rp(options)
        .then(function (repos) {
            // console.log('User has %d repos', repos.length);
            // winston.info(repos)
            resolve(repos)
        }).catch(function (err) {
            // API call failed...
            console.log("err::", "err")
            winston.info(err)
            reject("failed")
            // console.log("err::", err)
        });
    })
}
exports.NOTINUSE_FACIAL_RECOGNITION = async (req,res,next)=>{
    var _PIN_ARRAY = req.body.arrayofmobiles;
    var respData =[];
    for (x of _PIN_ARRAY){
        // winston.info(x.pin +" "+ x.maxdist)
        //  x.mobile = x.mobile.trim()
         console.log(x.mobile, x.urllink)
        try {
            if(x.mobile == "") {
                throw {
                    status:"fail",
                    mobile: x.mobile,
                    error: ` {${x.mobile}} invalid mobile format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }
            } if(x.mobile ===" "){ 
                throw {
                    status:"fail",
                    mobile: x.mobile,
                    error: ` {${x.mobile}} invalid mobile format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }
                
            } if(x.mobile ===null ||x.mobile === undefined  ){
                throw {
                    status:"fail",
                    mobile: x.mobile,
                    error: ` {${x.mobile}} invalid pin format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }
            } 
            if(x.mobile !== x.mobile.toUpperCase()){
                throw {
                    status:"fail",
                    mobile: x.mobile,
                    error: ` {${x}} invalid mobile format , Must be uppercase`,
                    desc: "fail"
                }
            }
            // if (!x.match(/((^[0-9]+)|(^+[0-9]+))+[0-9A-Z]+$/)){
            if(!x.mobile.match(/^[0-9]+$/)){
                throw {
                    status:"fail",
                    mobile: x.mobile,
                    error: ` {${x}} invalid mobile format , Must be all numbers `,
                    desc: "fail"
                }
            } 

            // var url_links = await geturlsfromconfig();
            var result = await get_token_via_mobile(x.mobile)
            // var sendsms = await blast_sms_to_pin(result, url_links)
            var sendpushnot = await send_push_notification_frsm(x.mobile, result.result.token, x.url)
            // console.log(result.result.token)
            respData.push(sendpushnot)
        }catch (err){
            console.log("trycatcherrro",err)
            respData.push(err)
        }  
    }
    res.status(200).json({
        message: respData
    })
}
const get_token_via_mobile = async function(_mobile){
    return new Promise((resolve,reject)=>{
        console.log("GDGDGDGDGDGSDGD", _mobile)
        XCorona.findOne({
            mobile: _mobile,
            // mobile: {$exists:true}, // some issue gives duplication in postman
            issuspended:"false", 
            expiry:false
        },{_id:0,pin:1, mobile:1,issuspended:1,expiry:1,loaend:1,loastart:1, token:1}).then(function(result){
            if(result==null){
                reject({
                    status: "fail",
                    mobile: _mobile,
                    error: `This {${_mobile}} is not a valid mobile`
                })
            } else {
                resolve({
                    result: result,
                    phoneNumber: result.mobile
                })
            }
        }).catch(function(err){
            logger.info("get_token_via_mobile.catch==>>", err)
            reject({
                mobile: _mobile,
                error: `catch error {${_mobile}} `
            })
        })
    })
}
const send_push_notification_frsm = async function(xpin, xtoken, url){
    return new Promise((resolve,reject)=>{
        var message = {
            notification: {
                title: 'SHN & QO Notification',
                body: 'As part of the active monitoring efforts, click here to authenticate yourself.'
              },
            data: {
                content: 'link',
                link: `${url}`,
            },
		//ttl:3600
          };
          var options = {
            priority :  "high",
            timeToLive : 60 * 60 * 24
         };
         admin.messaging().sendToDevice(xtoken, message)
         .then(function(response) {
               winston.info(`exports.send_push_notification_frsm:==>>${xpin} ${xtoken}`);
               resolve({
                   pin: xpin,
                   token: xtoken,
                   status: "pass",
                   date: moment().format("DD-MM-YYYY:HH:mm:ss")
               })
         })
         .catch(function(error) {
             winston.error("admin.messaging.catch=>"+ error);
             reject({
                 pin:xpin,
                 token:xtoken,
                 status:"fail",
                 date: moment().format("DD-MM-YYYY:HH:mm:ss")
             })
         });

    })
}
const not_send_push_notification_frsm = async function(xpin, xtoken, url){
    return new Promise((resolve,reject)=>{
        var message = {
            notification: {
              title: 'SHN & QO Reporting',
              body: `Please click here to launch the application ${url}.`
            },
            data: {
                content: 'Facial Recognition',
            }
          };
          var options = {
            priority :  "high",
            timeToLive : 60 * 60 * 24
         };
         admin.messaging().sendToDevice(xtoken, message, options)
         .then(function(response) {
               winston.info(`exports.send_push_notification_frsm:==>>${xpin} ${xtoken}`);
               resolve({
                   pin: xpin,
                   token: xtoken,
                   status: "pass",
                   date: moment().format("DD-MM-YYYY:HH:mm:ss")
               })
         })
         .catch(function(error) {
             winston.error("admin.messaging.catch=>"+ error);
             reject({
                 pin:xpin,
                 token:xtoken,
                 status:"fail",
                 date: moment().format("DD-MM-YYYY:HH:mm:ss")
             })
         });

    })
}

exports.UPDATE_MY_LOC = (req,res,next)=>{
    var _pin = req.body.pin;
    var _initlat = req.body.lat
    var _initlng = req.body.lng;
    XCorona.findOneAndUpdate(
        {pin: _pin},
        {
            $set: {
               initlat: _initlat,
               initlng: _initlng 
            }
        },
        {"fields": { pin:1, loastart:1, isbiometric:1,issuspended:1, showtemperature:1, loaend:1, expiry:1 },new:true}
    ).then(function(result){
    // logjs.info("UPDATE_MY_LOC.result=>:",result)
        console.log("UPDATE_MY_LOC.result=>:",result)
        if(result != null) {
            return res.status(200).json({
                status: 1,
                desc: "proceed",
                pin: result.pin,
                issuspended: result.issuspended,
                isbiometric: result.isbiometric,
                expiry: result.expiry,
                showtemperature: result.showtemperature
            })
        }

    }).catch(function(err){
        winston.error("UPDATE_MY_LOC.catch=>: %o",err);
	 return res.status(500).json({
            error: "unabel to update lat lng some error in catch"
        })
    })
}

//https://lufthansadsl.tk/virusrip/novel/ed-biometric/61RG61VH?bool=false
// http://localhost:4200/novel/ed-biometric/JAIN?bool=false
exports.BY_PIN_ENABLE_DISABLE_BIOMETRIC = (req,res,next)=>{
    // -> /ed-biometric/PIN?bool=false
    let _pin_params = req.params.pin;
    let _bool_query = req.query.bool
    if(typeof _bool_query == 'undefined' || typeof _pin_params == 'undefined'){
        return res.status(500).json({
            error: `Bool as query param {${_bool_query}} or {${_pin_params}} either one is undefined`
        })
    }
    _pin_params = _pin_params.toUpperCase();
    _bool_query = _bool_query.toLowerCase();
    console.log(_bool_query, "exports.BY_PIN_ENABLE_DISABLE_BIOMETRIC")
    if(_bool_query == "true" || _bool_query == "false" || _bool_query == "" || _bool_query == undefined || _bool_query == null){
        // console.log(_bool_query, "afadsfdsafsfsdafs")
//         var _date = moment().format("DD-MM-YYYY:HH:mm:ss")
                var _date = moment().format("YYYY-MM-DD:HH:mm:ss")

	    var update = {
            pin: _pin_params,
            isbiometric: _bool_query,
            date: _date,
            ts: Date.now()
        }
	    XCorona.findOneAndUpdate({pin:_pin_params},
            {
		    $set: {"isbiometric": _bool_query},
		    $push : {susbiotrk : update}
	    },
            {"fields": { pin:1, loastart:1, isbiometric:1,issuspended:1, loaend:1, expiry:1 },new:true}
        ).then(function(result){
            console.log("exports.BY_PIN_ENABLE_DISABLE_BIOMETRIC==>>", result)
            return res.status(200).json({
                message: result
            })
        }).catch(function(err){
            return res.status(500).json({
                error: `Unable to set bool value of {${_bool_query}} for isbiometric for pin {${_pin_params}}`
            })
        })
    }else {
        return res.status(500).json({
            error: `Bool query parameter {${_bool_query}} doesnt have true or false value`
        })
    }
    
}


//https://lufthansadsl.tk/virusrip/novel/ed-biometric/61RG61VH?bool=false
// http://localhost:4200/novel/ed-biometric/IMDA?bool=false
exports.BYORGID_ALLPINS_ENABLE_DISABLE_BIOMETRIC = (req,res,next)=>{
    let _orgid_params = req.params.orgid;
    let _bool_query = req.query.bool

    if(typeof _bool_query == 'undefined' || typeof _orgid_params == 'undefined'){
        return res.status(500).json({
            error: `Bool as query param {${_bool_query}} or {${_orgid_params}} either one is undefined`
        })
    }
    _orgid_params = _orgid_params.toUpperCase();
    _bool_query = _bool_query.toLowerCase();
    console.log(_bool_query, "BYORGID_ALLPINS_ENABLE_DISABLE_BIOMETRIC")


    console.log(_bool_query, _orgid_params, "exports.exports.BYORGID_ALLPINS_ENABLE_DISABLE_BIOMETRIC = (req,res,next)=>{")
    if(_bool_query == "true" || _bool_query == "false"){
        // console.log(_bool_query, "afadsfdsafsfsdafs")
//	 var _date = moment().format("DD-MM-YYYY:HH:mm:ss")
                var _date = moment().format("YYYY-MM-DD:HH:mm:ss")

	    var update = {
            orgid: _orgid_params ,
            isbiometric: _bool_query,
            date: _date,
            ts: Date.now()
        }
        XCorona.updateMany({orgid:_orgid_params},
            {
		    $set: {"isbiometric": _bool_query},
		    $push : {susbiotrk : update}
	    },
            {"fields": { pin:1, loastart:1, isbiometric:1,issuspended:1, loaend:1, expiry:1 },new:true}
        ).then(function(result){
            console.log("exports.BY_PIN_ENABLE_DISABLE_BIOMETRIC==>>", result, result.n)
            if(result.n == "0") {
                throw {
                    error: `Unable to get result for orgid ${_orgid_params}`
                }
            }
            XCorona.find({orgid: _orgid_params},{_id:0,pin:1,loastart:1,loaend:1,isbiometric:1, issuspended:1,expiry:1}).then(function(result){
                if(result.length>=1){
                    return res.status(200).json({
                        message: result
                    })
                } else {
                    throw {
                        error: `Unable to get result for orgid ${_orgid_params}`
                    }
                }
            }).catch(function(err){
                // throw {
                //     error: `Unable to get result for orgid ${_orgid_params}`
                // }
                return res.status(500).json({
                    message: `invalid request {${_orgid_params}}`,
                })
            }) 
            
        }).catch(function(err){
            return res.status(500).json({
                error: `Unable to set bool value of {${_bool_query}} for isbiometric for pin {${_orgid_params}}`,
                somemoreerrors: err
            })
        })
    }else {
        return res.status(500).json({
            error: `Bool query parameter {${_bool_query}} doesnt have true or false value`
        })
    }
}
//https://lufthansadsl.tk/virusrip/novel/getbiometric/IMDA
// http://localhost:4200/novel/getbiometric/IMDA
exports.GET_BIOMETRIC_VIA_ORGID = (req,res,next)=>{
    var _orgid_params = req.params.orgid;
    if(typeof _orgid_params == 'undefined'){
        return res.status(500).json({
            error: `Bool as query param {${_orgid_params}} is undefined`
        })
    }
    _orgid_params = _orgid_params.toUpperCase()
    XCorona.find({orgid: _orgid_params, mobile:{$exists:true}},{_id:0,showtemperature:1,orgid:1,pin:1,mobile:1,loastart:1,loaend:1,isbiometric:1, issuspended:1,expiry:1,multilogin:1})
    .then(function(result){
        if(result.length>=1){
            return res.status(200).json({
                message: result
            })
        } else {
            return res.status(500).json({
                message: `invalid request {${_orgid_params}}`
            })
        }
        
    }).catch(function(err){
        return res.status(500).json({
            error: `Unable to get results for {${_orgid_params}} `
        })
    }) 
}


exports.ADMIN_SEND_PUSHNOTIFICATION = async (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(422).json({errors:errors.array()});
        return;
    }
    var _PIN_ARRAY = req.body.pins;
    var respData =[];
    for (xpin of _PIN_ARRAY){
        winston.info("Exports.ADMIN_SEND_PUSHNOTIFICATION.forloop==>>"+ xpin)
        try {
            var getoken = await get_token_by_pin(xpin).then(async function(token){
                var result = await send_push_notification(xpin, token)
                respData.push(result)
            }).catch(function(err){
                winston.error("exports.ADMIN_SEND_PUSHNOTIFICATION=>"+err)
                respData.push({
                    pin: xpin,
                    token: getoken,
                    desc: "failtosendpushnotiication"
                })
            })
        }catch (err){
            respData.push(err)
        }  
        winston.info(respData) 
        //winston.debug("HHHHH")
        //winston.log('info','This is an information message.');
        // console.log("IAM called", respData)
    }
    res.status(200).json({
        message: respData
    })
}

const send_push_notification = async function(xpin, xtoken){
    return new Promise((resolve,reject)=>{
        var message = {
            notification: {
              title: 'SHN & QO Notification',
              body: 'We have not heard from you for sometime. Please click here to launch the application.'
            },
            data: {
                content: 'requestupdate',
            }
          };
          var options = {
            priority :  "high",
            timeToLive : 60 * 60 * 24
         };
         admin.messaging().sendToDevice(xtoken, message, options)
         .then(function(response) {
               winston.info(`exports.ADMIN_SEND_PUSHNOTIFICATION:==>>${xpin} ${xtoken}`);
               resolve({
                   pin: xpin,
                   token: xtoken,
                   status: "pass",
                   date: moment().format("DD-MM-YYYY:HH:mm:ss")
               })
         })
         .catch(function(error) {
             winston.error("admin.messaging.catch=>"+ error);
             reject({
                 pin:xpin,
                 token:xtoken,
                 status:"fail",
                 date: moment().format("DD-MM-YYYY:HH:mm:ss")
             })
         });

    })
}

const get_token_by_pin = async function(_pin){
    return new Promise((resolve,reject)=>{
        console.log("DSSDFSDFSDf_gtotoenbypub", _pin)
        XCorona.findOne({pin:_pin})
        .then((result1)=>{
            if(result1 === null) {
                winston.info("get_token_by_pin.result1==>>"+ result1)
                reject(`This {${_pin}} doesnt have any token`)
            } else {
                winston.info("get_token_by_pin.result1==>>"+ result1.token)
                resolve(result1.token)
            }
        }).catch((err)=>{
                winston.error("get_token_by_pin.catch=>" +err)
          reject("unabletogettoken")
        })
    })
}

exports.UPDATE_MAX_DIST_DEBUGGING = (req,res,next)=>{
    var _PIN_ARRAY = req.body.threshold
    // console.log(_PIN_ARRAY)
    for (i of _PIN_ARRAY){
        winston.info(i.pin +" "+ i.maxdist)
    }
    res.status(200).json({
        message: _PIN_ARRAY
    })
}
exports.UPDATE_MAX_DIST = async (req,res,next)=>{
    var _PIN_ARRAY = req.body.threshold
    // console.log(_PIN_ARRAY);
    var count = 0;
    var respData =[];
    for (x of _PIN_ARRAY){
        //winston.info("exports.UPDATE_MAX_DIST==>>" +x.pin +" "+ x.maxdist)
        count++;
	try {
            var result = await maxdist_UPDATE(x)
            respData.push(result)
        }catch (err){
            respData.push(err)
        }   
        //console.log("IAM called", respData)
    }
    winston.info("exports.UPDATE_MAX_DIST==>>TotalPinsCount->" + count)
    res.status(200).json({
        message: respData
    })
}
const maxdist_UPDATE = async function(x){
    return new Promise((resolve,reject)=>{
        XCorona.findOneAndUpdate(
            {pin:x.pin},
            {
                $set:{
			maxdist: x.maxdist,
			mindist: x.mindist,
			maxalt : x.maxalt,
			minalt : x.minalt
		}
            }
        ).then(function(result){
            if(result== null){
                reject({
                    pin: x.pin,
                    maxdist: "errorUpdating",
                    status: "fail"
                })
            } else {
                resolve({
                    pin: result.pin,
                    maxdist: result.maxdist,
                    status: "pass"
                })
            }
        }).catch(function(err){
            winston.error("exports.UPDATE_MAX_DIST.maxdist_UPDATE.catch=>" +err)
           reject(({
                pin: x.pin,
                maxdist: "catchError" ,
                status: "catch"
           }))
        })
    })
}
exports.ORGID_GET_FLOATING_PINS = (req,res,next)=>{
    var _orgid =req.params.orgid
    XCorona.find({"mobile": { $exists: false, $ne: ""}, orgid:_orgid}, {_id:0,orgid:1, pin:1,ts:1,maxdist:1,mindist:1,maxalt:1,minalt:1,updfreq:1,maxvltn:1})
    .then(function(result){
        return res.status(200).json({
            message: {
                result: result
            }
        })

    }).catch(function(err){
        return res.status(500).json({
            error:{
                error: "UnableToGetFloatingPinsByOrgID"
            }
        })
    })
}

exports.MULTI_LOGIN = async(req,res,next)=>{
    var _PINSARRAY = req.body.pins;
    var _boolValue = req.body.value;
    var _result = [];
    for (const pin of _PINSARRAY) {
        try {
            var result = await update_multilogin(pin, _boolValue)
            _result.push(result)
        } catch(err){
            _result.push(err)
            console.log("Error:multilogin:", err)
        }
    }
    res.status(200).json({
        message: _result
    })
}

const update_multilogin = async function(_pin,_value){
    return new Promise((resolve,reject)=>{
        XCorona.findOneAndUpdate({pin:_pin},
            {
                $set: {multilogin: _value}
            }, {new:  true}
        ).then(function(result){
            if(result == null){
                reject({
                    pin: _pin,
                    desc: "notFound"
                })
            } else {
                resolve({
                    pin: _pin,
                    desc: `multilogin:${result.multilogin}`
                })
            }

        }).catch(function(err){
            console.log("MultiLoginSet", err)
            reject({
                pin: _pin,
                desc: "catchErrorDuringMultiLoginSet"
            })
        })
    })
}

exports.BOOL_SUSPENDED_PINS_GET_ALL = (req,res,next)=>{
    var _bool = req.params.bool;
    // var _orgid = req.params.orgid;
    XCorona.find({issuspended:_bool},
        {_id:0, pin:1,orgid:1,issuspended:1,expiry:1, token:1,loastart:1, loaend:1, mobile:1}
    ).then(function(result){
        if(result.length>= 1){
            return res.status(200).json({
                message: result
            })
        } else {
            return res.status(500).json({
                error: "Unable to find suspended pins true or false"
            })
        }
    }).catch(function(err){
        return res.status(500).json({
            error: "Catch Error unable to find pins for BOOL_SUSPENDED_PINS_GET_ALL"
        })
    })
}

exports.BOOL_ORGID_SUSPENDED_PINS_GET_ALL = (req,res,next)=>{
    var _bool = req.params.bool;
    var _orgid = req.params.orgid;
    XCorona.find({issuspended:_bool, orgid: _orgid},
        {_id:0, pin:1,orgid:1,issuspended:1,expiry:1, token:1,loastart:1, loaend:1, mobile:1}
    ).then(function(result){
        if(result.length>= 1){
            return res.status(200).json({
                message: result
            })
        } else {
            return res.status(500).json({
                error: "Unable to find suspended pins true or false"
            })
        }
    }).catch(function(err){
        return res.status(500).json({
            error: "Catch Error unable to find pins"
        })
    })
}

exports.ORG_ID_GET_ALL_PINS = (req,res,next)=>{
    var _orgid = req.params.orgid;
	_orgid = _orgid.toUpperCase()
    // var _days = req.params.days
    console.log("PARAMS", _orgid)
    XCorona.find(
        {orgid:_orgid},
        {
            pin: 1,
            mobile:1,
            loaend:1,
            loastart:1,
            lastupdate:1,
           timestamp:1,
            biolastupdate:1,
            devicetype:1,
            initlat:1,
            initlng:1,
            biopush:1,
            bioupdate:1,
            hrloaend:1,
           timestamp:1,
            hrloastart:1,
            trk:1,
            issuspended: 1,
            maxdist: 1,
            maxvltn: 1,
            otpireq:1,
            otpmaxtry:1,
            otptout:1,
            updfreq:1,
            token:1,
            orgid:1,
            userfirstlogin:1,
            multilogin:1,
        }
    ).then(function(result){
        return res.status(200).json({
            message: result
        })
    }).catch(function(err){
        res.status(500).json({
            error: "UnableToFindPinsByThisOrgId"
        })
    })
}

exports.IS_SUSPENDED_PUSH = async(req,res,next)=>{
    var _PINSARRAY = req.body.pins;
    var _boolValue = req.body.value;
    var _result = [];
    for (const pin of _PINSARRAY) {
        try {
            var result = await update_isSuspended_push(pin, _boolValue)
            _result.push(result)
        } catch(err){
            _result. push(err)
            console.log("Error:IsSuspended:", err)
        }
    }
    res.status(200).json({
        message: _result
    })
}

const update_isSuspended_push = async function(_pin,_value){
    return new Promise((resolve,reject)=>{
//	var _date = moment().format("DD-MM-YYYY:HH:mm:ss")
	var _date = moment().format("YYYY-MM-DD:HH:mm:ss")
        var update = {
            pin: _pin,
            issuspended: _value,
            date: _date,
            ts: Date.now()
        }
        XCorona.findOneAndUpdate({pin:_pin},
            {
                $set: {issuspended: _value},
		$push: {susbiotrk : update}
            }, {new:  true}
        ).then(function(result){
            if(result == null){
                reject({
                    pin: _pin,
                    desc: "notFound"
                })
            } else {
                if(_value == "true") {
                    if(result.token != "" || result.token != "na", result.token != undefined) {
                        send_push_notification(_pin, result.token)
                        .then(function(result){
                            console.log("SentPushNotificationAfterEnabledSuspendedPin::",result)
                        }).catch(function(err){
                            console.log("SentPushNotificationAfterEnabledSuspendedPinError::",err)
                        })
                    }
                }
                resolve({
                    pin: _pin,
                    desc: result.issuspended
                })
            }
            
        }).catch(function(err){
            console.log("EEEEEEE", err)
            reject({
                pin: _pin,
                desc: "catchErrorDuringIsSuspendedSet"
            })
        })
    })
}
exports.IS_SUSPENDED = async(req,res,next)=>{
    var _PINSARRAY = req.body.pins;
    var _boolValue = req.body.value;
    var _result = [];
    for (const pin of _PINSARRAY) {
        try {
            var result = await update_isSuspended(pin, _boolValue)
            _result.push(result)
        } catch(err){
            _result.push(err)
            console.log("Error:IsSuspended:", err)
        }
    }
    res.status(200).json({
        message: _result
    })
}

const update_isSuspended = async function(_pin,_value){
    return new Promise((resolve,reject)=>{
        XCorona.findOneAndUpdate({pin:_pin},
            {
                $set: {issuspended: _value}
            }, {new:  true}
        ).then(function(result){
            if(result == null){
                reject({
                    pin: _pin,
                    desc: "notFound"
                })
            } else {
                resolve({
                    pin: _pin,
                    desc: result.issuspended
                })
            }

        }).catch(function(err){
            console.log("EEEEEEE", err)
            reject({
                pin: _pin,
                desc: "catchErrorDuringIsSuspendedSet"
            })
        })
    })
}


exports.GET_FLOATING_PINS = (req,res,next)=>{
    // db.otp.find({"mobile": { $exists: false, $ne: ""}}, {_id:0, pin:1,ts:1})
    XCorona.find({"mobile": { $exists: false, $ne: ""}}, {_id:0,orgid:1, pin:1,ts:1,maxdist:1,mindist:1,maxalt:1,minalt:1,updfreq:1,maxvltn:1})
    .then(function(result){
        return res.status(200).json({
            message: {
                result: result
            }
        })

    }).catch(function(err){
        return res.status(500).json({
            error:{
                error: "UnableToGetFloatingPins"
            }
        })
    })
}
// var currentD = Date.now();
// var unixepoch2 = new Date(1581757699369).getTime();
// var dd = moment(unixepoch2).tz('Asia/Singapore').format('DD/MM/YYYY')
// var ts = moment("24/2/2020", "DD/MM/YYYY").valueOf();
// var ts2 = moment(ts).tz('Asia/Singapore').format('DD/MM/YYYY')

// console.log("=========>>>>", ts2)
// console.log("==========>", ts)
// if(dd == date){
//     console.log("Ewuals",dd, date)
// } else {
//     console.log("motegql", dd, date)
// }
// var maxdist = "50"; // in meters
// var updfreq = "10"; // in minutes
// var maxvltn = "6"; //count
// var otpmaxtry = "3"; //attempts
// var otpexpiry = "3"; // in minutes
// var otptout = "3"; // in minutes
// var otpireq = "60"; // in seconds

// config: {type:String, required:false},
// maxdist: {type:String, required:false},
// updfreq: {type:String, required:false},
// maxvltn: {type:String, required:false}
// exports.UPDATE_CONFIG = (req,res,next)=>{
//     // console.log(req.body)
//     // var _config = "JAIN";
//     // var _maxdist = req.body.maxdist;
//     // var _updfreq = req.body.updfreq;
//     // var _maxvltn = req.body.maxvltn;
//     // var _otptout = req.body.otptout; // OTP Timeout
//     // var _otpexpiry = req.body.otpexpiry;
//     // var _otpmaxtry = req.body.otpmaxtry; // OTP Number of Tries
//     // var _otpireq = req.body.otpireq; // OTP Request Interval
//     // console.log(_maxdist, _updfreq, _maxvltn)

//     // maxdist = (_maxdist == "" || _maxdist == undefined) ?
//     //     maxdist : _maxdist;

//     // updfreq = (_updfreq == "" || _updfreq == undefined) ?
//     //     updfreq : _updfreq;

//     // maxvltn = (_maxvltn == "" || _maxvltn == undefined) ?
//     //     maxvltn : _maxvltn;

//     // otpexpiry = (_otpexpiry == "" || _otpexpiry == undefined) ?
//     //     otpexpiry : _otpexpiry;

//     // otptout = (_otptout == "" || _otptout == undefined) ?
//     //     otptout : _otptout;

//     // otpmaxtry = (_otpmaxtry == "" || _otpmaxtry == undefined) ?
//     //     otpmaxtry : _otpmaxtry;

//     // otpireq = (_otpireq == "" || _otpireq == undefined) ?
//     //     otpireq : _otpireq;

//     res.status(200).json({
//         maxdist: maxdist,
//         updfreq: updfreq,
//         maxvltn: maxvltn,
//         otpexpiry: otpexpiry,
//         otpireq: otpireq,
//         otpmaxtry: otpmaxtry,
//         otptout: otptout
//     })
// }

// const updateConfig = function(){
//     return new Promise((resolve,reject)=>{
//         CONFIG.find({config:"JAIN"})
//         .then((result)=>{
//             if(result.length>=1){

//             } else {
//                 var newConfig = new CONFIG({
//                     config: "JAIN",
//                     maxdist: maxdist,
//                     updfreq: updfreq,
//                     maxvltn: maxvltn,
//                     otpexpiry: otpexpiry,
//                     otpireq: otpireq,
//                     otpmaxtry: otpmaxtry,
//                     otptout: otptout
//                 })
//                 resolve(newConfig.save())
//             }
//         }).catch((err)=>{
//             console.log("UpdateConfig::", err)
//             reject("unabletoupdateconfig")
//         })
//     })
// }
//
//
exports.PIN_QUERY_GET_DATA_BY_DAYS = (req,res,next)=>{
    var _days = req.params.days;
    var _pin = req.params.pin

    let a = 0, b = 30;
    var arr = Array.from(range(a, b));
    function* range(a, b) {
      for (var i = a; i <= b; ++i) yield i;
    }
    if(_pin == "" || _pin == null || _pin ==undefined ){
        return res.status(500).json({
            error:{
                error: ` ${_pin} : not a valid`,
                desc: `EnterValid Pin`
            }
        })
    }
    if(!arr.includes(parseInt(_days))){
        return res.status(500).json({
            error:{
                error: ` ${_days} : not a valid`,
                desc: `Enter days range from 1 to 30 - max limit is 30, 0 will give todays date from monring 12:00:AM`
            }
        })
    }
    var yest = 0;
    var bioupdateyest =0;
    if(_days == 0){
        now = _MOMENT()
       // console.log('start ' + now.startOf('day').toString().unixepoch)
        const start = now.format('YYYY-MM-DD 00:00:01');
        //console.table(["AAAAA", _MOMENT(start).valueOf()])
        yest = _MOMENT(start).valueOf();
        bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    } else {
        _days = _days * 24
        console.log("_days", _days)
        var ts = Math.round(new Date().getTime());
        var tsYesterday = ts - (`${_days}` * 3600 * 1000);
        var abc = new Date().getTime() - (_days * 60 * 60 * 1000);
        //console.log("GET_DATA_BY_DAYS", tsYesterday, moment(tsYesterday).format("DD-MM-YYYY:HH:mm:ss"), abc)
        yest = parseInt(tsYesterday)
        bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    }
    console.table([["Time", yest], ["bioupdate",bioupdateyest]])

    XCorona.aggregate([
        // {$match: {"biopush": {$ne: null}}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}, "pin": "JAIN"}},
        {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}, "pin":_pin}},
        {
           $project: {
            pin: 1,
            pcode:1,
            mobile:1,
            loaend:1,
            loastart:1,
            lastupdate:1,
           timestamp:1,
		   biolastupdate:1,
            devicetype:1,
            initlat:1,
            initlng:1,
            biopush:1,
            bioupdate:1,
            hrloaend:1,
	   timestamp:1,
            hrloastart:1,
            trk:1,
            issuspended: 1,
            maxdist: 1,
            mindist:1,
            maxalt:1,
	    minalt:1,
            maxvltn: 1,
            otpireq:1,
            otpmaxtry:1,
            otptout:1,
            updfreq:1,
            token:1,
            orgid:1,
            userfirstlogin:1,
            multilogin:1,
              trk: {
                 $filter: {
                    input: "$trk",
                    as: "trkams",
                    cond: { $and: [
                        // { $gte:  [ "$$biopushams.count", 1 ] },
                        { $gte:  [ "$$trkams.ts", yest ] }
                      ] }
                 }
              },
              biopush: {
                $filter: {
                   input: "$biopush",
                   as: "biopushams",
                   cond: { $and: [
                       // { $gte:  [ "$$biopushams.count", 1 ] },
                       { $gte:  [ "$$biopushams.ts", yest ] }
                     ] }
                }
             }
             ,
             bioupdate: {
               $filter: {
                  input: "$bioupdate",
                  as: "bioupdatams",
                  cond: { $or: [
                      //{ $gte:  [ "$$bioupdatams.ts", yest ] },
                      { $gte:  [ "$$bioupdatams.dt", bioupdateyest ] }
                    ] }
               }
            }
           }
        }
     ]).then(function(result){
        return res.status(200).json({
            message: result
        })
      }).catch(function(err){
        return res.status(500).json({
            error: "unableTogetData"
        })
      })
}

exports.PIN_GET_DATA_BY_DAYS_BIO_PUSH_UPDATE_ORGID = (req,res,next)=>{
    var _days = req.params.days;
    var _pin = req.params.pin;
    var _orgid = req.params.orgid;
    _orgid = _orgid.toUpperCase();

    let a = 0, b = 30;
    var arr = Array.from(range(a, b));
    function* range(a, b) {
      for (var i = a; i <= b; ++i) yield i;
    }

    if(!arr.includes(parseInt(_days))){
        return res.status(500).json({
            error:{
                error: ` ${_days} : not a valid`,
                desc: `Enter days range from 1 to 30 - max limit is 30, 0 will give todays date from monring 12:00:AM`
            }
        })
    }
    var yest = 0;
    var bioupdateyest =0;
    if(_days == 0){
        now = _MOMENT()
        console.log('start ' + now.startOf('day').toString().unixepoch)
        const start = now.format('YYYY-MM-DD 00:00:01');
       // console.table(["AAAAA", _MOMENT(start).valueOf()])
        yest = _MOMENT(start).valueOf();
        //bioupdateyest = moment(yest).format("DD/MM/YYYY")
    bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    } else {
        _days = _days * 24
        console.log("_days", _days)
        var ts = Math.round(new Date().getTime());
        var tsYesterday = ts - (`${_days}` * 3600 * 1000);
        var abc = new Date().getTime() - (_days * 60 * 60 * 1000);
       // console.log("GET_DATA_BY_DAYS", tsYesterday, moment(tsYesterday).format("DD-MM-YYYY:HH:mm:ss"), abc)
        yest = parseInt(tsYesterday)
        //bioupdateyest = moment(yest).format("DD/MM/YYYY")
	  bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    }
    //console.table([["Time", yest], ["bioupdate",bioupdateyest]])

    XCorona.aggregate([
        // {$match: {"biopush": {$ne: null}}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}, "pin": "JAIN"}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}}},
        {$match: { "mobile": {$exists:true},  "trk": {$ne: []}, "trk.ts": {$ne: null}, "orgid": _orgid,"pin":_pin}},
        {
           $project: {
            pin: 1,
            pcode:1,
            mobile:1,
            loaend:1,
            loastart:1,
            lastupdate:1,
		   timestamp:1,
            biolastupdate:1,
            devicetype:1,
            expiry:1,
            initlat:1,
            initlng:1,
            biopush:1,
            bioupdate:1,
            hrloaend:1,
            hrloastart:1,
            trk:1,
            isbiometric:1,
            issuspended: 1,
            maxdist: 1,
		   mindist:1,
		   maxalt:1,
		   minalt:1,
            maxvltn: 1,
            otpireq:1,
            otpmaxtry:1,
            otptout:1,
            updfreq:1,
            token:1,
            orgid:1,
            userfirstlogin:1,
            multilogin:1,
            susbiotrk:1,
              trk: {
                 $filter: {
                    input: "$trk",
                    as: "trkams",
                    cond: { $and: [
                        // { $gte:  [ "$$biopushams.count", 1 ] },
                        { $gte:  [ "$$trkams.ts", yest ] }
                      ] }
                 }
              },
              biopush: {
                $filter: {
                   input: "$biopush",
                   as: "biopushams",
                   cond: { $and: [
                       // { $gte:  [ "$$biopushams.count", 1 ] },
                       { $gte:  [ "$$biopushams.ts", yest ] }
                     ] }
                }
             }
             ,
             bioupdate: {
               $filter: {
                  input: "$bioupdate",
                  as: "bioupdatams",
                  cond: { $and: [
                     // { $gte:  [ "$$biopushams.count", 1 ] },
                     // { $gte:  [ "$$bioupdatams.dt", bioupdateyest ] }
                     // { $eq: [{ $type: "$$bioupdatams.ts" }, "number"] },
		{ $eq: [{ $type: "$$bioupdatams.ts" }, "double"] },
			  { $gte:  [ "$$bioupdatams.ts", yest ] }  
		  ] }
               }
            },
		      susbiotrk: {
               $filter: {
                  input: "$susbiotrk",
                  as: "biosus",
                  cond: { $and: [
                      // { $gte:  [ "$$biopushams.count", 1 ] },
                      { $gte:  [ "$$biosus.ts", yest ] }
                    ] }
               }
            }
           }
        }
     ]).then(function(result){
        return res.status(200).json({
            message: result
        })
      }).catch(function(err){
        return res.status(500).json({
            error: "unableTogetData"
        })
      })
}

exports.ORGID_BIOPINS_GET_ALL_PINS_FOR_BIOMETRIC = (req,res,next)=>{
    var _orgid = req.params.orgid;
    _orgid = _orgid.toUpperCase();
    var ex = Date.now() -  (20 * 60 * 1000);
    console.log("ex::::::+++++++++>>>>", moment(ex).format("DD-MM-YYY_HH:mm:ss"))
    XCorona.find(
        {expiry:"false", mobile: {$exists:true}, issuspended:"false", isbiometric: "true", biolastupdate: {$lt: ex}, orgid:_orgid},
    //  { isbiometric: "true"},
        {orgid:1, isbiometric:1,biolastupdate:1,issuspended:1,mobile:1, expiry:1, _id: 0, pin:1, token:1}
    ).then((result)=>{
       if(result.length>=1){
           console.log("result.length_ORGID_BIOPINS:", result.length)
           return res.status(200).json({
               message: result
            })
       } else {
           console.log("result.len", result.length)
           return res.status(200).json({
            message: result
         })
       }
    }).catch(function(err){
        console.log("ersdf", err)
       // reject("unabletogettokensforBiometricpushnotification")
        return res.status(500).json({
            error: "unabletoget"
        })
    })
}
exports.notinuse__ORGID_BIOPINS_GET_ALL_PINS_FOR_BIOMETRIC = (req,res,next)=>{
    var _orgid = req.params.orgid;
    _orgid = _orgid.toUpperCase();
    var ex = Date.now() -  (20 * 60 * 1000);
    console.log("ex::::::+++++++++>>>>", moment(ex).format("DD-MM-YYY_HH:mm:ss"))
    XCorona.find(
        {expiry:"false", issuspended:"false", biolastupdate: {$lt: ex}, orgid:_orgid},
        {orgid:1, biolastupdate:1,issuspended:1,mobile:1, expiry:1, _id: 0, pin:1, token:1}
    ).then((result)=>{
       if(result.length>=1){
           console.log("result.length_ORGID_BIOPINS:", result.length)
           return res.status(200).json({
               message: result
            })
       } else {
           console.log("result.len", result.length)
       }
    }).catch(function(err){
        console.log("ersdf", err)
        reject("unabletogettokensforBiometricpushnotification")
    })
}

exports.ORGID_CHANGE_OR_SET = (req,res,next)=>{
    var _orgid = req.body.orgid;
    _orgid = _orgid.toUpperCase();
    var _pin = req.body.pin;
    XCorona.findOneAndUpdate(
        {pin:_pin},
        {
            $set: {"orgid": _orgid}
        },{new: true}
    ).then(function(result){
        if(result == null){
            return res.status(500).json({
                error: `${_pin} not found`
            })
        } else {
            return res.status(200).json({
                message: ` Organization ID: {${_orgid}}  successfully assigned to the pin {${_pin}}`
            })
        }
    }).catch(function(err){
        return res.status(500).json({
            error: "unable to update orgid to the pin"
        })
    })
}

exports.DISTINC_ORGIDS = (req,res,next)=>{
    XCorona.distinct("orgid").then((result)=>{
        res.status(200).json({
            message: result
        })
    }).catch((err)=>{
        return res.status(500).json({
            error: "Unable to fetch distinc orgids"
        })
    })
}


exports.DISTINC_PINS = (req,res,next)=>{
    XCorona.distinct("pin").then((result)=>{
        res.status(200).json({
            message: result
        })
    }).catch((err)=>{
        return res.status(500).json({
            error: "Unable to fetch distinc pins"
        })
    })
}

exports.DISTINC_PINS_ORGID = (req,res,next)=>{
    var _orgid = req.params.orgid;
    XCorona.distinct("pin", {orgid:_orgid}).then((result)=>{
        res.status(200).json({
            message: result
        })
    }).catch((err)=>{
        return res.status(500).json({
            error: "Unable to fetch distinc pins"
        })
    })
}
exports.ORGID_GET_DATA_BY_DAYS_BIO_PUSH_UPDATE_ORGID = (req,res,next)=>{
    var _days = req.params.days;
    var _orgid = req.params.orgid;
    _orgid = _orgid.toUpperCase();
    console.log("Chris",req.headers['authorization']);
    let a = 0, b = 30;
    var arr = Array.from(range(a, b));
    function* range(a, b) {
      for (var i = a; i <= b; ++i) yield i;
    }

    if(!arr.includes(parseInt(_days))){
        return res.status(500).json({
            error:{
                error: ` ${_days} : not a valid`,
                desc: `Enter days range from 1 to 30 - max limit is 30, 0 will give todays date from monring 12:00:AM`
            }
        })
    }
    var yest = 0;
    var bioupdateyest =0;
    if(_days == 0){
        now = _MOMENT()
        console.log('start ' + now.startOf('day').toString().unixepoch)
        const start = now.format('YYYY-MM-DD 00:00:01');
        console.table(["AAAAA", _MOMENT(start).valueOf()])
        yest = _MOMENT(start).valueOf();
        //bioupdateyest = moment(yest).format("DD/MM/YYYY")
	bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    } else {
        _days = _days * 24
        console.log("_days", _days)
        var ts = Math.round(new Date().getTime());
        var tsYesterday = ts - (`${_days}` * 3600 * 1000);
        var abc = new Date().getTime() - (_days * 60 * 60 * 1000);
        console.log("GET_DATA_BY_DAYS", tsYesterday, moment(tsYesterday).format("DD-MM-YYYY:HH:mm:ss"), abc)
        yest = parseInt(tsYesterday)
        //bioupdateyest = moment(yest).format("DD/MM/YYYY")
	bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    }
    console.table([["Time", yest], ["bioupdate",bioupdateyest]])

    XCorona.aggregate([
        // {$match: {"biopush": {$ne: null}}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}, "pin": "JAIN"}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}}},
        {$match: { "mobile": {$exists:true},  "trk": {$ne: []}, "trk.ts": {$ne: null}, "orgid": _orgid}},
        {
           $project: {
            pin: 1,
            pcode:1,
            mobile:1,
            loaend:1,
            loastart:1,
            lastupdate:1,
		   timestamp:1,
            biolastupdate:1,
            devicetype:1,
            expiry:1,
            initlat:1,
            initlng:1,
            biopush:1,
            bioupdate:1,
            hrloaend:1,
            hrloastart:1,
            trk:1,
            isbiometric:1,
            issuspended: 1,
            maxdist: 1,
            mindist:1,
            maxalt:1,
            minalt:1,
            maxvltn: 1,
            otpireq:1,
            otpmaxtry:1,
            otptout:1,
            updfreq:1,
            token:1,
            orgid:1,
            userfirstlogin:1,
            multilogin:1,
	   susbiotrk:1,
              trk: {
                 $filter: {
                    input: "$trk",
                    as: "trkams",
                    cond: { $and: [
                        // { $gte:  [ "$$biopushams.count", 1 ] },
                        { $gte:  [ "$$trkams.ts", yest ] }
                      ] }
                 }
              },
              biopush: {
                $filter: {
                   input: "$biopush",
                   as: "biopushams",
                   cond: { $and: [
                       // { $gte:  [ "$$biopushams.count", 1 ] },
                       { $gte:  [ "$$biopushams.ts", yest ] }
                     ] }
                }
             }
             ,
             bioupdate: {
               $filter: {
                  input: "$bioupdate",
                  as: "bioupdatams",
                  cond: { $and: [
                      // { $gte:  [ "$$biopushams.count", 1 ] },
                                            { $eq: [{ $type: "$$bioupdatams.ts" }, "double"] },
			  { $gte:  [ "$$bioupdatams.dt", bioupdateyest ] }
                    ] }
               }
            },
             biosustrk: {
               $filter: {
                  input: "$biosustrk",
                  as: "biosus",
                  cond: { $and: [
                      // { $gte:  [ "$$biopushams.count", 1 ] },
                      { $gte:  [ "$$biosus.ts", yest ] }
                    ] }
               }
            },

           }
        }
     ]).then(function(result){
        return res.status(200).json({
            message: result
        })
      }).catch(function(err){
        return res.status(500).json({
            error: "unableTogetData"
        })
      })
}
exports.GET_DATA_BY_DAYS_BIO_PUSH_UPDATE = (req,res,next)=>{
    var _days = req.params.days;
    let a = 0, b = 30;
    var arr = Array.from(range(a, b));
    function* range(a, b) {
      for (var i = a; i <= b; ++i) yield i;
    }
    if(!arr.includes(parseInt(_days))){
        return res.status(500).json({
            error:{
                error: ` ${_days} : not a valid`,
                desc: `Enter days range from 1 to 30 - max limit is 30, 0 will give todays date from monring 12:00:AM`
            }
        })
    }
    var yest = 0;
    var bioupdateyest =0;
    if(_days == 0){
        now = _MOMENT()
        // console.log('start ' + now.startOf('day').toString().unixepoch)
        const start = now.format('YYYY-MM-DD 00:00:01');
        // console.table(["AAAAA", _MOMENT(start).valueOf()])
        yest = _MOMENT(start).valueOf();
        //bioupdateyest = moment(yest).format("DD/MM/YYYY")
   bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    } else {
        _days = _days * 24
        console.log("_days", _days)
        var ts = Math.round(new Date().getTime());
        var tsYesterday = ts - (`${_days}` * 3600 * 1000);
        var abc = new Date().getTime() - (_days * 60 * 60 * 1000);
        // console.log("GET_DATA_BY_DAYS", tsYesterday, moment(tsYesterday).format("DD-MM-YYYY:HH:mm:ss"), abc)
        yest = parseInt(tsYesterday)
       // bioupdateyest = moment(yest).format("DD/MM/YYYY")
	      bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    }
    // console.table([["Time", yest], ["bioupdate",bioupdateyest]])

    XCorona.aggregate([
        // {$match: {"biopush": {$ne: null}}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}, "pin": "JAIN"}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}}},
        {$match: { "mobile": {$exists:true},  "trk": {$ne: []}, "trk.ts": {$ne: null}}},
        {
           $project: {
            pin: 1,
            pcode:1,
            mobile:1,
            loaend:1,
            loastart:1,
            lastupdate:1,
		        timestamp:1,
            biolastupdate:1,
            devicetype:1,
            initlat:1,
            initlng:1,
            biopush:1,
            bioupdate:1,
            hrloaend:1,
            hrloastart:1,
            trk:1,
            isbiometric:1,
            issuspended: 1,
            maxdist: 1,
            mindist:1,
            maxalt:1,
            minalt:1,
            maxvltn: 1,
            otpireq:1,
            otpmaxtry:1,
            otptout:1,
            updfreq:1,
            token:1,
            expiry:1,
            orgid:1,
            userfirstlogin:1,
            multilogin:1,
              trk: {
                 $filter: {
                    input: "$trk",
                    as: "trkams",
                    cond: { $and: [
                        // { $gte:  [ "$$biopushams.count", 1 ] },
                        { $gte:  [ "$$trkams.ts", yest ] }
                      ] }
                 }
              },
              biopush: {
                $filter: {
                   input: "$biopush",
                   as: "biopushams",
                   cond: { $and: [
                       // { $gte:  [ "$$biopushams.count", 1 ] },
                       { $gte:  [ "$$biopushams.ts", yest ] }
                     ] }
                }
             }
             ,
             bioupdate: {
               $filter: {
                  input: "$bioupdate",
                  as: "bioupdatams",
                  cond: { $and: [
                      // { $gte:  [ "$$biopushams.count", 1 ] },
                                            { $eq: [{ $type: "$$bioupdatams.ts" }, "double"] },
			  { $gte:  [ "$$bioupdatams.dt", bioupdateyest ] }
                    ] }
               }
            }
           }
        }
     ]).then(function(result){
        return res.status(200).json({
            message: result
        })
      }).catch(function(err){
        console.log("exports.GET_DATA_BY_DAYS_BIO_PUSH_UPDATE.catch=>",err)
        return res.status(500).json({
            error: "unableTogetData"
        })
      })
}


exports.PIN_QUERY_GET_DATA_BY_DAYS_WORKS_NOTINUSE = (req,res,next)=>{
    var _days = req.params.days;
    var _pin = req.query.pin

    let a = 1, b = 30;
    var arr = Array.from(range(a, b));
    function* range(a, b) {
      for (var i = a; i <= b; ++i) yield i;
    }
    if(_pin == "" || _pin == null || _pin ==undefined ){
        return res.status(500).json({
            error:{
                error: ` ${_pin} : not a valid`,
                desc: `EnterValid Pin`
            }
        })
    }
    if(!arr.includes(parseInt(_days))){
        return res.status(500).json({
            error:{
                error: ` ${_days} : not a valid`,
                desc: `Enter days 1 or 2 or 29 - max limit is 30, 0 is not allowed`
            }
        })
    }
    _days = _days * 24
    // console.log("_days", _days)
    var ts = Math.round(new Date().getTime());
    var tsYesterday = ts - (`${_days}` * 3600 * 1000);
    var abc = new Date().getTime() - (_days * 60 * 60 * 1000);
    // console.log("GET_DATA_BY_DAYS", tsYesterday, moment(tsYesterday).format("DD-MM-YYYY:HH:mm:ss"), abc)
    var yest = parseInt(tsYesterday)
    var bioupdateyest = moment(tsYesterday).format("DD/MM/YYYY")
    XCorona.aggregate([
        // {$match: {"biopush": {$ne: null}}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}, "pin": "JAIN"}},
        {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}, "pin":_pin}},
        {
           $project: {
            pin: 1,
            pcode:1,
            loaend:1,
            loastart:1,
            lastupdate:1,
            biolastupdate:1,
            devicetype:1,
            biopush:1,
            bioupdate:1,
            hrloaend:1,
            hrloastart:1,
            trk:1,
            token:1,
              trk: {
                 $filter: {
                    input: "$trk",
                    as: "trkams",
                    cond: { $and: [
                        // { $gte:  [ "$$biopushams.count", 1 ] },
                        { $gte:  [ "$$trkams.ts", yest ] }
                      ] }
                 }
              },
              biopush: {
                $filter: {
                   input: "$biopush",
                   as: "biopushams",
                   cond: { $and: [
                       // { $gte:  [ "$$biopushams.count", 1 ] },
                       { $gte:  [ "$$biopushams.ts", yest ] }
                     ] }
                }
             }
             ,
             bioupdate: {
               $filter: {
                  input: "$bioupdate",
                  as: "bioupdatams",
                  cond: { $and: [
                      // { $gte:  [ "$$biopushams.count", 1 ] },
                      { $gte:  [ "$$bioupdatams.date", bioupdateyest ] }
                    ] }
               }
            }
           }
        }
     ]).then(function(result){
        return res.status(200).json({
            message: result
        })
      }).catch(function(err){
        console.log("exports.PIN_QUERY_GET_DATA_BY_DAYS_WORKS_NOTINUSE.catch=>",err)
        return res.status(500).json({
            error: "unableTogetData"
        })
      })
}

exports.GET_DATA_BY_DAYS_BY_ORGID_PIN = (req,res,next)=>{
    var _days = req.params.days;
    var _orgid = req.params.orgid;
    var _pin = req.params.pin;
    _orgid = _orgid.toUpperCase()
    // console.log("=======================================")
    let a = 0, b = 30;
    var arr = Array.from(range(a, b));
    function* range(a, b) {
      for (var i = a; i <= b; ++i) yield i;
    }
    if(!arr.includes(parseInt(_days))){
        return res.status(500).json({
            error:{
                error: ` ${_days} : not a valid`,
                desc: `Enter days range from 1 to 30 - max limit is 30, 0 will give todays date from monring 12:00:AM`
            }
        })
    }
    var yest = 0;
    var bioupdateyest =0;
    if(_days == 0){
        now = _MOMENT()
       // console.log('start ' + now.startOf('day').toString().unixepoch)
        const start = now.format('YYYY-MM-DD 00:00:01');
        // console.table(["AAAAA", _MOMENT(start).valueOf()])
        yest = _MOMENT(start).valueOf();
        bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    } else {
        _days = _days * 24
        // console.log("_days", _days)
        var ts = Math.round(new Date().getTime());
        var tsYesterday = ts - (`${_days}` * 3600 * 1000);
        var abc = new Date().getTime() - (_days * 60 * 60 * 1000);
        // console.log("GET_DATA_BY_DAYS", tsYesterday, moment(tsYesterday).format("DD-MM-YYYY:HH:mm:ss"), abc)
        yest = parseInt(tsYesterday)
        bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    }
    // console.table([["Time", yest], ["bioupdate",bioupdateyest]])

    XCorona.aggregate([
        // {$match: {"biopush": {$ne: null}}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}, "pin": "JAIN"}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}}},
        // {$match: { "mobile": {$exists:true},  "trk": {$ne: []}, "trk.ts": {$ne: null}}},
        {$match: { "mobile": {$exists:true},  "trk": {$ne: []}, "trk.ts": {$ne: null}, "orgid": _orgid, "pin": _pin}},
        {
           $project: {
            pin: 1,
		   pcode:1,
            mobile:1,
                loaend:1,
            loastart:1,
            lastupdate:1,
            timestamp:1,
                   biolastupdate:1,
            devicetype:1,
            hrloaend:1,
            hrloastart:1,
            issuspended: 1,
            maxdist: 1,
		   mindist:1,
		   maxalt:1,
		   minalt:1,
            maxvltn: 1,
            otpireq:1,
            otpmaxtry:1,
            otptout:1,
            updfreq:1,
            trk:1,
            token:1,
            orgid:1,
            userfirstlogin:1,
            multilogin:1,
              trk: {
                 $filter: {
                    input: "$trk",
                    as: "trkams",
                    cond: { $and: [
                        // { $gte:  [ "$$biopushams.count", 1 ] },
                        { $gte:  [ "$$trkams.ts", yest ] }
                      ] }
                 }
              }
           }
        }
     ]).then(function(result){
        return res.status(200).json({
            message: result
        })
      }).catch(function(err){
          console.log("exports.GET_DATA_BY_DAYS_BY_ORGID_PIN.catch=>",err)
        return res.status(500).json({
            error: err
        })
      })
}



exports.GET_DATA_BY_DAYS_BY_ORGID = (req,res,next)=>{
    var _days = req.params.days;
    var _orgid = req.params.orgid;
    _orgid = _orgid.toUpperCase()
    // console.log("=======================================")
    let a = 0, b = 30;
    var arr = Array.from(range(a, b));
    function* range(a, b) {
      for (var i = a; i <= b; ++i) yield i;
    }
    if(!arr.includes(parseInt(_days))){
        return res.status(500).json({
            error:{
                error: ` ${_days} : not a valid`,
                desc: `Enter days range from 1 to 30 - max limit is 30, 0 will give todays date from monring 12:00:AM`
            }
        })
    }
    var yest = 0;
    var bioupdateyest =0;
    if(_days == 0){
        now = _MOMENT()
       // console.log('start ' + now.startOf('day').toString().unixepoch)
        const start = now.format('YYYY-MM-DD 00:00:01');
        // console.table(["AAAAA", _MOMENT(start).valueOf()])
        yest = _MOMENT(start).valueOf();
        bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    } else {
        _days = _days * 24
        // console.log("_days", _days)
        var ts = Math.round(new Date().getTime());
        var tsYesterday = ts - (`${_days}` * 3600 * 1000);
        var abc = new Date().getTime() - (_days * 60 * 60 * 1000);
        // console.log("GET_DATA_BY_DAYS", tsYesterday, moment(tsYesterday).format("DD-MM-YYYY:HH:mm:ss"), abc)
        yest = parseInt(tsYesterday)
        bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    }
    // console.table([["Time", yest], ["bioupdate",bioupdateyest]])

    XCorona.aggregate([
        // {$match: {"biopush": {$ne: null}}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}, "pin": "JAIN"}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}}},
        // {$match: { "mobile": {$exists:true},  "trk": {$ne: []}, "trk.ts": {$ne: null}}},
        {$match: { "mobile": {$exists:true},  "trk": {$ne: []}, "trk.ts": {$ne: null}, "orgid": _orgid}},
        {
           $project: {
            pin: 1,
            mobile:1,
                loaend:1,
            loastart:1,
            lastupdate:1,
            timestamp:1,
                   biolastupdate:1,
            devicetype:1,
            hrloaend:1,
            hrloastart:1,
            issuspended: 1,
            maxdist: 1,
            maxvltn: 1,
            otpireq:1,
            otpmaxtry:1,
            otptout:1,
            updfreq:1,
            trk:1,
            token:1,
            orgid:1,
            userfirstlogin:1,
            multilogin:1,
              trk: {
                 $filter: {
                    input: "$trk",
                    as: "trkams",
                    cond: { $and: [
                        // { $gte:  [ "$$biopushams.count", 1 ] },
                        { $gte:  [ "$$trkams.ts", yest ] }
                      ] }
                 }
              }
           }
        }
     ]).then(function(result){
        return res.status(200).json({
            message: result
        })
      }).catch(function(err){
        console.log("exports.GET_DATA_BY_DAYS_BY_ORGID.catch=>",err)
        return res.status(500).json({
            error: err
        })
      })
}

exports.GET_DATA_BY_DAYS = (req,res,next)=>{
    var _days = req.params.days;

    let a = 1, b = 30;
    var arr = Array.from(range(a, b));
    function* range(a, b) {
      for (var i = a; i <= b; ++i) yield i;
    }
    if(!arr.includes(parseInt(_days))){
        return res.status(500).json({
            error:{
                error: ` ${_days} : not a valid`,
                desc: `Enter days 1 or 2 or 29 - max limit is 30, 0 is not allowed`
            }
        })
    }
    _days = _days * 24
    // console.log("_days", _days)
    var ts = Math.round(new Date().getTime());
    var tsYesterday = ts - (`${_days}` * 3600 * 1000);
    var abc = new Date().getTime() - (_days * 60 * 60 * 1000);
    // console.log("GET_DATA_BY_DAYS", tsYesterday, moment(tsYesterday).format("DD-MM-YYYY:HH:mm:ss"), abc)
    var yest = parseInt(tsYesterday)
    XCorona.aggregate([
        // {$match: {"biopush": {$ne: null}}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}, "pin": "JAIN"}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}}},
        {$match: { "mobile": {$exists:true},  "trk": {$ne: []}, "trk.ts": {$ne: null}}},
        {
           $project: {
            pin: 1,
            mobile:1,
	        loaend:1,
            loastart:1,
            lastupdate:1,
            timestamp:1,
		   biolastupdate:1,
            devicetype:1,
            hrloaend:1,
            hrloastart:1,
            issuspended: 1,
            maxdist: 1,
            maxvltn: 1,
            otpireq:1,
            otpmaxtry:1,
            otptout:1,
            updfreq:1,
            trk:1,
            token:1,
            orgid:1,
            userfirstlogin:1,
            multilogin:1,
              trk: {
                 $filter: {
                    input: "$trk",
                    as: "trkams",
                    cond: { $and: [
                        // { $gte:  [ "$$biopushams.count", 1 ] },
                        { $gte:  [ "$$trkams.ts", yest ] }
                      ] }
                 }
              }
           }
        }
     ]).then(function(result){
        return res.status(200).json({
            message: result
        })
      }).catch(function(err){
        console.log("exports.GET_DATA_BY_DAYS.catch=>",err)
        return res.status(500).json({
            error: err
        })
      })
}

exports.GET_ALL_PINS_FOR_BIOMETRIC = (req,res,next)=>{
    //first update the expirty
    // second get all pins whose ts is greater than 2 hrs and not expired
    // 3rd send push notification
    // 4th save the info to update in biometric.
    find_HRLOAEND_and_set_EXPIRY_ToTrue()
    .then((result)=>{
        if(result){
            return biometricgetalltokens_pushNotification()
        }
    }).then((result2)=>{
        res.status(200).json({
            message: result2
        })
    }).catch((err)=>{
      console.log("exports.GET_ALL_PINS_FOR_BIOMETRIC.catch=>",err)
        res.status(500).json({
            error: err
        })
    })

}

exports.BIO_UPDATE = (req,res,next)=>{
  console.log(req.body.sendpin.pin)
  var _pin = req.body.sendpin.pin;
  var _date = moment().format("DD-MM-YYYY:HH:mm:ss");
  var update = {
      ts: req.body.sendpin.ts,
      date: _date,
      dt: req.body.sendpin.dt,
      status: req.body.sendpin.status
  }
  var update_now = {
      ts: Date.now(),
      date: _date,
      dt: req.body.sendpin.dt,
      status: req.body.sendpin.status
  }

    XCorona.findOneAndUpdate(
        {pin: _pin},
        {
            $push: {
                biopush: update
            }
        }, {new: true}
    ).then(function(result){
        return res.status(200).json({
            message: "success"
        })
    }).catch(function(err){
      console.log("exports.BIO_UPDATE.catch=>",err)
        return res.status(500).json({
            error: "unabletoUpdate"
        })
    })
}
const biometricgetalltokens_pushNotification = function(){
    return new Promise((resolve,reject)=>{
        // var ex = Date.now() + (5 * 60 * 1000);
        var ex = Date.now() -  (20 * 60 * 1000);
        // console.log("ex::::::+++++++++>>>>", moment(ex).format("DD-MM-YYY_HH:mm:ss"))
        XCorona.find(
           // {expiry:"false", issuspended:"false", biolastupdate: {$lt: ex}},
           {expiry:"false", mobile: {$exists:true}, issuspended:"false", isbiometric: "true", biolastupdate: {$lt: ex}}, 
	   {orgid:1, biolastupdate:1,issuspended:1,mobile:1,expiry:1, _id: 0, pin:1, token:1}
        ).then((result)=>{
            // console.log("biometricgetalltokens_pushNotification::",result)
            resolve(result)
            //   console.log("jain", result)
            //   for(a in result){
            //       console.log(result[a].pin, result[a].token)
            //   }
        }).catch(function(err){
            console.log("biometricgetalltokens_pushNotification.catch=>", err)
            reject("unabletogettokensforBiometricpushnotification")
        })
    })
}

exports.GETALLDATA_BY_MOBILE= (req,res,next)=>{
    var _mobile = req.params.mobile;
    getPinInfoByMobileNumber(_mobile).then((result)=>{
        res.status(200).json({
            message: result
        })
    }).catch((err)=>{
        res.status(500).json({
            error: "UnableToGet"
        })
    })
}

exports.GET_ALL_PINS = (req,res,next)=>{
    XCorona.find( {}, {
        expiry:1,
        _id: 1,
        pin:1,
	pcode:1,
        token:1,
	mobile:1,
        loastart:1,
        loaend:1,
        hrloastart:1,
        timestamp:1,
        hrloaend:1,
        initlat:1,
        initlng:1,
        lastupdate:1,
        biolastupdate:1 ,
        devicetype:1,
        issuspended: 1,
        maxdist: 1,
	mindist:1,
	maxalt:1,
	minalt:1,
        maxvltn: 1,
        otpireq:1,
        otpmaxtry:1,
        otptout:1,
        updfreq:1,
	      orgid:1,
            userfirstlogin:1,
            multilogin:1,
    } ).then((result)=>{
        // console.log("jain", result)
        return res.status(200).json({
            message: result
        })
    }).catch(function(err){
        console.log("exports.GET_ALL_PINS.catch=>", err)
        return res.status(500).json({
            error: "UnableToGetAllPins"
        })
    })
}

const getPinInfoByMobileNumber = function(_mobile){
    return new Promise((resolve)=>{
        XCorona.find({mobile: _mobile}, { lastupdate:1,expiry:1,loastart:1,loaend:1, _id: 0, pin:1, token:1 } )
        .then((result)=>{
            resolve(result)
        }).catch((err)=>{
            console.log("getPinInfoByMobileNumber.catch=>",err);
            reject("UnableToGetInfoOfPinByMobileNumber")
        })
    })
}



exports.UPDATE_CHALLENGE = (req,res,next)=>{
    var _pin = req.body.pin
    var _status = req.body.clientstatus
    if(_pin == null || _pin == undefined || _pin ==""){
        return res.status(404).json({
            error: `Pin is not defined ${_pin}`
        })
    }
    var _biolastupdate = Date.now()
    //var today = moment().format("DD/MM/YYYY")
    // var query = {pin: _pin, biometric: {date:today}}
    // var update = {}
    // var options = {upsert: true, new:true,setDefaultsOnInsert:true}
    var _date = moment().format("DD-MM-YYYY:HH:mm:ss")
    var _timestamp = Date.now()
    var biometric = {
        dt: _date,
        ts: _timestamp,
        status: _status
    }
    var firstResult =""
    XCorona.findOne({ pin: _pin },
        { pin:1,hrloastart:1,hrloaend:1, loastart:1, issuspended:1, loaend:1, expiry:1 }
    ).then(function(result){
        if(result === null){
            throw{
                error: `This PIN {${_pin}} is not a valid pin`,
            }
        } else {
            firstResult = result;
            console.log("UPDATE_CHALLENGE",result, result.issuspended)
            if(result.issuspended === "true"){
                throw{
                    status: 4,
                    desc: `This PIN {${_pin}} is suspended {${result.issuspended}}`,
                }
            }else if(result.expiry === "true"){
                throw{
                    status: 4,
                    desc: `This PIN {${_pin}} is expired {${result.expiry}}`,
                }
            } else {      
                return check_expiry_true_false(result,_pin)  
            }
        }
    }).then(function(resultTF){
        console.log("exports.UPDATE_CHALLENGE==>>.resultTF", resultTF)
        if(resultTF){
           return set_pin_to_expiry_true_UPDATE_CHALLENGE(_pin)
        } else {
            return false;
        }
    }).then(function(resultforexpiry){
        console.log("exports.UPDATE_CHALLENGE.resultforexpiry==>>", resultforexpiry)
        if(resultforexpiry){
            throw{
                status: 4,
                desc: `This PIN {${_pin}} is expired {${firstResult.loaend}}`,
            }
        } else {
            return update_challenge_biometric(_pin, _timestamp,biometric)
        }
    })
    .then(function(updateResult){
        return res.status(200).json({
            message: updateResult
        })
    }).catch(function(err){
        return res.status(500).json({
            error: err
        })
    })
}


const update_challenge_biometric = function(_pin, _timestamp, biometric){
    return new Promise((resolve,reject)=>{
        XCorona.findOneAndUpdate(
            {pin: _pin},
            {
                $set : {biolastupdate: _timestamp},
                $push:{bioupdate: biometric}
            }, {new: true}
        ).then((result)=>{
            console.log("DDDDD", result.issuspended)
            return resolve({
                status: 1,
                desc: "success",
                pin: result.pin,
                maxdist: result.maxdist,
                mindist: result.mindist,
                maxalt:result.maxalt,
                minalt:result.minalt,
                maxvltn:result.maxvltn,
                updfreq:result.updfreq,
                expiry:result.expiry,
                issuspended:result.issuspended,
		isbiometric: result.isbiometric,
		showtemperature: result.showtemperature
            })
        }).catch((err)=>{
            console.log("exports.UPDATE_CHALLENGE.update_challenge_biometric.catch=>",err)
            return reject({
                error: "exports.UPDATE_CHALLENGE.update_challenge_biometric.catch=>Unable to Update Biometric Update"
            })
        }) 
    })
}

const check_expiry_true_false = function(result,_pin){
    return new Promise((resolve,reject)=>{
        var currentDate = moment(Date.now()).tz('Asia/Singapore').format('DD/MM/YYYY')
        console.log("CheckExpiry:: ", result.loaend == currentDate, result.loaend, currentDate)
        var expiry = result.loaend
        var expiryepoch = moment(expiry, "DD/MM/YYYY").valueOf();
        expiryepoch += 28800; // +08hrs
        var now = Date.now();
        if (now >= expiryepoch) {
            //Yes its expired
         resolve(true)
        } else {
            //NOPE
            console.log("not expired",result.pin,now, expiryepoch,result.loaend )
          resolve(false)
        }
    })
}

const set_pin_to_expiry_true_UPDATE_CHALLENGE = function(_pin){
    return new Promise((resolve,reject)=>{
        XCorona.findOneAndUpdate(
            {pin:_pin},
            {
                $set: { "expiry" : true } ,
            },{new:true}
        ).then(function(result){
            console.log("PinUpdateToExpiryTrueIsSuccesfull ", _pin)
            resolve(true)
        }).catch(function(error){
            console.log("set_pin_to_expiry_true:", err)
            resolve(true)
            // reject("SomeErrorSettingPinExpiryTrue")
        })
    })
}

exports.DISABLE_ON_26MARCH2020_UPDATE_CHALLENGE = (req,res,next)=>{
    var _pin = req.body.pin
    var _status = req.body.clientstatus
    if(_pin == null || _pin == undefined || _pin ==""){
        return res.status(404).json({
            error: `Pin is not defined ${_pin}`
        })
    }

    var _biolastupdate = Date.now()
    //var today = moment().format("DD/MM/YYYY")
    // var query = {pin: _pin, biometric: {date:today}}
    // var update = {}
    // var options = {upsert: true, new:true,setDefaultsOnInsert:true}
    var _date = moment().format("DD-MM-YYYY:HH:mm:ss")
    var _timestamp = Date.now()
    var biometric = {
        dt: _date,
        ts: _timestamp,
        status: _status
    }

    XCorona.findOneAndUpdate(
        {pin: _pin},
        {
            $set : {biolastupdate: _timestamp},
            $push:{bioupdate: biometric}
        }, {new: true}
    ).then((result)=>{
        res.status(200).json({
            message : {
            status: 1,
            desc: "success",
            pin: result.pin,
            maxdist: result.maxdist,
		     mindist: result.mindist,
                 maxalt:result.maxalt,
                 minalt:result.minalt,
            maxvltn:result.maxvltn,
            updfreq:result.updfreq,
            expiry:result.expiry,
            issuspended:result.issuspended
          }
      })
    }).catch((err)=>{
        console.log("exports.UPDATE_CHALLENGE.catch=>",err)
        return res.status(500).json({
                error: "exports.UPDATE_CHALLENGE=>Unable to Update Biometric Update"
        })
    })
    // XCorona.findOneAndUpdate({pin: _pin}, {"biometric.today" :{$exist:true}})
    // .then(function(result){
    //     console.log(result)
    // }).catch(function(err){
    //     console.log(err)
    // })
}

exports.DONTUSECHANGE_START_DATE = (req,res,next)=>{
    console.log("========>", req.body.pin, req.body.newdate)
    var _pin = req.body.pin
    var _newdate = req.body.newdate
    // _newdate = moment(_newdate).format("DD/MM/YYYY")
    var _loastart = _newdate // must be in 27/02/2020
    var ts = moment(_newdate, "DD/MM/YYYY").valueOf();
    console.log("Momentss:::::", ts)
    // var _hrloaend = moment(ts); //doenst work in ubuntu aws
    var _hrloastart = ts    
    // console.log("asdfdsf", _pin, _newdate, _loaend, _hrloaend)
    // return res.status(200).json({
    //     message : _pin
    // })
    
    change_start_dateCORONAMODEL(_pin, _loastart,_hrloastart)
    .then((result)=> {
        console.log("asdfadsfsdf",result.pin)
        return result
    }).then((result2)=>{
        res.status(200).json({
            message: {
                status: "UpdateOfNewStartDateIsSuccesfull",
                pin: result2.pin,
                loastart:result2.loastart,
                loaend: result2.loaend,
                issuspended:result2.issuspended,
                expiry: result2.expiry,
            }
        })
    }).catch((err)=>{
        res.status(500).json({
            error: err
        })
    })
}

const dontsechange_start_dateCORONAMODEL = function(_pin, _loastart,_hrloastart){
    return new Promise((resolve,reject)=>{
        // XCorona.findOneAndUpdate(
        //     {pin:_pin, loaend: {$gt: _loastart}},
        //     {
        //         $set :{loastart : _loastart, hrloastart: _hrloastart, expiry:false}
        //     },{"fields": { pin:1, loastart:1, issuspended:1, expiry:1 ,loaend:1},new: true},
        // ).then(function(result){
        //     if(result == null) {
        //        return reject({
        //            pin: _pin,
        //            desc: "EitherPinNotExistOr" + ` {${_loastart}} is equal to LOAEND date`
        //        })
        //     }
        //     console.log(result.pin)
        //     resolve(result)
        //     // res.status(200).json({
        //     //     message: result
        //     // })
        // }).catch(function(err){
        //     console.log(err)
        //     reject("change_start_dateCORONAMODEL.PromiseAll.catch=>unabeltoUpdateStartDateINCORONA")
        //     // res.status(500).json({
        //     //     error: "unab;e tp iu[date"
        //     // })
        // }) 
        // return

        Promise.all([
            XCorona.findOne({ pin: _pin },{ pin:1, loastart:1, issuspended:1, loaend:1, expiry:1 }),
            XCorona.findOne({pin:_pin, loaend: {$gt: _loastart}},{ pin:1, loastart:1, issuspended:1, loaend:1, expiry:1 })
          ]).then( ([ pin, loaendgreater ]) => {
            console.log( util.format( "pin=%O greater=%O", pin, loaendgreater));
            if(pin == null){
                reject({
                    pin: _pin,
                    desc: `This pin [${_pin}] donot exist`
                })
            }
            if(loaendgreater === null) {
                reject({
                    pin: _pin,
                    desc: `This pin {${_pin}} LOAEND date is {${pin.loaend}} which is lesser than new LOASTART {${_loastart}}`
                })
            }
            XCorona.findOneAndUpdate(
                {pin:_pin, loaend: {$gt: _loastart}},
                {
                    $set :{loastart : _loastart, hrloastart: _hrloastart, expiry:false}
                },{"fields": { pin:1, loastart:1, issuspended:1, loaend:1, expiry:1 },new: true},
            ).then(function(result){
                if(result == null) {
                   return reject({
                       pin: _pin,
                       desc: "EitherPinNotExistOr" + ` {${_loastart}} is equal to LOAEND date`
                   })
                }
                console.log(result.pin)
                resolve(result)
                // res.status(200).json({
                //     message: result
                // })
            }).catch(function(err){
                console.log(err)
                reject("change_start_dateCORONAMODEL.PromiseAll.catch=>unabeltoUpdateStartDateINCORONA")
                // res.status(500).json({
                //     error: "unab;e tp iu[date"
                // })
            })            

          }).catch(function(err){
              winston.error("change_start_dateCORONAMODEL.Promise.all.catch=>"+ err)
              reject({
                  error: "UnabeltoUpdateLOAStartDateSomeErrorInCatch"
              })
          })
    })
}


exports.CHANGE_START_DATE = (req,res,next)=>{
    console.log("========>", req.body.pin, req.body.newdate)
    var _pin = req.body.pin
    var _newdate = req.body.newdate
    // _newdate = moment(_newdate).format("DD/MM/YYYY")
    var _loastart = _newdate // must be in 27/02/2020
    var ts = moment(_newdate, "DD/MM/YYYY").valueOf();
    console.log("Momentss:::::", ts)
    // var _hrloaend = moment(ts); //doenst work in ubuntu aws
    var _hrloastart = ts    
    // console.log("asdfdsf", _pin, _newdate, _loaend, _hrloaend)
    // return res.status(200).json({
    //     message : _pin
    // })
    
    change_start_dateCORONAMODEL(_pin, _loastart,_hrloastart)
    .then((result)=> {
        console.log("asdfadsfsdf",result.pin)
        return result
    }).then((result2)=>{
        res.status(200).json({
            message: {
                status: "UpdateOfNewStartDateIsSuccesfull",
                pin: result2.pin,
                loastart:result2.loastart,
                loaend: result2.loaend,
                issuspended:result2.issuspended,
                expiry: result2.expiry,
            }
        })
    }).catch((err)=>{
        res.status(500).json({
            error: err
        })
    })
}

const change_start_dateCORONAMODEL = function(_pin, _loastart,_hrloastart){
    return new Promise((resolve,reject)=>{
        Promise.all([
            XCorona.find({ pin: _pin },{ pin:1,hrloastart:1,hrloaend:1, loastart:1, issuspended:1, loaend:1, expiry:1 }),
            // XCorona.findOne({pin:_pin, loaend: {$gt: _loastart}},{ pin:1, loastart:1, issuspended:1, loaend:1, expiry:1 })
          ]).then( ([ pin ]) => {
            console.log( util.format( "pin=%O greater=%O", pin));
	  if(pin.length === 0){
                reject({
                    pin: _pin,
                    desc: `This pin [${_pin}] donot exist`
                })
            } else {
                console.table([pin[0].hrloaend])
                var intHrloaend = parseInt(pin[0].hrloaend)
                var intnewHrloastart = parseInt(_hrloastart)
                console.table([intHrloaend, intnewHrloastart])
                if(intnewHrloastart >= intHrloaend){
                    reject({
                        pin: _pin,
                        desc: `This pin {${_pin}} LOAEND date is {${pin[0].loaend}} which is lesser than or equal to new LOASTART {${_loastart}}`
                    })
                } else {
                    XCorona.findOneAndUpdate(
                        {pin:_pin},
                        {
                            $set :{loastart : _loastart, hrloastart: _hrloastart, expiry:false}
                        },{"fields": { pin:1, loastart:1, issuspended:1, loaend:1, expiry:1 },new: true},
                    ).then(function(result){
                        if(result == null) {
                           return reject({
                               pin: _pin,
                               desc: "EitherPinNotExistOr" + ` {${_loastart}} is equal to LOAEND date`
                           })
                        }
                        console.log(result.pin)
                        resolve(result)
                        // res.status(200).json({
                        //     message: result
                        // })
                    }).catch(function(err){
                        console.log(err)
                        reject("change_start_dateCORONAMODEL.PromiseAll.catch=>unabeltoUpdateStartDateINCORONA")
                        // res.status(500).json({
                        //     error: "unab;e tp iu[date"
                        // })
                    })
                }
            }
          }).catch(function(err){
              winston.error("change_start_dateCORONAMODEL.Promise.all.catch=>"+ err)
              reject({
                  error: "UnabeltoUpdateLOAStartDateSomeErrorInCatch"
              })
          })
    })
}


exports.CHANGE_END_DATE = (req,res,next)=>{
    console.log("========>", req.body.pin, req.body.newdate)
    var _pin = req.body.pin
    var _newdate = req.body.newdate
    // _newdate = moment(_newdate).format("DD/MM/YYYY")
    var _loaend = _newdate // must be in 27/02/2020
    var ts = moment(_newdate, "DD/MM/YYYY").valueOf();
    console.log("Momentss:::::", ts)
    // var _hrloaend = moment(ts); //doenst work in ubuntu aws
    var _hrloaend = ts       
    change_expiry_dateCORONAMODEL(_pin, _loaend,_hrloaend)
    .then((result)=> {
        console.log("asdfadsfsdf",result.pin)
        return result
    }).then((result2)=>{
        res.status(200).json({
            message: {
                status: "UpdateOfNewStartDateIsSuccesfull",
                pin: result2.pin,
                loastart:result2.loastart,
                loaend: result2.loaend,
                issuspended:result2.issuspended,
                expiry: result2.expiry,
            }
        })
    }).catch((err)=>{
        res.status(500).json({
            error: err
        })
    })
}


const change_expiry_dateCORONAMODEL = function(_pin, _loaend,_hrloaend){
    return new Promise((resolve,reject)=>{
        Promise.all([
            XCorona.find({ pin: _pin },{ pin:1,hrloastart:1,hrloaend:1, loastart:1, issuspended:1, loaend:1, expiry:1 }),
            // XCorona.findOne({pin:_pin, loaend: {$gt: _loastart}},{ pin:1, loastart:1, issuspended:1, loaend:1, expiry:1 })
          ]).then( ([ pin ]) => {
            console.log( util.format( "pin=%O greater=%O", pin));
            if(pin.length ===0){
                reject({
                    pin: _pin,
                    desc: `This pin [${_pin}] donot exist`
                })
            } else {
                // console.table([pin[0].hrloaend])
                var intHrloastart = parseInt(pin[0].hrloastart)
                var intnewHrloaend = parseInt(_hrloaend)
                console.table([intHrloastart, intnewHrloaend])
                if(intnewHrloaend <= intHrloastart){
                    reject({
                        pin: _pin,
                        desc: `This pin {${_pin}} LOASTART date is {${pin[0].loastart}} which is lesser than or equal to new LOAEND {${_loaend}}`,
                        info: `The New End Date must be higher than the Start date [NewEndDateIs: ${_loaend} & CurrentStartDateIs:${pin[0].loastart}], `
                    })
                } 
		    /*
		    else if (intnewHrloaend <= Date.now()){
                    reject({
                        pin: _pin,
                        desc: `This pin {${_pin}} LOASTART date is {${pin[0].loastart}} which is lesser than or equal to new LOAEND {${_loaend}}`,
                        info: `The New End Date must be higher than the current date {${Date.now()}} or humanreadable {${_MOMENT().format("DD-MM-YY")}} [NewEndDateIs: ${_loaend} & CurrentStartDateIs:${pin[0].loastart}], `

			    // info: `The New End Date must be higher than the current date {${Date.now()}} [NewEndDateIs: ${_loaend} & CurrentStartDateIs:${pin[0].loastart}], `
                    })
		    } 
		    */
                else {
                    XCorona.findOneAndUpdate(
                        {pin:_pin},
                        {
                            $set :{loaend : _loaend, hrloaend: _hrloaend, expiry:false}
                        },{"fields": { pin:1, loastart:1, issuspended:1, loaend:1, expiry:1 },new: true},
                    ).then(function(result){
                        if(result == null) {
                           return reject({
                               pin: _pin,
                               desc: "EitherPinNotExistOr" + ` {${_loastart}} is equal to LOAEND date`
                           })
                        }
                        console.log(result.pin)
                        resolve(result)
                        // res.status(200).json({
                        //     message: result
                        // })
                    }).catch(function(err){
                        console.log(err)
                        reject("change_end_dateCORONAMODEL.PromiseAll.catch=>unabeltoUpdateStartDateINCORONA")
                        // res.status(500).json({
                        //     error: "unab;e tp iu[date"
                        // })
                    })
                }
            }
          }).catch(function(err){
              winston.error("change_end_dateCORONAMODEL.Promise.all.catch=>"+ err)
              reject({
                  error: "UnabeltoUpdateLOAStartDateSomeErrorInCatch"
              })
          })
    })
}

const notnunuse_change_expiry_dateCORONAMODEL = function(_pin, _loaend,_hrloaend){
    return new Promise((resolve,reject)=>{
        Promise.all([
            XCorona.find({ pin: _pin },{ pin:1,hrloastart:1,hrloaend:1, loastart:1, issuspended:1, loaend:1, expiry:1 }),
            // XCorona.findOne({pin:_pin, loaend: {$gt: _loastart}},{ pin:1, loastart:1, issuspended:1, loaend:1, expiry:1 })
          ]).then( ([ pin ]) => {
            console.log( util.format( "pin=%O greater=%O", pin));
            if(pin.length ===0){
                reject({
                    pin: _pin,
                    desc: `This pin [${_pin}] donot exist`
                })
            } else {
                // console.table([pin[0].hrloaend])
                var intHrloastart = parseInt(pin[0].hrloastart)
                var intnewHrloaend = parseInt(_hrloaend)
                console.table([intHrloastart, intnewHrloaend])
                if(intnewHrloaend <= intHrloastart){
                    reject({
                        pin: _pin,
                        desc: `This pin {${_pin}} LOASTART date is {${pin[0].loastart}} which is lesser than or equal to new LOAEND {${_loaend}}`,
                        info: `The New End Date must be higher than the Start date [NewEndDateIs: ${_loaend} & CurrentStartDateIs:${pin[0].loastart}], `
                    })
                } else {
                    XCorona.findOneAndUpdate(
                        {pin:_pin},
                        {
                            $set :{loaend : _loaend, hrloaend: _hrloaend, expiry:false}
                        },{"fields": { pin:1, loastart:1, issuspended:1, loaend:1, expiry:1 },new: true},
                    ).then(function(result){
                        if(result == null) {
                           return reject({
                               pin: _pin,
                               desc: "EitherPinNotExistOr" + ` {${_loastart}} is equal to LOAEND date`
                           })
                        }
                        console.log(result.pin)
                        resolve(result)
                        // res.status(200).json({
                        //     message: result
                        // })
                    }).catch(function(err){
                        console.log(err)
                        reject("change_end_dateCORONAMODEL.PromiseAll.catch=>unabeltoUpdateStartDateINCORONA")
                        // res.status(500).json({
                        //     error: "unab;e tp iu[date"
                        // })
                    })
                }
            }
          }).catch(function(err){
              winston.error("change_end_dateCORONAMODEL.Promise.all.catch=>"+ err)
              reject({
                  error: "UnabeltoUpdateLOAEndDateSomeErrorInCatch"
              })
          })
    })
}


exports.CHANGE_EXPIRTYDATE = (req,res,next)=>{
    console.log("exports.CHANGE_EXPIRTYDATE=>", req.body.pin, req.body.newdate)
    var _pin = req.body.pin
    var _newdate = req.body.newdate
    // _newdate = moment(_newdate).format("DD/MM/YYYY")
    var _loaend = _newdate // must be in 27/02/2020

    var ts = moment(_newdate, "DD/MM/YYYY").valueOf();
    //var _hrloaend = moment(ts);
    var _hrloaend = ts;
    // console.log("asdfdsf", _pin, _newdate, _loaend, _hrloaend)
    // return res.status(200).json({
    //     message : _pin
    // })
    changeexpirydateCORONAMODEL(_pin, _loaend,_hrloaend)
    .then((result)=> {
        //if(result){
        //    return changeexpirydateOTPMODEL(_pin,_loaend,_hrloaend)
       // }
	      return true;
    }).then((result2)=>{
        res.status(200).json({
            message: "UpdateOfExpiryDateIsSuccesfull"
        })
    }).catch((err)=>{
        console.log("exports.CHANGE_EXPIRTYDATE.catch=>", err)
        res.status(500).json({
            error: err
        })
    })

}


exports.CHANGE_CONFIG_RAKESH = (req,res,next)=>{
    var _pin = req.body.pin;
    var _maxdist = req.body.maxdist;
    var _mindist =req.body.mindist;
    var _maxalt = req.body.maxalt;
    var _minalt = req.body.minalt;
    var _maxvltn = req.body.maxvltn;
    var _updfreq = req.body.updfreq;

    XCorona.findOneAndUpdate(
      {pin:_pin},
      {
          $set :{
              maxdist : _maxdist,
              mindist : _mindist,
              maxalt : _maxalt,
              minalt : _minalt,
              maxvltn: _maxvltn, 
              updfreq:_updfreq}
      },{new: true}
  ).then(function(result){
      if(result == null) {
         return res.status(500).json({
             error: `Unable to set config for pin: ${_pin}`,
             desc: "Update failed"
         })
      }else {
          return res.status(200).json({
              message: {
                  pin: result.pin,
                  maxdist: result.maxdist,
                  mindist: result.mindist,
                  maxalt: result.maxalt,
                  minalt: result.minalt,
                  maxvltn: result.maxvltn,
                  updfreq: result.updfreq,
                  loaend: result.loaend,
                  expiry: result.expiry,
                  issuspended: result.issuspended
              }
          })
      }
      
  }).catch(function(err){
    //   console.log(err)
    winston.info("exports.CHANGE_CONFIG_RAKESH.catch=>" + err)
      // reject("unabeltoUpdateExpiryDateINCORONA")
      return res.status(500).json({
          error: "change config issues under exports.CHANGE_CONFIG_RAKESH"
      })
  })
  }

exports.NOT_IN_USECHANGE_CONFIG_RAKESH = (req,res,next)=>{
  var _pin = req.body.pin;
  var _maxdist = req.body.maxdist;
  var _maxvltn = req.body.maxvltn;
  var _updfreq = req.body.updfreq;
  XCorona.findOneAndUpdate(
    {pin:_pin},
    {
        $set :{maxdist : _maxdist, maxvltn: _maxvltn, updfreq:_updfreq}
    },{new: true}
).then(function(result){
    if(result == null) {
       return res.status(500).json({
           error: `Unable to set config for pin: ${_pin}`,
           desc: "Update failed"
       })
    }else {
        return res.status(200).json({
            message: {
                pin: result.pin,
                maxdist: result.maxdist,
                maxvltn: result.maxvltn,
                updfreq: result.updfreq,
                loaend: result.loaend,
                issuspended: result.issuspended
            }
        })
    }

}).catch(function(err){
    console.log("exports.CHANGE_CONFIG_RAKESH.catch=>",err)
    // reject("unabeltoUpdateExpiryDateINCORONA")
    return res.status(500).json({
        error: "change config issues under exports.CHANGE_CONFIG_RAKESH"
    })
})
}

const changeexpirydateCORONAMODEL = function(_pin, _loaend,_hrloaend){
    return new Promise((resolve,reject)=>{
        XCorona.findOneAndUpdate(
            {pin:_pin},
            {
                $set :{loaend : _loaend, hrloaend: _hrloaend, expiry:false}
            },{new: true}
        ).then(function(result){
            if(result == null) {
               return reject("pinNotExistCoronaModel")
            }
            //console.log(result)
            resolve(result)
            // res.status(200).json({
            //     message: result
            // })
        }).catch(function(err){
            console.log("changeexpirydateCORONAMODEL.catch=>",err)
            reject("unabeltoUpdateExpiryDateINCORONA")
            // res.status(500).json({
            //     error: "unab;e tp iu[date"
            // })
        })
    })
}

const changeexpirydateOTPMODEL = function(_pin, _loaend,_hrloaend){
    return new Promise((resolve,reject)=>{
        // console.log("InSideOTP::",_pin, _loaend,_hrloaend )
	    OTP.findOneAndUpdate(
            {pin:_pin},
            {
                $set :{loaend : _loaend, expiry:false}
            },{new: true}
        ).then(function(result){
            // console.log("InSideOTPlevel2:",result)
            if(result == null) {
               return reject("pinNotExistOTP")
            }
            resolve(result)
            // res.status(200).json({
            //     message: result
            // })
        }).catch(function(err){
            console.log("changeexpirydateOTPMODEL.catch=>",err)
            reject("unabeltoUpdateExpiryDateINOTP")
            // res.status(500).json({
            //     error: "unab;e tp iu[date"
            // })
        })
    })
}

// exports.CHANGE_EXPIRTYDATE_2 = (req,res,next)=>{
//     console.log("========>", req.body.pin, req.body.newdate)
//     var _pin = req.body.pin
//     var _newdate = req.body.newdate
//     // _newdate = moment(_newdate).format("DD/MM/YYYY")
//     var _loaend = _newdate // must be in 27/02/2020
//     var _hrloaend = Date.now(_newdate)
//
//     console.log("asdfdsf", _pin, _newdate, _loaend, _hrloaend)
//     XCorona.findOneAndUpdate(
//         {pin:_pin},
//         {
//             $set :{loaend : _loaend, hrloaend: _hrloaend, expiry:false}
//         },{new: true}
//     ).then(function(result){
//         console.log(result)
//         res.status(200).json({
//             message: result
//         })
//     }).catch(function(err){
//         console.log(err)
//         res.status(500).json({
//             error: "unab;e tp iu[date"
//         })
//     })
// }

exports.UPDATE_TOKEN = (req,res,next)=>{
    var _pin = req.body.pin
    // console.log("afadsfasfdsfsdfsadf",_pin)
    var _token = req.body.token
    // console.log("afadsfasfdsfsdfsadf",_pin, _token)
    update_token_corona(_pin, _token).then((result1)=>{
        res.status(200).json({
            message: result1
        })
    }).catch((err)=>{
      console.log("exports.UPDATE_TOKEN.catch=>",err)
        res.status(500).json({
            error: err
        })
    })

}

const update_token_corona = function(_pin, _token){
    return new Promise((resolve,reject)=>{
        // console.log("Adasdasdasd")
        XCorona.findOneAndUpdate({pin:_pin},{$set:{token:_token}},{new:true}).then((result1)=>{
        // console.log("hhhh", result1)
        if(result1 == null){
            reject({
                status:2,
                desc: "invalid pin"
            })
        } else {
            resolve({
                status:1,
                desc: "token updated succesfully"
            })
        }
    }).catch((err)=>{
        console.log("update_token_corona.catch=>", err)
            reject({
                status: 4,
                desc: "update_token_corona_catch_err"
            })
        })
    })
}




exports.GET_TOKEN_2 = (req,res,next)=>{
    var _pin = req.params.pin;
    // console.log("DSSDFSDFSDf", _pin)
    XCorona.find({pin:_pin})
    .then((result1)=>{
        res.status(200).json({
            message: result1[0].token
        })
    }).catch((err)=>{
      console.log("exports.GET_TOKEN_2.catch=>",err)
        res.status(404).json({
            error: {
                status: 2,
                desc: "invalid pin"
            }
        })
    })
}



exports.GET_TOKEN_MOBILE = (req,res,next)=>{
    var _mobile = req.params.mobile;
    // console.log("------>>>>>>>>>>>>>>>>>>", _mobile)
    if(_mobile =="" || _mobile == null || _mobile == undefined){
        return res.status(500).json({
            error: "No mobile number provided"
        })
    }
    XCorona.find({mobile: _mobile}, { expiry:1, _id: 1, pin:1, token:1, loastart:1, loaend:1,mobile:1 } ).then((result)=>{
        // console.log("jain", result)
        return res.status(200).json({
            message: result
        })
    }).catch(function(err){
        // console.log("ersdf", err)
        console.log("exports.GET_TOKEN_MOBILE.catch=>",err)
        return res.status(500).json({
            error: "UnableToGetToken"
        })
    })
}

exports.CONFIG_GET = (req,res,next)=>{
    res.status(200).json({
        message: {
            maxdist: _CONFIG.maxdist,
            mindist: _CONFIG.mindist,
            maxalt: _CONFIG.maxalt,
            minalt: _CONFIG.minalt,
	   updfreq: _CONFIG.updfreq,
            maxvltn: _CONFIG.maxvltn,
            otpireq: _CONFIG.otpireq,
            otpmaxtry: _CONFIG.otpmaxtry,
            otptout:_CONFIG.otptout
        }
    })
}

exports.CONFIG_GET_VIA_POST = (req,res,next)=>{
    res.status(200).json({
        message: {
            maxdist: _CONFIG.maxdist,
            mindist: _CONFIG.mindist,
            maxalt: _CONFIG.maxalt,
            minalt: _CONFIG.minalt,
            updfreq: _CONFIG.updfreq,
            maxvltn: _CONFIG.maxvltn,
            otpireq: _CONFIG.otpireq,
            otpmaxtry: _CONFIG.otpmaxtry,
            otptout:_CONFIG.otptout
        } 
    })
}

exports.REGISTER = (req,res,next)=>{
    // var io = req.app.get('socketio');
    // var primus = req.app.get('primusio')
    // winston.info(req.body)
    var _pin = req.body.pin;
    var  _mobile =  req.body.mobile;
    var  _pcode =  req.body.pcode;
    var  _loastart =  req.body.loastart;
    var  _loaend =  req.body.loaend;
    var  _devicetype =  req.body.devicetype;
    // var _initlat = req.body.lat;
    // var _initlng = req.body.lng
    var _expiry = false;
    // var _dist = req.body.dist;
    // var _temp = req.body.temp;
    // var _pf = req.body.pf
    // var _symptoms = req.body.symptoms
    var _timestamp = Date.now();
    var ts = moment("24/2/2020", "DD/MM/YYYY").valueOf();
    var m = moment(ts);
    // var s = m.format("M/D/YYYY");
    var _hrloastart = moment(req.body.loastart, "DD/MM/YYYY").valueOf().toString();
    var _hrloaend = moment(req.body.loaend, "DD/MM/YYYY").valueOf().toString();
// console.log("JJJA", typeof _hrloaend, _hrloastart)
    const coronaData = new XCorona({
        _id: new mongoose.Types.ObjectId(),
        pin: _pin,
        mobile: _mobile,
        // pcode: _pcode,
        loastart: _loastart,
        loaend: _loaend,
        hrloastart: _hrloastart,
        hrloaend: _hrloaend,
        devicetype: _devicetype,
        expiry: _expiry,
        // trk: _trk,
        timestamp: _timestamp,
        // initlat: _initlat,
        // initlng: _initlng
    });

    saveToDB2(coronaData).then(function(result){
        // console.log(result)
        res.status(200).json({
            message : result
        })
    }).catch(function(err){
        // winston.error("SaveToFB ", err)
        console.log("exports.REGISTER.catch=>",err)
        res.status(500).json({
            err0r: err
        })
    })

}


exports.PCODE_UPDATE_BY_PIN = (req,res,next)=>{
    var _pin = req.body.pin;
    var _pcode = req.body.pcode;
    // console.log("qwerqwerwre",req.body)
    //first getlatlng via postalcode pcode
    getLatLngByPostalCode(_pcode).then(function(results){
        // console.log("RESULTSSSS:::", results)
        if(results.status == 2){
             res.status(200).json({
                message: results
            })
        } else {
            // console.log("RESUzzzzzzzz:::", results)
            return saveLatLngByPinInMongoDB(_pin, results, _pcode)
        }
    }).then(function(results2){
        // console.log("qeqeqweqweqeqedsadsfsaddfsadfdasfasd::",results2)
        // console.log("Iam Called ====== ======= ===>>>")
        return res.status(200).json({
            message: {
                status: 1,
                desc: "success",
                initlat: results2.initlat,
                initlng: results2.initlng
            }
        })
    }).catch(function(err){
      console.log("exports.PCODE_UPDATE_BY_PIN.catch=>", err)
        res.status(500).json({
            error: "exports.PCODE_UPDATE_BY_PIN.catch=>error"
        })
    })
}



// const pcode_update_bypin = function(_pin, _pcode){
//     return new Promise((resolve,reject)=>{
//         XCorona.findOneAndUpdate({pin: _pin},{$set:{pcode:_pcode}}, {upsert:true,new:true})
//         .then(function(result1){
//             var jesus = JSON.stringify(result1);
//             if(jesus.length >= 1){
//                 console.log("--------2", result1.length, jesus.length)
//                 resolve("UpdateDone")
//             winston.info("pcode_update_bypin:", result1)
//             } else {
//                 console.log("23e232342", jesus.length, jesus.length)
//                 resolve("UnableToUpdate")
//             winston.info("pcode_update_bypin:", result1)
//             }
//         }).catch(function(err){
//             winston.error(err);
//             ("pcode_update_bypin:Error:", err)
//             reject(err)
//         })
//     })
// }

// pcode_update_bypin("pinH", "00000")
// .then(function(resolt){
//     // console.log("----------------->>>>>>>>",resolt)
// }).catch(function(err){
//     // console.log("eeeeeeeeeeeee------>",err)
// })
const saveToDB2 = function(coronaData){
    return new Promise(function(resolve,reject){
        // console.log("caling Savetodb", coronaData.pin)
        XCorona.find({pin: coronaData.pin}).then(function(result){
            // console.log(result, result.length)
            if(result.length >= 1){
            // if(!result == "null"){
                //exists
                // resolve(result)
                // console.log("it exists")
                // resolve("UserExists")
                return(true)
                // return updateDB(coronaData, primus, io,result);
            } else {
                return false;
            }
        }).then(function(result){
            if(result == false){
                // console.log("fasle", result)
                // primus.send('chartData',coronaData);
                // io.emit('chartData', coronaData)
                resolve(coronaData.save())
            } else {
                var finalresult = {
                    result: result,
                    desc: "UserExist"
                }
                resolve(finalresult)
            }
        }).catch(function(err){
            console.log("saveToDB2.catch=>",err);
            // winston.error(err)
            reject(err)
        })
    })
}

const saveLatLngByPinInMongoDB = function(_pin, latlng, _pcode){
    return new Promise((resolve,reject)=>{
        XCorona.findOneAndUpdate({pin: _pin},{$set:{pcode: _pcode, initlat:latlng.lat, initlng:latlng.lng}}, {new:true})
        .then(function(result1){
            if(result1 == null){
                reject({
                    status: 2,
                    desc: "invalid pin"
                })
            } else {
                resolve(result1)
            }
        }).catch(function(err){
            console.log("saveLatLngByPinInMongoDB.catch=>", err)
            reject("UnableToUpdateLatLngByPin")
        })
    })
}


// const updateNewOTP = function(_pin,_otp){
//     return new Promise(function(resolve,reject){
//         OTP.fin({pin: _pin},{$set:{otp:_otp}}, {upsert:true, new:true})
//         .then(function(result1){
//             console.log("UpdateNewOTP:", result1)
//             resolve(result1)
//         }).catch(function(err){
//             console.log("UpdateNewOTpcatch", err)
//             reject(err)
//         })
//     })
// }

exports.GET_PINS_WITHOUT_TRK = (req,res,next)=>{
    getPinsWithoutTrk().then((result)=>{
        if(result){
            res.status(200).json({
                message: result
            })
        }
    }).catch((err)=>{
        console.log("exports.GET_PINS_WITHOUT_TRK.catch=>",err)
        res.status(500).json({
            error: "unabeltoGetPinsInfoWithoutTrk"
        })
    })
}

const getPinsWithoutTrk = function(){
    return new Promise((resolve,reject)=>{
        // XCorona.find( {}, {mobile:1,biolastupdate:1, lastupdate:1,expiry:1,loastart:1,loaend:1, _id: 0, pin:1, token:1 } ).then((result)=>{
            XCorona.find({},
                {
                expiry:1,
                _id: 0,
                pin:1,
                token:1,
                loastart:1,
                loaend:1,
                hrloastart:1,
                timestamp:1,
                mobile:1,
                hrloaend:1,
                initlat:1,
                initlng:1,
                lastupdate:1,
                biolastupdate:1 ,
                devicetype:1,
                issuspended: 1,
                maxdist: 1,
                maxvltn: 1,
                otpireq:1,
                otpmaxtry:1,
                otptout:1,
                updfreq:1,
            } ).then((result)=>{
        // console.log("jain", result)
            resolve(result)
        }).catch(function(err){
          console.log("getPinsWithoutTrk.catch=>",err)
            // console.log("ersdf", err)
            reject("unableToFindpins")
        })
    })
}

// const NotInuse_getPinsWithoutTrk = function(){
//     return new Promise((resolve,reject)=>{
//         XCorona.find( {}, {mobile:1,biolastupdate:1, lastupdate:1,expiry:1,loastart:1,loaend:1, _id: 0, pin:1, token:1 } ).then((result)=>{
//             console.log("jain", result)
//             resolve(result)
//         }).catch(function(err){
//             console.log("ersdf", err)
//             reject("unableToFindpins")
//         })
//     })
// }

const getLatLngByPostalCode = function(_pcode){
    return new Promise((resolve,reject)=>{
        var options = {
            // uri: 'https://api.github.com/user/repos',
            uri: `https://developers.onemap.sg/commonapi/search?searchVal=${_pcode}&returnGeom=Y&getAddrDetails=N&pageNum=1`,
            qs: {
                // access_token: 'xxxxx xxxxx' // -> uri + '?access_token=xxxxx%20xxxxx'
            },
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true // Automatically parses the JSON string in the response
        };

        rp(options)
            .then(function (repos) {
                // console.log('User has %d repos', repos.length);
                // console.log("dfasfdsfads",repos.results.length)

                if(repos.results.length>=1){
                    // console.log("wwwwwwwwww", JSON.stringify(repos).length)
                    var message = {
                        pcode: _pcode,
                        lat: repos.results[0].LATITUDE,
                        lng: repos.results[0].LONGITUDE
                    }
                    winston.info(message)
                    resolve(message)
                } else {
                    // 2 means invalid pcode
                    reject({
                        status: 2,
                        desc: "invalid pcode"
                    })
                }

            })
            .catch(function (err) {
                // API call failed...
                console.log("getLatLngByPostalCode.catch=>", err)
                reject("getLatLngByPostalCode.catch=>")
                // console.log("err::", err)

            });
    })
}

// getLatLngByPostalCode(313138).then(function(res){
//     console.log(res)
// }).catch(function(err){
//     console.log(err)
// })

// exports.UPDATE_INFO = (req,res,next)=>{
//     var io = req.app.get('socketio');
//     var primus = req.app.get('primusio')
//     var _pin = req.body.pin;
//     var _pf = req.body.pf;

//     //temp disable work with Shengayng
//     var _temp = req.body.temp;
//     var _symptoms = req.body.symptoms
//     //symptoms alsp disable work with shengyang

//     var _dist = req.body.dist;
//     var _trk = {
//         pf: _pf,
//         ts: Date.now(),
//         dist: _dist,
//         temp: _temp,
//         symptoms: _symptoms
//     }

//     updateLatLng_updated(_pin, _trk, primus, io)
//     .then(function(resolt){
//         res.status(200).json({
//             message: resolt
//         })
//     }).catch(function(err){
//         res.status(500).json({
//             error: err
//         })
//     })
// }
exports.UPDATE_INFO = (req,res,next)=>{
    // var io = req.app.get('socketio');
    // var primus = req.app.get('primusio')
    var _pin = req.body.pin;
    var _pf = req.body.pf;
    var _alt = req.body.altitude;
    //temp disable work with Shengayng
    var _temp = req.body.temp;
    var _symptoms = req.body.symptoms
    //symptoms alsp disable work with shengyang
    var unixdate = Date.now()
    //var humandate = _MOMENT(unixdate).format("DD-MM-YYYY:HH:mm:ss")
    var humandate = moment().format("DD-MM-YYYY:HH:mm:ss")
    var _dist = req.body.dist;
    var _altitude = req.body.altitude;
    var _accuracy = req.body.accuracy;
    var _source = req.body.source;

    var _trk = {
        pf: _pf,
        date: humandate,
        ts: Date.now(),
        dist: _dist,
        temp: _temp,
        symptoms: _symptoms,
        appalt: _alt,
	altitude: _altitude,
        accuracy: _accuracy,
        source: _source 
    }
	
    if(_temp != "NA") {
        var min = 34;
        var max = 41
        if(((_temp-min)*(_temp-max) <= 0)){
            console.log("exports.UPDATE_INFO==>>",`TEMP has avalidValue-> ${_temp}`)
            winston.info("exports.UPDATE_INFO==>>" +`TEMP has avalidValue-> ${_temp}`)
            updateLatLng_updated(_pin, _trk)
            .then(function(resolt){
               return res.status(200).json({
                    message: resolt
                })
            }).catch(function(err){
               return res.status(500).json({
                    error: err
                })
            }) 
        } else {
            console.log("exports.UPDATE_INFO==>>", `TEMP has invalidvalue-> ${_temp}`)
            winston.info("exports.UPDATE_INFO==>>" +`TEMP has invalidvalue-> ${_temp}`)
            return res.status(500).json({
                message: {
                    status: 1,
                    desc: `proceed but temp {${_temp}} value is invalid `
                }
            })
        }
    } else {
        console.log("exports.UPDATE_INFO==>>", _temp, "TEMP IS NA")
        updateLatLng_updated(_pin, _trk)
        .then(function(resolt){
           return res.status(200).json({
                message: resolt
            })
        }).catch(function(err){
            return res.status(500).json({
                error: err
            })
        }) 
    }
}

exports.UPDATE_INFO_ORIGINAL_30MARCH2020 = (req,res,next)=>{
    // var io = req.app.get('socketio');
    // var primus = req.app.get('primusio')
    var _pin = req.body.pin;
    var _pf = req.body.pf;
    var _alt = req.body.altitude;
    //temp disable work with Shengayng
    var _temp = req.body.temp;
    var _symptoms = req.body.symptoms
    //symptoms alsp disable work with shengyang
    var unixdate = Date.now()
    //var humandate = _MOMENT(unixdate).format("DD-MM-YYYY:HH:mm:ss")
    var humandate = moment().format("DD-MM-YYYY:HH:mm:ss")
	var _dist = req.body.dist;
    var _trk = {
        pf: _pf,
	date: humandate,
        ts: Date.now(),
        dist: _dist,
        temp: _temp,
        symptoms: _symptoms,
	    appalt: _alt
    }


    updateLatLng_updated(_pin, _trk)
    .then(function(resolt){
        res.status(200).json({
            message: resolt
        })
    }).catch(function(err){
        res.status(500).json({
            error: err
        })
    })
}

exports.Notinuse__ORGID_GET_ALL_FOR_PUSHNOTIFICATION = (req,res,next)=>{
    var _orgid =req.params.orgid;
    _orgid = _orgid.toUpperCase();
    find_HRLOAEND_and_set_EXPIRY_ToTrue()
    .then((result1)=>{
        // console.log(result1, "sfsfd")
        if(result1){
            return true
        }
    }).then((result2)=>{
        // console.log("kkk", result2)
        if(result2){
            return orgid_getalltokens_pushNotification(_orgid)
        }
    }).then((result3)=>{
        if(result3){
            return res.status(200).json({
                message: result3
            })
        }
    }).catch((err)=>{
      console.log("exports.ORGID_GET_ALL_FOR_PUSHNOTIFICATION.catch=>",err)
        return res.status(404).json({
            error: err
        })
    })

}

const notinuse_orgid_getalltokens_pushNotification = function(_orgid){
    return new Promise((resolve,reject)=>{
        // var ex = Date.now() + (5 * 60 * 1000);
        var ex = Date.now() -  (20 * 60 * 1000);
        // console.log("ex==========>>>>", ex)
        XCorona.find(
            { orgid:_orgid, issuspended:false, expiry:false, lastupdate: {$lte: ex}},
            {orgid:1, issuspended:1,lastupdate:1,expiry:1, _id: 0, pin:1, token:1}
        ).then((result)=>{
            // console.log("orgid_getalltokens_pushNotification::",result)
            resolve(result)
            //   console.log("jain", result)
            //   for(a in result){
            //       console.log(result[a].pin, result[a].token)
            //   }
        }).catch(function(err){
            console.log("orgid_getalltokens_pushNotification.catch=>", err)
            reject("orgid_getalltokens_pushNotificationunabletogettokensforpushnotification")
        })
    })
}
exports.ORGID_GET_ALL_FOR_PUSHNOTIFICATION = (req,res,next)=>{
    var _orgid =req.params.orgid;
    _orgid = _orgid.toUpperCase();
    find_HRLOAEND_and_set_EXPIRY_ToTrue()
    .then((result1)=>{
        console.log(result1, "sfsfd")
        if(result1){
            return true
        }
    }).then(function(result2){
        if(result2){
            return check_org_id_exist(_orgid)
        }
    }).then((result3)=>{
        // console.log("kkk", result3)
        winston.info("exports.ORGID_GET_ALL_FOR_PUSHNOTIFICATION.result3==>> "+ "| OrgidIs:" + result3.orgid +" | " + "Pushtimingis:"+ result3.pushtiming + " |")
        if(result3){
            return orgid_getalltokens_pushNotification(result3.orgid, result3.pushtiming)
        }
    }).then((result3)=>{
        if(result3){
            return res.status(200).json({
                message: result3
            })
        }
    }).catch((err)=>{
        return res.status(404).json({
            error: err
        })
    })
  
}

const check_org_id_exist = function(_orgid){
    return new Promise((resolve,reject)=>{
        XOrgid.findOne({orgid: _orgid})
        .then(function(result){
            // console.log(result)
            if(result===null){
                winston.info("check_org_id_exist.XOrgid.findOne.result===null==>> " + result)
                reject(`Unable to find OrgID:{${_orgid}}`)
            } else {
                winston.info("check_org_id_exist.result==>> "+ "| OrgidIs:" + result.orgid +" | " + "Pushtimingis:"+ result.pushtiming + " |")
                if(result.pushtiming === undefined || result.pushtiming === "" || result.pushtiming === null) {
                    console.log("pushinginr", result.pushtiming)
                    resolve({
                        orgid: result.orgid,
                        pushtiming: 20
                    })
                }
                resolve({
                    orgid: result.orgid,
                    pushtiming: result.pushtiming
                })
            }
        }).catch(function(err){
            winston.info("check_org_id_exist.catch=>" + err)
            reject(false)
        })
    })
}

// check_org_id_exist("IMDA").then(function(result){
//     winston.info("check==>:"+"|Orgid="+result.orgid + "|pushtiming="+ result.pushtiming+"|")
// }).catch(function(err){
//     winston.error(err)
// })

const orgid_getalltokens_pushNotification = function(_orgid, _pushtiming){
    return new Promise((resolve,reject)=>{
        // var ex = Date.now() + (5 * 60 * 1000);
        _pushtiming = parseInt(_pushtiming);
        var ex = Date.now() -  (`${_pushtiming}` * 60 * 1000);
        winston.info("orgid_getalltokens_pushNotification==>>"+ ex)
        // console.log("ex==========>>>>", ex)
        XCorona.find( 
            { orgid:_orgid, issuspended:false, expiry:false, mobile:{ $exists:true}, lastupdate: {$lte: ex}}, 
            {orgid:1, issuspended:1,lastupdate:1,expiry:1, _id: 0, pin:1, token:1}
        ).then((result)=>{
            // console.log("orgid_getalltokens_pushNotification::",result)
            // console.log(typeof result)
            if(result.length === 0){
                reject({
                    error: `No Active pin in Organization for this OrgId {${_orgid}}`
                })
            } else {
                winston.debug(result)
                // resolve(result)
		  resolve({
                    result: result,
                    pushtiming: _pushtiming
                })
		    /*
                resolve({
                    pin: result.pin,
                    expiry: result.expiry,
                    token: result.token,
                    issuspended: result.issuspended,
                    orgid: result.orgid,
                    pushtiming: _pushtiming
                })
		*/
            }
            console.log("sdfasdfadsfadsfasdfasdfasdfdsfdsafadsfdsafasdfadsf",result)
        }).catch(function(err){
            console.log("ersdf", err)
            reject("orgid_getalltokens_pushNotificationunabletogettokensforpushnotification")
        })
    })
}
//==========================================================

// ===========================================================


exports.GET_ALL_FOR_PUSHNOTIFICATION = (req,res,next)=>{
    find_HRLOAEND_and_set_EXPIRY_ToTrue()
    .then((result1)=>{
        // console.log(result1, "sfsfd")
        if(result1){
            return true
        }
    }).then((result2)=>{
        // console.log("kkk", result2)
        if(result2){
            return getalltokens_pushNotification()
        }
    }).then((result3)=>{
        if(result3){
            return res.status(200).json({
                message: result3
            })
        }
    }).catch((err)=>{
      console.log("exports.GET_ALL_FOR_PUSHNOTIFICATION.catch=>",err)
        return res.status(404).json({
            error: err
        })
    })

}

const false_find_HRLOAEND_and_set_EXPIRY = function(){
    return new Promise((resolve,reject)=>{
        XCorona.updateMany(
            {hrloaend : {$gt: Date.now()}},
            { $set: { "expiry" : false } },
        )
        .then((resolt)=>{
            // console.log("false_find_HRLOAEND_and_set_EXPIRY ",resolt)
            if(resolt.ok == 1){
                // console.log(resolt.ok)
                resolve(true)
            } else {
                // console.log(resolt.ok)
                reject(false)
            }
        }).catch((err)=>{
            console.log("false_find_HRLOAEND_and_set_EXPIRY.catch=>",err)
            reject("false_find_HRLOAEND_and_set_EXPIRY.catch=>: unableto set to true")
        })
    })
}


false_find_HRLOAEND_and_set_EXPIRY().then(function(result){
    // console.log(result)
}).catch(function(err){
    console.log(err)
})



const find_HRLOAEND_and_set_EXPIRY_ToTrue = function(){
    return new Promise((resolve,reject)=>{
        XCorona.updateMany(
            {hrloaend : {$lt: Date.now()}},
            { $set: { "expiry" : true } },
        )
        .then((resolt)=>{
            // console.log(resolt)
            if(resolt.ok == 1){
                // console.log(resolt.ok)
                resolve(true)
            } else {
                // console.log(resolt.ok)
                reject(false)
            }
        }).catch((err)=>{
            console.log("find_HRLOAEND_and_set_EXPIRY_ToTrue.catch=>",err)
            reject("find_HRLOAEND_and_set_EXPIRY_ToTrue.catch=>: unableto set to true")
        })
    })
}

const getalltokens_pushNotification = function(){
    return new Promise((resolve,reject)=>{
        var ex = Date.now() - (40 * 60 * 1000);
        //var ex = Date.now()
	XCorona.find(
		//{$and: [{expiry:"false", lastupdate:{$lt: ex} }]},
		//{ expiry:"false",$expr: {$lt:[{$toDouble:"lastupdate"}, ex]} },
		{  expiry:"false",mobile:{$exists:true}, issuspended:"false", lastupdate: {$lt: ex}},
            {orgid:1,issuspended:1, lastupdate:1,expiry:1, _id: 0, pin:1, token:1, lang:1}
        ).then((result)=>{
            // console.log(result)
            resolve(result)
            //   console.log("jain", result)
            //   for(a in result){
            //       console.log(result[a].pin, result[a].token)
            //   }
        }).catch(function(err){
            console.log("getalltokens_pushNotification.catch=>", err)
            reject("getalltokens_pushNotification.catch=>")
        })
    })
}

//
// findExpiryComparison()
//as per the documentation from mongodb
//Currently I don't think its possible in MongoDB to
//update multiple documents and return all the updated documents in the same query.
const findExpiryComparison = function(_pin){
    return new Promise((resolve,reject)=>{
        var expiry = ""
        XCorona.updateMany(
            {hrloaend : {$lte: Date.now()}},
            { $set: { "expiry" : true } },
            )
        .then((resolt)=>{
            // console.log("ss",resolt)
            // for(var i=0; i<resolt.length; i++){
            //     // console.log("dddd", resolt[i].pin, resolt[i].loastart)
            // }
            return resolt
        })
        .then((result2)=>{
            // var date = moment(Date.now()).tz('Asia/Singapore').format('DD/MM/YYYY')
            // console.log(date)
            // if(result2[0].loaend == Date.now()) {
            //     resolve(true)
            // } else {
            //     resolve(result2)
            // }
        }).catch((err)=>{
          console.log("findExpiryComparison.catch=>",err)
            reject(err)
        })
    })
}

// findExpiryComparison("pinI").then(function(result){
//     // console.log(result)
// }).catch(function(err){
//     console.log(err)
// })

// const updateLatLng_updated = function(_pin, _trk, primus, io){
//     return new Promise(function(resolve,reject){
//         XCorona.findOneAndUpdate(
//             {pin: _pin},
//             {
//                 $push : {
//                 trk :  _trk
//                 },

//             }, {new: true}
//             ).then(function(result){
//                 console.log("FunctionUpdateLatLng:", result)
//                 if(result == null) {
//                     reject({
//                         status: 2,
//                         desc: "invalid pin"
//                     })
//                 }  else {
//                     resolve(result)
//                 }
//                 // primus.send('chartData',updateInfo);
//                 // io.emit('chartData', updateInfo)

//             }).catch(function(err){
//                 winston.error(err)
//                 reject("failed Unabled to update pf and dist")
//             })
//         })
// }

const updateLatLng_updated = function(_pin, _trk){
    return new Promise(function(resolve,reject){
        var updatedData ="";
        var isPinSuspended = ""
        checkPinExists(_pin)
        .then(function(result0){
            updatedData = result0
          return true;
        }).then(function(result1){
            //checkExpiry will return true or false
            //if returns true means not expired
            return checkExpiry(updatedData,_pin)
        }).then(function(result2){
            if(result2){ // if true means pin is not expired, if it is not expired then check suspended
               return isPin_Suspended(_pin)
            }
        }).then(function(result3){
            console.log("exports.UPDATE_INFO.updateLatLng_updated.isPin_Suspended.result3==>>", result3)
           return result3;
        }).then(function(result4){
            if(result4) {
                return update_TRK_mongoDb(_pin, _trk)
            }
        }).then(function(result5){
            //console.log("exports.UPDATE_INFO.updateLatLng_updated.update_TRK_mongoDb.result5==>>",result5)
            logger.info("exports.UPDATE_INFO.updateLatLng_updated.update_TRK_mongoDb.result5==>>",result5)
	    resolve({
                status: 1,
                desc: "proceed",
                maxdist: result5.maxdist,
		mindist: result5.mindist,
                maxalt:result5.maxalt,
                minalt:result5.minalt,
                maxvltn: result5.maxvltn,
                updfreq: result5.updfreq,
                loastart: result5.loaend,
	        issuspended: result5.issuspended,
                expiry:result5.expiry,
		isbiometric: result5.isbiometric,
		showtemperature: result5.showtemperature
            })
        }).catch(function(err){
            console.log("exports.UPDATE_INFO.updateLatLng_updated.catch=>", err)
            reject(err)
            // reject("UnableToUpdatePinTRK")
        })
    })
}

const update_TRK_mongoDb = function(_pin, _trk){
    return new Promise((resolve,reject)=>{
        XCorona.findOneAndUpdate(
            {pin: _pin},
            {
                $set: {lastupdate: _trk.ts},
                $push : {
                    trk :  _trk
                },
                }, {new: true}
            ).then(function(result){
                var config = {
                    maxdist : result.maxdist,
                    mindist: result.mindist,
                    maxalt:result.maxalt,
                    minalt:result.minalt,
		    maxvltn: result.maxvltn,
                    updfreq: result.updfreq,
                    loaend: result.loaend,
		    issuspended: result.issuspended,
		    expiry:result.expiry,
		    isbiometric: result.isbiometric,
		    showtemperature: result.showtemperature
                }
                resolve(config)
            }).catch(function(err){
                console.log("update_TRK_mongoDb.catch=>",err)
                reject(false)
            })
    })
}

const checkPinExists = function(_pin){
    return new Promise((resolve,reject)=>{
        XCorona.find({pin:_pin}).then(function(result){
            if(result.length>=1){
                resolve(result)
            } else {
                reject({
                    status:2,
                    desc: "invalid pin"
                })
            }
        }).catch(function(err){
            console.log("CheckPinExists.catch=>", err)
            reject("UnableToCheckIfPinExistsIn: checkPinExists")
        })
    })
}

const isPin_Suspended = function(_pin) {
    return new Promise((resolve,reject)=>{
        XCorona.find({pin:_pin, issuspended: {$exists:true, $eq:"true"}}, {_id:0,pin:1,loaend:1,issuspended:1,expiry:1})
        .then(function(result){
            // console.log("Result::", result, "Length:", result.length)
            if(result.length >= 1){
               console.log("isPin_Suspended==>>yes suspended")
               reject({
                  status: 4,
                  desc: "pin suspended"
               })
            } else {
             console.log("isPin_Suspended==>>No not suspended", result)
             resolve({
                status: false,
                result: ""
             })
            }
        }).catch(function(err){
          //   console.log("Err", err)
            console.log("isPin_Suspended.catch=>",err)
            reject("UnableToFindIsPin_Suspended")
        })
    })
}

const checkExpiry = function(result, _pin){
    return new Promise((resolve,reject)=>{
        var currentDate = moment(Date.now()).tz('Asia/Singapore').format('DD/MM/YYYY')
        // console.log("CheckExpiry:: ", result[0].loaend == currentDate, result[0].loaend, currentDate)

        var expiry = result[0].loaend
        var expiryepoch = moment(expiry, "DD/MM/YYYY").valueOf();
        expiryepoch += 28800; // +08hrs
        var now = Date.now();
        if (now >= expiryepoch) {
            //YES, SMALLER
            console.log("checkExpiry==>>", _pin, now, expiryepoch)
            // console.log("expired",_pin, now, expiryepoch, result[0].loaend)
            // this is dirty way of doing things, but let it be the way it is.
            set_pin_to_expiry_true(_pin).then(function(result){
                // console.log("set_pin_to_expiry_true: succesfull")
            }).catch(function(err){
                console.log("set_pin_to_expiry_true.catch==>",err)
            })
        reject({
            status: 3,
            desc: "pin expired"
        })
        } else {
            //NOPE
            console.log("checkExpiry==>>",result[0].pin,now, expiryepoch,result[0].loaend )
            resolve(true)
        }
    })
}



const set_pin_to_expiry_true = function(_pin){
    return new Promise((resolve,reject)=>{
        XCorona.findOneAndUpdate(
            {pin:_pin},
            {
                $set: { "expiry" : true } ,
            },{new:true}
        ).then(function(result){
            // console.log("PinUpdateToExpiryTrueIsSuccesfull ", _pin)
            resolve(true)
        }).catch(function(error){
            // console.log("set_pin_to_expiry_true:", err)
            console.log("set_pin_to_expiry_true.catch=>",error)
            reject("SomeErrorSettingPinExpiryTrue")
        })
    })
}


// const jain_updateLatLng_updated = function(_pin, _trk, primus, io){
//     return new Promise(function(resolve,reject){
//         XCorona.findOneAndUpdate(
//             {pin: _pin},
//             {
//                 $set: {lastupdate: _trk.ts},
//                 $push : {
//                 trk :  _trk
//                 },
//             }, {new: true}
//             ).then(function(result){
//
// 		    //            console.log("FunctionUpdateLatLng:", result)
//                 if(result == null) {
//                     reject({
//                         status: 2,
//                         desc: "invalid pin"
//                     })
//                 }  else {
//                     return result
//                 }
//                 // primus.send('chartData',updateInfo);
//                 // io.emit('chartData', updateInfo)
//
//             }).then((result2)=>{
//                 return checkExpiry(result2,_pin)
//             }).then((result3)=>{
//                 if(result3){
//                     resolve({
//                         status: 1,
//                         desc: "proceed"
//                     })
//                 } else {
//                     reject({
//                         status: 3,
//                         desc: "pin expired"
//                     })
//                 }
//             }).catch(function(err){
//                 winston.error(err)
//                 reject("failed Unabled to update pf and dist")
//             })
//         })
// }



// const checkExpiry = function(result, _pin){
//     return new Promise((resolve,reject)=>{
//         var currentDate = moment(Date.now()).tz('Asia/Singapore').format('DD/MM/YYYY')
//         console.log("CheckExpiry:: ", result.loaend == currentDate, result.loaend, currentDate)

//         var expiry = result.loaend
//         var expiryepoch = moment(expiry, "DD/MM/YYYY").valueOf();
//         expiryepoch += 28800; // +08hrs
//         var now = Date.now();
//         if (now >= expiryepoch) {
//             //YES, SMALLER
//             console.log("expired",_pin, now, expiryepoch, result.loaend)
//             // this is dirty way of doing things, but let it be the way it is.
//             set_pin_to_expiry_true(_pin).then(function(result){
//                 console.log("set_pin_to_expiry_true: succesfull")
//             }).catch(function(err){
//                 console.log("SettingPinTo true is not sucesfful")
//             })
//         reject({
//                 status: 3,
//                 desc: "expired"
//             })
//         } else {
//             //NOPE
//             console.log("not expired",result.pin,now, expiryepoch,result.loaend )
//             resolve(true)
//         }
//     })
// }

// const _notinsuecheckExpiry = function(result, _pin){
//     return new Promise((resolve,reject)=>{
//         var currentDate = moment(Date.now()).tz('Asia/Singapore').format('DD/MM/YYYY')
//         console.log("CheckExpiry:: ", result.loaend == currentDate, result.loaend, currentDate)
//
//         var expiry = result.loaend
//         var expiryepoch = moment(expiry, "DD/MM/YYYY").valueOf();
//         expiryepoch += 28800; // +08hrs
//         var now = Date.now();
//         if (now >= expiryepoch) {
//             //YES, SMALLER
//             console.log("expired",_pin, now, expiryepoch, result.loaend)
//             // this is dirty way of doing things, but let it be the way it is.
//             set_pin_to_expiry_true(_pin).then(function(result){
//                 console.log("set_pin_to_expiry_true: succesfull")
//             }).catch(function(err){
//                 console.log("SettingPinTo true is not sucesfful")
//             })
//         resolve(false)
//         } else {
//             //NOPE
//             console.log("not expired",result.pin,now, expiryepoch,result.loaend )
//             resolve(true)
//         }
//     })
// }
//
// const NOTINSUEset_pin_to_expiry_true = function(_pin){
//     return new Promise((resolve,reject)=>{
//         XCorona.findOneAndUpdate(
//             {pin:_pin},
//             {
//                 $set: { "expiry" : true } ,
//             },{new:true}
//         ).then(function(result){
//             console.log("PinUpdateToExpiryTrueIsSuccesfull ", _pin)
//             resolve(true)
//         }).catch(function(error){
//             console.log("set_pin_to_expiry_true:", err)
//             reject("SomeErrorSettingPinExpiryTrue")
//         })
//     })
// }


// const checkExpiry = function(result){
//     return new Promise((resolve,reject)=>{
//         var currentDate = moment(Date.now()).tz('Asia/Singapore').format('DD/MM/YYYY')
//         console.log("CheckExpiry:: ", result.loaend == currentDate, result.loaend, currentDate)
//         if(result.loaend == currentDate){
//             reject({
//                 status: 3,
//                 desc: "expired"
//             })
//         } else {
//             resolve(true)
//         }
//     })
// }

exports.UPDATE_MONGODB = (req,res,next)=>{
    // console.log("sfdsfsafdsf", JSON.stringify(req.body.results[0].length), req.body.results.length)
    // UPDATECorona.insertMany(req.body.results).then(function(abc){
    //     console.log("insertmany::", abc)
    // }).catch(function(err){
    //     console.log(err)
    // })
    for(i=0; i< req.body.results.length; i++){
        uploadDataIntoMongoDB(req.body.results[i])
    }
    res.status(200).json({
        message: "UpdateDoneSuccefully",
    })
}

const uploadDataIntoMongoDB = function(calcData){
        console.log("jain",calcData.pin)
        const coronaUpdate = new UPDATECorona({
            _id: new mongoose.Types.ObjectId(),
            pin: calcData.pin,
            trk: calcData.trk,
            timestamp: calcData.timestamp,
            // emailid: calcData.emailid,
            name: calcData.name
        });

        UPDATECorona.find({pin:calcData.pin}).then(function(result){
            console.log("dasfasdfsdf",result)
            if(result.length >= 1){
                console.log("it exists then clean the array and add new data")
                return cleanupArray(calcData.pin);
            } else {
                console.log('donot exist')
                return false;
            }
        }).then(function(result){
            if(result == false){
                coronaUpdate.save();
            } else {
                // resolve(result)
                console.log("cleanupddone")
                return true;
            }
        }).then(function(status){
            if(status){
                return afterCleanUpTheArrayPushTrackerUpdateInfo(calcData.pin, coronaUpdate)
            }
        }).then(function(final){
            console.log("finally updated")
        })
        .catch(function(err){
            winston.error(err)
            console.log(err)
        })
}

function calculateDistance(_prev_lat, _prev_lng, _lat, _lng) {
    return new Promise(function(resolve,reject) {
        try {
            prev_lat = parseFloat(_prev_lat)
            prev_lng = parseFloat(_prev_lng)
            lat = parseFloat(_lat)
            lng = parseFloat(_lng)
            console.log (prev_lat, prev_lng, lat, lng)
            if (prev_lat == undefined || prev_lng == undefined || lat == undefined || lng == undefined) {
                // return -2;
                resolve(-2)
            }
            if (prev_lat == NaN || prev_lng == NaN || lat == NaN || lng == NaN) {
                 console.log("Nan:" ,true)
                // return -3;
                resolve(-3)
            }
            if (prev_lat == "" || prev_lng == "" || lat == "" || lng == "") {
                // return -4;
                resolve(-4)
            }
            if (prev_lat == null || prev_lng == null || lat == null || lng == null) {
                // return -5;
                resolve(-5)
            }
            if (prev_lat == "" || prev_lng == "" || lat == "" || lng == "") {
                // return -6;
                resolve(-6)
            }
            var R = 6371e3; // metres
            var pi = Math.PI;
            // var φ1 = degrees2Radians(prev_lat);
            // var φ2 = degrees2Radians(lat);
            // var Δφ = degrees2Radians(lat-prev_lat);
            // var Δλ = degrees2Radians(lng-prev_lng);
            var pi = (pi/180)

            var φ1 = prev_lat * pi;
            var φ2 = lat * pi;
            var Δφ = (lat-prev_lat) * pi;
            var Δλ = (lng-prev_lng) * pi;
            // var φ1 = prev_lat * (pi/180);
            // var φ2 = lat * (pi/180);
            // var Δφ = (lat-prev_lat) * (pi/180);
            // var Δλ = (lng-prev_lng) (pi/180);

            var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

            var d = R * c;
            resolve(d)
            // return d;
        } catch{
            // return -1
            resolve(-1)
        }
    })
}

const afterCleanUpTheArrayPushTrackerUpdateInfo = function(updateInfo, coronaUpdate){
    console.log()
    return new Promise(function(resolve,reject){
        UPDATECorona.findOneAndUpdate(
            {pin: updateInfo},
            {
                $push : {
                trk :  coronaUpdate.trk
                }
            }).then(function(result){
                // primus.send('chartData',updateInfo);
                // io.emit('chartData', updateInfo)
                resolve(result)
            }).catch(function(err){
                winston.error(err)
                reject(err)
            })
        })
}
const cleanupArray = function(searchThispin){
    return new Promise(function(resolve,reject){
        UPDATECorona.update({pin:searchThispin}, { $set: { trk: [] }}, function(err, affected){
            // console.log('affected: ', affected);
            resolve("cleanedUpTheArray")
        }).catch(function(err){
          console.log("cleanupArray.catch=>",err)
            winston.error(err)
            reject(err)
        })
    })
}

// const uploadDataIntoMongoDB2 = function(calcData){
//     return new Promise(function(resolve,reject){
//         for (i = 0; i < calcData.length; i++) {
//             console.log(calcData[i])
//           }
//         // UPDATECorona.find().then(function(result){
//         //     resolve(result)
//         // }).catch(function(err){
//         //     reject(err)
//         // })
//     })
// }
//




// exports.CORONA = (req,res,next)=>{
//     var io = req.app.get('socketio');
//     var primus = req.app.get('primusio')

//     console.log(req.body.pin)
//    var _pin = req.body.pin;
//    var _trk = {
//        lat: req.body.lat,
//        lng: req.body.lng,
//        ts: Date.now(),
//    }
// //    var temperature = req.body.temperature;
//    var _emailid = req.body.email;
//    var _name = req.body.name;
//    var  _mobile =  req.body.mobile;
//    var _temperature = req.body.temperature;
//    var _symptoms = req.body.symptoms
//    const coronaData = new Corona({
//         _id: new mongoose.Types.ObjectId(),
//         pin: _pin,
//         trk: _trk,
//         timestamp: Date.now(),
//         emailid: _emailid,
//         name: _name,
//         mobile: _mobile,
//         temp: _temperature,
//         symptoms: _symptoms
//     });
//     saveToDB(coronaData, primus, io).then(function(result){
//         console.log(result)
//         res.status(200).json({
//             message : result
//         })
//     }).catch(function(err){
//         res.status(500).json({
//             err0r: err
//         })
//         console.log(err)
//     })

// }


exports.GET_UPDATED_DATA = (req,res,next)=>{
    UPDATECorona.find().then(function(result){
        res.status(200).json({
            results: result
        })
    }).catch(function(err){
        winston.error(err)
        console.log("exports.GET_UPDATED_DATA.catch=>",err)
        res.status(500).json({
            message: err
        })
    })
}

exports.GETALLDATA = (req,res,next)=>{
    XCorona.find().then(function(result){
        res.status(200).json({
            results: result
        })
    }).catch(function(err){
        winston.error(err)
        console.log("exports.GETALLDATA.catch=>",err)
        res.status(500).json({
            message: err
        })
    })
}

exports.GETALLDATA_BYPIN = (req,res,next)=>{
    var _pin = req.params.pin
    XCorona.find({pin: _pin}).then(function(result){
        res.status(200).json({
            results: result
        })
    }).catch(function(err){
        winston.error(err)
        console.log("exports.GETALLDATA_BYPIN.catch=>",err)
        res.status(500).json({
            message: err
        })
    })
}

const saveToDB = function(coronaData){
    return new Promise(function(resolve,reject){
        // console.log("caling Savetodb", coronaData.pin)
        XCorona.find({pin: coronaData.pin}).then(function(result){
            // console.log(result, result.length)
            if(result.length >= 1){
            // if(!result == "null"){
                //exists
                // resolve(result)
                // console.log("it exists")
                return updateDB(coronaData,result);
            } else {
                return false;
            }
        }).then(function(result){
            if(result == false){
                // console.log("fasle", result)
                // primus.send('chartData',coronaData);
                // io.emit('chartData', coronaData)
                resolve(coronaData.save())
            } else {
                resolve(result)
            }
        }).catch(function(err){
            console.log("saveToDB.catch=>",err);
            winston.error(err)
            reject(err)
        })
    })
}

// const updateDB = function(updateInfo, primus, io){
//     return new Promise(function(resolve,reject){
//         Corona.findOneAndUpdate(
//             {pin: updateInfo.pin},
//             {
//                 $push : {
//                 trk :  updateInfo.trk
//                 }
//             }).then(function(result){
//                 primus.send('chartData',updateInfo);
//                 // io.emit('chartData', updateInfo)
//                 resolve(result)
//             }).catch(function(err){
//                 reject(err)
//             })
//         })
// }


const updateDB = function(updateInfo,currentData){
    return new Promise(function(resolve,reject){
        var uI = updateInfo
        // console.log("sddfsaf::>>>>>>",currentData,currentData[0].initlat,currentData[0].initlng,updateInfo.initlat,updateInfo.initlng )
        calculateDistance(currentData[0].initlat,currentData[0].initlng,updateInfo.initlat,updateInfo.initlng)
        .then(function(result){
            // console.log("CalculateDistance::", result)
            return result
        }).then(function(result1){
            // console.log("resssss", result1)
            // if(result1){ dont use this, if this becomes zero the condistion will become falst
               return updateInfo.trk[0].dist = result1
            // }
        }).then(function(result3){
            // console.log("Resut3", result3, updateInfo, updateInfo.trk[0].lat)
           return updateLatLng(updateInfo)
        }).then(function(result2){
            // console.log("afterUpdate::", result2)
            resolve(result2)
        }).catch(function(err){
            console.log(err)
            winston.error(err)
            reject("ubable")
        })
    })
}



const updateLatLng = function(updateInfo){
    return new Promise(function(resolve,reject){
        XCorona.findOneAndUpdate(
            {pin: updateInfo.pin},
            {
                $push : {
                trk :  updateInfo.trk
                }
            }).then(function(result){
                console.log("updateLatLng==>>", result)
                // primus.send('chartData',updateInfo);
                // io.emit('chartData', updateInfo)
                resolve(result)
            }).catch(function(err){
              console.log("updateLatLng.catch=>",err)
                winston.error(err)
                reject(err)
            })
        })
}

const findOneByPin = function(updateInfo){
    return new Promise((resolve,reject)=>{
        XCorona.findOne({pin: updateInfo.pin})
        .then(function(result){
            if(result.length >= 1){
                resolve(result)
            } else {
                resolve(false)
            }
        }).catch(function(err){
          console.log("findOneByPin.catch=>",err)
            winston.error(err)
            reject("unable to get results ")
        })
    })
}

// router.post("/", (req, res, next) => {
//     Product.findById(req.body.productId)
//       .then(product => {
//         if (!product) {
//           return res.status(404).json({
//             message: "Product not found"
//           });
//         }
//         const order = new Order({
//           _id: mongoose.Types.ObjectId(),
//           quantity: req.body.quantity,
//           product: req.body.productId
//         });
//         return order.save();
//       })
//       .then(result => {
//         console.log(result);
//         res.status(201).json({
//           message: "Order stored",
//           createdOrder: {
//             _id: result._id,
//             product: result.product,
//             quantity: result.quantity
//           },
//           request: {
//             type: "GET",
//             url: "http://localhost:3000/orders/" + result._id
//           }
//         });
//       })
//       .catch(err => {
//         console.log(err);
//         res.status(500).json({
//           error: err
//         });
//       });
//   });
// const saveData = function
// MyModel.findOneAndUpdate(
//     {foo: 'bar'}, // find a document with that filter
//     modelDoc, // document to insert when nothing was found
//     {upsert: true, new: true, runValidators: true}, // options
//     function (err, doc) { // callback
//         if (err) {
//             // handle error
//         } else {
//             // handle document
//         }
//     }
// );


const saveGeoData = function(coronaData){
    return new Promise(function(resolve,reject){
        coronaModel.findOneAndUpdate(
            {pin: coronaData.pin},
            coronaData,
            {upsert: true, new: true, runValidators: true}
            ).then(function(result){
                resolve(result)
            }).catch(function(err){
           console.log(err)
           winston.error(err)
           reject("ErrorInSavingCoronaDataInMongoDB" + err)
       })
    })
}

const saveGeoData2 = function(coronaData){
    return new Promise(function(resolve,reject){
        coronaData.save().then(function(result){
           resolve(result)
       }).catch(function(err){
        winston.error(err)
           console.log(err)
           reject("ErrorInSavingCoronaDataInMongoDB" + err)
       })
    })
}


 // var io = req.app.get('socketio');
    // var primus = req.app.get('primusio')
    // // console.log("dsd",primus)
    // primus.send("jain", {"jain": "kkk"})
    // primus.on('lufthansa', (data)=>{
    //     console.log("datafrom Lufthansa:::", data)
    // })
    // io.emit('messages', {"jain":"jain" + Date.now()})
    // res.status(200).json({
    //     message: "SuccessFromRoutesJSFolder:::" + Date.now()
    // })


    // exports.GET_LAT_LNG_BY_POSTALCODE = (req,res,next) =>{
//     var _pin = req.body.pin;
//     var _pcode = req.body.pcode;
//     getLatLngByPostalCode(_pcode).then(function(results){
//         res.status(200).json({
//             message: results
//         })
//     }).catch(function(err){
//         res.status(500).json({
//             error: "UnableToGetLatLngCoordinates"
//         })
//     })
// }





exports.CORONA = (req,res,next)=>{
    // var io = req.app.get('socketio');
    // var primus = req.app.get('primusio')
    // var producer = req.app.get("kafka_producer");
    console.log(req.body)
    winston.info(req.body)

    var _pin = req.body.pin;
    var  _mobile =  req.body.mobile;
    var  _pcode =  req.body.pcode;
    var  _loastart =  req.body.loastart;
    var  _loaend =  req.body.loaend;
    var  _devicetype =  req.body.devicetype;
    var _initlat = req.body.lat;
    var _initlng = req.body.lng
    var _expired = false;

    var _dist = req.body.dist;
    var _temp = req.body.temp;
    var _pf = req.body.pf
    var _symptoms = req.body.symptoms
    var _timestamp = Date.now()

    var _trk = {
        pf: _pf,
        ts: Date.now(),
        dist: _dist,
        temp: _temp,
        symptoms: _symptoms
    }

    // var kafka_payload = {
    //     pin: _pin,
    //     trk: [],
    //     timestamp: _timestamp,
    //     // emailid: _emailid,
    //     name: _name,
    //     mobile: _mobile,
    //     temp: _temperature,
    //     symptoms: _symptoms
    // }
    // kafka_payload.trk.push(_trk)
    // payload = JSON.stringify(kafka_payload)
    // payloads = [
    //     {topic: "corona-topic", messages: payload, partitions:1}
    // ]

    // producer.send(payloads, function(err, data) {
    //     // console.log("KafkaProducerSend:Data:::::",data);
    //     if(err){
    //     // console.log("KafkaProducerErr0r:::::", err)
    //  }
    // });
    const coronaData = new XCorona({
            _id: new mongoose.Types.ObjectId(),
            pin: _pin,
            mobile: _mobile,
            pcode: _pcode,
            loastart: _loastart,
            loaend: _loaend,
            devicetype: _devicetype,
            expired: _expired,
            // trk: _trk,
            timestamp: _timestamp,
            initlat: _initlat,
            initlng: _initlng
        });
        // console.log(coronaData.pin)

        // return;
    saveToDB(coronaData).then(function(result){
        console.log(result)
        res.status(200).json({
            message : result
        })
    }).catch(function(err){
        winston.error("SaveToFB ", err)
        res.status(500).json({
            err0r: err
        })
    })

}


// exports.PCODE_UPDATE_BY_PIN = (req,res,next)=>{
//     var _pin = req.body.pin;
//     var _pcode = req.body.pcode;
//     pcode_update_bypin(_pin, _pcode)
//     .then(function(resolt){
//         res.status(200).json({
//             message: resolt
//         })
//     }).catch(function(err){
//         res.status(500).json({
//             error: err
//         })
//     })
// }


    // exports.GET_LAT_LNG_BY_POSTALCODE = (req,res,next) =>{
    //     var _pin = req.body.pin;
    //     var _pcode = req.body.pcode;
    //     getLatLngByPostalCode(_pcode).then(function(results){
    //         if(false){
    //             return res.status(500).json({
    //                 message: "UnableToUpdateLatLng"
    //             })
    //         }
    //         return saveLatLngByPinInMongoDB(_pin, results)
    //     }).then(function(results2){
    //         res.status(200).json({
    //             message: results2
    //         })
    //     }).catch(function(err){
    //         res.status(500).json({
    //             error: "UnableToGetLatLngCoordinates"
    //         })
    //     })
    // }
