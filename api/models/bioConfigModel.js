const mongoose = require('mongoose');
const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required:true, unique:false},
    today: {type:String, required:false},
    timings: {
        morStart: {type:Number},
        morEnd: {type:Number},
        aftStart: {type:Number},
        aftEnd: {type:Number},
        eveStart: {type:Number},
        eveEnd: {type:Number},
    }
},{ collection: 'bioconfig' })
module.exports = mongoose.model('Bioconfig', imageSchema)