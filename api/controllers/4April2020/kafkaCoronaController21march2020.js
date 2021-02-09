const mongoose = require("mongoose");
const XCorona = require("../models/coronaModel");
const UPDATECorona = require("../models/updCoronaModel")
const OTP = require('../models/coronaModelOTP')
const winston = require('../../config/winston')
const fs = require('fs')
var rp = require('request-promise')
var moment = require('moment-timezone');
var _MOMENT = require('moment')
var _CONFIG = require('../../config/config')
var CONFIG = require('../models/configModel')

// console.log(Date.now())
// var d = new Date(15233223423)
// console.log(d)
var timeString = "1581757699369"
var intString = parseInt(timeString)
var unixepoch = new Date(intString).getTime();
var date = moment(unixepoch).tz('Asia/Singapore').format('DD/MM/YYYY')
//console.log("ssss",date)

exports.ORGID_GET_FLOATING_PINS = (req,res,next)=>{
    var _orgid =req.params.orgid
    XCorona.find({"mobile": { $exists: false, $ne: ""}, orgid:_orgid}, {_id:0,orgid:1, pin:1,ts:1})
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
    XCorona.find({"mobile": { $exists: false, $ne: ""}}, {_id:0,orgid:1, pin:1,ts:1})
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
    var _pin = req.query.pin
    
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
        console.table(["AAAAA", _MOMENT(start).valueOf()])
        yest = _MOMENT(start).valueOf();
        bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    } else {
        _days = _days * 24
        console.log("_days", _days)
        var ts = Math.round(new Date().getTime());
        var tsYesterday = ts - (`${_days}` * 3600 * 1000);
        var abc = new Date().getTime() - (_days * 60 * 60 * 1000);
        console.log("GET_DATA_BY_DAYS", tsYesterday, moment(tsYesterday).format("DD-MM-YYYY:HH:mm:ss"), abc)
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
        {$match: { "mobile": {$exists:true},  "trk": {$ne: []}, "trk.ts": {$ne: null}, "orgid": _orgid,"pin":_pin}},
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
            expiry:1,
            initlat:1,
            initlng:1,
            biopush:1,
            bioupdate:1,
            hrloaend:1,
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

exports.ORGID_BIOPINS_GET_ALL_PINS_FOR_BIOMETRIC = (req,res,next)=>{
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




exports.ORGID_GET_DATA_BY_DAYS_BIO_PUSH_UPDATE_ORGID = (req,res,next)=>{
    var _days = req.params.days;
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
       // bioupdateyest = moment(yest).format("DD/MM/YYYY")
	 bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    }
    console.table([["Time", yest], ["bioupdate",bioupdateyest]])
    
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
            initlat:1,
            initlng:1,
            biopush:1,
            bioupdate:1,
            hrloaend:1,
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
    console.log("_days", _days)
    var ts = Math.round(new Date().getTime());
    var tsYesterday = ts - (`${_days}` * 3600 * 1000);
    var abc = new Date().getTime() - (_days * 60 * 60 * 1000);
    console.log("GET_DATA_BY_DAYS", tsYesterday, moment(tsYesterday).format("DD-MM-YYYY:HH:mm:ss"), abc)
    var yest = parseInt(tsYesterday)
    var bioupdateyest = moment(tsYesterday).format("DD/MM/YYYY")
    XCorona.aggregate([
        // {$match: {"biopush": {$ne: null}}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}, "pin": "JAIN"}},
        {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}, "pin":_pin}},
        {
           $project: {
            pin: 1,
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
        return res.status(500).json({
            error: "unableTogetData"
        })
      })
}

exports.PIN_QUERY_GET_DATA_BY_DAYS_WORKS_BUT_NOTINUSE = (req,res,next)=>{
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
    console.log("_days", _days)
    var ts = Math.round(new Date().getTime());
    var tsYesterday = ts - (`${_days}` * 3600 * 1000);
    var abc = new Date().getTime() - (_days * 60 * 60 * 1000);
    console.log("GET_DATA_BY_DAYS", tsYesterday, moment(tsYesterday).format("DD-MM-YYYY:HH:mm:ss"), abc)
    var yest = parseInt(tsYesterday)
    XCorona.aggregate([
        // {$match: {"biopush": {$ne: null}}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}, "pin": "JAIN"}},
        {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}, "pin":_pin}},
        {
           $project: {
            pin: 1,
            loaend:1,
            loastart:1,
            lastupdate:1,
            biolastupdate:1,
            devicetype:1,
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
        console.table(["AAAAA", _MOMENT(start).valueOf()])
        yest = _MOMENT(start).valueOf();
        bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    } else {
        _days = _days * 24
        console.log("_days", _days)
        var ts = Math.round(new Date().getTime());
        var tsYesterday = ts - (`${_days}` * 3600 * 1000);
        var abc = new Date().getTime() - (_days * 60 * 60 * 1000);
        console.log("GET_DATA_BY_DAYS", tsYesterday, moment(tsYesterday).format("DD-MM-YYYY:HH:mm:ss"), abc)
        yest = parseInt(tsYesterday)
        bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    }
    console.table([["Time", yest], ["bioupdate",bioupdateyest]])

    XCorona.aggregate([
        // {$match: {"biopush": {$ne: null}}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}, "pin": "JAIN"}},
        // {$match: {"trk": {$ne: []}, "trk.ts": {$ne: null}}},
        // {$match: { "mobile": {$exists:true},  "trk": {$ne: []}, "trk.ts": {$ne: null}}},
        {$match: { "mobile": {$exists:true},  "trk": {$ne: []}, "trk.ts": {$ne: null}, "orgid": _orgid, "pin": _pin}},
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
          console.log("eeeeee",err)
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
        console.table(["AAAAA", _MOMENT(start).valueOf()])
        yest = _MOMENT(start).valueOf();
        bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    } else {
        _days = _days * 24
        console.log("_days", _days)
        var ts = Math.round(new Date().getTime());
        var tsYesterday = ts - (`${_days}` * 3600 * 1000);
        var abc = new Date().getTime() - (_days * 60 * 60 * 1000);
        console.log("GET_DATA_BY_DAYS", tsYesterday, moment(tsYesterday).format("DD-MM-YYYY:HH:mm:ss"), abc)
        yest = parseInt(tsYesterday)
        bioupdateyest = moment(yest).format("DD-MM-YYYY:HH:mm:ss")
    }
    console.table([["Time", yest], ["bioupdate",bioupdateyest]])

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
          console.log("eeeeee",err)
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
    console.log("_days", _days)
    var ts = Math.round(new Date().getTime());
    var tsYesterday = ts - (`${_days}` * 3600 * 1000);
    var abc = new Date().getTime() - (_days * 60 * 60 * 1000);
    console.log("GET_DATA_BY_DAYS", tsYesterday, moment(tsYesterday).format("DD-MM-YYYY:HH:mm:ss"), abc)
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
        return res.status(500).json({
            error: err
        })
      })
}


exports.GET_DATA_BY_DAYS_DONTUSETHISINPORDUCTION = (req,res,next)=>{
    var _days = req.params.days;
    _days = _days * 24
    var ts = Math.round(new Date().getTime());
    var tsYesterday = ts - (`${_days}` * 3600 * 1000);
	var abc = new Date().getTime() - (_days * 60 * 60 * 1000);
	console.log("GET_DATA_BY_DAYS", tsYesterday, moment(tsYesterday).format("DD-MM-YYYY:HH:mm:ss"), abc)
    console.log("GET_DATA_BY_DAYS", tsYesterday)
	var yest = parseInt(tsYesterday)
	console.log("Yesyerdat", tsYesterday, yest)
    // console.log("ex::::::+++++++++>>>>",ex, moment(ex).format("DD-MM-YYY_HH:mm:ss"))
    XCorona.find( 
        // { expiry:"false",$expr: {$lt:[{$toInt: biolastupdate}, ex]} },
	{},
        {expiry:"false",biopush: { $elemMatch: { ts: { $gte: yest } } }},
        { biopush:1, bioupdate:1,trk:1,biolastupdate:1,expiry:1, _id: 0, pin:1, token:1, mobile:1,lastupdate:1, loastart:1,loaend:1}
    ).then((result)=>{
        console.log("GetDataViaDays",result)
        return res.status(200).json({
            message: {
                result: result
            }
        })
        resolve(result)
    }).catch(function(err){
        console.log("ersdf", err)
        return res.status(500).json({
            error:{
                error: "UnableToGetTRKviaDays"
            }
        })
        reject("unabletogettokensforBiometricpushnotification")
    })
}
exports.GET_DATA_BY_DAYS_NOTINUSE = (req,res,next)=>{
    var _days = req.params.days;
    _days = _days * 25
    var ts = Math.round(new Date().getTime() / 1000);
    var tsYesterday = ts - (`${_days}` * 3600);
    console.log("GET_DATA_BY_DAYS", tsYesterday)
    // console.log("ex::::::+++++++++>>>>",ex, moment(ex).format("DD-MM-YYY_HH:mm:ss"))
    XCorona.find( 
        // { expiry:"false",$expr: {$lt:[{$toInt: biolastupdate}, ex]} },  
        {expiry:"false",trk: { $elemMatch: { ts: { $gte: tsYesterday } } }}
    ).then((result)=>{
        console.log("GetDataViaDays",result)
        return res.status(200).json({
            message: {
                result: result
            }
        })
        resolve(result)
    }).catch(function(err){
        console.log("ersdf", err)
        return res.status(500).json({
            error:{
                error: "UnableToGetTRKviaDays"
            }
        })
        reject("unabletogettokensforBiometricpushnotification")
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
        return res.status(500).json({
            error: "unabletoUpdate"
        })
    })
}
const biometricgetalltokens_pushNotification = function(){
    return new Promise((resolve,reject)=>{
        // var ex = Date.now() + (5 * 60 * 1000);
        var ex = Date.now() -  (20 * 60 * 1000);
        console.log("ex::::::+++++++++>>>>", moment(ex).format("DD-MM-YYY_HH:mm:ss"))
        XCorona.find( 
            {expiry:"false", issuspended:"false", biolastupdate: {$lt: ex}}, 
            {orgid:1, biolastupdate:1,issuspended:1,mobile:1,expiry:1, _id: 0, pin:1, token:1}
        ).then((result)=>{
            console.log("biometricgetalltokens_pushNotification::",result)
            resolve(result)
            //   console.log("jain", result)
            //   for(a in result){
            //       console.log(result[a].pin, result[a].token)
            //   }
        }).catch(function(err){
            console.log("ersdf", err)
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
        maxvltn: 1,
        otpireq:1,
        otpmaxtry:1,
        otptout:1,
        updfreq:1,
	      orgid:1,
            userfirstlogin:1,
            multilogin:1,
    } ).then((result)=>{
        console.log("jain", result)
        return res.status(200).json({
            message: result
        })
    }).catch(function(err){
        console.log("ersdf", err)
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
            console.log("getPinInfoByMobileNumber:::::");
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
                 maxvltn:result.maxvltn,
                 updfreq:result.updfreq,
                 expiry:result.expiry,
                 issuspended:result.issuspended
            }
        })
    }).catch((err)=>{
        return res.status(500).json({
                error: "Unable to Update Biometric Update"
        })
    })
    // XCorona.findOneAndUpdate({pin: _pin}, {"biometric.today" :{$exist:true}})
    // .then(function(result){
    //     console.log(result)
    // }).catch(function(err){
    //     console.log(err)
    // })
}

