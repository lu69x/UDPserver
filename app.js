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
    if(msg.slice(0,1)=='N'){
        var ack0 = new Buffer(msg)
        server.send(ack0, 0, ack0.length, rinfo.port, rinfo.address, (err,bytes)=>{
                nodeObj.addr = rinfo.address
                nodeObj.port = rinfo.port
            console.log('Node => Server')
        })
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
