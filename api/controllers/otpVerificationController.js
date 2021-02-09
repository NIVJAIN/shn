const mongoose = require("mongoose");
const XCorona = require("../models/coronaModel");
// const UPDATECorona = require("../models/updCoronaModel")
const XConfig = require('../models/configModel')

const OTP = require("../models/coronaModelOTP")
const Bioconfig = require("../models/bioConfigModel")
const Biotimer = require("../models/biotimerModel")
const {body, check, validationResult } = require('express-validator');
const logger = require('../../config/logfive')
const sendSMS = require('./messageController')
const fs = require('fs')
var customId = require('custom-id');
//var winston = require('winston');
const winston = require('../../config/winston')
var moment = require('moment-timezone');
const jwt = require('jsonwebtoken')
var CONFIG = require('../../config/config')
var RefreshTokens = require('../models/tokenModel')
var _MOMENT = require('moment')

exports.CHANGE_IN_CONFIG = (req,res,next)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        res.status(422).json({errors:errors.array()});
        return;
    }
    var _fieldtochange = req.body.fieldname;
    var _fieldvaluetochange = req.body.fieldvalue;
    XConfig.findOneAndUpdate(
        // {osurl: {$exists: true}},
        {},
        {
            $set: {
                [_fieldtochange]: _fieldvaluetochange
            }
        },{upsert:true, new:true}
    ).then(function(result){
        return res.status(200).json({
            message: {
                result: result
            }
        })
    }).catch(function(err){
        console.log(err)
        return res.status(500).json({
            error: "UnableToSaveTheConfigToDatabase"
        })
    })

}

exports.BATCH_SMS_PIN = async(req,res,next)=>{
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
	 x = x.trim()
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
            var url_links = await geturlsfromconfig();
            var result = await get_mobile_with_pin(x)
            var sendsms = await blast_sms_to_pin(result, url_links)
            respData.push(sendsms)
        }catch (err){
            console.log("trycatcherrro",err)
            respData.push(err)
        }
    }
	console.log("batchsms",respData)
    res.status(200).json({
        message: respData
    })
    // console.log("sdfsdf",respData)
}
const blast_sms_to_pin = async function(result,_url_links){
    return new Promise((resolve,reject)=>{
        console.log("jjjjjj",result.result.pin, _url_links)
        // var message = `Your SHN period is from ${result.result.loastart} to ${result.result.loaend}.
        // The PIN assigned to you is: ${result.result.pin}
        // Please download the SHN Reporting app immediately.
        // For iOS: ${_url_links.osurl}
        // For Android: ${_url_links.androidurl}`
        var message = `Your SHN & QO period is from ${result.result.loastart} to ${result.result.loaend}.\n`
              + `The PIN assigned to you is: ${result.result.pin}\n\n`
              + `Please download the SHN Reporting app immediately.\n\n`
              + `For iOS: ${_url_links.osurl}\n\n`
              + `For Android: ${_url_links.androidurl}`


        sendSMS.SEND_SMS_RESOLVE_REJECT(message, result.result.mobile, result.result.pin).then(function(resultfromsms){
            // resolve({
            //     message: result.result,
            //     smsInfo: resultfromsms
            // })
            resolve({
                status: "pass",
                pin: result.result.pin,
                mobile: result.result.mobile,
                loastart:result.result.loastart ,
                loaend: result.result.loaend,
                expiry: result.result.expiry,
                issuspended:result.result.issuspended,
                smsInfo: resultfromsms
            })
        }).catch(function(err){
            reject({
                status:"fail",
                pin: result.result.pin,
                error: err,
                desc: 'unabel to send sms for this pin' + ` ${result.result.pin} : ${result.result.mobile}`
            })
        })

    })
}
exports.BATCH_SMS_PIN_withEEXPESS_VALIDATION_REQ = async(req,res,next)=>{
    var _PIN_ARRAY = req.body.arrayofpins;
    //const errors= validationResult(req);
    //console.log("sss",errors)
    // if(!errors.isEmpty()){
    //     res.status(422).json({errors:errors.array()});
    //     return;
    // }
    var respData =[];
    for (x of _PIN_ARRAY){
        // winston.info(x.pin +" "+ x.maxdist)
        try {
            if(x == "") {
                throw {
                    pin: x,
                    error: ` {${x}} invalid pin format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }
            } if(x ===" "){ 
                throw {
                    pin: x,
                    error: ` {${x}} invalid pin format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }
                
            } if(x ===null ||x === undefined  ){
                throw {
                    pin: x,
                    error: ` {${x}} invalid pin format , accepted formats ALPHAnumeric`,
                    desc: "fail"
                }
            } if(x !== x.toUpperCase()){
                throw {
                    pin: x,
                    error: ` {${x}} invalid pin format , Must be uppercase`,
                    desc: "fail"
                }
            }
            if (!x.match(/^[0-9A-Z]+$/)){
                throw {
                    pin: x,
                    error: ` {${x}} invalid pin format , Must be ALPHAnumeric in all UPPERCASE`,
                    desc: "fail"
                }
            }
        

            // if(x == "" || x ===" " || x ===null || x === undefined || x !== x.toUpperCase()){
            //     throw {
            //         pin: x,
            //         error: ` {${x}} invalid pin format , accepted formats ALPHAnumeric`,
            //         desc: "fail"
            //     }
            // }
           //console.log("asdfadsfsd",body(x).exists().isUppercase().notEmpty())
            var url_links = await geturlsfromconfig();
            var result = await get_mobile_with_pin(x)
            var sendsms = await blast_sms_to_pin(result, url_links)
            respData.push(sendsms)
        }catch (err){
            console.log("trycatcherrro",err)
            respData.push(err)
        }  
    }
    res.status(200).json({
        message: respData
    })
    // console.log("sdfsdf",respData)
}
exports.BATCH_SMS_PIN_ORIG = async(req,res,next)=>{
    var _PIN_ARRAY = req.body.arrayofpins;
    const errors= validationResult(req);
    if(!errors.isEmpty()){
	console.log("BATCH_SMS_PIN.!errors.isEmpty", errors.array())
        res.status(422).json({errors:errors.array()});
        return;
    }
    var respData =[];
    for (x of _PIN_ARRAY){
        // winston.info(x.pin +" "+ x.maxdist)
        try {
            var url_links = await geturlsfromconfig();
            var result = await get_mobile_with_pin(x)
            var sendsms = await blast_sms_to_pin(result, url_links)
            respData.push(sendsms)
        }catch (err){
            console.log("trycatcherrro",err)
            respData.push(err)
        }  
    }
    console.log("BATCH_SMS_PIN.respDataArray", respData)
    res.status(200).json({
        message: respData
    })
    // console.log("sdfsdf",respData)
}

const blast_sms_to_pin_NOTUNUSE = async function(result,_url_links){
    return new Promise((resolve,reject)=>{
        console.log("jjjjjj",result.result.pin, _url_links)
        var message2 = `Your SHN period is from ${result.result.loastart} to ${result.result.loaend}.
        The PIN assigned to you is: ${result.result.pin}
        Please download the SHN Reporting app immediately.
        For iOS: ${_url_links.osurl}
        For Android: ${_url_links.androidurl}`

	      var message = `Your SHN period is from ${result.result.loastart} to ${result.result.loaend}.\n`
              + `The PIN assigned to you is: ${result.result.pin}\n\n`
              + `Please download the SHN Reporting app immediately.\n\n`
              + `For iOS: ${_url_links.osurl}\n\n`
              + `For Android: ${_url_links.androidurl}`
        sendSMS.SEND_SMS_RESOLVE_REJECT(message, result.result.mobile, result.result.pin).then(function(resultfromsms){
            resolve({
                message: result.result,
                smsInfo: resultfromsms
            })
        }).catch(function(err){
            reject({
                pin: result.result.pin,
                error: err,
                desc: 'unabel to send sms for this pin' + ` ${result.result.pin} : ${result.result.mobile}`
            })
        })
        
    })
}

const geturlsfromconfig = async function(){
    return new Promise((resolve,reject)=>{
        XConfig.findOne({osurl:{$exists:true}}).then(function(result){
            if(result != null){
                resolve({
                    osurl: result.osurl,
                    androidurl: result.androidurl
                })
            } else {
               reject({
                   error: "unable to get app urls"
               })
            }
        })
    })
}

const get_mobile_with_pin = async function(_pin){
    return new Promise((resolve,reject)=>{
        XCorona.findOne({
            pin: _pin,
            mobile: {$exists:true}, 
            issuspended:"false", 
            expiry:false
        },{_id:0,pin:1, mobile:1,issuspended:1,expiry:1,loaend:1,loastart:1}).then(function(result){
            if(result==null){
                reject({
		    status: "fail",
                    pin: _pin,
                    error: `This {${_pin}} is not a valid pin or it could be suspended or expired`
                })
            } else {
                resolve({
                    result: result,
                    phoneNumber: result.mobile
                })
            }
        }).catch(function(err){
            console.log("blast_sms_to_all_pins.catch==>>", err)
            reject({
                pin: _pin,
                error: `catch error {${_pin}} `
            })
        })
    })
}


exports.SET_APP_URLS = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(422).json({errors: errors.array()});
        return;
    }
    var newConfig = new XConfig({
        _id: new mongoose.Types.ObjectId(),
        osurl: req.body.osurl,
        androidurl: req.body.androidurl
    })
    XConfig.findOneAndUpdate({osurl: {$exists:true}},
        {
            $set: {
                osurl: req.body.osurl,
                androidurl: req.body.androidurl
            }
        }, {upsert:true, new:true}
    ).then(function(result){
        if(result == null){
           return newConfig.save()
        } else {
            return res.status(200).json({
                message: result
            })
        }  
    }).catch(function(err){
        console.log(err)
        return res.status(500).json({
            error: "unabel to get urls for IoS and Android"
        })
    })
}

exports.BULK_ASSIGN_FOR_FLOATINGPINS_AND_BROADCAST_SMS = async(req,res,next)=>{
    var _PIN_ARRAY = req.body.arrayofpins
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    // console.log(_PIN_ARRAY)
    var respData =[];
    for (x of _PIN_ARRAY){
        // winston.info(x.pin +" "+ x.maxdist)
        try {
            var result = await SETFLOATINGPINS_UPDATE(x)
            respData.push(result)
        }catch (err){
            console.log(err)
            respData.push(err)
        }  
        // winston.info(respData) 
        // winston.debug("HHHHH")
        // winston.log('info','This is an information message.');
        // console.log("IAM called", respData)
    }
    res.status(200).json({
        message: respData
    })
}

