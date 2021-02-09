const mongoose = require('mongoose');
const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    config: {type:String, required:false},
    maxdist: {type:Number, required:false},
    mindist: {type:Number, required:false},
    maxalt: {type:Number, required:false},
    minalt: {type:Number, required:false},
    updfreq: {type:Number, required:false},
    maxvltn: {type:Number, required:false},   
    otpexpiry: {type:Number, required:false},  
    otpireq: {type:Number, required:false},  
    otpmaxtry: {type:Number, required:false},  
    otptout: {type:Number, required:false},
    osurl:  {type:String, required:false},
    androidurl: {type:String, required:false}, 
    // tries: {type:Int16Array, required:false}
},{ collection: 'config' })
module.exports = mongoose.model('Config', imageSchema)



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
