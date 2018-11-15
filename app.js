var express = require("express");
var app = express();
var server = require("http").createServer(app);
var _ = require("underscore");
var mysql = require('mysql');

var controller = require('./controller');


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

var port = process.env.PORT || 4500;
server.listen(port, (err)=> {
    if (err) {
        console.log(err);
    } 
    console.log('server is listening on -->', port);
});


app.post('/coroutinesignUp', controller.coroutinesignUp);
app.post('/auto', controller.Auto);
app.post('/signupWaterfall', controller.signupWaterfall)
app.post('/Awaitsignup', controller.Awaitsignup);
app.post('/promise', controller.promise);
