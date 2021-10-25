const express = require('express');
const router = express.Router();
const DB = require('../DB/DB');


router.get('/', async function (req, res, next) {

    const Result = await DB.receiveNews();

    res.send(Result);
});

router.delete('/delete', async function (req, res) {

    const Result = await DB.deleteNews(req.body.Data);

    res.send(Result);

})

module.exports = {router};
