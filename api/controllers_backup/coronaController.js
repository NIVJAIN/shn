const mongoose = require("mongoose");
const Corona = require("../models/coronaModel");
const fs = require('fs')

exports.CORONA = (req,res,next)=>{
    var io = req.app.get('socketio');
    var primus = req.app.get('primusio')

    console.log(req.body.uuid)
   var _uuid = req.body.uuid;
   var _trk = {
       lat: req.body.lat,
       lng: req.body.lng
   }
   var _emailid = req.body.email;
   var _name = req.body.name
   const coronaData = new Corona({
        _id: new mongoose.Types.ObjectId(),
        uuid: _uuid,
        trk: _trk,
        timestamp: Date.now(),
        emailid: _emailid,
        name: _name

    });
    saveToDB(coronaData, primus, io).then(function(result){
        console.log(result)
        res.status(200).json({
            message : result
        })
    }).catch(function(err){
        res.status(500).json({
            err0r: err
        })
        console.log(err)
    })

}



exports.GETALLDATA = (req,res,next)=>{
    Corona.find().then(function(result){
        res.status(200).json({
            results: result
        })
    }).catch(function(err){
        res.status(500).json({
            message: err
        })
    })
}
const saveToDB = function(coronaData, primus, io){
    return new Promise(function(resolve,reject){
        console.log("caling Savetodb", coronaData.uuid)
        Corona.find({uuid: coronaData.uuid}).then(function(result){
            console.log(result, result.length)
            
            if(result.length >= 1){
            // if(!result == "null"){
                //exists
                // resolve(result)
                console.log("it exists")
                return updateDB(coronaData, primus, io);
            } else {
                return false;
            }
        }).then(function(result){
            if(result == false){
                primus.send('chartData',coronaData);
                // io.emit('chartData', coronaData)
                resolve(coronaData.save())
            } else {
                resolve(result)
            }
        }).catch(function(err){
            console.log(err);
            reject(err)
        })
    })
}

const updateDB = function(updateInfo, primus, io){
    return new Promise(function(resolve,reject){
        Corona.findOneAndUpdate(
            {uuid: updateInfo.uuid},
            {
                $push : {
                trk :  updateInfo.trk
                }
            }).then(function(result){
                primus.send('chartData',updateInfo);
                // io.emit('chartData', updateInfo)
                resolve(result)
            }).catch(function(err){
                reject(err)
            })
        })
}

// router.post("/", (req, res, next) => {
//     Product.findById(req.body.productId)
//       .then(product => {
//         if (!product) {
//           return res.status(404).json({
//             message: "Product not found"
//           });
//         }
//         const order = new Order({
//           _id: mongoose.Types.ObjectId(),
//           quantity: req.body.quantity,
//           product: req.body.productId
//         });
//         return order.save();
//       })
//       .then(result => {
//         console.log(result);
//         res.status(201).json({
//           message: "Order stored",
//           createdOrder: {
//             _id: result._id,
//             product: result.product,
//             quantity: result.quantity
//           },
//           request: {
//             type: "GET",
//             url: "http://localhost:3000/orders/" + result._id
//           }
//         });
//       })
//       .catch(err => {
//         console.log(err);
//         res.status(500).json({
//           error: err
//         });
//       });
//   });
// const saveData = function
// MyModel.findOneAndUpdate(
//     {foo: 'bar'}, // find a document with that filter
//     modelDoc, // document to insert when nothing was found
//     {upsert: true, new: true, runValidators: true}, // options
//     function (err, doc) { // callback
//         if (err) {
//             // handle error
//         } else {
//             // handle document
//         }
//     }
// );


const saveGeoData = function(coronaData){
    return new Promise(function(resolve,reject){
        coronaModel.findOneAndUpdate(
            {uuid: coronaData.uuid},
            coronaData,
            {upsert: true, new: true, runValidators: true}
            ).then(function(result){
                resolve(result)
            }).catch(function(err){
           console.log(err)
           reject("ErrorInSavingCoronaDataInMongoDB" + err)
       })
    })
}

const saveGeoData2 = function(coronaData){
    return new Promise(function(resolve,reject){
        coronaData.save().then(function(result){
           resolve(result)
       }).catch(function(err){
           console.log(err)
           reject("ErrorInSavingCoronaDataInMongoDB" + err)
       })
    })
}


 // var io = req.app.get('socketio');
    // var primus = req.app.get('primusio')
    // // console.log("dsd",primus)
    // primus.send("jain", {"jain": "kkk"})
    // primus.on('lufthansa', (data)=>{
    //     console.log("datafrom Lufthansa:::", data)
    // })
    // io.emit('messages', {"jain":"jain" + Date.now()})
    // res.status(200).json({
    //     message: "SuccessFromRoutesJSFolder:::" + Date.now()
    // })