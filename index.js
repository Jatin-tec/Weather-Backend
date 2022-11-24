const axios = require('axios');
var express = require('express');
var app = express();
var cors = require('cors')

const NodeCache = require("node-cache");
const myCache = new NodeCache();

const api_key = '22a23f13ac0c88b42ec96a8ec9bcddcc';

app.use(cors());

app.get('/', function (req, res) {
    res.send('<h3>Working!!</h3>');
})

app.get('/get-wether', async function (req, res) {

    const resolveRequests = (body, key) => {

        let part = [];
        let bodyArray = [];

        for (var prop in body) {
            bodyArray.push(body[prop]);
        }

        part = bodyArray.slice(key*10, (key*10)+10);
        
        const querry = [];
        part.forEach((val) => {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${val.latitude}&lon=${val.longitude}&appid=${api_key}`;
            const result = axios.get(url);
            querry.push(result);
        })

        return Promise.all(querry);
    }

    const key = req.query.key;
    const data = req.query.data;

    if (myCache.get(`data${key}`) === undefined) {

        const result = await resolveRequests(data, key);

        const resultArray=[];
        result.forEach((doc) => {
            resultArray.push(doc.data);
        })

        if (resultArray !== []){
            myCache.set(`data${key}`, resultArray, 300)
        }

    }
    
    res.json(myCache.get(`data${key}`));
})

app.listen(process.env.PORT || 3000);