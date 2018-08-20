var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var axios = require('axios');
var Pusher = require('pusher');
var date = require('date-and-time');
const url = 'http://logistics-api.eu-4.evennode.com/graphql';
var reserves;

var pusher = new Pusher({
  appId: '435528',
  key: '5db59e0050361fadf97d',
  secret: 'e2c8529ae479b2a04a3e',
  cluster: 'ap2',
  encrypted: true
});

// pusher.trigger('qwerty', 'Reserve', {
//   "message": "hello world"
// });
setInterval(function() {
    axios.post(url,{
        query: `{ activeReserves { trailerid reserved lat long time truckid user status} }`
    }).then(response => {
        reserves = response.data.data.activeReserves;
        for (let i = 0; i < reserves.length; i++) {
            var date1 = new Date();
            var date2 = new Date(reserves[i].time);
            if(date.subtract(date2,date1).toMinutes() <= 30 )
            {
                if(date.subtract(date2,date1).toMinutes() <= 15 ) {
                    if(date.subtract(date2,date1).toMinutes() <= 5 ) {
                        pusher.trigger(reserves[i].user, 'Reserve', {
                            "message": "Reserve for trailer #"+reserves[i].trailerid+" expires in "+ date.subtract(date2,date1).toMinutes()
                        });
                    } else {
                        pusher.trigger(reserves[i].user, 'Reserve', {
                            "message": "Reserve for trailer #"+reserves[i].trailerid+" expires in "+ date.subtract(date2,date1).toMinutes()
                        });    
                    }
                } else {
                    pusher.trigger(reserves[i].user, 'Reserve', {
                    "message": "Reserve for trailer #"+reserves[i].trailerid+" expires in "+ date.subtract(date2,date1).toMinutes()
                    });
                }
            }
        }
    }).catch(e => {console.log(e)})
}, 5 * 60 * 1000);


io.on('connection', function(socket){ 
    // console.log(socket) 
        setInterval(function() {    
            //Sending an object when emmiting an event
            socket.emit('ping', { data: 'pinging!'});
        }, 2000);

        socket.on('reserve', function (data) {
            console.log(JSON.stringify(data))
            io.emit('updateTrailerState', data);
        })

});

server.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});