const SETFLOATINGPINS_UPDATE = async function(x){
    return new Promise((resolve,reject)=>{
      
        var finalUpdatedResult = "";
        // console.log(x, _hrloastart, _hrloaend)
        // resolve(true)
        // first check mobile exist if exist error it out for catch
        // if doesnt exists check pin avaliable, if not avaliable error this pin doesnt exist in this orgid
        // if floating pin is avaliable save the records and send sms.
        mobileExistsTmeansNotExistRmeansExistWithError(x.pin,x.mobile)
        .then(function(result){ //it return true means mobile not exist
            if(result) {
                return check_if_its_afloating_pin(x.orgid, x.pin)
            }
        }).then(function(result2){
            return update_floating_pin_records(x);
        }).then(function(result3){
            var url_ios = `https://apps.apple.com/sg/app/shn-reporting/id1499970706`
            var url_android = `https://play.google.com/store/apps/details?id=sg.gov.imda.shn`
            var message2 = `Your SHN period is from ${x.loastart} to ${x.loaend}.
            The PIN assigned to you is: ${x.pin}
            Please download the SHN Reporting app immediately.
            For iOS: ${url_ios}
            For Android: ${url_android}`
                  var message = `Your SHN period is from ${x.loastart} to ${x.loaend}.\n`
              + `The PIN assigned to you is: ${x.pin}\n\n`
              + `Please download the SHN Reporting app immediately.\n\n`
              + `For iOS: ${url_ios}\n\n`
              + `For Android: ${url_android}`
		if(result3){
                finalUpdatedResult = result3;
                return sendSMS.SEND_SMS_RESOLVE_REJECT(message, x.mobile, x.pin)
            }
        }).then(function(resultfromsms){
            resolve({
                message: finalUpdatedResult,
                smsInfo: resultfromsms
            })
        }).catch(function(err){
            reject(err)
        })
    })
}
// sendSMS.SEND_SMS_RESOLVE_REJECT("HI", "6581397860", "JAIN").then(function(result){
//     console.log(result)
// }).catch(function(err){
//     console.log(err)
// })
const mobileExistsTmeansNotExistRmeansExistWithError = async function(_pin,_mobile){
    return new Promise(function(resolve,reject){
        XCorona.find({mobile: _mobile}).then(function(result){
            console.log("res", result)
            if(result.length>= 1){
                reject({
                    pin: _pin,
                    status:'fail',
                    error: `This mobile number {${_mobile}} already registered`
                })
            } else {
                resolve(true)
            }
        }).catch(function(err){
            reject({
                pin:_pin,
                status:'fail',
                error: `FromCatch=> UnableToCheckIfMobileExists {${_mobile}}`
            })
        })
    })
}
const update_floating_pin_records = function(x){
    return new Promise((resolve,reject)=>{
        var _orgid = x.orgid
        var _isbiometric = true;
        var _pin = x.pin;
        var _loastart = x.loastart;
        var _loaend = x.loaend;
        var _hrloastart = moment(x.loastart, "DD/MM/YYYY").valueOf();
        var _hrloaend = moment(x.loaend, "DD/MM/YYYY").valueOf();
        var _multilogin = "false"
        var _mobile = x.mobile;
        var _maxdist = x.maxdist;
        var _mindist = x.mindist;
        var _maxalt =x.maxalt;
        var _minalt =x.minalt;
        var _maxvltn = x.maxvltn
        var _updfreq = x.updfreq 
        if(_orgid == "ICA"){
            _isbiometric = false;
        }
        XCorona.findOneAndUpdate(
            {pin:x.pin, orgid: x.orgid, mobile:{$exists:false}},
            {
                $set: {
                    mobile: _mobile,
                   loastart: _loastart,
                   loaend : _loaend,
                   hrloastart: _hrloastart,
                   hrloaend: _hrloaend,
                   expiry:false,
                   multilogin: _multilogin,
                   maxdist: _maxdist,
                   mindist: _mindist,
                   maxalt: _maxalt,
                   minalt: _minalt,
                   maxvltn: _maxvltn,
                   updfreq: _updfreq,
                   isbiometric: _isbiometric
                }
            },{"fields": {mobile:1,multilogin:1, pin:1, loastart:1, isbiometric:1,issuspended:1, loaend:1,maxdist:1,mindist:1,maxalt:1,minalt:1,maxvltn:1,updfreq:1, expiry:1 },new:true}
        ).then(function(result){
            console.log(result)
            if(result == null) {
                reject({
                    pin: x.pin,
                    status: 'fail',
                    error: `Either Pin not found or OrgId didnt match or there is already an existing mobile number attached to this pin`
                })
            
            } else {
                resolve(result)
            }
        }).catch(function(err){
            console.log("update_floating_pin_records.catch=>", err)
                //winston.error("exports.ASSIGN_FLOATING_PINS.XCorona.findOneAndUpdate.catch==>" +err)
                // console.log('exports.ASSIGN_FLOATING_PINS.try.catch.err==>: %o' , err)
                reject({
                    pin:x.pin,
                    status:'fail',
                    error: `From update_floating_pin_records.catch=> UNABLE To update floating pin`
                })
        })
    })
}

const check_if_its_afloating_pin = function(_orgid,_pin){
    return new Promise((resolve,reject)=>{
        XCorona.findOne(
            {orgid:_orgid, pin:_pin,mobile:{$exists:false}}
        ).then(function(result){
            if(result == null){
                reject({
                    pin: _pin,
                    status: "fail",
                    error: `{${_orgid}}:{${_pin}} is not a floating pin`
                })
            } else {
                resolve(true)
            }
        }).catch(function(err){
            reject({
                pin: _pin,
                status: "fail",
                error: `From catch=> ${_orgid}, ${_pin} Unable to check if its a floating pin`
            })
        })
    })
}
exports.ASSIGN_FLOATING_PINS = async (req,res,next)=>{
    var _orgid = req.body.orgid;
    _orgid = _orgid.toUpperCase();
        const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }
	var _isbiometric = true;
    if(_orgid == "ICA"){
        _isbiometric = false;
    }


	if(_orgid == "" || _orgid == " " || _orgid == undefined || _orgid == null) {
        return res.status(500).json({
            error: `Organization ID cannot be empty ${_orgid}`
        })
    }
    
    var _pin = req.body.pin;
    var _loastart = req.body.loastart;
    var _loaend = req.body.loaend;
    var _hrloastart = moment(req.body.loastart, "DD/MM/YYYY").valueOf();
    var _hrloaend = moment(req.body.loaend, "DD/MM/YYYY").valueOf();
    var _multilogin = "false"
    var _mobile = req.body.mobile;
    var _maxdist = req.body.maxdist
    var _mindist = req.body.mindist;
    var _maxalt =req.body.maxalt;
    var _minalt =req.body.minalt;
    var _maxvltn = req.body.maxvltn;
    var _updfreq = req.body.updfreq;

    try {
        var result = await mobileExists(_mobile)
        XCorona.findOneAndUpdate(
            {pin:_pin, orgid: _orgid, mobile:{$exists:false}},
            {
                $set: {
                    mobile: _mobile,
                   loastart: _loastart,
                   loaend : _loaend, 
                   hrloastart: _hrloastart,
                   hrloaend: _hrloaend, 
                   expiry:false,
                   multilogin: _multilogin,
                   maxdist: _maxdist,
		   mindist: _mindist,
                   maxalt: _maxalt,
                   minalt: _minalt,
                   maxvltn: _maxvltn,
                   updfreq: _updfreq,
		   isbiometric: _isbiometric
                }
            },{new:true}
        ).then(function(result){
            if(result == null) {
                return res.status(404).json({
                    error: `Either Pin not found or OrgId didnt match or there is already an existing mobile number attached to this pin`
                })
            }
            return res.status(200).json({
                message: result
            })
        }).catch(function(err){
		//winston.error("exports.ASSIGN_FLOATING_PINS.XCorona.findOneAndUpdate.catch==>" +err)
		winston.error('exports.ASSIGN_FLOATING_PINS.try.catch.err==>: %o' , err)
		return res.status(500).json({
                error: "Unable to set pins assignment"
            })
        })
    } catch(err){
 	winston.error("exports.ASSIGN_FLOATING_PINS.try.catch.err==>: %0", err)
        return res.status(500).json({
            error: err
        })
    }
}

const mobileExists = async function(_mobile){
    return new Promise(function(resolve,reject){
        XCorona.find({mobile: _mobile}).then(function(result){
            console.log(result)
            if(result.length>= 1){
                reject({
                    error: `This mobile number {${_mobile}} already registered`
                })
            } else {
                resolve(false)
            }
        }).catch(function(err){
            reject({
                error: "UnableToCheckIfMobileExists"
            })
        })
    })
}

exports.LOGIN = (req,res,next)=>{
    var _pin = req.body.pin;
    var _mobile = req.body.mobile;
    var _devicetype = req.body.devicetype;
    var _language = req.body.lang;
    var _make = req.body.make;
    var _model = req.body.model;
    var _osver = req.body.osver;

    var _enddate = ""
    var _isbiometric = "";
    var mainResult = "";
    var _loastart = moment().format("DD/MM/YYYY").toString()
    var _loaend = moment().add(14,'d').format('DD/MM/YYYY').toString()
    var _hrloastart = _MOMENT(_loastart, "DD/MM/YYYY").valueOf();
    var _hrloaend = _MOMENT(_loaend, "DD/MM/YYYY").valueOf();
    winston.info("exports.LOGIN==>>" + _pin +"|" + _mobile + "|" + _devicetype+"|"+ _language + "|" + _loastart + "|" + _loaend + "|"+ _hrloastart + "|" + _hrloaend)
    if(_mobile == "6599999999"){
       return res.status(200).json({
            message: {
                status: 1,
                desc: "proceed",
                enddate: _enddate,
            }
        })
    }
   // check if mobile exists.
    // if mobile not exists then check if floating pin exist. that means no mobile.
    // if floating pin exists then
    // then assign this pin to that mobile.
    // also date.now will LOASTART
    // also loaend is 14 days after.
    // "loastart" : "28/02/2020",
    // "loaend" : "27/05/2020",
    // "hrloastart" : "1582848000000",
    // "hrloaend" : "1590508800000",
      var newRegister2 = {
        pin : _pin,
        mobile: _mobile,
        otp: "",
        otpexpiry: "",
        loastart: _loastart,
        loaend: _loaend,
        hrloastart: _hrloastart,
        hrloaend: _hrloaend,
        devicetype: _devicetype,
        lang: _language,
        expiry: "false",
        issuspended: "false",
        maxdist: 100,
        mindist: 0,
        maxalt: 280,
        minalt: -20,
        maxvltn: 6,
        updfreq:10,
        make: _make,
        model: _model,
        osver: _osver
    }
    var newRegister = new XCorona({
        _id: new mongoose.Types.ObjectId(),
        pin : _pin,
        mobile: _mobile,
        otp: "",
        otpexpiry: "",
        loastart: _loastart,
        loaend: _loaend,
        hrloastart: _hrloastart,
        hrloaend: _hrloaend,
        devicetype: _devicetype,
        lang: _language,
        expiry: "false",
        issuspended: "false",
        maxdist: 100,
        mindist: 0,
        maxalt: 280,
        minalt: -20,
        maxvltn: 6,
        updfreq:10,
        make: _make,
        model: _model,
        osver: _osver
    })
    GET_floating_pins_TF(_pin).then(function(result){
        if(result){
            check_mobile_exist(_mobile)
            .then(function(result){ // this will give true if exists, else false
                if(result){
                throw {
                        error: `{${_mobile}} already exists`
                    }
                        /*
                    return res.status(500).json({
                        error: "Mobile Already Exists"
                    })
                    */
                } else {
                    // update mobile and other details to floating pin
                    return UPDATE_floating_pin_TR(newRegister)
                }
            }).then(function(result2){
                console.log("GET_floating_pins_TF==",_pin, result2)
                if(result2.status) {
                return res.status(200).json({
                        message: {
                            status: 1,
                            desc: "proceed",
                            enddate: _loaend,
                            isbiometric: result2.info.isbiometric,
                            showtemperature: result2.info.showtemperature
                        }
                    })
                }
            }).catch(function(err){
                winston.error("exports.LOGIN.GET_floating_pins_TF.catch=>: %o",  err)
                logger.info('exports.LOGIN.catch=>', err)
		return res.status(500).json({
                    error: err
                })
            })
        } else {
            userExist_MobileAndPin(_pin, _mobile).then(function(result1){
                if(result1){
                    mainResult = result1;
                    console.log("userExist_MobileAndPin::", result1.length)
                    _enddate = result1[0].loaend
                    _isbiometric = result1[0].isbiometric;
                return checkExpiry(result1)
                }
            }).then(function(result2){
                return isPin_Suspended(_pin)
            }).then(function(result2){
                if(result2) { // if true then proceed
                    console.log("sdfsfsdfasdfasdfasdfasdfasdfadsfsd", result2)
                    return updateDeviceType(newRegister2)
                    // // return request_otp()
                    // res.status(200).json({
                    //     status: 1,
                    //     desc: "proceed"
                    // })
                }
            }).then((result3)=>{
                res.status(200).json({
                    message: {
                        status: 1,
                        desc: "proceed",
                        enddate: _enddate,
                        isbiometric: _isbiometric,
                        loaend: mainResult[0].loaend,
                        issuspended: mainResult[0].issuspended,
                        expiry: mainResult[0].expiry,
                        showtemperature: mainResult[0].showtemperature
                    }
                })
            }).catch(function(err){
                winston.error("GetFloatingpins.catch=>: %o",err)
		logger.error("GerFloatingpins.catch=>", err)
                res.status(404).json({
                    error: err
                })
            })
        }
    })
}

