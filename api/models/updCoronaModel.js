const mongoose = require('mongoose');
const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // emailid: {type:String, required:false},
    timestamp: {type:String, required:true},
    name: {type:String, required:false},
    pin: {type:String, required:false},
    trk : { type : Array , "default" : [] }, 

},{ collection: 'update' })
module.exports = mongoose.model('UPDATECorona', imageSchema)
