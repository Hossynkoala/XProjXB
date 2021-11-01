const {MongoClient, ObjectId, Timestamp} = require('mongodb');
const axios = require("axios");
var convert = require('xml-js');
const {BSONType} = require("mongodb/mongodb.ts34");

const CronJob = require('cron').CronJob;
const uri = "mongodb+srv://hossynkoala:85245685hHH!@xprojx.edi7r.mongodb.net/XProjX?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});


async function receiveFeeds() {

    const Con = await (await client.connect()).db("fundamental").collection("Feeds").find({}).toArray();

    return Con;

}


async function receiveRSS() {
    const Con = await (await client.connect()).db("fundamental").collection('Feeds').aggregate(
        [
            {$project: {URL: 1, _id: 0, RSS: 1}},
            {$unwind: {path: '$RSS'}}
        ]
    ).toArray();
    return Con;
}


async function updateRss(RSS) {

    let config = {
        method: 'get',
        url: RSS,
        headers: {}
    };

    //Creat raw RSS

    const rawXML = await axios(config);

    const xml = rawXML.data;

    const result = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}));


//create time
    const TimeNow = new Date();
    const timeParser = `${TimeNow.getFullYear()}/${TimeNow.getMonth()}/${TimeNow.getDay()} `;

    for (let itemElement of result.rss.channel.item) {
        const cl = await client.connect();

        itemElement['isDelete'] = false;
        itemElement['isApprove'] = false;
        itemElement['creationTime'] = timeParser.toISOString()

        await cl.db('fundamental').collection('news').replaceOne(itemElement, itemElement, {upsert: true})
    }


    return result.rss.channel.item

}


async function addFeed(data) {

    const con = (await client.connect()).db('fundamental').collection('Feeds').insertOne(data)

    return con;

}


async function receiveDashboardData() {

    const resultData = {
        rss: 0,
        data: 0,
        tag: 0,
        news: 0
    }

    const countRSS = await (await client.connect()).db("fundamental").collection('Feeds').aggregate(
        [
            {$count: 'URL'},
        ]
    ).toArray();

    const countData = await (await client.connect()).db("fundamental").collection('Feeds').aggregate(
        [
            {$unwind: {path: '$RSS'}},
            {$count: 'RSS'},
        ]
    ).toArray();

    const countTag = await (await client.connect()).db("fundamental").collection('Feeds').aggregate(
        [
            {$unwind: {path: '$Tags'}},
            {$count: 'Tags'},
        ]
    ).toArray();


    const countNews = await (await client.connect()).db("fundamental").collection('news').countDocuments()


    resultData.rss = countRSS[0].URL;
    resultData.data = countData[0].RSS;
    resultData.tag = countTag[0].Tags;
    resultData.news = countNews;

    return resultData;

}


async function receiveNews(Filter) {

    const filter = {
        showDelete: Filter.showDelete, //show delete 0|1
        data: Filter.data, //Data
        skip: Filter.skip, //skip,
        showApprove: Filter.showApprove
    }
    const datas = await (await client.connect()).db("fundamental").collection('news').aggregate(
        [
            {$match: {isDelete: filter.showDelete, isApprove: filter.showApprove}},
            {$skip: filter.skip},
            {$limit: filter.data}
        ]
    ).toArray();

    return datas;
}


async function deleteNews(ids) {

    for (const _id of ids) {
        const newValues = {$set: {isDelete: true}};
        const data = await client.connect()
        await data.db("fundamental").collection('news').updateOne({_id: new ObjectId(_id)}, newValues)
    }


    return 'done';
}


async function approveNews(ids) {

    for (const _id of ids) {
        const newValues = {$set: {isDelete: false, isApprove: true}};
        const data = await client.connect()
        await data.db("fundamental").collection('news').updateOne({_id: new ObjectId(_id)}, newValues)
    }


    return 'done';
}

module.exports = {
    receiveFeeds,
    receiveRSS,
    updateRss,
    addFeed,
    receiveDashboardData,
    receiveNews,
    deleteNews,
    approveNews
};


const job = new CronJob('1 * * * * *', async function () {

    const conn = await client.connect();
    const ArrayDoc = await conn.db('fundamental').collection('Feeds').find({}).toArray();

    for (let RSS of ArrayDoc) {

        for (let rss of RSS.RSS) {

            let config = {
                method: 'get',
                url: RSS.URL + '/' + rss,
                headers: {}
            };

//create raw rss
            const rawXML = await axios(config);

            const xml = rawXML.data;

            const result = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}));

//create time
            const TimeNow = new Date();
            const timeParser = `${TimeNow.getFullYear()}/${TimeNow.getMonth()}/${TimeNow.getDay()} `;

            for (let itemElement of result.rss.channel.item) {

                const cl = await client.connect();

                itemElement['isDelete'] = false;
                itemElement['isApprove'] = false;
                itemElement['creationTime'] = Date.parse(timeParser)

                await cl.db('fundamental').collection('news').replaceOne(itemElement, itemElement, {upsert: true})

            }


        }

    }


}, null, true, 'America/Los_Angeles');


job.start()