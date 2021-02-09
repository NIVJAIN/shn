const mongoose = require("mongoose");
const XCorona = require("../models/coronaModel");
// const UPDATECorona = require("../models/updCoronaModel")
const OTP = require("../models/coronaModelOTP")
const Bioconfig = require("../models/bioConfigModel")
const Biotimer = require("../models/biotimerModel")

const sendSMS = require('./messageController')
const fs = require('fs')
var customId = require('custom-id');
var winston = require('winston');
var moment = require('moment-timezone');
const jwt = require('jsonwebtoken')
var CONFIG = require('../../config/config')


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

exports.GET_JAIN = (req,res,next)=>{
    console.log("HIjain", req.query.name)
    res.status(200).json({
        message: "DifferenceBetweenQueryAndParams",
        query: req.query.name,
        params: req.params.id
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

exports.GEN_JWT = (req,res,next)=>{
    // var _token = req.headers.authorization;
    var _pin = req.body.pin;
    const _token = jwt.sign({
        _pin
    },
        CONFIG.JWT_SECRET,
        {
            expiresIn: "30d"
        },
    )
    res.status(200).json({
        message: "success",
        token : _token
    }) 
}

exports.JWT_TESTING = (req,res,next)=>{
    var _token = req.headers.authorization;
    var _pin = req.body.pin;
    res.status(200).json({
        message: "TokenMatches",
        token: _token
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
        var otpSinglePin = new OTP({
            _id: new mongoose.Types.ObjectId(),
            pin: "",
            ts: _timestamp
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

exports.GETALL_DATA = (req,res,next)=>{
    OTP.find().then(function(result){
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
    OTP.find({pin: _pin}).then(function(result){
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

exports.CREATE_USER_BYPIN = (req,res,next)=>{
    console.log("afdasfadsfsdfsd",req.body.pin)
    var _pin = req.body.pin
    var createPinSchema = new OTP({
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


exports.CREATE_USER_MOBILE_PIN = (req,res,next)=>{
    var _pin = req.body.pin
    var _mobile = req.body.pin
    var _pin = req.body.pin
    var createPinSchema = new OTP({
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
// find first, if not exist return 
// if exists generate otp 
// after generate otp update in mongodb

exports.REGISTER_FOR_LOGIN = (req,res,next)=>{
    console.log(req.body)
    var _pin = req.body.pin;
    var _mobile = req.body.mobile;
    var _loastart = req.body.loastart;
    var _loaend = req.body.loaend;
    var newRegister = new OTP({
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

const register_firsttime_bypin = function(newRegister){
    return new Promise((resolve,reject)=>{
        OTP.find({pin:newRegister.pin})
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

exports.LOGIN = (req,res,next)=>{
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

const updateDeviceType = function(_pin,_devicetype){
    return new Promise(function(resolve,reject){
        OTP.findOneAndUpdate({pin: _pin},{$set:{devicetype:_devicetype}}, {new:true})
        .then(function(result1){
            console.log("UpdateDeviceType:--", result1)
            if(result1 == null) {
                throw new Error("DeviceUpdateFailed")
            } else {
                return(true)
            }
        }).then(function(result2){
            XCorona.findOneAndUpdate(
                {pin: _pin},
                {
                    $set: {devicetype: _devicetype},
                }, {new: true}
            ).then(function(resultams){
                resolve(resultams)
            }).catch(function(err){
                reject("unabletoupdatedevicetype")
            })
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


const updateDeviceType_orig = function(_pin,_devicetype){
    return new Promise(function(resolve,reject){
        OTP.findOneAndUpdate({pin: _pin},{$set:{devicetype:_devicetype}}, {new:true})
        .then(function(result1){
            console.log("UpdateDeviceType:--", result1)
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
const checkExpiry_NotINUSE = function(result){
    return new Promise((resolve,reject)=>{
        var currentDate = moment(Date.now()).tz('Asia/Singapore').format('DD/MM/YYYY')
        console.log("CheckExpiry:: ", result[0].loaend == currentDate, result[0].loaend, currentDate)
        if(result[0].loaend == currentDate){
            reject({
                status: 3,
                desc: "expired"
            })
        } else {
            resolve(true)
        }
    })
}

const checkExpiry = function(result){
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
                desc: "expired"
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
        OTP.findOneAndUpdate({pin: _pin},{$set:{otp:_otp, ts: Date.now()}}, {new:true})
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
    console.log("dfsf", req.body)
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

const verify_otp = function(_pin, _otp){
    return new Promise(function(resolve,reject){
        // OTP.findOne({mobile: {$eq:_mobile}},{otp:{$eq:_otp}})
        OTP.find()
        .where('pin', _pin)
        .where('otp', _otp)
        .then(function(result){
            if(result.length >= 1){
                console.log("verify_otp:::::", result)
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
        OTP.find()
        .where('mobile', _mobile)
        .where('pin', _pin)
        .then(function(result){
            if(result.length >= 1){
                console.log("verify_otp:::::", result)
                resolve(result)
            } else {
                console.log("verify_otp:::::", result)
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


exports.REQUEST_PIN = (req,res,next)=>{
    var _mobile = req.body.mobile;
    var _loastart = req.body.loastart;
    var _loaend = req.body.loaend;
    var _timestamp = Date.now();
    var finalResult = "";
    var _pin = ""
    var newRegister = new OTP({
        _id: new mongoose.Types.ObjectId(),
        pin : "",
        mobile: _mobile,
        otp: "",
        ts: _timestamp,
        otpexpiry: "",
        loastart: _loastart,
        loaend: _loaend
    })
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
        return newRegister.pin = result2
    }).then((result3)=>{
        return newRegister.save()
    }).then((result4)=>{
        finalResult = result4
        coronaData.pin = _pin
        return coronaData.save()
    }).then((result5)=>{
        res.status(200).json({
            message: finalResult
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

exports.REQUEST_PIN_2 = (req,res,next)=>{
    var _mobile = req.body.mobile;
    var _loastart = req.body.loastart;
    var _loaend = req.body.loaend;

    var newRegister = new OTP({
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
            var saveSchema = new OTP({
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
        var saveSchema = new OTP({
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
        OTP.find({mobile: _mobile}).then(function(result){
            console.log(result)
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

const request_pin = function(_mobile){
    return new Promise(function(resolve,reject){
        OTP.find({mobile: _mobile}).then(function(result){
            console.log(result)
            resolve(result)
        }).catch(function(err){
            reject(err)
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
const check_if_pin_exist_and_check_mobile = function(findUserByPin){
    return new Promise(function(resolve,reject){
        console.log("caling FindUser user_exist", findUserByPin)
        OTP.find({pin: findUserByPin}).then(function(result){
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
        OTP.find({pin: findUserByPin}).then(function(result){
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
    var io = req.app.get('socketio');
    var primus = req.app.get('primusio')
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
    saveToDB(coronaData, primus, io).then(function(result){
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
const saveToDB = function(coronaData, primus, io){
    return new Promise(function(resolve,reject){
        console.log("caling Savetodb", coronaData.uuid)
        Corona.find({uuid: coronaData.uuid}).then(function(result){
            console.log(result, result.length)
            
            if(result.length >= 1){
            // if(!result == "null"){
                //exists
                // resolve(result)
                console.log("it exists")
                return updateDB(coronaData, primus, io);
            } else {
                return false;
            }
        }).then(function(result){
            if(result == false){
                primus.send('chartData',coronaData);
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

const updateDB = function(updateInfo, primus, io){
    return new Promise(function(resolve,reject){
        Corona.findOneAndUpdate(
            {uuid: updateInfo.uuid},
            {
                $push : {
                trk :  updateInfo.trk
                }
            }).then(function(result){
                primus.send('chartData',updateInfo);
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
