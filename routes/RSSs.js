var express = require('express');
var router = express.Router();
var DB = require('../DB/DB');


router.get('/', async function (req, res, next) {

    const Result = await DB.RecieveRSS();

    res.send(Result).status(200);
});

router.post('/updatersss', async function (req, res, next) {

    const result = await DB.updatersss(req.body.Data);

    res.send(result).status(200);
});


module.exports = {router};