exports.UPDATE_CHALLENGE_2222 = (req,res,next)=>{
    var _pin = req.body.pin
    var _status = req.body.clientstatus
    if(_pin == null || _pin == undefined || _pin ==""){
        return res.status(404).json({
            error: `Pin is not defined ${_pin}`
        })
    }

    var _biolastupdate = Date.now() 
    var today = moment().format("DD/MM/YYYY")
    // var query = {pin: _pin, biometric: {date:today}}
    // var update = {}
    // var options = {upsert: true, new:true,setDefaultsOnInsert:true}
    var _date = moment().format("DD/MM/YYYY")
    var _timestamp = Date.now()
    var biometric = {
        date: _date,
        ts: _timestamp + "-" + moment().format("DD/MM/YYYY_HH:mm:ss"),
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
		 desc: "success"
	    }
        })
    }).catch((err)=>{
        return res.status(500).json({
            error : "Unable to Update Biometric Update"
        })
    })
    // XCorona.findOneAndUpdate({pin: _pin}, {"biometric.today" :{$exist:true}})
    // .then(function(result){
    //     console.log(result)
    // }).catch(function(err){
    //     console.log(err)
    // })
}

exports.CHANGE_EXPIRTYDATE = (req,res,next)=>{
    console.log("========>", req.body.pin, req.body.newdate)
    var _pin = req.body.pin
    var _newdate = req.body.newdate
    // _newdate = moment(_newdate).format("DD/MM/YYYY")
    var _loaend = _newdate // must be in 27/02/2020

    var ts = moment(_newdate, "DD/MM/YYYY").valueOf();
    //var _hrloaend = moment(ts);
    var _hrloaend = ts;
    console.log("asdfdsf", _pin, _newdate, _loaend, _hrloaend)
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
        res.status(500).json({
            error: err
        })
    })

}