exports.LOGIN_1APRILB4RAKESHREEQUEST = (req,res,next)=>{
    var _pin = req.body.pin;
    var _mobile = req.body.mobile;
    var _devicetype = req.body.devicetype;
    var _language = req.body.lang;
    var _enddate = ""
    var _isbiometric = "";
    var mainResult = "";
    var _loastart = moment().format("DD/MM/YYYY").toString()
    var _loaend = moment().add(14,'d').format('DD/MM/YYYY').toString()
    var _hrloastart = _MOMENT(_loastart, "DD/MM/YYYY").valueOf();
    var _hrloaend = _MOMENT(_loaend, "DD/MM/YYYY").valueOf();
    winston.info("exports.LOGIN==>>" + _pin +"|" + _mobile + "|" + _devicetype+"|"+ _language + "|" + _loastart + "|" + _loaend + "|"+ _hrloastart + "|" + _hrloaend)
    if(_mobile == "6599999999"){
       return res.status(200).json({
            message: {
                status: 1,
                desc: "proceed",
                enddate: _enddate,
            }
        })
    }
   // check if mobile exists.
    // if mobile not exists then check if floating pin exist. that means no mobile.
    // if floating pin exists then 
    // then assign this pin to that mobile.
    // also date.now will LOASTART
    // also loaend is 14 days after.
    // "loastart" : "28/02/2020",
	// "loaend" : "27/05/2020",
	// "hrloastart" : "1582848000000",
	// "hrloaend" : "1590508800000",
    var newRegister = new XCorona({
        _id: new mongoose.Types.ObjectId(),
        pin : _pin,
        mobile: _mobile,
        otp: "",
        otpexpiry: "",
        loastart: _loastart,
        loaend: _loaend,
        hrloastart: _hrloastart,
        hrloaend: _hrloaend,
        devicetype: _devicetype,
        lang: _language,
        expiry: "false",
        issuspended: "false",
        maxdist: 100,
        mindist: 0,
        maxalt: 280,
        minalt: -20,
        maxvltn: 6,
        updfreq:10
    })
    GET_floating_pins_TF(_pin).then(function(result){
        if(result){ 
            check_mobile_exist(_mobile)
            .then(function(result){ // this will give true if exists, else false
                if(result){
		throw {
                        error: `{${_mobile}} already exists`
                    }
			/*
                    return res.status(500).json({
                        error: "Mobile Already Exists"
                    })
		    */
                } else {
                    // update mobile and other details to floating pin
                    return UPDATE_floating_pin_TR(newRegister)
                }
            }).then(function(result2){
                console.log("GET_floating_pins_TF==",_pin, result2)
                if(result2) {
                   return res.status(200).json({
                        message: {
                            status: 1,
                            desc: "proceed",
                            enddate: _loaend
                        }
                    })
                }
            }).catch(function(err){
                winston.error("exports.LOGIN.GET_floating_pins_TF.catch=>: %o",  err)
                return res.status(500).json({
                    error: err
                })
            })
        } else {
            userExist_MobileAndPin(_pin, _mobile).then(function(result1){
                if(result1){
                    mainResult = result1;
		    console.log("userExist_MobileAndPin::", result1.length)
                    _enddate = result1[0].loaend
                    _isbiometric = result1[0].isbiometric;
		   return checkExpiry(result1)
                }
            }).then(function(result2){
                return isPin_Suspended(_pin)
            }).then(function(result2){
                if(result2) { // if true then proceed
                    console.log("sdfsfsdfasdfasdfasdfasdfasdfadsfsd", result2)
                    return updateDeviceType(newRegister)
                    // // return request_otp()
                    // res.status(200).json({
                    //     status: 1,
                    //     desc: "proceed"
                    // })
                }
            }).then((result3)=>{
                res.status(200).json({
                    message: {
                        status: 1,
                        desc: "proceed",
                        enddate: _enddate,
			isbiometric: _isbiometric,
			loaend: mainResult[0].loaend,
                        issuspended: mainResult[0].issuspended,
                        expiry: mainResult[0].expiry
                    }
                })
            }).catch(function(err){
                winston.error("GetFloatingpins.catch=>: %o",err)
                res.status(404).json({
                    error: err
                })
            })
        }
    })
}

const isPin_Suspended = function(_pin) {
    return new Promise((resolve,reject)=>{
        XCorona.find({pin:_pin, issuspended: {$exists:true, $eq:"true"}}, {_id:0,pin:1,loaend:1,issuspended:1,expiry:1})
        .then(function(result){
            // console.log("Result::", result, "Length:", result.length)
            if(result.length >= 1){
               console.log("FromOTPcontroller.:isPin_Suspended==>>yes suspended")
               reject({
                  status: 4,
                  desc: "pin suspended"
               })
            } else {
             console.log("FromOTPcontroller.isPin_Suspended==>>No not suspended", result)
             resolve({
                status: false,
                result: ""
             })
            }
        }).catch(function(err){
          //   console.log("Err", err)
            console.log("fromOTPController.isPin_Suspended.catch=>",err)
            reject("UnableToFindIsPin_Suspended")
        })
    })
}

exports.LOGIN_DOESNTHAVE_ISSUSPENDED = (req,res,next)=>{
    var _pin = req.body.pin;
    var _mobile = req.body.mobile;
    var _devicetype = req.body.devicetype;
    var _language = req.body.lang;
    var _enddate = ""
    var _loastart = moment().format("DD/MM/YYYY").toString()
    var _loaend = moment().add(14,'d').format('DD/MM/YYYY').toString()
    var _hrloastart = _MOMENT(_loastart, "DD/MM/YYYY").valueOf().toString();
    var _hrloaend = _MOMENT(_loaend, "DD/MM/YYYY").valueOf().toString();
    winston.info("exports.LOGIN==>>" + _pin +"|" + _mobile + "|" + _devicetype+"|"+ _language + "|" + _loastart + "|" + _loaend + "|"+ _hrloastart + "|" + _hrloaend)
    if(_mobile == "6599999999"){
       return res.status(200).json({
            message: {
                status: 1,
                desc: "proceed",
                enddate: _enddate,
            }
        })
    }
   // check if mobile exists.
    // if mobile not exists then check if floating pin exist. that means no mobile.
    // if floating pin exists then 
    // then assign this pin to that mobile.
    // also date.now will LOASTART
    // also loaend is 14 days after.
    // "loastart" : "28/02/2020",
	// "loaend" : "27/05/2020",
	// "hrloastart" : "1582848000000",
	// "hrloaend" : "1590508800000",
    var newRegister = new XCorona({
        _id: new mongoose.Types.ObjectId(),
        pin : _pin,
        mobile: _mobile,
        otp: "",
        otpexpiry: "",
        loastart: _loastart,
        loaend: _loaend,
	hrloastart: _hrloastart,
        hrloaend: _hrloaend,
        devicetype: _devicetype,
	lang: _language,
        expiry: "false",
        issuspended: "false",
	maxdist: 100,
	mindist: 0,
        maxalt: 280,
        minalt: -20,
        maxvltn: 6,
        updfreq:10
    })
    GET_floating_pins_TF(_pin).then(function(result){
        if(result){ 
            check_mobile_exist(_mobile)
            .then(function(result){ // this will give true if exists, else false
                if(result){ 
                    return res.status(500).json({
                        error: "Mobile Already Exists"
                    })
                } else {
                    // update mobile and other details to floating pin
                    return UPDATE_floating_pin_TR(newRegister)
                }
            }).then(function(result2){
                console.log("GET_floating_pins_TF==",_pin, result2)
                if(result2) {
                   return res.status(200).json({
                        message: {
                            status: 1,
                            desc: "proceed",
                            enddate: _loaend
                        }
                    })
                }
            }).catch(function(err){
                winston.error("exports.LOGIN.GET_floating_pins_TF.catch=>: %o",  err)
		return res.status(500).json({
                    error: err
                })
            })
        } else {
            userExist_MobileAndPin(_pin, _mobile).then(function(result1){
                if(result1){
                    console.log("result1:", result1)
                    _enddate = result1[0].loaend
                    return checkExpiry(result1)
                }
            }).then(function(result2){
                if(result2) { // if true then proceed
                    console.log("sdfsfsdfasdfasdfasdfasdfasdfadsfsd", result2)
                    return updateDeviceType(_pin, _devicetype)
                    // // return request_otp()
                    // res.status(200).json({
                    //     status: 1,
                    //     desc: "proceed"
                    // })
                }
            }).then((result3)=>{
                res.status(200).json({
                    message: {
                        status: 1,
                        desc: "proceed",
                        enddate: _enddate
                    }
                })
            }).catch(function(err){
                winston.error("GetFloatingpins.catch=>: %o",err)
                res.status(404).json({
                    error: err
                })
            })
        }
    })
}
const UPDATE_floating_pin_TR = function(_newRegister){
    return new Promise((resolve,reject)=>{
        XCorona.findOneAndUpdate(
            {pin: _newRegister.pin},
            {
                $set: {
                    mobile:_newRegister.mobile,
                    otp: "",
                    otpexpiry: "",
                    loastart: _newRegister.loastart,
                    loaend: _newRegister.loaend,
                    devicetype: _newRegister.devicetype,
                    expiry: _newRegister.expiry,
                    issuspended: _newRegister.issuspended
                }
            }, {new:true}
        ).then(function(result){
            if(result == null){
                reject({
                    pin: _newRegister.pin,
                    desc: "fail to update"
                })
            } else {
                resolve({
                    status: "true",
                    info: result

                })
            }
        }).catch(function(err){
            console.log("UPDATE_floating_pin:catch", err)
            reject({
                pin: _newRegister.pin,
                desc: "fail to update"
            })
        })
    })
}
const ST_1APRIL_UPDATE_floating_pin_TR = function(_newRegister){
    return new Promise((resolve,reject)=>{
        XCorona.findOneAndUpdate(
            {pin: _newRegister.pin},
            {
                $set: {
                    mobile:_newRegister.mobile,
                    otp: "",
                    otpexpiry: "",
                    loastart: _newRegister.loastart,
                    loaend: _newRegister.loaend,
                    devicetype: _newRegister.devicetype,
                    expiry: _newRegister.expiry,
                    issuspended: _newRegister.issuspended
                }
            }, {new:true}
        ).then(function(result){
            if(result == null){
                reject({
                    pin: _newRegister.pin,
                    desc: "fail to update"
                })
            } else {
                resolve(true)
            }
        }).catch(function(err){
            console.log("UPDATE_floating_pin:catch", err)
            reject({
                pin: _newRegister.pin,
                desc: "fail to update"
            })
        })
    })
}

