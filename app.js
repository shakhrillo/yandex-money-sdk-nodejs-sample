var express = require('express');
require("long-stack-traces");
var bodyParser = require('body-parser');
var swig = require('swig');
var app = express();
var utils = require('./utils.js');
var ym = require('yandex-money-sdk');
var constants = require("./constants");
var session = require('express-session');
var morgan = require("morgan");


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret: "super secret key", resave: true, saveUninitialized: true}));
app.use(morgan('dev'));

swig.setDefaults({ loader: swig.loaders.fs(__dirname + '/views' )});


app.get('/', function(req, res){
  var result = utils.render('index.html');
  res.send(result);
});

app.post('/obtain-token/', function(req, res) {
  var scope = req.body.scope;
  var url = ym.Wallet.buildObtainTokenUrl(
    constants.CLIENT_ID,
    constants.REDIRECT_URI,
    scope.split(' ')
  );
  res.redirect(url);
});


require('./controllers/wallet')('', app); 
require('./controllers/external')('', app); 

app.use(function(err, req, res, next) {
  var template = utils.render("error.html", {
    text: JSON.stringify(err.err, undefined, 2),
    home: err.home
  });
  res.send(template);
});

app.listen(3000, function () {
  console.log("Server is started at 3000 port");
});
