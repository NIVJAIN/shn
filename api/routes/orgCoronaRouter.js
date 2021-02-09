const express = require('express')
const router = express.Router();
const routeController = require('../controllers/orgCoronaController');
const checkAuth = require('../middleware/check-auth')

router.post('/createorg', routeController.CREATE_ORGID)
router.get('/getorg', routeController.GET_ORGID)
router.post('/updatetiming', routeController.UPDATE_TIMING_PUSHNOTIFICATION)


module.exports = {router};