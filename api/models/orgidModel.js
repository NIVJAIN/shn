const mongoose = require('mongoose');
const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    orgid: {type:String, required:true, unique: true},
    timestamp: {type:String, required:false},
    hrdate:  {type:String, required:false},
    pushtiming: {type:Number, required:false},
},{ collection: 'orgid' })
module.exports = mongoose.model('Orgid', imageSchema)