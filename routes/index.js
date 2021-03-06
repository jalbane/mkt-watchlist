const express = require('express')
const router = express.Router();
//require('dotenv').config()
const jwt = require('jsonwebtoken')
const MongoClient = require('mongodb').MongoClient
const url = `${process.env.DB_URL}`;
const StockSocket = require('stocksocket');
var cookieParser = require('cookie-parser')

router.use(cookieParser())
function getWatchlist(req, res, next){
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		//console.log(req.headers.cookie)
		let email = req.headers.cookie.split('cookieEmail=')[1].split(';')[0]
		let [emailName, host] = email.split('%40')
		email = [emailName, host].join('@')
		if (err) throw err;
		let dbo = db.db("userdb");

		dbo.collection("watchlist").findOne({userEmail: email}, function(err, result){
			if (err) throw err;
			if (result == null){
			}else if(!result.ticker.length ){
				res.locals.watchlist = []
				res.locals.tickerLength = 0;
				res.locals.i = 0;
			}
			else{
				res.locals.i = 0;
				res.locals.tickerLength = result.ticker.length;
				res.locals.watchlist = result;
			}
			next();
		})
	})
}

router.get('/home', getWatchlist, (req, res) => {
	//console.log("line 31", req.headers.cookie)
	let token = req.headers.cookie.split('cookie=')[1].split(';')[0]; 

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=> {
		let name = req.headers.cookie.split('name=')[1].split(';')[0]
		name = name.split('%20')[0]
		res.render('index.ejs',{name: name});
	})
})

module.exports = router;