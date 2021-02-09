const express = require('express')
const router = express.Router();
const routeController = require('../controllers/coronaController');

router.post('/corona', routeController.CORONA)

router.get('/getall', routeController.GETALLDATA)

router.post('/update', routeController.UPDATE_MONGODB)

router.get('/getupdateddata', routeController.GET_UPDATED_DATA)
// router.post('/dsfasd', function(req,res){
//   const jain = req.body.name;
// })
module.exports = {router};
