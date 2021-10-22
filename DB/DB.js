const {MongoClient} = require('mongodb');
const axios = require("axios");
var convert = require('xml-js');

const uri = "mongodb+srv://hossynkoala:85245685hHH!@xprojx.edi7r.mongodb.net/XProjX?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});


async function RecieveFeeds() {

    const Con = await (await client.connect()).db("fundamental").collection("Feeds").find({}).toArray();

    return Con;

}


async function RecieveRSS() {

    const Con = await (await client.connect()).db("fundamental").collection('Feeds').aggregate(
        [
            {$project: {URL: 1, _id: 0, RSS: 1}},
            {$unwind: {path: '$RSS'}}
        ]
    ).toArray();
    return Con;
}


async function updatersss(RSS) {

    let config = {
        method: 'get',
        url: RSS,
        headers: {}
    };

    axios(config)
        .then(async (response) => {

            var xml = response.data;

            var result1 = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 4}));

            const cl = await client.connect();

            result1.rss.channel.item.forEach(feed => {
                cl.db('fundamental').collection('datas').replaceOne(feed, feed, {upsert: true})
            });


            return result1.rss.channel.item

        })
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


module.exports = {
    RecieveFeeds,
    RecieveRSS,
    updatersss,
    addFeed,
    receiveDashboardData
};