const express = require("express");
const app = express();
const server = require("http").createServer(app);
const _ = require("underscore");
const mysql = require('mysql');
const MongoClient = require('mongodb').MongoClient;

const controller = require('./controller');
const url = 'mongodb://localhost:27017';
const dbname ='test';
    MongoClient.connect(url, (err, client)=> {
    console.log("COnnected database");
    global.db = client.db(dbName);
  });

connection = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "123456",
    database : "testdb",
});

connection.connect(function (err) {              
    if (err) {
        console.log('error in connecting to db ', err);
    } else {
        console.log('database connected');
    }
});

const port = process.env.PORT || 4500;
server.listen(port, (err)=> {
    if (err) {
        console.log(err);
    } 
    console.log('server is listening on -->', port);
});


app.post('/coroutinesignUp', controller.coroutinesignUp);
app.get('/auto', controller.Auto);
app.post('/signupWaterfall', controller.signupWaterfall)
app.post('/Awaitsignup', controller.Awaitsignup);
app.get('/promise', controller.promise);
