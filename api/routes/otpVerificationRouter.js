const express = require('express')
const router = express.Router();
const routeController = require('../controllers/otpVerificationController');
const checkAuth = require('../middleware/check-auth')
const validateController = require('../controllers/otpValidation')


// server endpoint is /otp/userexist


router.post('/login', routeController.LOGIN)
router.post('/register', routeController.REGISTER_FOR_LOGIN)
// router.post('/userexist', routeController.USER_EXIST)
router.post('/requestotp', routeController.REQUEST_OTP2)
router.post('/verifyotp', routeController.VERIFY_OTP)

router.post('/genjwt',routeController.GEN_JWT)
router.post('/refreshtoken', routeController.REFRESH_TOKEN)
router.post('/deleterefreshtoken', routeController.DELETE_REFRESH_TOKEN)
router.post('/jwt', checkAuth,routeController.JWT_TESTING)

router.post('/setbioconfig', routeController.SET_BIO_CONFIG)
router.get('/getbioconfig', routeController.GET_BIO_CONFIG)
router.get('/getbio/:date', routeController.GET_BIO_TIMER)
//router.post('/changeinconfig', routeController.CHANGE_IN_CONFIG)
router.post('/changeinconfig', validateController.validate('CHANGE_IN_CONFIG') ,routeController.CHANGE_IN_CONFIG)

router.get('/getjain/:id',checkAuth, routeController.GET_JAIN)
//generate pins max 20

//get query&params in express
//etc. example.com/user/000000?sex=female
// app.get('/user/:id', function(req, res) {
//     const query = req.query;// query = {sex:"female"}
//     const params = req.params; //params = {id:"000000"}
//  })

//generate pins max 20

//router.get('/genpins/:quantity', routeController.GENERATE_PINS_MAX20)
router.get('/genpins/:quantity/:orgid', routeController.GENERATE_PINS_MAX20_ORGID)
router.post('/setfloatingpins', validateController.validate('ASSIGN_FLOATING_PINS'), routeController.ASSIGN_FLOATING_PINS)
router.post('/bulkassignandbroadcastsms',checkAuth, validateController.validate('BULK_ASSIGN_FOR_FLOATINGPINS_AND_BROADCAST_SMS'), routeController.BULK_ASSIGN_FOR_FLOATINGPINS_AND_BROADCAST_SMS)
router.post('/setappurls',validateController.validate('SET_APP_URLS') , routeController.SET_APP_URLS)
router.post('/batchsms', validateController.validate('BATCH_SMS_PIN'), routeController.BATCH_SMS_PIN)


//router.post('/setfloatingpins', routeController.ASSIGN_FLOATING_PINS)


//our backdoor
router.post('/createuser', routeController.CREATE_USER_MOBILE_PIN)
router.post('/createuserbypin', routeController.CREATE_USER_BYPIN);
router.post('/verifyuserbypinmobile', routeController.VERIFY_USER_BY_PIN_MOBILE);
router.post('/requestpin', routeController.REQUEST_PIN);

router.get('/getallotp', routeController.GETALL_DATA)
router.get('/getonlyotppin/:pin', routeController.GETALLDATA_BY_PIN)
//backdoor end


router.post('/dum', routeController.dum);



// router.get('/getall', routeController.GETALLDATA)

// router.post('/update', routeController.UPDATE_MONGODB)

// router.get('/getupdateddata', routeController.GET_UPDATED_DATA)
module.exports = {router};