exports.CHANGE_CONFIG_RAKESH = (req,res,next)=>{
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
       return reject({
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
    console.log(err)
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
            console.log(err)
            reject("unabeltoUpdateExpiryDateINCORONA")
            // res.status(500).json({
            //     error: "unab;e tp iu[date"
            // })
        })
    })
}

const changeexpirydateOTPMODEL = function(_pin, _loaend,_hrloaend){
    return new Promise((resolve,reject)=>{
        console.log("InSideOTP::",_pin, _loaend,_hrloaend )
	    OTP.findOneAndUpdate(
            {pin:_pin},
            {
                $set :{loaend : _loaend, expiry:false}
            },{new: true}
        ).then(function(result){
            console.log("InSideOTPlevel2:",result)
            if(result == null) {
               return reject("pinNotExistOTP")
            }
            resolve(result)
            // res.status(200).json({
            //     message: result
            // })
        }).catch(function(err){
            console.log(err)
            reject("unabeltoUpdateExpiryDateINOTP")
            // res.status(500).json({
            //     error: "unab;e tp iu[date"
            // })
        })
    })
}

exports.CHANGE_EXPIRTYDATE_2 = (req,res,next)=>{
    console.log("========>", req.body.pin, req.body.newdate)
    var _pin = req.body.pin
    var _newdate = req.body.newdate
    // _newdate = moment(_newdate).format("DD/MM/YYYY")
    var _loaend = _newdate // must be in 27/02/2020
    var _hrloaend = Date.now(_newdate)

    console.log("asdfdsf", _pin, _newdate, _loaend, _hrloaend)
    XCorona.findOneAndUpdate(
        {pin:_pin},
        {
            $set :{loaend : _loaend, hrloaend: _hrloaend, expiry:false}
        },{new: true}
    ).then(function(result){
        console.log(result)
        res.status(200).json({
            message: result
        })
    }).catch(function(err){
        console.log(err)
        res.status(500).json({
            error: "unab;e tp iu[date"
        })
    })
}