const GET_floating_pins_TF  = function(_pin){
    return new Promise ((resolve,reject)=>{
        XCorona.find({pin:_pin ,"mobile": { $exists: false, $ne: ""}}, {_id:0,orgid:1, pin:1,ts:1})
        .then(function(result){
            if(result.length>=1){
                resolve(true)
            } else {
                resolve(false)
            }
            // resolve(result)
        }).catch(function(err){
	   winston.error("GET_floating_pins_TF.catch=>"+ err)
           reject("error unable to get floating pins")
        })  
    })
} 

exports.LOGIN_ORIGINAL_AFTEROLIVER  = (req,res,next)=>{
    var _pin = req.body.pin;
    var _mobile = req.body.mobile;
    var _devicetype = req.body.devicetype;
    var _enddate = ""
    userExist_MobileAndPin(_pin, _mobile).then(function(result1){
        if(result1){
            console.log("result1:", result1)
            _enddate = result1[0].loaend
            return checkExpiry(result1)
        }
    }).then(function(result2){
        if(result2) { // if true then proceed
            console.log("sdfsfsdfasdfasdfasdfasdfasdfadsfsd", result2)
            return updateDeviceType(_pin, _devicetype)
            // // return request_otp()
            // res.status(200).json({
            //     status: 1,
            //     desc: "proceed"
            // })
        } 
    }).then((result3)=>{
        res.status(200).json({
            message: {
                status: 1,
                desc: "proceed",
                enddate: _enddate
            }
            
        })
    }).catch(function(err){
        winston.error(err)
        res.status(404).json({
            error: err
        })
    })
}

// find first, if not exist return 
// if exists generate otp 
// after generate otp update in mongodb

exports.REGISTER_FOR_LOGIN = (req,res,next)=>{
    console.log(req.body)
    var _pin = req.body.pin;
    var _mobile = req.body.mobile;
    var _loastart = req.body.loastart;
    var _loaend = req.body.loaend;
    var newRegister = new XCorona({
        _id: new mongoose.Types.ObjectId(),
        pin : _pin,
        mobile: _mobile,
        otp: "",
        otpexpiry: "",
        loastart: _loastart,
        loaend: _loaend,
	expiry: "false"
    })
    register_firsttime_bypin(newRegister).then(function(result){
        res.status(200).json({
            message: result
        })
    }).catch((err)=>{
        console.log("eerrrr", err)
        res.status(500).json({
            error: err
        })
    })
}

// updateDeviceType("47YN12EY", "ios").then(function(result){
//     console.log(result)
// }).catch(function(err){
//     console.log("eeeees", err)
// })
exports.REQUEST_OTP2 = (req,res,next)=>{
    var _pin = req.body.pin;
    var _mobile = req.body.mobile;
    var _otp = "";
    console.log("REQUEST_OTP2", req.body)
    var newOptResult = {
        result: true,
        pin: "",
        mobile: "",
        otp: "",
    }
    userExist_MobileAndPin(_pin, _mobile).then(function(result1){
        return request_otp();
    }).then((result)=>{
        _otp = result;
        console.log("fsadfadsfadsfdsfasdfasdfdsf", _otp)
        return updateNewOTP(_pin, _otp)
    }).then((result3)=>{
        // return res.status(200).json({
        //     message: result3
        // })
         console.log("safdasfsdfsdf",result3)
        if(result3){
            newOptResult.pin = result3.pin
            newOptResult.mobile = result3.mobile
            newOptResult.otp = result3.otp
            console.log("newOtpResult::", newOptResult)
            return send_sms(req,res, _otp,newOptResult)
        }
    }).catch(function(err){
        winston.error(err)
        res.status(404).json({
            error: err
        })
    })
}

exports.VERIFY_OTP = (req,res,next)=>{
    var _mobile = req.body.mobile;
    var _pin = req.body.pin;
    var _otp = req.body.otp;


    if(_mobile == "6599999999") {
        if(_otp == "896745"){
            return res.status(200).json({
                message: {
                    status: 1,
                    desc: "success",
                }
            })
        } else {
            return res.status(500).json({
                error: {
                    status: 2,
                    desc: "incorrectotp",
                }
            })
        }

    }
    console.log("dfsf", _pin, _otp)
    verify_otp(_pin, _otp).then(function(result){
        res.status(200).json({
            message: result
        })
    }).catch(function(err){
        winston.error("VERIFY_OTP:",err)
        res.status(500).json({
            error: err
        })
    })
}


exports.GEN_JWT = (req,res,next)=>{
    // var _token = req.headers.authorization;
    var _pin = req.body.pin;
    const _token = jwt.sign({
        pin:_pin
    },
        CONFIG.JWT_SECRET,
        {
            expiresIn: "24h"
        },
    )
    var refresh_token = jwt.sign({
        pin:_pin
    }, CONFIG.JWT_REFRESHTOKEN_SECRET)
    var updateResults =  update_Refresh_TokenInDB(refresh_token);
    res.status(200).json({
        message: "success",
        token : _token,
        refreshToken: refresh_token
    }) 
}

exports.DELETE_REFRESH_TOKEN = async(req, res) => {
    // refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    // delete refreshToken in mongoDB
    var deleteResult = await delete_Refresh_Tokens_InDB(req.body.refreshToken)
    res.sendStatus(204)
}
  

exports.REFRESH_TOKEN = async(req,res) =>{
    const refreshToken = req.body.refreshToken
    if (refreshToken == null) return res.sendStatus(401)
    // if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    RefreshTokens.findOne({token:refreshToken}).then(function(result){
      if(result == null){
        return res.status(403).json({
          error: "Invalid token"
        })
      } else {
        jwt.verify(refreshToken, CONFIG.JWT_REFRESHTOKEN_SECRET, (err, user) => {
          if (err) return res.sendStatus(403)
          const accessToken = generateAccessToken({pin:user.pin})
          res.json({ accessToken: accessToken })
        })
      }
    })
}
const update_Refresh_TokenInDB = function(_refreshToken){
    return new Promise((resolve,reject)=>{
      var newToken = new RefreshTokens({
        _id: new mongoose.Types.ObjectId(),
        token: _refreshToken
      })
      newToken.save().then(function(result){
        resolve(result)
      }).catch(function(err){
        reject(err)
      })
    })
  }
  
  const delete_Refresh_Tokens_InDB = function(_refreshToken){
    return new Promise((resolve,reject)=>{
      RefreshTokens.findOneAndRemove({token: _refreshToken})
      .then(function(result){
        resolve(result)
      }).catch(function(err){
        reject(err)
      })
    })
  }


  function generateAccessToken(user) {
    return jwt.sign(user, CONFIG.JWT_SECRET, { expiresIn: '70s' })
  }


exports.JWT_TESTING = (req,res,next)=>{
    var _token = req.headers.authorization;
    var _pin = req.body.pin;
    res.status(200).json({
        message: "TokenMatches",
        token: _token
    }) 
}


exports.SET_BIO_CONFIG = (req,res,next)=>{
    var _morStart = req.body.morStart;
    var _morEnd = req.body.morEnd;
    var _aftStart = req.body.aftStart;
    var _aftEnd = req.body.aftEnd;
    var _eveStart = req.body.eveStart;
    var _eveEnd = req.body.eveEnd;

    var _timings = {
        morStart: _morStart,
        morEnd: _morEnd,
        aftStart: _aftStart,
        aftEnd: _aftEnd,
        eveStart: _eveStart,
        eveEnd: _eveEnd
    }

    Bioconfig.findOneAndUpdate(
        {name: "bioconfig"},
        {
            $set: {
                today : moment().format("DD-MM_YYYY:HH:mm:ss"),
                timings: _timings
            }
        },{upsert:true, new:true}
    ).then(function(result){
        return res.status(200).json({
            message: {
                result: result
            }
        })
    }).catch(function(err){
        console.log(err)
        return res.status(500).json({
            error: "UnableToSaveTheConfigToDatabase"
        })
    })
}

exports.GET_BIO_CONFIG = (req,res,next)=>{
    Bioconfig.find().then(function(result){
        return res.status(200).json({
            message: {
                result: result
            }
        })
    }).catch(function(err){
        return res.status(500).json({
            error: {
                error: "UnableToGetTheBioConfiguration"
            }
        })
    })
}



exports.GET_BIO_TIMER = (req,res,next)=>{
    var _date = req.params.date;
    console.log("Biotimer", _date)
    Biotimer.find({today: _date}).then(function(result){
        return res.status(200).json({
            message: {
                result: result
            }
        })
    }).catch(function(err){
        return res.status(500).json({
            error: {
                error: "UnableToGetBioTimerSchedulePleaseUseOneDayEarlierinFormat",
                format: "DD-MM-YYYY"
            }
        })
    })
}


