const express = require('express')
const app = express();
const bodyParser = require('body-parser');
app.use(express.urlencoded({extended: true}));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');
require('dotenv').config()


var db;


/*MongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, function(에러, client){

    if(에러) return console.log(에러)

    db = client.db('blog');

    app.listen(process.env.PORT, function() {
        console.log('listening on 8080')
    });


});
*/

app.get('/main', function(req, res) {
    res.render('main.ejs');
})

app.get('/login', function(req, res){
    res.render('login.ejs');
})

app.get('/register', function(req, res){
    res.render('register.ejs');
})

app.listen(process.env.PORT, function() {
    console.log('listening on 8080')
});