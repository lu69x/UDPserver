var s_port = 41234
var dgram = require('dgram')
var server = dgram.createSocket('udp4')

server.on('listening',()=>{
    var address = server.address()
    console.log('Server listening ' + address.address + ':' + address.port)
})

server.on('message',(msg, rinfo)=>{
    console.log('server got a message from ' + rinfo.address + ':' + rinfo.port);
    console.log('ASCII: ' + msg);
    var ack = new Buffer(msg)
    server.send(ack, 0, ack.length, '41234', '119.31.119.95', (err,bytes)=>{
        console.log('sent back')
    })    
})

server.on('error',(err)=>{
    console.log('server error: \n' + err.stack)
    server.close()
})

server.on('close',()=>{
    console.log('Closed.')
})

server.bind(s_port)