exports.GET_JAIN = (req,res,next)=>{
    console.log("HIjain", req.query.name)
    res.status(200).json({
        message: "DifferenceBetweenQueryAndParams",
        query: req.query.name,
        params: req.params.id
    })
}


exports.GENERATE_PINS_MAX20_ORGID = (req,res,next)=>{
    var totalPinsToGenerate = req.params.quantity;
    var _orgid = req.params.orgid;
    _orgid = _orgid.toUpperCase();
    console.log("peooedsds", _orgid)
    if(_orgid == "" || _orgid == null || _orgid == undefined){
        return res.status(500).json({
            error: `Organization ID is required`
        })
    }

    console.log("genpinsQuantity:", totalPinsToGenerate)
    if(totalPinsToGenerate > 20){
        return res.status(200).json({
            message: "Pin generation should be less than or equal to 20 max"
        })
    }


    maxTwentyPinsToGenerate_orgid(totalPinsToGenerate, _orgid)
    .then(function(result){
        return res.status(200).json({
            message: result
        })
    }).catch(function(err){
        return res.status(500).json({
            error: "UnableToGeneratePins"
        })
    })
}


const maxTwentyPinsToGenerate_orgid = async (value, _orgid) => {
    var result = false;
    console.log("vae", value, _orgid)
    var pinsArray = [];
    for(var i=0;i < value; i++) {
        console.log(i)
        var newpin = await singlePinGeneration_and_save_to_mongoDB_orgid(_orgid)
        pinsArray.push(newpin)
        // pinsArray.push(i)
    }
    console.log("pinsArray::", pinsArray)
    return (pinsArray);
  }

  const singlePinGeneration_and_save_to_mongoDB_orgid = function(_orgid){
    return new Promise((resolve,reject)=>{
        var _pin = "";
	var _wellness = "true";
	var _showtemperature = "true";
	if(_orgid == 'ICA'){
		_wellness = "false";
		_showtemperature= "false";
	}
        var _timestamp = Date.now();
        var otpSinglePin = new XCorona({
            _id: new mongoose.Types.ObjectId(),
            pin: "",
            orgid: _orgid,
            timestamp: _timestamp,
            issuspended: "false",
	    maxdist: 100,
            mindist: 0,
	    maxalt: 280,
	    minalt: -20,
	    maxvltn: 6,
            updfreq: 10,
	    wellness: _wellness,
	    showtemperature: _showtemperature
        })
        generate_pin__but_checkifexist()
        .then(function(result){
            console.log("generatePin::", result, result.length)
            _pin = result
            otpSinglePin.pin = _pin
            //otpSinglePin.save();
            //resolve(_pin)
            resolve(otpSinglePin.save())
        }).catch(function(err){
            console.log("errrrrrrr::", err)
            reject("unable to generate pin")
        })
    })
}

//generate pin first and then check
//check pin if it exists
// if doesnt exists
//create pin in OTP schema first, not in XCorona Schema
//after create pin
//create endppint to register these pins
//for that you need mobile/loastart/loaend date from Oliver
//after that trigger the endpoint to register those pins
// save the info in OTP and then save the info in XCorona model
// const checkPinExist =
exports.GENERATE_PINS_MAX20 = (req,res,next)=>{
    var totalPinsToGenerate = req.params.quantity;
    console.log("genpinsQuantity:", totalPinsToGenerate)
    if(totalPinsToGenerate > 20){
        return res.status(200).json({
            message: "Pin generation should be less than or equal to 20 max"
        })
    }
    maxTwentyPinsToGenerate(totalPinsToGenerate)
    .then(function(result){
        return res.status(200).json({
            message: result
        })
    }).catch(function(err){
        return res.status(500).json({
            error: "UnableToGeneratePins"
        })
    })

    // console.log("jijjojo")
    // res.status(200).json({
    //     message: "hi"
    // })
}

exports.CREATE_USER_MOBILE_PIN = (req,res,next)=>{
    var _pin = req.body.pin
    var _mobile = req.body.pin
    var _pin = req.body.pin
    var createPinSchema = new XCorona({
        _id: new mongoose.Types.ObjectId(),
        pin: _pin,
        mobile: _mobile
    })
    user_exist(_pin).then(function(result){
        if(result){
            return result
        } else {
            return createPinSchema.save()
        }
    }).then(function(result2){
        if(result2 == "UserExist"){
            return res.status(200).json({
                message: "UserExist"
            })
        } else {
            return res.status(200).json({
                message: result2
            })
        }
    }).catch(function(err){
        winston.error(err)
        res.status(500).json({
            err0r: err
        })
    })
}

exports.CREATE_USER_BYPIN = (req,res,next)=>{
    console.log("afdasfadsfsdfsd",req.body.pin)
    var _pin = req.body.pin
    var createPinSchema = new XCorona({
        _id: new mongoose.Types.ObjectId(),
        pin: _pin,
    })
    user_exist(_pin).then(function(result){
        if(result){
            return result
        } else {
            return createPinSchema.save()
        }
    }).then(function(result2){
        if(result2 == "UserExist"){
            return res.status(200).json({
                message: "UserExist"
            })
        } else {
            return res.status(200).json({
                message: result2
            })
        }
    }).catch(function(err){
        winston.error(err)
        res.status(500).json({
            err0r: err
        })
    })
}


exports.VERIFY_USER_BY_PIN_MOBILE = (req,res,next)=>{
    var _pin = req.body.pin;
    var _mobile = req.body.mobile;
    userExist_MobileAndPin(_pin,_mobile)
    .then(function(result){
        res.status(200).json({
            message: result
        })
    })
    .catch(function(err){
        winston.error(err)
        res.status(500).json({
            error: err
        })
    })

}

exports.REQUEST_PIN = (req,res,next)=>{
    var _mobile = req.body.mobile;
    var _loastart = req.body.loastart;
    var _loaend = req.body.loaend;
    var _timestamp = Date.now();
    var finalResult = "";
    var _pin = ""
    // var newRegister = new OTP({
    //     _id: new mongoose.Types.ObjectId(),
    //     pin : "",
    //     mobile: _mobile,
    //     otp: "",
    //     ts: _timestamp,
    //     otpexpiry: "",
    //     loastart: _loastart,
    //     loaend: _loaend
    // })
    var _hrloastart = moment(req.body.loastart, "DD/MM/YYYY").valueOf().toString();
    var _hrloaend = moment(req.body.loaend, "DD/MM/YYYY").valueOf().toString();
    const coronaData = new XCorona({
        _id: new mongoose.Types.ObjectId(),
        pin: "",
        mobile: _mobile,
        pcode: "",
        loastart: _loastart,
        loaend: _loaend,
        hrloastart: _hrloastart,
        hrloaend: _hrloaend,
        devicetype: "",
        expiry: "false",
        // trk: _trk,
        timestamp: _timestamp,
        token: ""
        // initlat: _initlat,
        // initlng: _initlng
    });
    check_mobile_exist(_mobile)
    .then((result1)=>{
        console.log("DFSDFSDFSDFSDFSDFSDFSDF", result1)
        if(!result1){
            console.log("fa;se called", result1)
           return  generate_pin__but_checkifexist() 
        } else {
            throw new Error("MobileExist")
        }
    }).then((result2)=>{
        _pin = result2
        return _pin
    }).then((result4)=>{
        // finalResult = result4
        coronaData.pin = _pin
        return coronaData.save()
    }).then((result5)=>{
        res.status(200).json({
            message: result5
        })
    }).catch((err)=>{
        if(err.message =="MobileExist"){
            return res.status(500).json({
                error:"MobileAlreadyExist"
            })
        } else {
            res.status(500).json({
                error:err
            })
        }

    })
    // generate_pin__but_checkifexist()
    // .then((result)=>{
    //     return newRegister.pin = result
    // }).then((result2)=>{
    //     if(result2){
    //         return newRegister.save()
    //     }
    // }).then((result3)=>{
    //     res.status(200).json({
    //         message: result3
    //     })
    // }).catch((err)=>{
    //     res.status(500).json({
    //         error: err
    //     })
    // })

}


exports.GETALL_DATA = (req,res,next)=>{
    XCorona.find().then(function(result){
        res.status(200).json({
            results: result
        })
    }).catch(function(err){
        winston.error(err)
        res.status(500).json({
            message: err
        })
    })
}

exports.GETALLDATA_BY_PIN = (req,res,next)=>{
    var _pin = req.params.pin
    XCorona.find({pin: _pin}).then(function(result){
        res.status(200).json({
            results: result
        })
    }).catch(function(err){
        winston.error(err)
        res.status(500).json({
            message: err
        })
    })
}

exports.dum = (req,res,next)=>{
    var _pin = req.body.pin;
    var _mobile = req.body.mobile
    check_if_pin_exist_and_check_mobile(_pin,_mobile).then(function(result1){
        console.log("DDD", result1)
        if(!result1){
            console.log("usenotexit", result1)
        } else {
            if(result1.mobTrueFalse){
                console.log(result1)
            } else {
                console.log("fadsfsdf",result1)
            }
        }
    }) .catch(function(err){
        console.log(err)
        res.status(200).json({
            error: err
        })
    })
}

const maxTwentyPinsToGenerate = async value => {
    var result = false;
    console.log("vae", value)
    var pinsArray = [];
    for(var i=0;i < value; i++) {
        console.log(i)
        var newpin = await singlePinGeneration_and_save_to_mongoDB()
        pinsArray.push(newpin)
        // pinsArray.push(i)
    }
    console.log("pinsArray::", pinsArray)
    return (pinsArray);
  }


const singlePinGeneration_and_save_to_mongoDB = function(){
    return new Promise((resolve,reject)=>{
        var _pin = "";
        var _timestamp = Date.now();
        var otpSinglePin = new XCorona({
            _id: new mongoose.Types.ObjectId(),
            pin: "",
            timestamp: _timestamp
        })
        generate_pin__but_checkifexist()
        .then(function(result){
            console.log("generatePin::", result, result.length)
            _pin = result
            otpSinglePin.pin = _pin
            otpSinglePin.save();
            resolve(_pin)
        }).catch(function(err){
            console.log("errrrrrrr::", err)
            reject("unable to generate pin")
        })
    })
}





exports.USER_EXIST = (req,res,next)=>{
    var pin = req.body.pin;
    user_exist(pin).then(function(result){
        res.status(200).json({
            message: result
        })
    }).catch(function(err){
        winston.error(err)
        res.status(500).json({
            err0r: err
        })
    })
}







const register_firsttime_bypin = function(newRegister){
    return new Promise((resolve,reject)=>{
        XCorona.find({pin:newRegister.pin})
        .then(function(result){
            if(result.length >=1){
                reject({
                    status: 1,
                    desc: `${newRegister.pin}, : exists`
                })
            } else {
                return false;
            }
        }).then(function(result2){
            if(result2 == false){
                resolve(newRegister.save())
            }
        }).catch((err)=>{
            reject("UnableToFindPinMongoDBOTP")
        })
    })
}


