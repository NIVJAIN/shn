const express = require('express')
const router = express.Router();
const routeController = require('../controllers/userCoronaController');
const checkAuth = require('../middleware/check-auth')

router.post('/adminsignup', routeController.ADMIN_SIGNUP)
router.post('/adminlogin', routeController.ADMIN_LOGIN)
router.post('/token', routeController.REFRESH_TOKEN)
router.post('/logout', routeController.LOGOUT)

module.exports = {router};