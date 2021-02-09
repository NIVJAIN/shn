const express = require('express')
const router = express.Router();
const routeController = require('../controllers/kafkaCoronaController');
const checkAuth = require('../middleware/check-auth')
const authVerif = require('../middleware/update-auth')
const validateChecker = require('../controllers/kafkaCoronaValidation');

//http://localhost:4200/novel/register
//https://lufthansadsl.tk/virusrip/novel/register
//locationreport.gov.sg/novel/register ->pending verification
router.post('/register', routeController.REGISTER)


//http://localhost:4200/novel/updatepcode

router.post('/updatepcode',checkAuth, routeController.PCODE_UPDATE_BY_PIN)
router.post('/updatemyloc', routeController.UPDATE_MY_LOC)

//http://localhost:4200/novel/update
//https://lufthansadsl.tk/virusrip/novel/update
// router.post('/update',checkAuth,routeController.UPDATE_INFO)
router.post('/update', authVerif.UPDATE_JWT_VERIFICATION, routeController.UPDATE_INFO)

router.post('/updatetoken', checkAuth,routeController.UPDATE_TOKEN)
router.get('/gettoken/:pin', routeController.GET_TOKEN_2)
router.get('/token/:mobile', routeController.GET_TOKEN_MOBILE)

//QLIKVIEW
//QLIKSENSE
router.get('/getallpins/:days', routeController.GET_DATA_BY_DAYS)
router.get('/get/:days', routeController.GET_DATA_BY_DAYS_BIO_PUSH_UPDATE)
router.get('/get/:days/:orgid',checkAuth, routeController.ORGID_GET_DATA_BY_DAYS_BIO_PUSH_UPDATE_ORGID)

//router.get('/get/:days/:orgid',routeController.ORGID_GET_DATA_BY_DAYS_BIO_PUSH_UPDATE_ORGID)

router.get('/get/:days/:orgid/:pin', routeController.PIN_GET_DATA_BY_DAYS_BIO_PUSH_UPDATE_ORGID)
//QLIK GET DISTINC ORGANIZATION ID's
router.get('/orgids', routeController.DISTINC_ORGIDS)
router.get('/pins',routeController.DISTINC_PINS )
router.get('/pins/:orgid',routeController.DISTINC_PINS_ORGID )

router.get('/onlypins', routeController.GET_PINS_WITHOUT_TRK)
//router.get('/otppins', routeController.OTP_PINS_WITHOUT_OTP)

router.get('/floatingpins', routeController.GET_FLOATING_PINS)
router.get('/floatingpins/:orgid', routeController.ORGID_GET_FLOATING_PINS)

//decommissioned
//http://localhost:4200/novel/getlatlng
//https://lufthansadsl.tk/virusrip/novel/getlatlng
// router.post('/getlatlng', routeController.GET_LAT_LNG_BY_POSTALCODE)
// router.post('/updateconfig', routeController.UPDATE_CONFIG)
router.get('/config', routeController.CONFIG_GET)
router.post('/config', routeController.CONFIG_GET_VIA_POST)
//http://localhost:4200/novel/push
//https://lufthansadsl.tk/virusrip/novel/push
router.get('/push', routeController.GET_ALL_FOR_PUSHNOTIFICATION)
router.get('/push/:orgid', routeController.ORGID_GET_ALL_FOR_PUSHNOTIFICATION)
router.get('/biopins', routeController.GET_ALL_PINS_FOR_BIOMETRIC)
router.get('/biopins/:orgid', routeController.ORGID_BIOPINS_GET_ALL_PINS_FOR_BIOMETRIC)

router.post('/bioupdate', routeController.BIO_UPDATE)
router.post('/updatechallenge', checkAuth,routeController.UPDATE_CHALLENGE)
router.get('/getallsuspendedpins/:bool', routeController.BOOL_SUSPENDED_PINS_GET_ALL)
router.get('/getallsuspendedpins/:bool/:orgid', routeController.BOOL_ORGID_SUSPENDED_PINS_GET_ALL)

