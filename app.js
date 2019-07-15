const express = require('express');
const mysql = require('mysql');
const axios = require('axios');

var app = express();

const bodyparser = require('body-parser');
const path = require('path');
const port = process.env.port || 3000;

var router = express.Router();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));
app.use(express.static('public'))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


//Create database connection
const db = mysql.createConnection ({
        host: 'localhost',
        user: 'root',
        database: 'weathersql'
});

db.connect((err) => {
        if(err){
            throw err;
        }
        console.log('MySql connected...')
});


// //Create Database !!
// app.get('/createdb', (req,res) => {
//     let sql = 'CREATE DATABASE weathersql';
//     db.query(sql,(err,result) => {
//         if(err) throw err;
//         console.log(result);
//         res.send('Database created...');
//     });
// });

//Create Database Table
app.get('/createtable', (req,res) => {
    let sql = 'CREATE TABLE main (City VARCHAR(255), temperature VARCHAR(255), pressure VARCHAR(255), humidity VARCHAR(255), PRIMARY KEY(City) )';
    db.query(sql, (err,result) => {
        if(err) throw err;
        console.log(result);
        res.send('Posts table created');
    });
});

// app.get('/show', (req,res) => {
//     res.send('testing');
// });

//Present result of filtered data in UI
app.post('/show', (req,res) => {
    var text = req.body['search-text'];
    const querystr = `http://api.openweathermap.org/data/2.5/weather?q=`+text+`&APPID=5e902e61a4eb98f41bf118c889ffbadd`;
    axios.get(querystr).then((response) => {
               console.log(response.data);
                
                let main = { "city" : response.data['name'], "temperature" : response.data['main']['temp'], "pressure" : response.data['main']['pressure'], "humidity" : response.data['main']['humidity']};
                let sql = "INSERT INTO main SET ?";
                let query = db.query(sql,main, (err,result) => {
                    if(err) throw err;
                    console.log(result);
                })
    
         db.query('SELECT temperature, pressure, humidity FROM main', (err, rs) =>{
            res.render('result', {main: rs})
         })
        })
});


 //Go to homepage of website
app.get('/homepage', (req, res, next) => {
    db.query('SELECT * FROM main', (err, rs) =>{
       res.render('homepage', {weather: rs})
    })
 })

 //Start localhost:3000
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
