var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var axios = require('axios');
var Pusher = require('pusher');
var date = require('date-and-time');
const url = 'http://ben-logistics-api.eu-4.evennode.com/graphql';
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

io.on('connection', function(socket){ 
    // console.log(socket) 
        setInterval(function() {    
            //Sending an object when emmiting an event
            socket.emit('ping', { data: 'pinging!'});
        }, 2000);

        setInterval(function() {
            axios.post(url,{
                query: `{ activeReserves { trailerid reserved lat long time truckid user status} }`
            }).then(response => {
                reserves = response.data.data.activeReserves;
                axios.post(url,{
                  query: `{ currentTime { Curr }}`
                }).then(res => {
                  var date1 = new Date(res.data.data.currentTime.Curr);
                  for (let i = 0; i < reserves.length; i++) {   
                      var date2 = new Date(reserves[i].time);
                      if(date.subtract(date2,date1).toMinutes() <= 30 && date.subtract(date2,date1).toMinutes() > 0)
                      {
                          socket.emit(reserves[i].user, { message: "Reserve for trailer #"+reserves[i].trailerid+" expires in "+ date.subtract(date2,date1).toMinutes()})                                
                      } else
                      if(date.subtract(date2,date1).toMinutes() <= 0) {
                          axios.post(url,{
                              query: `mutation{ freezeReserve(trailerid:`+ reserves[i].trailerid +`, user:"` + reserves[i].user + `") { trailerid user} }`
                          }).then(response => {
                              console.log("TRailer with ID " + reserves[i].trailerid + " has been freezed!")
                          }).catch(e => {
                              console.log(e)
                          })
                      }
                  }
                })
            }).catch(e => {console.log(e)})
        }, 5 * 60 * 1000);

        socket.on('reserve', function (data) {
            console.log(JSON.stringify(data))
            io.emit('updateTrailerState', data);
        })

});

server.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});