// exports.LOGIN = (req,res,next)=>{
    
// }

// exports.LOGIN = (req,res,next)=>{
//     var _pin = req.body.pin;
//     var _mobile = req.body.mobile;

//     userExist_MobileAndPin(_pin, _mobile).then(function(result1){
//         if(result1){
//             console.log("result1:", result1)
//             return checkExpiry(result1)
//         }
//     }).then(function(result2){
//         if(result2) { // if true then only generate otp.
//             console.log("sdfsfsdfasdfasdfasdfasdfasdfadsfsd", result2)
//             // return request_otp()
//             res.status(200).json({
//                 status: 1,
//                 desc: "proceed"
//             })
//         } 
//     }).catch(function(err){
//         winston.error(err)
//         res.status(404).json({
//             error: err
//         })
//     })
// }



// const updateDeviceType = function(_pin,_devicetype){
//     return new Promise(function(resolve,reject){
//         XCorona.findOneAndUpdate({pin: _pin},{$set:{devicetype:_devicetype}}, {new:true})
//         .then(function(result1){
//             console.log("UpdateDeviceType:--", result1)
//             if(result1 == null) {
//                 throw new Error("DeviceUpdateFailed")
//             } else {
//                 return(true)
//             }
//         }).then(function(result2){
//             XCorona.findOneAndUpdate(
//                 {pin: _pin},
//                 {
//                     $set: {devicetype: _devicetype},
//                 }, {new: true}
//             ).then(function(resultams){
//                 resolve(resultams)
//             }).catch(function(err){
//                 reject("unabletoupdatedevicetype")
//             })
//         }).catch(function(err){
//             winston.error("UpdateDeviceType:"+ err)
//             if(err.message == "DeviceUpdateFailed"){
//                 console.log("UpdateDeviceType", err)
//                 reject(err.message)
//             } else {
//                 reject("unableDeviceUpdateFailed")
//             }
//         })
//     })
// }

const updateDeviceType = function(newRegister2){
    return new Promise(function(resolve,reject){
        XCorona.findOneAndUpdate({pin: newRegister2.pin},
            {$set:{
                devicetype:newRegister2.devicetype,
                lang: newRegister2.lang,
                make: newRegister2.make,
                model: newRegister2.model,
                osver: newRegister2.osver
            }}, 
            {new:true})
        .then(function(result1){
            console.log("UpdateDeviceType:--")
            if(result1 == null) {
                throw new Error("DeviceUpdateFailed")
            } else {
                resolve(true)
            }
        }).catch(function(err){
            winston.error("UpdateDeviceType:"+ err)
            if(err.message == "DeviceUpdateFailed"){
                console.log("UpdateDeviceType", err)
                reject(err.message)
            } else {
                reject("unableDeviceUpdateFailed")
            }
        })
    })
}
const updateDeviceType_1stApril = function(_pin,_devicetype){
    return new Promise(function(resolve,reject){
        XCorona.findOneAndUpdate({pin: _pin},{$set:{devicetype:_devicetype}}, {new:true})
        .then(function(result1){
            console.log("UpdateDeviceType:--", result1.pin)
            if(result1 == null) {
                throw new Error("DeviceUpdateFailed")
            } else {
                resolve(true)
            }
        }).catch(function(err){
            winston.error("UpdateDeviceType:"+ err)
            if(err.message == "DeviceUpdateFailed"){
                console.log("UpdateDeviceType", err)
                reject(err.message)
            } else {
                reject("unableDeviceUpdateFailed")
            }
        })
    })
}



// const checkExpiry = function(result){
//     return new Promise((resolve,reject)=>{
//         var currentDate = moment(Date.now()).tz('Asia/Singapore').format('DD/MM/YYYY')
//         console.log("CheckExpiry:: ", result[0].loaend == currentDate, result[0].loaend, currentDate)
//         if(result[0].loaend < currentDate){
//             reject({
//                 status: 3,
//                 desc: "expired"
//             })
//         } else {
//             resolve(true)
//         }
//     })
// }
const notinuse_checkExpiry = function(result){
    return new Promise((resolve,reject)=>{
        var currentDate = moment(Date.now()).tz('Asia/Singapore').format('DD/MM/YYYY')
        console.log("CheckExpiry::FromOTPRoutes ", result[0].loaend == currentDate, result[0].loaend, currentDate)

        var expiry = result[0].loaend
        var expiryepoch = moment(expiry, "DD/MM/YYYY").valueOf();
        expiryepoch += 28800; // +08hrs
        var now = Date.now();
        if (now >= expiryepoch) {
            //YES, SMALLER
            console.log("expired::FromOTPRoutes", now, expiryepoch, expiry)
            // reject({
            //     status: 3,
            //     desc: "expired",
            //     loaend: result[0].loaend,
            //     isbiometric: result[0].isbiometric,
            //     issuspended: result[0].issuspended,
            //     expiry: result[0].expiry
            // })
            set_pin_to_expiry_true(result[0].pin).then(function(result){
                console.log("set_pin_to_expiry_true: succesfull")
                reject({
                    status: 3,
                    desc: "expired",
                    loaend: result[0].loaend,
                    isbiometric: result[0].isbiometric,
                    issuspended: result[0].issuspended,
                    expiry: result[0].expiry
                })
            }).catch(function(err){
                console.log("SettingPinTo true is not sucesfful")
                reject({
                    status: 3,
                    desc: "expired",
                    loaend: result[0].loaend,
                    isbiometric: result[0].isbiometric,
                    issuspended: result[0].issuspended,
                    expiry: result[0].expiry
                })
            })
        } else {
            //NOPE
            console.log("not expired::FromOTPRoutes:",now, expiryepoch ,expiry)
            resolve(true)
        }
    })
}

const checkExpiry = async function(result){
    return new Promise(async(resolve,reject)=>{
        var currentDate = moment(Date.now()).tz('Asia/Singapore').format('DD/MM/YYYY')
        console.log("CheckExpiry::FromOTPRoutes ", result[0].loaend == currentDate, result[0].loaend, currentDate)

        var expiry = result[0].loaend
        var expiryepoch = moment(expiry, "DD/MM/YYYY").valueOf();
        expiryepoch += 28800; // +08hrs
        var now = Date.now();
        if (now >= expiryepoch) {
            //YES, SMALLER
            console.log("expired::FromOTPRoutes", now, expiryepoch, expiry)
            // reject({
            //     status: 3,
            //     desc: "expired",
            //     loaend: result[0].loaend,
            //     isbiometric: result[0].isbiometric,
            //     issuspended: result[0].issuspended,
            //     expiry: result[0].expiry
            // })
            var setexpiryawait = await set_pin_to_expiry_true(result[0].pin).then(function(resultfromsetexpiry){
                if(resultfromsetexpiry != "null") {
                    console.log("resultis not equal to null", resultfromsetexpiry.expiry)
                    reject({
                        status: 3,
                        desc: "expired",
                        loaend: result[0].loaend,
                        isbiometric: result[0].isbiometric,
                        issuspended: result[0].issuspended,
                        expiry: resultfromsetexpiry.expiry,
                        showtemperature: resultfromsetexpiry.showtemperature
                    })
                } else {
                    console.log("resultis not equal to else called", result)
                    reject({
                        status: 3,
                        desc: "expired",
                        loaend: result[0].loaend,
                        isbiometric: result[0].isbiometric,
                        issuspended: result[0].issuspended,
                        expiry: result[0].expiry,
                        showtemperature: result[0].showtemperature
                    })
                }
            }).catch(function(err){
                console.log("resultis not equal to else catcgh caled", err)
                reject({
                    status: 3,
                    desc: "expired",
                    loaend: result[0].loaend,
                    isbiometric: result[0].isbiometric,
                    issuspended: result[0].issuspended,
                    expiry: result[0].expiry,
		    showtemperature: result[0].showtemperature
                })
            })

            // set_pin_to_expiry_true(result[0].pin).then(function(result){
            //     console.log("set_pin_to_expiry_true: succesfull")
            //     reject({
            //         status: 3,
            //         desc: "expired",
            //         loaend: result[0].loaend,
            //         isbiometric: result[0].isbiometric,
            //         issuspended: result[0].issuspended,
            //         expiry: result[0].expiry
            //     })
            // }).catch(function(err){
            //     console.log("SettingPinTo true is not sucesfful")
            //     reject({
            //         status: 3,
            //         desc: "expired",
            //         loaend: result[0].loaend,
            //         isbiometric: result[0].isbiometric,
            //         issuspended: result[0].issuspended,
            //         expiry: result[0].expiry
            //     })
            // })
        } else {
            //NOPE
            console.log("not expired::FromOTPRoutes:",now, expiryepoch ,expiry)
            resolve(true)
        }
    })
}
const checkExpiry_1STAPRIL = async function(result){
    return new Promise(async(resolve,reject)=>{
        var currentDate = moment(Date.now()).tz('Asia/Singapore').format('DD/MM/YYYY')
        console.log("CheckExpiry::FromOTPRoutes ", result[0].loaend == currentDate, result[0].loaend, currentDate)

        var expiry = result[0].loaend
        var expiryepoch = moment(expiry, "DD/MM/YYYY").valueOf();
        expiryepoch += 28800; // +08hrs
        var now = Date.now();
        if (now >= expiryepoch) {
            //YES, SMALLER
            console.log("expired::FromOTPRoutes", now, expiryepoch, expiry)
            // reject({
            //     status: 3,
            //     desc: "expired",
            //     loaend: result[0].loaend,
            //     isbiometric: result[0].isbiometric,
            //     issuspended: result[0].issuspended,
            //     expiry: result[0].expiry
            // })
            var setexpiryawait = await set_pin_to_expiry_true(result[0].pin).then(function(resultfromsetexpiry){
                if(resultfromsetexpiry != "null") {
                    console.log("resultis not equal to null", resultfromsetexpiry.expiry)
                    reject({
                        status: 3,
                        desc: "expired",
                        loaend: result[0].loaend,
                        isbiometric: result[0].isbiometric,
                        issuspended: result[0].issuspended,
                        expiry: resultfromsetexpiry.expiry
                    })
                } else {
                    console.log("resultis not equal to else called", result)
                    reject({
                        status: 3,
                        desc: "expired",
                        loaend: result[0].loaend,
                        isbiometric: result[0].isbiometric,
                        issuspended: result[0].issuspended,
                        expiry: result[0].expiry
                    })
                }
            }).catch(function(err){
                console.log("resultis not equal to else catcgh caled", err)

                reject({
                    status: 3,
                    desc: "expired",
                    loaend: result[0].loaend,
                    isbiometric: result[0].isbiometric,
                    issuspended: result[0].issuspended,
                    expiry: result[0].expiry
                })
            })

            // set_pin_to_expiry_true(result[0].pin).then(function(result){
            //     console.log("set_pin_to_expiry_true: succesfull")
            //     reject({
            //         status: 3,
            //         desc: "expired",
            //         loaend: result[0].loaend,
            //         isbiometric: result[0].isbiometric,
            //         issuspended: result[0].issuspended,
            //         expiry: result[0].expiry
            //     })
            // }).catch(function(err){
            //     console.log("SettingPinTo true is not sucesfful")
            //     reject({
            //         status: 3,
            //         desc: "expired",
            //         loaend: result[0].loaend,
            //         isbiometric: result[0].isbiometric,
            //         issuspended: result[0].issuspended,
            //         expiry: result[0].expiry
            //     })
            // })
        } else {
            //NOPE
            console.log("not expired::FromOTPRoutes:",now, expiryepoch ,expiry)
            resolve(true)
        }
    })
}

