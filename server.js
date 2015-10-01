var morgan  = require('morgan');
var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io = require('socket.io')(server);
var Twit = require('twit');
var stream;

var twitter = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');

});

io.on('connect', function(socket) {
  console.log('attempt to logon')
  socket.on('updateTerm', function (searchTerm) {
    socket.emit('updatedTerm', searchTerm);

    // Start stream
    if (stream) {
      stream.stop();
    }

    stream = twitter.stream('statuses/filter', { track: searchTerm, language: 'en' });

    stream.on('tweet', function (tweet) {
      var data = {};
      data.name = tweet.user.name;
      data.screen_name = tweet.user.screen_name;
      data.text = tweet.text;
      data.user_profile_image = tweet.user.profile_image_url;
      socket.emit('tweets', data);
    });
  });
});	


server.listen(3000);
console.log('Server on port 3000');
