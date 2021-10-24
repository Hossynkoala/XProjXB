const express = require('express');
const router = express.Router();
const DB = require('../DB/DB');


router.get('/', async function (req, res, next) {

    const Result = await DB.receiveRSS();

    res.send(Result).status(200);
});

router.post('/updaterss', async function (req, res, next) {

    const result = await DB.updateRss(req.body.Data);

    res.send(result).status(200);
});


module.exports = {router};