const set_pin_to_expiry_true = async function(_pin){
    return new Promise((resolve,reject)=>{
        XCorona.findOneAndUpdate(
            {pin:_pin},
            {
                $set: { "expiry" : true } ,
            },{new:true}
        ).then(function(result){
            console.log("PinUpdateToExpiryTrueIsSuccesfull ", _pin)
            resolve(result)
        }).catch(function(error){
            console.log("set_pin_to_expiry_true:", err)
            // resolve(true)
            reject("SomeErrorSettingPinExpiryTrue")
        })
    })
}
const _notinuse_set_pin_to_expiry_true = function(_pin){
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
            // resolve(true)
            reject("SomeErrorSettingPinExpiryTrue")
        })
    })
}

const asdfsfsdnotinuse_checkExpiry = function(result){
    return new Promise((resolve,reject)=>{
        var currentDate = moment(Date.now()).tz('Asia/Singapore').format('DD/MM/YYYY')
        console.log("CheckExpiry::FromOTPRoutes ", result[0].loaend == currentDate, result[0].loaend, currentDate)

        var expiry = result[0].loaend
        var expiryepoch = moment(expiry, "DD/MM/YYYY").valueOf();
        expiryepoch += 28800; // +08hrs
        var now = Date.now();
        if (now >= expiryepoch) {
            //YES, SMALLER
            console.log("expired::FromOTPRoutes", now, expiryepoch)
            reject({
                status: 3,
                desc: "expired",
		loaend: result[0].loaend,
		isbiometric: result[0].isbiometric
            })
        } else {
            //NOPE
            console.log("not expired::FromOTPRoutes:",now, expiryepoch )
            resolve(true)
        }
    })
}


// const findExpiryComparison = function(_pin){
//     return new Promise((resolve,reject)=>{
//         OTP.find({pin:_pin})
//         .then((resolt)=>{
//             return resolt
//         })
//         .then((result2)=>{
//             var currentDate = moment(Date.now()).tz('Asia/Singapore').format('DD/MM/YYYY')
//             console.log(date)
//             if(result2[0].loaend == currentDate) {
//                 reject({
//                     status: 2,
//                     desc: "expired end date"
//                 })
//             } else {
//                 resolve(true)
//             }
//         }).catch((err)=>{
//             reject(err)
//         })
//     })
// }
// exports.REQUEST_OTP = (req,res,next)=>{
//     var _mobile = req.body.mobile
//     var _pin = req.body.pin
//     var newOptResult = {
//         result: true,
//         pin: "",
//         mobile: "",
//         otp: "",
//     }
//     var _otp = "";
//     var otpSchema = new OTP({
//         _id: new mongoose.Types.ObjectId(),
//         mobile : _mobile,
//         pin: _pin,
//         otp: ""
//     })
//     userExist_MobileAndPin(_pin, _mobile).then(function(result1){
//         if(result1){
//             console.log("result1:", result1)
//             return request_otp();
//         } else {
//             throw new Error("UserDonotExist");
//         }
//     }).then(function(result2){
//         console.log("---------==========>", result2)
//         _otp = result2;
//         // otpSchema.otp = result2;
//         return updateNewOTP(_pin, _otp)
//         // console.log("00=========>2", _otp )
//     }).then(function(result3){
//         if(result3){
//             newOptResult.pin = result3.pin
//             newOptResult.mobile = result3.mobile
//             newOptResult.otp = result3.otp
//             console.log("newOtpResult::", newOptResult)
//             return send_sms(req,res, _otp,newOptResult)
//             // res.status(200).json({
//             //     message: result3
//             // })
//         }
//     }).catch(function(err){
//         if(err.message == "UserDonotExist"){
//             winston.error(err)
//             console.log("catch err.message:::::",err.message)
//             return res.status(404).json({
//                 message: "UserDonotExist"
//             })
//         } 
//         winston.error(err)
//         res.status(500).json({
//             error: err
//         })
//     })
// }


const updateNewOTP = function(_pin,_otp){
    return new Promise(function(resolve,reject){
        XCorona.findOneAndUpdate({pin: _pin},{$set:{otp:_otp, otptimestamp: Date.now()}}, {new:true})
        .then(function(result1){
            console.log("UpdateNewOTP:", result1)
            resolve(true)
        }).catch(function(err){
            winston.error("updateNewOTP:", err)
            console.log("UpdateNewOTpcatch", err)
            reject(err)
        })
    })
}

// exports.REQUEST_OTP2 = (req,res,next)=>{
//     var _mobile = req.body.mobile
//     var _pin = req.body.pin
//     var _otp = "";
//     console.log("REQUEST_OTP::", req.body)
//     var otpSchema = new OTP({
//         _id: new mongoose.Types.ObjectId(),
//         mobile : _mobile,
//         pin: _pin,
//         otp: _otp
//     })
//     // req.body.message = `Your SMS OTP is ${req.bod}`;
//     // req.body.subject = "LocRep"
//     // return;
//     var result2 = "";
//     request_otp().then(function(result){
//         otpSchema.otp = result;
//         _otp = result
//         return otpSchema.save();
//     }).then(function(result){
//         console.log("request_otp:::::",result)
//         result2 = result
//         return send_sms(req,res, _otp)
//     }).then(function(result3){
//         console.log("result3 sending sms:::", result3)
//         res.status(200).json({
//             message: "success",
//             results: {
//                 mobile: result2.mobile,
//                 pin: result2.pin,
//                 // otp: result2.otp
//             }
//         })
//     }).catch(function(err){
//         res.status(500).json({
//             error: err
//         })
//     })
// }

// exports.REQUEST_OTP = (req,res,next)=>{
//     var _mobile = req.body.mobile
//     var _pin = req.body.pin
//     var _otp = "";
//     console.log("REQUEST_OTP::", req.body)
//     var otpSchema = new OTP({
//         _id: new mongoose.Types.ObjectId(),
//         mobile : _mobile,
//         pin: _pin,
//         otp: _otp
//     })
//     // req.body.message = `Your SMS OTP is ${req.bod}`;
//     // req.body.subject = "LocRep"
//     // return;
//     var result2 = "";
//     request_otp().then(function(result){
//         otpSchema.otp = result;
//         _otp = result
//         return otpSchema.save();
//     }).then(function(result){
//         console.log("request_otp:::::",result)
//         result2 = result
//         return send_sms(req,res, _otp)
//     }).then(function(result3){
//         console.log("result3 sending sms:::", result3)
//         res.status(200).json({
//             message: "success",
//             results: {
//                 mobile: result2.mobile,
//                 pin: result2.pin,
//                 // otp: result2.otp
//             }
//         })
//     }).catch(function(err){
//         res.status(500).json({
//             error: err
//         })
//     })
// }

const send_PIN_sms = function(req,res,_pin) {
    req.body.message = `Your PIN is ${_pin}`;
    req.body.subject = "LocRep"
    // req.body.newotp = newOptResult
    return sendSMS.SEND_SMS(req,res)
}

const send_sms = function(req,res,otp,newOptResult) {
    try{
        req.body.message = `Your SMS OTP is ${otp}`;
        req.body.subject = "LocRep"
        req.body.newotp = newOptResult
        return sendSMS.SEND_SMS(req,res)
    } catch(err){
        console.log("SEND_SMS_ERROR::", err)
    }
    
}

// const send_sms2 = function(req, otp){    
//     return new Promise(function(resolve,reject){
//         req.body.message = `Your SMS OTP is ${req.bod}`;
//         req.body.subject = "LocRep"
//         sendSMS.SEND_SMS(req).then(function(result){
//             console.log("sendingSMS:::", result)
//             resolve(result)
//         }).catch(function(err){
//             console.log("sendingSMS:::", err)
//             reject(err)
//         })
//     })   
// }



const verify_otp = function(_pin, _otp){
    return new Promise(function(resolve,reject){
        // OTP.findOne({mobile: {$eq:_mobile}},{otp:{$eq:_otp}})
        XCorona.find()
        .where('pin', _pin)
        .where('otp', _otp)
        .then(function(result){
            if(result.length >= 1){
                console.log("verify_otp:::::", _pin)
                // resolve(true)
                resolve({
                    status: 1,
                    desc: "success"
                })
            } else {
                console.log("verify_otp:::::", result)
                reject({
                    status: 2,
                    desc: "incorrect otp"
                })
            }
        }).catch(function(err){
            console.log("verify_otp:::::", err)
            reject(err)
        })
    })
}

const userExist_MobileAndPin = function(_pin, _mobile){
    return new Promise(function(resolve,reject){
        // OTP.findOne({mobile: {$eq:_mobile}},{otp:{$eq:_otp}})
        XCorona.find()
        .where('mobile', _mobile)
        .where('pin', _pin)
        .then(function(result){
            if(result.length >= 1){
                console.log("verify_otp:::::", result.length)
                resolve(result)
            } else {
                console.log("verify_otp:::::", result.length)
                // resolve(false)
                reject({
                    status: 2,
                    desc: "invalid pin"
                })
            }
        }).catch(function(err){
            console.log("verify_otp:::::", err)
            reject(err)
        })
    })
}

const request_otp = function(){
    return new Promise(function(resolve,reject){
        var digits = '0123456789';
        var otpLength = 6;
        var otp = '';
        try {
            for(let i=1; i<=otpLength; i++){
                var index = Math.floor(Math.random()*(digits.length));
                otp = otp + digits[index];
            }
            console.log("request_otp", otp)
            resolve(otp)
        } catch(err){
            console.log("request_otp", err)
            reject(err)
        }
    })
}