//router.post('/suspension', routeController.IS_SUSPENDED)
router.post('/suspension', routeController.IS_SUSPENDED_PUSH)
router.post('/multilogin', routeController.MULTI_LOGIN)
router.post('/change', routeController.CHANGE_EXPIRTYDATE)
//router.post('/changeenddate', routeController.CHANGE_EXPIRTYDATE)
router.post('/changeenddate', routeController.CHANGE_END_DATE)
router.post('/changestartdate', routeController.CHANGE_START_DATE)
router.post('/changeorgid', routeController.ORGID_CHANGE_OR_SET)
router.post('/changeconfig', routeController.CHANGE_CONFIG_RAKESH)

// router.post('/corona', routeController.CORONA)
router.get('/getall', routeController.GETALLDATA)
router.get('/getall/:pin', routeController.GETALLDATA_BYPIN)
//router.get('/getall/:mobile', routeController.GETALLDATA_BY_MOBILE)
router.get('/getallmobile/:mobile', routeController.GETALLDATA_BY_MOBILE)
router.get('/getallpins', routeController.GET_ALL_PINS)

router.get('/getallpins/:days', routeController.GET_DATA_BY_DAYS)
// example.com/user/000000?sex=female
//https://localhost:4200/novel/2?pin=JAIN
//router.get('/gettrk/:days', routeController.PIN_QUERY_GET_DATA_BY_DAYS)
router.get('/gettrk/:days/:pin', routeController.PIN_QUERY_GET_DATA_BY_DAYS)

// router.post('/update', routeController.UPDATE_MONGODB)
router.get('/getupdateddata', routeController.GET_UPDATED_DATA)
router.get('/getbyorg/:orgid', routeController.ORG_ID_GET_ALL_PINS)
router.get('/getallpins/:days/:orgid', routeController.GET_DATA_BY_DAYS_BY_ORGID)
router.get('/getallpins/:days/:orgid/:pin', routeController.GET_DATA_BY_DAYS_BY_ORGID_PIN)
//CHEE CHENG WILL POST DATA TO BELOW ENDPOINT
router.post('/maxdist', routeController.UPDATE_MAX_DIST)
router.post('/showtemperature', routeController.UPDATE_WELLNESS_TRUEORFALSE);
//router.post('/showtemperature', routeController.UPDATE_WELLNESS_TRUEORFALSE);
//router.post('/adminpush', routeController.ADMIN_SEND_PUSHNOTIFICATION)
router.post('/adminpush',validateChecker.ADMIN_SEND_PUSHNOTIFICATION(),routeController.ADMIN_SEND_PUSHNOTIFICATION)


//https://lufthansadsl.tk/virusrip/novel/ed-biometric/61RG61VH?bool=false
// http://localhost:4200/novel/ed-biometric/JAIN?bool=false
router.post('/ed-biometric/:pin', routeController.BY_PIN_ENABLE_DISABLE_BIOMETRIC )
//   const bool = req.query.bool; // query = {sex:"female"}
//    const orgid = req.params.orgid //params = {id:"000000"}
//https://lufthansadsl.tk/virusrip/novel/ed-biometric/61RG61VH?bool=false
// http://localhost:4200/novel/ed-biometric/IMDA?bool=false
router.post('/ed-biometricorg/:orgid', routeController.BYORGID_ALLPINS_ENABLE_DISABLE_BIOMETRIC)
//https://lufthansadsl.tk/virusrip/novel/getbiometric/IMDA
// http://localhost:4200/novel/getbiometric/IMDA
router.get('/getbiometric/:orgid', routeController.GET_BIOMETRIC_VIA_ORGID)
router.post('/frsm', routeController.FACIAL_RECOGNITION)
router.post('/dynamicpush', routeController.DYNAMIC_PUSH_NOTIFICATION)
router.post('/ping', routeController.PING_PUSH_NOTIFICATION)


