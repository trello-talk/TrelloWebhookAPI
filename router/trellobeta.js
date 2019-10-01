const bluebird = require("bluebird");
const fs = require("fs");
const express = require('express');
const moment = require("moment");
const chalk = require("chalk");
const Config = require(__dirname+'/../config.json');
//const Trello = require(__dirname+'/../../config.json').trello;
const request = require("superagent");
const rethink = require("rethinkdb");
const router = express.Router();
let functions = {default:[],github:[]};
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
			let files = fs.readdirSync(__dirname+"/../functions/default");
			files.map(file => {
				if(file.endsWith('.js')){
					try{
						functions["default"][file.slice(0, -3)] = require(__dirname+'/../functions/default/'+file);
					}catch(e){
						reject(e);
					}
				}
			});
			let files2 = fs.readdirSync(__dirname+"/../functions/github");
			files2.map(file => {
				if(file.endsWith('.js')){
					try{
						functions["github"][file.slice(0, -3)] = require(__dirname+'/../functions/github/'+file);
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
	conn.use('Trello');
	rdb = {r: rethink, conn: conn};
	loadFunctions().then(() => {
		console.log("Functions loaded");
		takeRequests = true;
	}).catch((e) => {throw e;});
}).catch((e) => {throw e;});

router.post("/", (req, res) => {
  	if(takeRequests){
  		boardid = req.body.model.url.split('/')[4]
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
				res.status(200).json({status: 200, message: "ok"});
				Object.keys(webhookBoard).map((c)=>{
					if(c == "id") return;
					b = webhookBoard[c];
					if (b.muted === true) return undefined;
					if(b.bits&&b.bits.length !== 0){
						if(b.muted || !b.bits.includes(req.body.action.type.toLowerCase())){
							return undefined // Skip request
						}
					}
					if(!b.webhook) return;
					console.log('hook: '+b.webhook)
					switch(b.style){
						case "github":
							if(functions["github"][req.body.action.type]){
								try{
									functions["github"][req.body.action.type](req, request, b.webhook, "https://cdn.discordapp.com/app-icons/202929883863580673/28b93df9f9e8d43bedf20291e9743c73.jpg");
								}catch(e){
									console.log(e)
								}
							}else{
								console.log("Couldn't find file for action", req.body.action.type)
								console.log("=".repeat(20))
								console.log(JSON.stringify(req.body))
								console.log("=".repeat(20))
							}
							break;
						case "default":
						default:
							if(functions["default"][req.body.action.type]){
								try{
									functions["default"][req.body.action.type](req, request, b.webhook, "https://cdn.discordapp.com/app-icons/202929883863580673/28b93df9f9e8d43bedf20291e9743c73.jpg");
								}catch(e){
									console.log(e)
								}
							}else{
								console.log("Couldn't find file for action", req.body.action.type)
								console.log("=".repeat(20))
								console.log(JSON.stringify(req.body))
								console.log("=".repeat(20))
							}
							break;
					}
				})
			}
		});
  	}else{
  		res.status(200).json({status: 200, message: "ok but still loading"});
  	}
});

router.get("/", (req, res) => {
  res.status(200).json({status: 200, message: "head request ok"});
	console.log('got head request')
});


module.exports = router;
