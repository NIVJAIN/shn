const mongoose = require('mongoose');
const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    uuid: {type:String, required:true},
    trk : { type : Array , "default" : [] }, 
    timestamp: {type:String, required:true},
    emailid: {type:String, required:true},
    name: {type:String, required:true}

},{ collection: 'novelmodel' })
module.exports = mongoose.model('Corona', imageSchema)