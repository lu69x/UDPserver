var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var a_port = 9000

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
    node:{type:String, required:true},
    addr:{type:String, required:true},
    port:{type:String, required:true},
    date:{type:String, required:true}
})

var connection = mongoose.model('routing', connectSchema)

//HTTP JSON
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

app.get('/getbynode/:node', (req,res)=>{
    connection.find({node:req.params.node}).then((docs)=>{
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

app.get('/dropbynode/:node', (req,res)=>{
    connection.deleteOne({node:req.params.node}).then((docs)=>{
        res.send(docs)
    }, (err)=>{
        res.send(err)
    })
})

app.listen(a_port, ()=>{
    console.log('Application listening 127.0.0.1: ' + a_port)
})

app.post('/post', (req,res)=>{
    let buffer = new connection({
        node:req.body.node,
        addr:req.body.addr,
        port:req.body.port,
        date:new Date().toLocaleString()
    })
    buffer.save().then((docs)=>{
        res.send(docs)        
    }, (err)=>{
        res.status(400).send(err)
    })
})

app.post('/updatenode', (req,res)=>{
    connection.deleteOne({node:req.body.node}).then((docs)=>{
        let buffer = new connection({
            node:req.body.node,
            addr:req.body.addr,
            port:req.body.port,
            date:new Date().toLocaleString()
        })
        buffer.save().then((docs)=>{
            res.send(docs)        
        })
    })
})

server.on('listening',()=>{
    var address = server.address()
    console.log('Server listening ' + address.address + ':' + address.port)
})


//UDP server
server.on('message',(msg, rinfo)=>{
    console.log('server got a message from ' + rinfo.address + ':' + rinfo.port);
    console.log('ASCII: ' + msg);
    if(msg.slice(0,1)=='N'){            //From node
        if(msg.slice(1,2)=='S'){
            connection.find({node:msg.slice(2,6)}).then((docs)=>{
                if(Object.keys(docs).length!=0){
                    connection.deleteOne({node:msg.slice(2,6)}).then((docs)=>{
                        let buffer = new connection({
                            node:msg.slice(2,6),
                            addr:rinfo.address,
                            port:rinfo.port,
                            date:new Date()
                        })
                        buffer.save().then((docs)=>{
                            res.send(docs)        
                        })
                    })
                }else{
                    let buffer = new connection({
                        node:msg.slice(2,6),
                        addr:rinfo.address,
                        port:rinfo.port,
                        date:new Date()
                    })
                    buffer.save().then((docs)=>{
                        console.log(docs)
                    },(err)=>{
                        console.log(err)
                    })
                }
            }, (err)=>{
                console.log(err)
            })
        }else if(msg.slice(1,2)=='C'){

        }
    }else if(msg.slice(0,1)=='C'){       //From client
        if(msg.slice(1,2)=='S'){

        }else if(msg.slice(1,2)=='N'){

        }
    }else if(msg.slice(0,1)=='S'){       //From server
        if(msg.slice(1,2)=='N'){

        }else if(msg.slice(1,2)=='C'){

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

function UDPsend(dir, msg, addr, port){
    var ack = new Buffer(msg)
    server.send(ack, 0, ack.length, port, address, (err,bytes)=>{
        console.log(dir)
    })
}