exports.UPDATE_TOKEN = (req,res,next)=>{
    var _pin = req.body.pin
    console.log("afadsfasfdsfsdfsadf",_pin)
    var _token = req.body.token
    console.log("afadsfasfdsfsdfsadf",_pin, _token)
    update_token_corona(_pin, _token).then((result1)=>{
        res.status(200).json({
            message: result1
        })
    }).catch((err)=>{
        res.status(500).json({
            error: err
        })
    })   

}

const update_token_corona = function(_pin, _token){
    return new Promise((resolve,reject)=>{
        console.log("Adasdasdasd")
        XCorona.findOneAndUpdate({pin:_pin},{$set:{token:_token}},{new:true}).then((result1)=>{
        console.log("hhhh", result1)
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
        console.log("update_token_corona::", err)
            reject({
                status: 4,
                desc: "update_token_corona_catch_err"
            })
        })
    })
}




exports.GET_TOKEN_2 = (req,res,next)=>{
    var _pin = req.params.pin;
    console.log("DSSDFSDFSDf", _pin)
    XCorona.find({pin:_pin})
    .then((result1)=>{
        res.status(200).json({
            message: result1[0].token
        })
    }).catch((err)=>{
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
    console.log("------>>>>>>>>>>>>>>>>>>", _mobile)
    if(_mobile =="" || _mobile == null || _mobile == undefined){
        return res.status(500).json({
            error: "No mobile number provided"
        })
    }
    XCorona.find({mobile: _mobile}, { expiry:1, _id: 1, pin:1, token:1, loastart:1, loaend:1,mobile:1 } ).then((result)=>{
        console.log("jain", result)
        return res.status(200).json({
            message: result
        })
    }).catch(function(err){
        console.log("ersdf", err)
        return res.status(500).json({
            error: "UnableToGetToken"
        })
    })
}

exports.CONFIG_GET = (req,res,next)=>{
    res.status(200).json({
        message: {
            maxdist: _CONFIG.maxdist,
            updfreq: _CONFIG.updfreq,
            maxvltn: _CONFIG.maxvltn,
            otpireq: _CONFIG.otpireq,
            otpmaxtry: _CONFIG.otpmaxtry,
            otptout:_CONFIG.otptout
        } 
    })
}

exports.REGISTER = (req,res,next)=>{
    var io = req.app.get('socketio');
    var primus = req.app.get('primusio')
    winston.info(req.body)
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
console.log("JJJA", typeof _hrloaend, _hrloastart)
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

    saveToDB2(coronaData, primus, io).then(function(result){
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


exports.PCODE_UPDATE_BY_PIN = (req,res,next)=>{
    var _pin = req.body.pin;
    var _pcode = req.body.pcode;
    console.log("qwerqwerwre",req.body)
    //first getlatlng via postalcode pcode
    getLatLngByPostalCode(_pcode).then(function(results){
        console.log("RESULTSSSS:::", results)
        if(results.status == 2){
             res.status(200).json({
                message: results
            })
        } else {
            console.log("RESUzzzzzzzz:::", results)
            return saveLatLngByPinInMongoDB(_pin, results, _pcode)
        }
    }).then(function(results2){
        // console.log("qeqeqweqweqeqedsadsfsaddfsadfdasfasd::",results2)
        console.log("Iam Called ====== ======= ===>>>")
        return res.status(200).json({
            message: {
                status: 1,
                desc: "success",
                initlat: results2.initlat,
                initlng: results2.initlng
            }
        })
    }).catch(function(err){
        res.status(500).json({
            error: err
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
const saveToDB2 = function(coronaData, primus, io){
    return new Promise(function(resolve,reject){
        console.log("caling Savetodb", coronaData.pin)
        XCorona.find({pin: coronaData.pin}).then(function(result){
            console.log(result, result.length)
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
                console.log("fasle", result)
                primus.send('chartData',coronaData);
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
            console.log(err);
            winston.error(err)
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
            console.log("saveLatLngByPinInMongoDB:Error:", err)
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
        console.log("jain", result)
            resolve(result)
        }).catch(function(err){
            console.log("ersdf", err)
            reject("unableToFindpins")
        })
    })
}

const NotInuse_getPinsWithoutTrk = function(){
    return new Promise((resolve,reject)=>{
        XCorona.find( {}, {mobile:1,biolastupdate:1, lastupdate:1,expiry:1,loastart:1,loaend:1, _id: 0, pin:1, token:1 } ).then((result)=>{
            console.log("jain", result)
            resolve(result)
        }).catch(function(err){
            console.log("ersdf", err)
            reject("unableToFindpins")
        })
    })
}

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
                console.log("dfasfdsfads",repos.results.length)
                
                if(repos.results.length>=1){
                    console.log("wwwwwwwwww", JSON.stringify(repos).length)
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
                console.log("err::", "err")
                reject("failed")
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
    var io = req.app.get('socketio');
    var primus = req.app.get('primusio')
    var _pin = req.body.pin;
    var _pf = req.body.pf;
    
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
        symptoms: _symptoms
    }

    
    updateLatLng_updated(_pin, _trk, primus, io)
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

exports.ORGID_GET_ALL_FOR_PUSHNOTIFICATION = (req,res,next)=>{
    var _orgid =req.params.orgid;
    _orgid = _orgid.toUpperCase();
    find_HRLOAEND_and_set_EXPIRY_ToTrue()
    .then((result1)=>{
        console.log(result1, "sfsfd")
        if(result1){
            return true
        }
    }).then((result2)=>{
        console.log("kkk", result2)
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
        return res.status(404).json({
            error: err
        })
    })
  
}

const orgid_getalltokens_pushNotification = function(_orgid){
    return new Promise((resolve,reject)=>{
        // var ex = Date.now() + (5 * 60 * 1000);
        var ex = Date.now() -  (20 * 60 * 1000);
        console.log("ex==========>>>>", ex)
        XCorona.find( 
            { orgid:_orgid, issuspended:false, expiry:false, lastupdate: {$lte: ex}}, 
            {orgid:1, issuspended:1,lastupdate:1,expiry:1, _id: 0, pin:1, token:1}
        ).then((result)=>{
            console.log("orgid_getalltokens_pushNotification::",result)
            resolve(result)
            //   console.log("jain", result)
            //   for(a in result){
            //       console.log(result[a].pin, result[a].token)
            //   }
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
        console.log(result1, "sfsfd")
        if(result1){
            return true
        }
    }).then((result2)=>{
        console.log("kkk", result2)
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
            console.log("false_find_HRLOAEND_and_set_EXPIRY ",resolt)
            if(resolt.ok == 1){
                console.log(resolt.ok)
                resolve(true)
            } else {
                console.log(resolt.ok)
                reject(false)
            }
        }).catch((err)=>{
            reject("false_find_HRLOAEND_and_set_EXPIRY: unableto set to true")
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
            console.log(resolt)
            if(resolt.ok == 1){
                console.log(resolt.ok)
                resolve(true)
            } else {
                console.log(resolt.ok)
                reject(false)
            }
        }).catch((err)=>{
            reject("find_HRLOAEND_and_set_EXPIRY_ToTrue: unableto set to true")
        })
    })
}

const getalltokens_pushNotification = function(){
    return new Promise((resolve,reject)=>{
        var ex = Date.now() - (20 * 60 * 1000);
        XCorona.find( 
		//{$and: [{expiry:"false", lastupdate:{$lt: ex} }]},
		//{ expiry:"false",$expr: {$lt:[{$toDouble:"lastupdate"}, ex]} },
		{  expiry:"false", issuspended:"false", lastupdate: {$lt: ex}}, 
            {orgid:1,issuspended:1, lastupdate:1,expiry:1, _id: 0, pin:1, token:1}
        ).then((result)=>{
            console.log(result)
            resolve(result)
            //   console.log("jain", result)
            //   for(a in result){
            //       console.log(result[a].pin, result[a].token)
            //   }
        }).catch(function(err){
            console.log("ersdf", err)
            reject("unabletogettokensforpushnotification")
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
            console.log("ss",resolt)
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

const updateLatLng_updated = function(_pin, _trk, primus, io){
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
            console.log("Result3:::::", result3)
           return result3;
        }).then(function(result4){
            if(result4) {
                return update_TRK_mongoDb(_pin, _trk)
            }
        }).then(function(result5){
            console.log("result5---------",result5)
            resolve({
                status: 1,
                desc: "proceed",
                maxdist: result5.maxdist,
                maxvltn: result5.maxvltn,
                updfreq: result5.updfreq,
                loastart: result5.loaend
            })
        }).catch(function(err){
            console.log("Error: updateLatLng_updated ", err)
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
                    maxvltn: result.maxvltn,
                    updfreq: result.updfreq,
                    loaend: result.loaend,
                }
                resolve(config)
            }).catch(function(err){
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
            console.log("CheckPinExists:", err)
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
               console.log("ResultIsExist:True: yes suspended")
               reject({
                  status: 4,
                  desc: "pin suspended"
               })
            } else {
             console.log("ResultIsExist:False:", result)
             resolve({
                status: false,
                result: ""
             })
            }
        }).catch(function(err){
          //   console.log("Err", err)
            reject("UnableToFindIsPin_Suspended")
        })
    })
}

const checkExpiry = function(result, _pin){
    return new Promise((resolve,reject)=>{
        var currentDate = moment(Date.now()).tz('Asia/Singapore').format('DD/MM/YYYY')
        console.log("CheckExpiry:: ", result[0].loaend == currentDate, result[0].loaend, currentDate)

        var expiry = result[0].loaend
        var expiryepoch = moment(expiry, "DD/MM/YYYY").valueOf();
        expiryepoch += 28800; // +08hrs
        var now = Date.now();
        if (now >= expiryepoch) {
            //YES, SMALLER
            console.log("expired",_pin, now, expiryepoch, result[0].loaend)
            // this is dirty way of doing things, but let it be the way it is.
            set_pin_to_expiry_true(_pin).then(function(result){
                console.log("set_pin_to_expiry_true: succesfull")
            }).catch(function(err){
                console.log("SettingPinTo true is not sucesfful")
            })
        reject({
            status: 3,
            desc: "pin expired"
        })
        } else {
            //NOPE
            console.log("not expired",result[0].pin,now, expiryepoch,result[0].loaend )
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
            console.log("PinUpdateToExpiryTrueIsSuccesfull ", _pin)
            resolve(true)
        }).catch(function(error){
            console.log("set_pin_to_expiry_true:", err)
            reject("SomeErrorSettingPinExpiryTrue")
        })
    })
}


const jain_updateLatLng_updated = function(_pin, _trk, primus, io){
    return new Promise(function(resolve,reject){
        XCorona.findOneAndUpdate(
            {pin: _pin},
            {
                $set: {lastupdate: _trk.ts},
                $push : {
                trk :  _trk
                }, 
            }, {new: true}
            ).then(function(result){
    
		    //            console.log("FunctionUpdateLatLng:", result)
                if(result == null) {
                    reject({
                        status: 2,
                        desc: "invalid pin"
                    })
                }  else {
                    return result
                }
                // primus.send('chartData',updateInfo);
                // io.emit('chartData', updateInfo)
                
            }).then((result2)=>{
                return checkExpiry(result2,_pin)
            }).then((result3)=>{
                if(result3){
                    resolve({
                        status: 1,
                        desc: "proceed"
                    })
                } else {
                    reject({
                        status: 3,
                        desc: "pin expired"
                    })
                }
            }).catch(function(err){
                winston.error(err)
                reject("failed Unabled to update pf and dist")
            })
        })
}



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

const _notinsuecheckExpiry = function(result, _pin){
    return new Promise((resolve,reject)=>{
        var currentDate = moment(Date.now()).tz('Asia/Singapore').format('DD/MM/YYYY')
        console.log("CheckExpiry:: ", result.loaend == currentDate, result.loaend, currentDate)

        var expiry = result.loaend
        var expiryepoch = moment(expiry, "DD/MM/YYYY").valueOf();
        expiryepoch += 28800; // +08hrs
        var now = Date.now();
        if (now >= expiryepoch) {
            //YES, SMALLER
            console.log("expired",_pin, now, expiryepoch, result.loaend)
            // this is dirty way of doing things, but let it be the way it is.
            set_pin_to_expiry_true(_pin).then(function(result){
                console.log("set_pin_to_expiry_true: succesfull")
            }).catch(function(err){
                console.log("SettingPinTo true is not sucesfful")
            })
        resolve(false)
        } else {
            //NOPE
            console.log("not expired",result.pin,now, expiryepoch,result.loaend )
            resolve(true)
        }
    })
}

const NOTINSUEset_pin_to_expiry_true = function(_pin){
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
            reject("SomeErrorSettingPinExpiryTrue")
        })
    })
}


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
            console.log('affected: ', affected);
            resolve("cleanedUpTheArray")
        }).catch(function(err){
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
        res.status(500).json({
            message: err
        })
    })
}

const saveToDB = function(coronaData, primus, io){
    return new Promise(function(resolve,reject){
        console.log("caling Savetodb", coronaData.pin)
        XCorona.find({pin: coronaData.pin}).then(function(result){
            console.log(result, result.length)
            if(result.length >= 1){
            // if(!result == "null"){
                //exists
                // resolve(result)
                console.log("it exists")
                return updateDB(coronaData, primus, io,result);
            } else {
                return false;
            }
        }).then(function(result){
            if(result == false){
                console.log("fasle", result)
                primus.send('chartData',coronaData);
                // io.emit('chartData', coronaData)
                resolve(coronaData.save())
            } else {
                resolve(result)
            }
        }).catch(function(err){
            console.log(err);
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


const updateDB = function(updateInfo, primus, io,currentData){
    return new Promise(function(resolve,reject){
        var uI = updateInfo
        console.log("sddfsaf::>>>>>>",currentData,currentData[0].initlat,currentData[0].initlng,updateInfo.initlat,updateInfo.initlng )
        calculateDistance(currentData[0].initlat,currentData[0].initlng,updateInfo.initlat,updateInfo.initlng)
        .then(function(result){
            console.log("CalculateDistance::", result)
            return result
        }).then(function(result1){
            console.log("resssss", result1)
            // if(result1){ dont use this, if this becomes zero the condistion will become falst
               return updateInfo.trk[0].dist = result1
            // }
        }).then(function(result3){
            console.log("Resut3", result3, updateInfo, updateInfo.trk[0].lat)
           return updateLatLng(updateInfo)
        }).then(function(result2){
            console.log("afterUpdate::", result2)
            resolve(result2)
        }).catch(function(err){
            console.log(err)
            winston.error(err)
            reject("ubable")
        })    
    })
}



const updateLatLng = function(updateInfo, primus, io){
    return new Promise(function(resolve,reject){
        XCorona.findOneAndUpdate(
            {pin: updateInfo.pin},
            {
                $push : {
                trk :  updateInfo.trk
                }
            }).then(function(result){
                console.log("FunctionUpdateLatLng:", result)
                // primus.send('chartData',updateInfo);
                // io.emit('chartData', updateInfo)
                resolve(result)
            }).catch(function(err){
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
    var io = req.app.get('socketio');
    var primus = req.app.get('primusio')
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
    saveToDB(coronaData, primus, io).then(function(result){
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
