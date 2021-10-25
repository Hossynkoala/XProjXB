var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var Feeds = require('./routes/Feeds');
var RSSs = require('./routes/RSSs');
var dashboard = require('./routes/dashboard')
var news = require('./routes/news')
const {MongoClient} = require("mongodb");

var CronJob = require('cron').CronJob;

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
app.use('/news', news.router);



module.exports = app;





const uri = "mongodb+srv://hossynkoala:85245685hHH!@xprojx.edi7r.mongodb.net/XProjX?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});



var job = new CronJob('* * * * * *',async function() {

  await (await client.connect()).db('fundamental').collection('data').insertOne({})

}, null, true, 'America/Los_Angeles');
job.start();