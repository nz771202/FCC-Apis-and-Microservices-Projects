// server.js
// where your node app starts

// init project
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});
const express = require('express');
const app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
const cors = require('cors');
app.use(cors({optionSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// Timestamp API
app.get("/api/timestamp/:date_string", function (req, res) {
  const d = new Date(req.params.date_string);
  if (d == 'Invalid Date') {
    res.json({error: d.toString()});
  } else {
    res.json({"unix": d.getTime(), "utc": d.toUTCString()});
  }
});

// Whoami API
app.get('/api/whoami', (req, res) => {
  res.json({
    ipaddress: req.ip,
    language: req.headers['accept-language'],
    software: req.headers['user-agent']
  });
});

// Url shortener API
app.use('/api/shorturl', require('./url-shortener').create());

// Exercise tracker API
app.use('/api/exercise', require('./exercise-tracker').create());

// File metadata API
app.use('/api/file_metadata', require('./file-metadata').create());

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
