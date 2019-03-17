var s_port = 41234
var dgram = require('dgram')
var server = dgram.createSocket('udp4')

var n_addr = ''
var n_port = ''
var s_addr = ''
var s_port = ''

server.on('listening',()=>{
    var address = server.address()
    console.log('Server listening ' + address.address + ':' + address.port)
})

server.on('message',(msg, rinfo)=>{
    /*
    Type note
        Nxx = node to Server (x is number of node) example
            - N00 : node 0
            - N09 : node 9
            - N0A : node 10
            - NFF : node 255
        CLI = Client to Server
        SER = Server to Node

    console.log('server got a message from ' + rinfo.address + ':' + rinfo.port);
    console.log('ASCII: ' + msg);
    */
    if(msg[0]=="N"){
        n_addr = rinfo.address
        n_port = rinfo.port
        console.log('Node => Client : ' + msg)
        /*
        var ack = new Buffer(msg)
            server.send(ack, 0, ack.length, rinfo.port, rinfo.address, (err,bytes)=>{
        }) 
        */    
    }else if(msg.slice(0,3)=="CLI"){
        var ack = new Buffer(msg.slice(3))
            server.send(ack, 0, ack.length, n_port, n_addr, (err,bytes)=>{
                console.log('Client => node : ' + msg)
        })    
    }else if(msg.slice(0,3)=="SER"){
        /*
        var ack = new Buffer(msg)
            server.send(ack, 0, ack.length, rinfo.port, rinfo.address, (err,bytes)=>{
            console.log('sent back')
        })    
        */
    }
    
})

server.on('error',(err)=>{
    console.log('server error: \n' + err.stack)
    server.close()
})

server.on('close',()=>{
    console.log('Closed')
})

server.bind(s_port)