router.post('/globalchange', routeController.GLOBAL_CHANGE)
module.exports = {router};














//http://localhost:4200/novel/updatepcode
// {
//     "pin": "pinH",
//     "pcode": "313138"
// }

// {
//     "error": {
//         "status": 2,
//         "desc": "invalid pin"
//     }
// }

// {
//     "error": {
//         "status": 2,
//         "desc": "invalid pcode"
//     }
// }

//http://localhost:4200/novel/update
//https://lufthansadsl.tk/virusrip/novel/update
// {
// 	"pin": "pin123",
//     "pf": "pass",
//     "dist": "50.00",
//     "temp": "36.7",
//     "symptoms": "running nose"
// }

// {
//     "message": {
//         "trk": [
//             {
//                 "pf": "pass",
//                 "ts": 1582602027082,
//                 "dist": "50.00",
//                 "temp": "36.7",
//                 "symptoms": "running nose"
//             },
//             {
//                 "pf": "fail",
//                 "ts": 1582602040820,
//                 "dist": "50.00",
//                 "temp": "36.7",
//                 "symptoms": "running nose"
//             },
//             {
//                 "pf": "fail",
//                 "ts": 1582602205603,
//                 "dist": "50.00",
//                 "temp": "36.7",
//                 "symptoms": "running nose"
//             }
//         ],
//         "_id": "5e53e081944a6b21fe84a491",
//         "pin": "pin123",
//         "mobile": "6581397860",
//         "loastart": "25-05-2020",
//         "loaend": "26-05-2020",
//         "timestamp": "1582555265174",
//         "__v": 0,
//         "initlat": "1.3362641370000001",
//         "initlng": "103.8449074",
//         "pcode": "313138"
//     }
// }

// {
//     "error": {
//         "status": 2,
//         "desc": "invalid pin"
//     }
// }


//http://localhost:4200/novel/register
// {
//     "pin": "pinA",
//     "mobile": "6581397860",
//     "loastart": "25-05-2020",
//     "loaend": "26-05-2020",
//     "devicetype": "iphone",
//     "expiry": "false",
//     "timestamp": "154321000"
// }
// {
//     "message": {
//         "trk": [],
//         "_id": "5e53f076946752570d6b97d3",
//         "pin": "pinI",
//         "mobile": "6581397860",
//         "loastart": "25/02/2020",
//         "loaend": "26/02/2020",
//         "hrloastart": "1582560000000",
//         "hrloaend": "1582646400000",
//         "devicetype": "iphone",
//         "expiry": "false",
//         "timestamp": "1582559350363",
//         "__v": 0
//     }
// }

//http://localhost:4200/novel/getlatlng
// {
//     "pin": "pin123",
//     "pcode": "313138"
// }
// {
//     "message": {
//         "trk": [],
//         "_id": "5e53e081944a6b21fe84a491",
//         "pin": "pin123",
//         "mobile": "6581397860",
//         "loastart": "25-05-2020",
//         "loaend": "26-05-2020",
//         "timestamp": "1582555265174",
//         "__v": 0,
//         "initlat": "1.3362641370000001",
//         "initlng": "103.8449074"
//     }
// }

//http://localhost:4200/novel/updatepcode
//https://lufthansadsl.tk/virusrip/novel/updatepcode
//locationreport.gov.sg/novel/updatepcode ->pending verification
// {
//     "pin": "pinH",
//     "pcode": "313138"
// }



// {
// "name": "Jain", 
// "mobile": "81397860",
// "uuid": "794acdf1-77d1-4ef1-a963-fa58db8e7928"
// "lat": undefined
// "lng": undefined
// "name": "Sripal Jain"
// "mobile": "81397860"
// "pcode": "313138"
// "timestamp": 1581579139198
// }
