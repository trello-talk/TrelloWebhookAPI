const bluebird = require("bluebird");
const fs = require("fs");
const express = require('express');
const moment = require("moment");
const chalk = require("chalk");
const Config = require(__dirname+'/../config.json');
const request = require("superagent");
const rethink = require("rethinkdb");
const router = express.Router();
let functions = {};
let takeRequests = false;
let rdb = {};
global.Config = Config;
global.Colors = Config.colors;

let Data = {
	get: {
		webhook: function(id, bid){
			return rdb.r.table("webhooks").get(bid)(id).default(null).run(rdb.conn);
		},
		webhookBoard: function(bid){
			return rdb.r.table("webhooks").get(bid).default(null).run(rdb.conn);
		}
	},
	delete: {
		webhookBoard: function(bid){
			return rdb.r.table("webhooks").get(bid).delete().run(rdb.conn);
		},
		webhook: function(id, bid){
			return new Promise((resolve, reject) => {
				rdb.r.table("webhooks").get(bid).default(null).run(rdb.conn, (err, data) => {
					if(err){ reject(err); }
					if(data === null){reject(err); }
					let table = data;
					delete table[id]
					rdb.r.table("webhooks").get(bid).replace(table).run(rdb.conn, (err2, data2) => {
						if(err2){ reject(err2); }
						resolve(data2);
					});
				});
			});
		}
	}
};

let loadFunctions = function(){
	return new Promise((resolve, reject) => {
		try{
			let files = fs.readdirSync(__dirname+"/../functions");
			files.map(file => {
				if(file.endsWith('.js')){
					try{
						functions[file.slice(0, -3)] = require(__dirname+'/../functions/'+file);
					}catch(e){
						reject(e);
					}
				}
			});
			resolve();
		}catch(e){
			reject(e);
		}
	});
}

rethink.connect({host: Config.ip, port: Config.port, user: Config.user, password: Config.password}, (err, conn) => {
	console.log("Connected to rethink");
	if(err){ throw err; }
	conn.use('Brello');
	rdb = {r: rethink, conn: conn};
	loadFunctions().then(() => {
		console.log("Functions loaded");
		takeRequests = true;
	}).catch((e) => {throw e;});
}).catch((e) => {throw e;});

router.post("/", (req, res) => {
  	if(takeRequests){
  		boardid = req.body.model.url.split('/')[4]
		console.log('BETA MODE')
		console.log('+++++++++++++++++++++++')
		console.log('incoming request '+boardid)
		Data.get.webhookBoard(boardid).then(webhookBoard =>{
			if(webhookBoard == null){
				console.log('got invalid request '+boardid)
				res.status(410).json({status: 410, message: "gone"});
			}else if(Object.keys(webhookBoard).length <= 1){
				console.log('got invalid request '+boardid)
				res.status(410).json({status: 410, message: "gone"});
				Data.delete.webhookBoard(boardid);
			}else{
				console.log(webhookBoard)
				res.status(200).json({status: 200, message: "ok"});
				Object.keys(webhookBoard).map((c)=>{
					if(c == "id"){ return; }
					b = webhookBoard[c];
					console.log(b.webhook+"/slack")
					if(rates[b.webhook] !== undefined && Number(rates[b.webhook]) >= Date.now()){
						console.log('limited'); 
						return undefined; // Skip request from ratelimit
					}
					if(b.bits&&b.bits.length !== 0){
						if(!b.bits.includes(req.body.action.type.toLowerCase())){
							return undefined // Skip request
						}
					}
					console.log('hook: '+b.webhook)
					if(functions[req.body.action.type]){
						try{
							functions[req.body.action.type](req, request, b.webhook, "https://cdn.discordapp.com/app-icons/202929883863580673/28b93df9f9e8d43bedf20291e9743c73.jpg");
						}catch(e){
							console.log(e)
						}
					}else{
						console.log("Couldn't find file for action", req.body.action.type)
						console.log("=".repeat(10))
						console.log(req.body)
						console.log("=".repeat(10))
					}
				})
			}
		});
  	}else{
  		res.status(200).json({status: 200, message: "ok but still loading"});
  	}
});

router.get("/", (req, res) => {
  res.status(200).json({status: 200, message: "ok"});
	console.log('got head request')
});


module.exports = router;
