var express=require('express')
var bodyParser = require('body-parser')
var app = express()
var http =require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
 
var dBUrl ='mongodb://user:user@ds125628.mlab.com:25628/learning-node-message'

var Message = mongoose.model('Message',{
name:String,
message:String}
)

app.get('/messages',(req,res) => {
Message.find({},(err,messages)=>{
    res.send(messages)
    }) 
})
 
app.post('/messages',async (req, res) => {

    try {
    
        var message = new Message(req.body)

        var myVar=message.name;
        if (typeof myVar != "undefined")
        { 
       var sendmessage = await message.save()
            console.log('saved')
            var censored = await Message.findOne({message: 'badword'})
    
            if(censored) { 
                await Message.remove({_id: censored.id})
            }
            io.emit('message', req.body)
            res.sendStatus(200) 
        }
        
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally{
        console.log('message post called')
    }

})

io.on('connection', (socket) => {
    console.log('a user connected')
})

// mongoose.connect(dBUrl, { useMongoClient : true },(err)=>{
// console.log('mongoose DB connecte',err)
// })

mongoose.connect(dBUrl, {
    socketTimeoutMS: 0,
    keepAlive: true,
    reconnectTries: 30
  });

var server = http.listen(3000,()=>{
console.log('Server is listening on port',server.address().port)
}) 