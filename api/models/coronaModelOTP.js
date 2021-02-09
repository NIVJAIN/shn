const mongoose = require('mongoose');
const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // emailid: {type:String, required:false},
    // timestamp: {type:String, required:true},
    // name: {type:String, required:false},
    pin: {type:String, required:true,unique: true},
    mobile: {type:String, required:false},
    otp:  {type:String, required:false},
    ts: {type:String, required:false},
    otpexpiry: {type:String, required:false},
    loastart: {type:String, required:false},
    loaend: {type:String, required:false},
    devicetype: {type:String, required:false},
	expiry: {type:String, required:false} 
    // tries: {type:Int16Array, required:false}
},{ collection: 'otp' })
module.exports = mongoose.model('OTP', imageSchema)



// const mongoose = require('mongoose');
// const imageSchema = mongoose.Schema({
//     _id: mongoose.Schema.Types.ObjectId,
//     uuid: {type:String, required:true},
//     trk : { type : Array , "default" : [] }, 
//     timestamp: {type:String, required:true},
//     emailid: {type:String, required:true},
//     name: {type:String, required:true}

// },{ collection: 'novelmodel' })
// module.exports = mongoose.model('Corona', imageSchema)
