const mongoose = require('mongoose');
const imageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    today: {type:String, required:true, unique: true},
    scheduled: {
        morning: {type:String},
        afternoon: {type:String},
        evening: {type:String},
    },
},{ collection: 'biotimer' })
module.exports = mongoose.model('Biotimer', imageSchema)