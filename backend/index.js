const express = require("express");
const redis = require("redis");
const url = require('url');
const keys = require('./keys');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

console.log(keys);

//Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.Password,
    port: keys.pgPort
})

pgClient.on('error', () => console.log('Lost PG connection'));

pgClient
    .query('CREATE TABLE IF NOT EXISTS counter_value (number INT)')
    .catch(error => console.log(error));

pgClient
    .query('CREATE TABLE IF NOT EXISTS nwd_value (number INT)')
    .catch(error => console.log(error));

// Redis Client Setup
const redisClient = redis.createClient({
   host: keys.redisHost,
   port: keys.redisPort 
});

redisClient.set('counter_value', 0);
redisClient.set('nwd_value', 0);

app.get('/api/', (req, res) =>{
    console.log("Response from backend.");
    res.send("Response from backend.");
});

app.get('/', (req, res) =>{
    const nwdResult = getNwd(url.parse(req.url,true).query);

    let incrementedCounterValue;
    redisClient.get('counter_value', (err, counter_value) => {
        console.log("Current counter value from Redis: " + counter_value);
        incrementedCounterValue = parseInt(counter_value) + 1;
        redisClient.set('counter_value', incrementedCounterValue);
    });

    redisClient.get('nwd_value', (err, nwd_value) => {
        console.log("Current nwd from Redis: " + nwd_value);
        redisClient.set('nwd_value', nwdResult);
    });
    
    pgClient.connect()
        .then(() => console.log("Connected successfully"))
        .then(() => pgClient.query("INSERT INTO counter_value(number) VALUES("+incrementedCounterValue+")"))
        .then(() => pgClient.query("INSERT INTO nwd_value(number) VALUES("+nwdResult+")"))
        .catch(e => console.log(e));    


    console.log("Najwiekszy wspolny dzielnik ("+ a + ", " + b + "): " + nwd(a, b));

    res.send("Thanks for visiting.");
});

getNwd = (queryObject) => {
    a = parseInt(queryObject.l1);
    b = parseInt(queryObject.l2);
    const nwdResult = parseInt(nwd(a, b));

    return nwdResult;
}

nwd = (a, b) => {
    while (a != b) {
        if (a < b) {
          pom = a; a = b; b = pom;
        } 
        a = a - b;
      }
      return a;
}

app.listen(5000, () =>{
    console.log("Lisening on port 5000...");
});