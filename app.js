var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var session = require('express-session');
var upload = multer({ dest: './uploads' });

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
// var app = require('express')();
// var server2 = require('http').Server(app);
// var server = require('socket.io')(server2);

global.db_handle = require('./database/db_handle');
global.db = mongoose.connect("mongodb://localhost:27017/nodedb");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine("html",require("ejs").renderFile); //help ejs recognize .html files
// app.set('view engine', 'ejs');
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(multer());

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'secret',
    cookie:{ 
        maxAge: 1000*60*60  //1 hour
    }
}));

app.use('/', routes);
app.use('/users', users);
app.use('login',routes);
app.use('/home',routes);
app.use('/logout',routes);

app.use(function(req, res, next){ 
    res.locals.user = req.session.user;   // get user from session
    var err = req.session.error;
    delete req.session.error;
    res.locals.message = "";
    if(err){ 
        res.locals.message = '<div class="alert alert-danger" style="margin-bottom:15px; color:red;">'+err+'</div>';
    }
    next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
