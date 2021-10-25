const {MongoClient, ObjectId} = require('mongodb');
const axios = require("axios");
var convert = require('xml-js');

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


    const rawXML = await axios(config);

    const xml = rawXML.data;

    const result = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}));


    for (let itemElement of result.rss.channel.item) {

        const cl = await client.connect();

        itemElement['isDelete'] = false;
        await cl.db('fundamental').collection('news').replaceOne(itemElement, itemElement, {upsert: true})

    }


    return result.rss.channel.item

}


async function addFeed(data) {

    const con = (await client.connect()).db('fundamental').collection('Feeds').insertOne(data)

    return con;

}


//#todo
//add news
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


    resultData.rss = countRSS[0].URL;
    resultData.data = countData[0].RSS;
    resultData.tag = countTag[0].Tags;

    return resultData;

}


async function receiveNews() {

    const datas = await (await client.connect()).db("fundamental").collection('news').aggregate(
        [
            {$match: {isDelete: false}},
            {$skip: 0},
            {$limit: 100}
        ]
    ).toArray();

    return datas;
}


async function deleteNews(_id) {

    const newValues = {$set: {isDelete: true}};
    const datas = await client.connect()
    await datas.db("fundamental").collection('news').updateOne({_id: new ObjectId(_id)}, newValues)

    return 'done';
}


module.exports = {
    receiveFeeds,
    receiveRSS,
    updateRss,
    addFeed,
    receiveDashboardData,
    receiveNews,
    deleteNews
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


            const rawXML = await axios(config);

            const xml = rawXML.data;

            const result = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}));


            for (let itemElement of result.rss.channel.item) {

                const cl = await client.connect();

                itemElement['isDelete'] = false;
                await cl.db('fundamental').collection('news').replaceOne(itemElement, itemElement, {upsert: true})

            }


        }

    }


}, null, true, 'America/Los_Angeles');

job .start()