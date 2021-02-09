
const jwt = require('jsonwebtoken')
const CONFIG = require('../../config/config')
module.exports = (req,res,next)=>{
    try {
	    if(req.headers.authorization !== undefined){
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token,CONFIG.JWT_SECRET);
        req.userData = decoded;
        next()
	}
	     else {
            return res.status(401).json({
                error: "Authfailed"
            })
        }

    } catch(err){
       console.log("Auth failed", err)
	    return res.status(401).json({
            error: "Authfailed"
        })
    } 
}
