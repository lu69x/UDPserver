var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var a_port = 41235

var dgram = require('dgram')
var server = dgram.createSocket('udp4')
var s_port = 41234

var app = express()
app.use(bodyParser.json())
var Schema = mongoose.Schema
mongoose.Promise = global.Promise

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Mydb').then(()=>{
  console.log('@@@ Connect Success @@@')
}, ()=>{
  console.log('!!! Fail to connect !!!')
})

var connectSchema = new Schema({
    data:{type:String, required:true},
    addr:{type:String, required:true},
    port:{type:String, required:true}
})

var connection = mongoose.model('routing', connectSchema)

//HTTP JSON
app.post('/post', (req,res)=>{
    let data = new connection({
        data:req.body.data,
        addr:req.body.addr,
        port:req.body.port
    })
    data.save().then((docs)=>{
        res.send(docs)        
    }, (err)=>{
        res.status(400).send(err)
    })
})

app.get('/', (req,res)=>{
    res.send('WU Lighting control')
})

app.get('/getall',(req,res)=>{
    connection.find().then((docs)=>{
        res.send(docs)        
    }, (err)=>{
        res.status(400).send(err)
    })
})

app.get('/getbydata/:data', (req,res)=>{
    connection.find({data:req.params.data}).then((docs)=>{
        res.send(docs)
    }, (err)=>{
        res.send(err)
    })
})

app.get('/dropall', (req,res)=>{
    connection.remove().then((docs)=>{
        res.send(docs)
    }, (err)=>{
        res.send(err)
    })
})

app.get('/dropbydata/:data', (req,res)=>{
    connection.deleteOne({data:req.params.data}).then((docs)=>{
        res.send(docs)
    }, (err)=>{
        res.send(err)
    })
})

app.listen(a_port, ()=>{
    console.log('Application listening 127.0.0.1: ' + a_port)
})



server.on('listening',()=>{
    var address = server.address()
    console.log('Server listening ' + address.address + ':' + address.port)
})


//UDP server
server.on('message',(msg, rinfo)=>{
    console.log('server got a message from ' + rinfo.address + ':' + rinfo.port);
    console.log('ASCII: ' + msg);

    let json = {
        data:msg.toString('utf-8'),
        addr:rinfo.address,
        port:rinfo.port
    }

    if(msg.slice(0,1)=='N'){
        connection.find({data:json.data}).then((docs)=>{
            if(Object.keys(docs).length != 0){
                connection.updateOne({str:data}, json,(err, res)=>{
                    console.log(str)
                })
            }else{
                let data = new connection(json)
                data.save().then((docs)=>{}, (err)=>{})
            }
        }, (err)=>{
        })
        var ack = new Buffer('S00')
            server.send(ack, 0, ack.length, rinfo.port, rinfo.address, (err,bytes)=>{
                console.log('Server => Node : ' + ack)
            })
    }
    else if(msg.slice(0,1)=='C'){
        if(json.data.length > 3){
            connection.find({data:node}).then((docs)=>{
                if(Object.keys(docs).length != 0){
                    var ack = new Buffer(json.data)
                    server.send(ack, 0, ack.length, json.port, json.address, (err,bytes)=>{
                        console.log('Client => Node : ' + ack)
                    })
                }
            }, (err)=>{})
        }
    }
})

server.on('error',(err)=>{
    console.log('server error: \n' + err.stack)
    server.close()
})

server.on('close',()=>{
    console.log('Closed.')
})

server.bind(s_port)
