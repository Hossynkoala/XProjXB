var express = require('express');
var router = express.Router();
var DB = require('../DB/DB');


router.get('/', async function (req, res, next) {
    const Result = await DB.RecieveFeeds();

    res.send(Result);
});

router.post('/addfeed', async function (req, res, next) {

    const result = await DB.addFeed(req.body.Data);
    res.send(result).status(200);
});


module.exports = {router};
