const mongoose = require("mongoose");
const winston = require('../../config/winston')
const fs = require('fs')
var rp = require('request-promise')
var moment = require('moment-timezone');
var _MOMENT = require('moment')
var _CONFIG = require('../../config/config')
const bcrypt = require('bcryptjs')
const User = require('../models/user-model');
const jwt = require('jsonwebtoken')
var RefreshTokens = require('../models/tokenModel')

exports.ADMIN_SIGNUP = (req,res,next)=>{
    var _email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2
    var _orgid = req.body.orgid;
    let errors = []; 
    console.log("kafdsfsfsdafsdfsd")
    if (!_email || !password || !password2 || !_orgid) {
        errors.push({ msg: 'Please enter all fields' });
    }
    if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
    }
    if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
    }
    if (errors.length > 0) {
       return res.status(500).json({
           error: errors
       })
    }
    User.find({email:_email})
    .exec()
    .then(user=>{
        // console.log('user', user)
        if(user.length >=1){
            return res.status(409).json({
                message: 'Mail exists'
            })
        } else {
            bcrypt.hash(password,10,function(err, hash){
                if(err){
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const user = new User({
                        _id: mongoose.Types.ObjectId(),
                        email: _email,
                        password: hash,
                        orgid: _orgid
                    });
                    user.save()
                    .then((result)=>{
                        return res.status(201).json({
                            message: "User Created"
                        })
                    })
                    .catch((err)=>{
                        return res.status(500).json({
                            error: err
                        })
                    })
                } 
            })
        }
    })
    .catch(err=>{
        return res.status(500).json({
            error: err
        })
    })
}

exports.ADMIN_LOGIN = (req,res,next)=>{
    const {orgid, email, password } = req.body;
    let errors = [];
  
    if (!orgid || !email || !password) {
      errors.push({ msg: 'Please enter all fields' });
    }
    if (errors.length > 0) {
        return res.status(500).json({
            error: errors
        })
    }
    User.findOne({email:email, orgid:orgid})
    .exec()
    .then(resultams=>{
        console.log("asmin", resultams)
        if(resultams === null){
            return res.status(404).json({
                message : 'Auth failed Nahi'
            })
        }
        bcrypt.compare(password,resultams.password,(err,result)=>{
            console.log(err, result)
            if(err){
                return res.status(401).json({
                    message: 'Auth failed'
                })
            }
            if(result){
                var token = jwt.sign({
                    email: email,
                    orgid: orgid
                }, _CONFIG.JWT_SECRET,
                {
                    expiresIn: "1h"
                })
                var refresh_token = jwt.sign({
                    email: email,
                    orgid: orgid
                }, _CONFIG.JWT_REFRESHTOKEN_SECRET)
                var updateResults =  update_Refresh_TokenInDB(refresh_token);
                return res.status(200).json({
                    message: "Auth successfull",
                    token: token,
                    refreshToken: refresh_token
                })
            }
            return res.status(401).json({
                message: 'Auth lfailed'
            })
        }) 
    })
    .catch(err=>{
        return res.status(500).json({
            error: err
        })
    })
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
        jwt.verify(refreshToken, _CONFIG.JWT_REFRESHTOKEN_SECRET, (err, user) => {
          if (err) return res.sendStatus(403)
          const accessToken = generateAccessToken({email:user.email,orgid:user.orgid})
          res.json({ accessToken: accessToken })
        })
      }
    })
}

exports.LOGOUT = async(req, res) => {
    // refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    // delete refreshToken in mongoDB
    var deleteResult = await delete_Refresh_Tokens_InDB(req.body.refreshToken)
    res.sendStatus(204)
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
    return jwt.sign(user, _CONFIG.JWT_SECRET, { expiresIn: '70s' })
  }
















// exports.ADMIN_LOGIN_NOTINUSE = (req,res,next)=>{
//     const {orgid, email, password } = req.body;
//     let errors = [];
  
//     if (!orgid || !email || !password) {
//       errors.push({ msg: 'Please enter all fields' });
//     }
//     if (errors.length > 0) {
//         return res.status(500).json({
//             error: errors
//         })
//     }
//     User.findOne({email:email, orgid:orgid})
//     .exec()
//     .then(resultams=>{
//         console.log("asmin", resultams)
//         if(resultams === null){
//             return res.status(404).json({
//                 message : 'Auth failed Nahi'
//             })
//         }
//         bcrypt.compare(password,resultams.password,(err,result)=>{
//             console.log(err, result)
//             if(err){
//                 return res.status(401).json({
//                     message: 'Auth failed'
//                 })
//             }
//             if(result){
//                 var token = jwt.sign({
//                     email: email,
//                     orgid: orgid
//                 }, _CONFIG.JWT_SECRET,
//                 {
//                     expiresIn: "999h"
//                 })
//                 return res.status(200).json({
//                     message: "Auth successfull",
//                     token: token
//                 })
//             }
//             return res.status(401).json({
//                 message: 'Auth lfailed'
//             })
//         }) 
//     })
//     .catch(err=>{
//         return res.status(500).json({
//             error: err
//         })
//     })

// }

