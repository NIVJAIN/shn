exports.JAIN = (req,res,next)=>{
    var io = req.app.get('socketio');
    var primus = req.app.get('primusio')
    // console.log("dsd",primus)
    primus.send("jain", {"jain": "kkk"})
    primus.on('lufthansa', (data)=>{
        console.log("datafrom Lufthansa:::", data)
    })
    io.emit('messages', {"jain":"jain" + Date.now()})
    res.status(200).json({
        message: "SuccessFromRoutesJSFolder:::" + Date.now()
    })
}