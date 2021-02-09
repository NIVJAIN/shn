const {body, query, param,check } = require("express-validator")

exports.ADMIN_SEND_PUSHNOTIFICATION = function(){
    //console.log('afadsfadsfsaf')
    return [ 
        body('pins.*').exists().isUppercase().withMessage("Must Be UpperCase").notEmpty()
        // body('quantity', 'Must be a number and shouldnotbe empty').isInt().exists().notEmpty(),
    ]
}






