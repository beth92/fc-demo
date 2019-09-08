const express = require('express');
const http = require('http');

const socketIO = require('socket.io');
//Include PubNub JavaScript SDK
const PubNub = require('pubnub');

const path = require('path');

const app = express();
const server = new http.Server(app);

//creates a new socket.io instance attached to the http server.
const io = socketIO(server);

//Provide the absolute path to the dist directory.
app.use(express.static(path.resolve( './dist')));

//On get request send 'index.html' page as a response.
app.get('/', function(req, res) {
  res.sendfile('index.html');
});

//Whenever someone connects this gets executed
io.on('connection', function (socket) {
  //Instantiate a new Pubnub instance along with the subscribeKey
  const pubNub = new PubNub({
    subscribeKey : 'sub-c-4377ab04-f100-11e3-bffd-02ee2ddab7fe'
  });
  // adding listener to pubnub
  pubNub.addListener({
    message: function(data) {
      // checking whether the data contains info for the ‘Apple’ category or not
      if(data.message.symbol === 'Apple'){
        // Creates a new date object from the specified message.timestamp
        const ts = new Date(data.message.timestamp);
        // Converting the timestamp into a desired format. HH:MM:SS:MS
        const formatted =  (ts.getHours()) + ':' + (ts.getMinutes()) + ':' + (ts.getSeconds()) + ':' + (ts.getMilliseconds());
        if (data.message['order_quantity']) {
          socket.emit('news', {"label": formatted, "value": data.message['order_quantity']});
        }
      }
    }
  });
  console.log("Subscribing...");
  //Subscribe the PubNub channel
  pubNub.subscribe({
    channels: ['pubnub-market-orders']
  });
});
//server listening on port 3000
server.listen(3000, function() {
  console.log('listening on *:3000');
});
