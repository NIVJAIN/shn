const express = require('express')
const router = express.Router();
const routeController = require('../controllers/routeController');

router.get('/jain', routeController.JAIN)

module.exports = {router};


// // WITHOUT controller
// router.get('/jain', (req,res,next)=>{
//     var io = req.app.get('socketio');
//     io.emit('messages', {"jain":"jain" + Date.now()})
//     res.status(200).json({
//         message: "SuccessFromRoutesJSFolder:::" + Date.now()
//     })
// });