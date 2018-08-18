var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function(socket){ 
    // console.log(socket) 
        setInterval(function() {
            //Sending an object when emmiting an event
            socket.emit('ping', { data: 'pinging!'});
        }, 2000);

        socket.on('reserve', function (data) {
            socket.emit('updateTrailerState', { trailerid: data.trailerid, state: data.state });
        })

});

server.listen(8443, function () {
    console.log('Example app listening on port 8443!');
});