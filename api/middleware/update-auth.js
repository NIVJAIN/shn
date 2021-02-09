
const jwt = require('jsonwebtoken')
const CONFIG = require('../../config/config')
 UPDATE_JWT_VERIFICATION = (req,res,next)=>{
    try {
        if(req.headers.authorization !== undefined){
            const token = req.headers.authorization.split(" ")[1];
            console.log("UPDATE_JWT_VERIFICATION", req.headers.authorization)
            // console.log("TOTOTOTOTOTOTKEN==",token, CONFIG.JWT_SECRET)
            const decoded = jwt.verify(token,CONFIG.JWT_SECRET);
            console.log("decode===>",decoded)
            if(decoded.pin == req.body.pin){
                req.userData = decoded;
            } else {
                return res.status(401).json({
                    error: "Authfailed-2"
                })
            }  
            next()
        } else {
            return res.status(401).json({
                error: "Authfailed1"
            })
        }
    } catch(err){
        console.log("trycatch==>",err)
        return res.status(401).json({
            error: "Authfailed3"
        })
    } 
}

module.exports = {
    UPDATE_JWT_VERIFICATION: UPDATE_JWT_VERIFICATION
} 