exports.REQUEST_PIN_2 = (req,res,next)=>{
    var _mobile = req.body.mobile;
    var _loastart = req.body.loastart;
    var _loaend = req.body.loaend;

    var newRegister = new XCorona({
        _id: new mongoose.Types.ObjectId(),
        pin : "",
        mobile: _mobile,
        otp: "",
        otpexpiry: "",
        loastart: _loastart,
        loaend: _loaend
    })
    check_mobile_exist(_mobile)
    .then((result1)=>{
        console.log("DFSDFSDFSDFSDFSDFSDFSDF", result1)
        if(!result1){
            console.log("fa;se called", result1)
           return  generate_pin__but_checkifexist() 
        } else {
            throw new Error("MobileExist")
        }
    }).then((result2)=>{
        return newRegister.pin = result2
    }).then((result3)=>{
        return newRegister.save()
    }).then((result4)=>{
        res.status(200).json({
            message: result4
        })
    }).catch((err)=>{
        if(err.message =="MobileExist"){
            return res.status(500).json({
                error:"MobileAlreadyExist"
            })
        } else {
            res.status(500).json({
                error:err
            })
        }
        
    })
    // generate_pin__but_checkifexist()
    // .then((result)=>{
    //     return newRegister.pin = result
    // }).then((result2)=>{
    //     if(result2){
    //         return newRegister.save()
    //     }
    // }).then((result3)=>{
    //     res.status(200).json({
    //         message: result3
    //     })
    // }).catch((err)=>{
    //     res.status(500).json({
    //         error: err
    //     })
    // })

}

// aaZ
exports.REQUEST_PIN_original = (req,res,next)=>{
    var _mobile = req.body.mobile;
    console.log(_mobile)
    request_pin(_mobile).then(function(result){
        console.log("reeeee", result)
        if(result.length>= 1){
         return   send_PIN_sms(req,res,result[0].pin) // this mobile exists so send him his pin
        } else {
            // his mobole doesmnt exost, so generate a new pin and then send sms to him
            return generate_pin__but_checkifexist();
        }
    }).then(function(result2){
        console.log("result2", result2)
        if(result2){
            var saveSchema = new XCorona({
                _id: new mongoose.Types.ObjectId(),
                pin: result2,
                mobile: _mobile
            })
            saveSchema.save()
            send_PIN_sms(req,res,result2)
        } else {
            console.log("oma gexissfsfewrwef")
            // res.status(200).json({
            //     message: result2
            // })
        }
    }).catch(function(err){
        res.status(500).json({
            error: err
        })
    })
}


const saveNewMobilePin = function(_pin, _mobile){
    return new Promise(function(resolve,reject){
        var saveSchema = new XCorona({
            pin: _pin,
            mobile: _mobile
        })

    })
}

const generate_pin__but_checkifexist = async value => {
    var result = false;
    while (result == false ) {
      console.log(result)
      var newPin = customId({})
      output = await checkPinInDB(newPin);
      if(output == true){ 
        result = true
        return newPin
      }
    }
    console.log('yay')
  }

const generate_pin__but_checkifexist2 = function(){
    return new Promise(function(resolve,reject){
        var newPinIsGoodForReleaseBool = false;
        // while(!newPinIsGoodForReleaseBool){
            var newPin = customId({})
            // check if new pin is in datanase
           checkPinInDB(newPin).then(function(result){
            if(result){
                newPinIsGoodForReleaseBool = false
            } else {
                newPinIsGoodForReleaseBool = true
                resolve(newPin)
            }
           }).catch(function(err){
              newPinIsGoodForReleaseBool = true
              reject(err)
           })
        // }
    })
}

const checkPinInDB = function(newPin){
    return new Promise(function(resolve,reject){
        user_exist(newPin).then(function(result){
            console.log("sdddddd",result)
            if(result.length>=1){
                resolve(false)
            } else {
                resolve(true)
            }
        }).catch(function(err){
            reject(err)
        })
    })
}


const check_mobile_exist = function(_mobile){
    return new Promise(function(resolve,reject){
        XCorona.find({mobile: _mobile}).then(function(result){
            //console.log(result)
            if(result.length>= 1){
                resolve(true)
            } else {
                resolve(false)
            }
            
        }).catch(function(err){
            reject(err)
        })
    })
}

// const request_pin = function(_mobile){
//     return new Promise(function(resolve,reject){
//         OTP.find({mobile: _mobile}).then(function(result){
//             console.log(result)
//             resolve(result)
//         }).catch(function(err){
//             reject(err)
//         })
//     })
// }


const check_if_pin_exist_and_check_mobile = function(findUserByPin){
    return new Promise(function(resolve,reject){
        console.log("caling FindUser user_exist", findUserByPin)
        XCorona.find({pin: findUserByPin}).then(function(result){
            if(result.length >= 1){
                console.log("user_exist:::::", result,result[0].pin, result.length, result[0].mobile)
                return(result)
            } else {
                return false;
            }
        }).then(function(result){
            var mobTrueFalse
            if(result == false){
                resolve(false)
            } else {
                console.log("res", result[0].mobile)
                if(result[0].mobile == undefined){
                    mobTrueFalse = false
                } else {
                    mobTrueFalse = true
                }
                var message = {
                    pinBool: true,
                    mobileBool: mobTrueFalse
                }
                resolve(message)
            }
        }).catch(function(err){
            console.log("User_exist:::",err);
            reject(err)
        })
    })
}


const user_exist = function(findUserByPin){
    return new Promise(function(resolve,reject){
        console.log("caling FindUser user_exist", findUserByPin)
        XCorona.find({pin: findUserByPin}).then(function(result){
        console.log("user_exist:::::", result, result.length)
            if(result.length >= 1){
                return(true)
            } else {
                return false;
            }
        }).then(function(result){
            if(result == false){
                resolve(false)
            } else {
                resolve(true)
            }
        }).catch(function(err){
            console.log("User_exist:::",err);
            reject(err)
        })
    })
}







// const SAVE_OTP_IN_DATABASE= function(){
//     return new Promise(function(resolve,reject){
//     })
// }


exports.CORONA = (req,res,next)=>{
    // var io = req.app.get('socketio');
    // var primus = req.app.get('primusio')
    var producer = req.app.get("kafka_producer");
    console.log(req.body)
    var _pin = req.body.pin;
    var _trk = {
        lat: req.body.lat,
        lng: req.body.lng,
        ts: Date.now(),
        temp: req.body.temperature,
        symptoms: req.body.symptoms
    }
    // var temperature = req.body.temperature;
    var _emailid = req.body.email;
    var _name = req.body.name;
    var  _mobile =  req.body.mobile;
    var _temperature = req.body.temperature;
    var _symptoms = req.body.symptoms
    var _timestamp = req.body.timestamp
    var kafka_payload = {
        pin: _pin,
        trk: _trk,
        timestamp: _timestamp,
        emailid: _emailid,
        name: _name,
        mobile: _mobile,
        temp: _temperature,
        symptoms: _symptoms
    }
    payload = JSON.stringify(kafka_payload)
    payloads = [
        {topic: "corona-topic", messages: payload, partitions:1}
    ]
   
    producer.send(payloads, function(err, data) {
        console.log("KafkaProducerSend:Data:::::",data);
        if(err){
        console.log("KafkaProducerErr0r:::::", err)
     }
    });
    const coronaData = new Corona({
            _id: new mongoose.Types.ObjectId(),
            pin: _pin,
            trk: _trk,
            // timestamp: _timestamp,
            emailid: _emailid,
            name: _name,
            mobile: _mobile,
            temp: _temperature,
            symptoms: _symptoms
        });
    saveToDB(coronaData).then(function(result){
        console.log(result)
        res.status(200).json({
            message : result
        })
    }).catch(function(err){
        res.status(500).json({
            err0r: err
        })
        console.log(err)
    })

}


exports.UPDATE_MONGODB = (req,res,next)=>{
    console.log("sfdsfsafdsf", JSON.stringify(req.body.results[0].length), req.body.results.length)
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
        console.log("jain",calcData.uuid)
        const coronaUpdate = new UPDATECorona({
            _id: new mongoose.Types.ObjectId(),
            uuid: calcData.uuid,
            trk: calcData.trk,
            timestamp: calcData.timestamp,
            emailid: calcData.emailid,
            name: calcData.name
        });

        UPDATECorona.find({uuid:calcData.uuid}).then(function(result){
            console.log("dasfasdfsdf",result)
            if(result.length >= 1){
                console.log("it exists then clean the array and add new data")
                return cleanupArray(calcData.uuid);
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
                return afterCleanUpTheArrayPushTrackerUpdateInfo(calcData.uuid, coronaUpdate)
            }
        }).then(function(final){
            console.log("finally updated")
        })
        .catch(function(err){
            console.log(err)
        })
}


const afterCleanUpTheArrayPushTrackerUpdateInfo = function(updateInfo, coronaUpdate){
    console.log()
    return new Promise(function(resolve,reject){
        UPDATECorona.findOneAndUpdate(
            {uuid: updateInfo},
            {
                $push : {
                trk :  coronaUpdate.trk
                }
            }).then(function(result){
                // primus.send('chartData',updateInfo);
                // io.emit('chartData', updateInfo)
                resolve(result)
            }).catch(function(err){
                reject(err)
            })
        })
}
const cleanupArray = function(searchThisUUID){
    return new Promise(function(resolve,reject){
        UPDATECorona.update({uuid:searchThisUUID}, { $set: { trk: [] }}, function(err, affected){
            console.log('affected: ', affected);
            resolve("cleanedUpTheArray")
        }).catch(function(err){
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

//     console.log(req.body.uuid)
//    var _uuid = req.body.uuid;
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
//         uuid: _uuid,
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
        res.status(500).json({
            message: err
        })
    })
}

exports.GETALLDATA = (req,res,next)=>{
    Corona.find().then(function(result){
        res.status(200).json({
            results: result
        })
    }).catch(function(err){
        res.status(500).json({
            message: err
        })
    })
}
const saveToDB = function(coronaData){
    return new Promise(function(resolve,reject){
        console.log("caling Savetodb", coronaData.uuid)
        Corona.find({uuid: coronaData.uuid}).then(function(result){
            console.log(result, result.length)
            
            if(result.length >= 1){
            // if(!result == "null"){
                //exists
                // resolve(result)
                console.log("it exists")
                return updateDB(coronaData);
            } else {
                return false;
            }
        }).then(function(result){
            if(result == false){
                // primus.send('chartData',coronaData);
                // io.emit('chartData', coronaData)
                resolve(coronaData.save())
            } else {
                resolve(result)
            }
        }).catch(function(err){
            console.log(err);
            reject(err)
        })
    })
}

const updateDB = function(updateInfo){
    return new Promise(function(resolve,reject){
        Corona.findOneAndUpdate(
            {uuid: updateInfo.uuid},
            {
                $push : {
                trk :  updateInfo.trk
                }
            }).then(function(result){
                // primus.send('chartData',updateInfo);
                // io.emit('chartData', updateInfo)
                resolve(result)
            }).catch(function(err){
                reject(err)
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
            {uuid: coronaData.uuid},
            coronaData,
            {upsert: true, new: true, runValidators: true}
            ).then(function(result){
                resolve(result)
            }).catch(function(err){
           console.log(err)
           reject("ErrorInSavingCoronaDataInMongoDB" + err)
       })
    })
}

const saveGeoData2 = function(coronaData){
    return new Promise(function(resolve,reject){
        coronaData.save().then(function(result){
           resolve(result)
       }).catch(function(err){
           console.log(err)
           reject("ErrorInSavingCoronaDataInMongoDB" + err)
       })
    })
}

