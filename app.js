var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var Feeds = require('./routes/Feeds');
var RSSs = require('./routes/RSSs');
var dashboard = require('./routes/dashboard')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/feed', Feeds.router);
app.use('/rss', RSSs.router);
app.use('/dashboard', dashboard.router);


module.exports = app;
