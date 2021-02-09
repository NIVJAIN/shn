const express = require('express')
const router = express.Router();
const smsRouteController = require('../controllers/messageController');

router.post('/sms', smsRouteController.SEND_SMS)

module.exports = {router};

