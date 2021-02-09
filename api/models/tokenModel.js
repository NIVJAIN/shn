const mongoose = require('mongoose');
const tokenSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  token: {type:String, required:true, unique: true},
},{ collection: 'tokens' });
module.exports = mongoose.model('Refreshtokens', tokenSchema)