const express = require('express');
const router = express.Router();
const DB = require('../DB/DB');


router.post('/', async function (req, res, next) {

    const Result = await DB.receiveNews(req.body.Data);

    res.send(Result);
});

router.delete('/delete', async function (req, res) {

    const Result = await DB.deleteNews(req.body.Data);

    res.send(Result);

})

module.exports = {router};
