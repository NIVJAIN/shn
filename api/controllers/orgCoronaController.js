const mongoose = require("mongoose");
const XOrgid = require("../models/orgidModel");
// const UPDATECorona = require("../models/updCoronaModel")
// const Biometric = require('../models/biometricModel')
// const OTP = require('../models/coronaModelOTP')
const winston = require('../../config/winston')
const fs = require('fs')
var rp = require('request-promise')
var moment = require('moment-timezone');
var _MOMENT = require('moment');


exports.CREATE_ORGID = (req,res,next)=>{
    var _orgid = req.body.orgid;
    var _timestamp = Date.now();
    var _hrdate = moment().format("DD-MM-YYYY:HH:mm:ss")
    var _pushtiming =  req.body.pushtiming;
    var newOrgid = new XOrgid({
        _id: new mongoose.Types.ObjectId(),
        orgid : _orgid,
        timestamp: _timestamp,
        hrdate: _hrdate,
        pushtiming: _pushtiming
    })
    XOrgid.findOne({orgid: _orgid})
    .then(function(result){
        winston.info("exports.CREATE_ORGID.result=>" + result)
        winston.info("exports.CREATE_ORGID==>>" + _orgid+" |"+ _timestamp +" |" + _hrdate +  " | "+ result + " |")
        if(result == null) {
            return false
        } else {
            // throw new Error(`{${_orgid}} already exists in DB`)
            throw {
                error: "error",
                message:`Organization ID {${_orgid}} already exists in DB`,
            };
        }
    }).then(function(result2){
        if(result2 == false){
            return newOrgid.save()
        }
    }).then(function(result3){
        if(result3){
            return res.status(200).json({
                message: result3
            })
        }
    }).catch(function(err){
        winston.error(err.more)
        console.log(typeof err)
        if(err.error == "error" ){
            console.log("----jo")
            return res.status(500).json({
                error: err.message
            })
        }
        return res.status(500).json({
            error: "exports.CREATE_ORGID.catch=> " +  `{${_orgid}} unable to update`
        })
    })
}

exports.GET_ORGID = (req,res,next)=>{
    XOrgid.find({}).then(function(result){
        return res.status(200).json({
            message: result
        })
    }).catch(function(err){
        return res.status(500).json({
            error: err
        })
    })
}

exports.UPDATE_TIMING_PUSHNOTIFICATION = (req,res,next)=>{
    var _pushtiming = req.body.pushtiming;
    var _orgid = req.body.orgid;
    _orgid = _orgid.toUpperCase()
    _pushtiming = parseInt(_pushtiming);
    XOrgid.findOneAndUpdate({orgid: _orgid},
        {$set: {pushtiming: _pushtiming}},
        {new:true}
    ).then(function(result){
        return res.status(200).json({
            message: result
        })
    }).catch(function(err){
        return res.status(500).json({
            error: `Unable to update {${orgid}} pushnotification {${_pushtiming}}timing`
        })
    })
}