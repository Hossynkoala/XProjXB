var express = require('express');
var router = express.Router();
var DB = require('../DB/DB');


router.get('/', async function (req, res, next) {

    const Result = await DB.receiveDashboardData();

    res.send(Result);
});


module.exports = {router};
