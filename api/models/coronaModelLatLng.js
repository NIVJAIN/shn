const mongoose = require('mongoose');
const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // emailid: {type:String, required:false},
    timestamp: {type:String, required:true},
    name: {type:String, required:false},
    pin: {type:String, required:true},
    mobile: {type:String, required:false},
    temp: {type:String, required:false},
    symptoms: {type:String, required:false},
    trk : { type : Array , "default" : [] }, 
    initlat: {type:String, required:false},
    initlng: {type:String, required:false},
    loastart : {type:String, required:false},
    loaend: {type:String, required:false},
    //address:{type:String, required:false}
    pcode: {type:String, required:false}

},{ collection: 'novelmodel' })
module.exports = mongoose.model('XCorona', imageSchema)



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