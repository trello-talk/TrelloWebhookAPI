var bluebird = require("bluebird");
var fs = require("fs");
var express = require('express');
var moment = require("moment");
var chalk = require("chalk");
var request = require("superagent");
var client = require('redis').createClient();
var router = express.Router();
var rates = {}
var log = function(level, message){

	var lg = "["+moment().format()+"] "+message;
	switch(Number(level)){
		case 1:
			console.log(chalk.green(lg));
		break;
		case 2:
			console.log(chalk.yellow(lg));
		break;
		case 3:
			console.log(chalk.red(lg));
		break;
	}

};

router.post("/", (req, res) => {
  client.get('t!webhook', (err, data)=>{
    hookdata = JSON.parse(data)
		boardid = req.body.model.url.split('/')[4]
		console.log('incoming request'+boardid)
		if(!hookdata[boardid]){
			console.log('got invalid request '+boardid)
			res.status(410).json({status: 410, message: "gone"});
		}else{
			res.status(200).json({status: 200, message: "ok"});
			Object.keys(hookdata[boardid]).map((c)=>{
				b = hookdata[boardid][c];
				console.log(hookdata[boardid][c].webhook+"/slack")
				if(rates[b.webhook]!=undefined&&Number(rates[b.webhook]) >= Date.now()){console.log('limited'); return undefined}
				if(b.bits&&b.bits.length!=0){
					if(!b.bits.includes(req.body.action.type.toLowerCase())){
						return undefined // Skip request
					}
				}
				console.log('hook: '+b.webhook)
				request.get(b.webhook)
				.end((err, res2)=>{
					if(err){
						delete hookdata[boardid][c]
						client.set('t!webhook', JSON.stringify(hookdata))
					}else{
						if(res2.header['x-ratelimit-remaining']=='0'){
							rates[b.webhook] = res2.header['x-ratelimit-reset']
						}else{
							// #429bce
							switch(req.body.action.type){
								case "voteOnCard":
									request.post(hookdata[boardid][c].webhook+"/slack")
									.send({
										"text": "",
										"attachments": [
											{
												"author_link": req.body.model.url,
								        "color": "#ffed58",
								        "author_name": "Trello: "+req.body.model.name,
								        "author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
								        "title": `${req.body.action.memberCreator.fullName} ${req.body.action.data.voted ? "added" : "removed"} vote to card ${req.body.action.data.card.name}`,
												"title_link": `https://trello.com/c/${req.body.action.data.card.shortLink}`,
												"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
												"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`
								    	}
								    ]
									})
									.end((err2, res3)=>{
										if(res3.header['x-ratelimit-remaining']=='0'){
											rates[b.webhook] = res3.header['x-ratelimit-reset']
										}
									})
								  break;
								case "createList":
									request.post(hookdata[boardid][c].webhook+"/slack")
									.send({
										"text": "",
										"attachments": [
											{
												"author_link": req.body.model.url,
								        "color": "#009800",
								        "author_name": "Trello: "+req.body.model.name,
								        "author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
								        "title": `${req.body.action.memberCreator.fullName} created list ${req.body.action.data.list.name}`,
												"title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
												"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
												"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})`
								    	}
								    ]
									})
									.end((err2, res3)=>{
										if(res3.header['x-ratelimit-remaining']=='0'){
											rates[b.webhook] = res3.header['x-ratelimit-reset']
										}
									})
								  break;
								case "createCheckItem":
									request.post(hookdata[boardid][c].webhook+"/slack")
									.send({
										"text": "",
										"attachments": [
											{
												"author_link": req.body.model.url,
								        "color": "#7aff7a",
								        "author_name": "Trello: "+req.body.model.name,
								        "author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
								        "title": `${req.body.action.memberCreator.fullName} created check item ${req.body.action.data.checkItem.name} in checklist ${req.body.action.data.checklist.name} in card ${req.body.action.data.card.name}`,
												"title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
												"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
												"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`
								    	}
								    ]
									})
									.end((err2, res3)=>{
										if(res3.header['x-ratelimit-remaining']=='0'){
											rates[b.webhook] = res3.header['x-ratelimit-reset']
										}
									})
								  break;
								case "deleteCheckItem":
									request.post(hookdata[boardid][c].webhook+"/slack")
									.send({
										"text": "",
										"attachments": [
											{
												"author_link": req.body.model.url,
								        "color": "#ff807a",
								        "author_name": "Trello: "+req.body.model.name,
								        "author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
								        "title": `${req.body.action.memberCreator.fullName} deleted check item ${req.body.action.data.checkItem.name} in checklist ${req.body.action.data.checklist.name} in card ${req.body.action.data.card.name}`,
												"title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
												"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
												"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`
								    	}
								    ]
									})
									.end((err2, res3)=>{
										if(res3.header['x-ratelimit-remaining']=='0'){
											rates[b.webhook] = res3.header['x-ratelimit-reset']
										}
									})
								  break;
								case "addMemberToBoard":
									request.post(hookdata[boardid][c].webhook+"/slack")
									.send({
										"text": "",
										"attachments": [
											{
												"author_link": req.body.model.url,
								        "color": "#f7b300",
								        "author_name": "Trello: "+req.body.model.name,
								        "author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
								        "title": `${req.body.action.memberCreator.fullName} added ${req.body.action.member.fullName} to the board`,
												"title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
												"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
												"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Member Added**: ${req.body.action.member.fullName} (${req.body.action.member.username})`
								    	}
								    ]
									})
									.end((err2, res3)=>{
										if(res3.header['x-ratelimit-remaining']=='0'){
											rates[b.webhook] = res3.header['x-ratelimit-reset']
										}
									})
								  break;
								case "makeAdminOfBoard":
									request.post(hookdata[boardid][c].webhook+"/slack")
									.send({
										"text": "",
										"attachments": [
											{
												"author_link": req.body.model.url,
								        "color": "#f7b300",
								        "author_name": "Trello: "+req.body.model.name,
								        "author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
								        "title": `${req.body.action.memberCreator.fullName} made ${req.body.action.member.fullName} an admin of the board`,
												"title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
												"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
												"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Member Changed**: ${req.body.action.member.fullName} (${req.body.action.member.username})`
								    	}
								    ]
									})
									.end((err2, res3)=>{
										if(res3.header['x-ratelimit-remaining']=='0'){
											rates[b.webhook] = res3.header['x-ratelimit-reset']
										}
									})
								  break;
								case "makeNormalMemberOfBoard":
									request.post(hookdata[boardid][c].webhook+"/slack")
									.send({
										"text": "",
										"attachments": [
											{
												"author_link": req.body.model.url,
								        "color": "#f7b300",
								        "author_name": "Trello: "+req.body.model.name,
								        "author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
								        "title": `${req.body.action.memberCreator.fullName} made ${req.body.action.member.fullName} a normal member of the board`,
												"title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
												"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
												"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Member Changed**: ${req.body.action.member.fullName} (${req.body.action.member.username})`
								    	}
								    ]
									})
									.end((err2, res3)=>{
										if(res3.header['x-ratelimit-remaining']=='0'){
											rates[b.webhook] = res3.header['x-ratelimit-reset']
										}
									})
								  break;
								case "createCard":
									request.post(hookdata[boardid][c].webhook+"/slack")
									.send({
										"text": "",
										"attachments": [
											{
												"author_link": req.body.model.url,
								        "color": "#009800",
								        "author_name": "Trello: "+req.body.model.name,
								        "author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
								        "title": `${req.body.action.memberCreator.fullName} created card ${req.body.action.data.card.name} in list ${req.body.action.data.list.name}`,
												"title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
												"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
												"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`
								    	}
								    ]
									})
									.end((err2, res3)=>{
										if(res3.header['x-ratelimit-remaining']=='0'){
											rates[b.webhook] = res3.header['x-ratelimit-reset']
										}
									})
								  break;
								case "updateCheckItemStateOnCard":
									request.post(hookdata[boardid][c].webhook+"/slack")
									.send({
										"text": "",
										"attachments": [
											{
												"author_link": req.body.model.url,
								        "color": "#f7b300",
								        "author_name": "Trello: "+req.body.model.name,
								        "author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
								        "title": `${req.body.action.memberCreator.fullName} ${req.body.action.data.checkItem.state=='incomplete' ? "unchecked" : "checked"} item ${req.body.action.data.checkItem.name} in checklist ${req.body.action.data.checklist.name} on card ${req.body.action.data.card.name}`,
												"title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
												"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
												"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`
								    	}
								    ]
									})
									.end((err2, res3)=>{
										if(res3.header['x-ratelimit-remaining']=='0'){
											rates[b.webhook] = res3.header['x-ratelimit-reset']
										}
									})
								  break;
								case "deleteCard":
									request.post(hookdata[boardid][c].webhook+"/slack")
									.send({
										"text": "",
										"attachments": [
											{
												"author_link": req.body.model.url,
								        "color": "#b30000",
								        "author_name": "Trello: "+req.body.model.name,
								        "author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
								        "title": `${req.body.action.memberCreator.fullName} deleted a card in list ${req.body.action.data.list.name}`,
												"title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
												"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
												"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})`
								    	}
								    ]
									})
									.end((err2, res3)=>{
										if(res3.header['x-ratelimit-remaining']=='0'){
											rates[b.webhook] = res3.header['x-ratelimit-reset']
										}
									})
								  break;
								case "commentCard":
									request.post(hookdata[boardid][c].webhook+"/slack")
									.send({
										"text": "",
										"attachments": [
											{
												"author_link": req.body.model.url,
								        "color": "#ffed58",
								        "author_name": "Trello: "+req.body.model.name,
								        "author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
								        "title": `${req.body.action.memberCreator.fullName} commented on card ${req.body.action.data.card.name}`,
												"title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
												"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
												"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})\n**Comment**: ${req.body.action.data.text}\n**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`
								    	}
								    ]
									})
									.end((err2, res3)=>{
										if(res3.header['x-ratelimit-remaining']=='0'){
											rates[b.webhook] = res3.header['x-ratelimit-reset']
										}
									})
								  break;
								case "removeChecklistFromCard":
									request.post(hookdata[boardid][c].webhook+"/slack")
									.send({
										"text": "",
										"attachments": [
											{
												"author_link": req.body.model.url,
								        "color": "#ff807a",
								        "author_name": "Trello: "+req.body.model.name,
								        "author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
								        "title": `${req.body.action.memberCreator.fullName} removed checklist ${req.body.action.data.checklist.name} from card ${req.body.action.data.card.name}`,
												"title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
												"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
												"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`
								    	}
								    ]
									})
									.end((err2, res3)=>{
										if(res3.header['x-ratelimit-remaining']=='0'){
											rates[b.webhook] = res3.header['x-ratelimit-reset']
										}
									})
								  break;
								case "addChecklistToCard":
									request.post(hookdata[boardid][c].webhook+"/slack")
									.send({
										"text": "",
										"attachments": [
											{
												"author_link": req.body.model.url,
								        "color": "#7aff7a",
								        "author_name": "Trello: "+req.body.model.name,
								        "author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
								        "title": `${req.body.action.memberCreator.fullName} added checklist ${req.body.action.data.checklist.name} to card ${req.body.action.data.card.name}`,
												"title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
												"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
												"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`
								    	}
								    ]
									})
									.end((err2, res3)=>{
										if(res3.header['x-ratelimit-remaining']=='0'){
											rates[b.webhook] = res3.header['x-ratelimit-reset']
										}
									})
								  break;
								case "addLabelToCard":
									request.post(hookdata[boardid][c].webhook+"/slack")
									.send({
										"text": "",
										"attachments": [
											{
												"author_link": req.body.model.url,
								        "color": "#7aff7a",
								        "author_name": "Trello: "+req.body.model.name,
								        "author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
								        "title": `${req.body.action.memberCreator.fullName} added label ${req.body.action.data.text} to card ${req.body.action.data.card.name}`,
												"title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
												"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
												"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`
								    	}
								    ]
									})
									.end((err2, res3)=>{
										if(res3.header['x-ratelimit-remaining']=='0'){
											rates[b.webhook] = res3.header['x-ratelimit-reset']
										}
									})
								  break;
								case "removeLabelFromCard":
									request.post(hookdata[boardid][c].webhook+"/slack")
									.send({
										"text": "",
										"attachments": [
											{
												"author_link": req.body.model.url,
								        "color": "#ff807a",
								        "author_name": "Trello: "+req.body.model.name,
								        "author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
								        "title": `${req.body.action.memberCreator.fullName} removed label ${req.body.action.data.text} from card ${req.body.action.data.card.name}`,
												"title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
												"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
												"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`
								    	}
								    ]
									})
									.end((err2, res3)=>{
										if(res3.header['x-ratelimit-remaining']=='0'){
											rates[b.webhook] = res3.header['x-ratelimit-reset']
										}
									})
								  break;
								case "updateCard":
									jso = {}
									if(req.body.action.data.listBefore){
										jso = {
											"text": "",
											"attachments": [
												{
													"author_link": req.body.model.url,
													"color": "#f7b300",
									        "author_name": "Trello: "+req.body.model.name,
													"author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
													"title": `${req.body.action.memberCreator.fullName} moved card ${req.body.action.data.card.name} from list ${req.body.action.data.listBefore.name} to ${req.body.action.data.listAfter.name}`,
													"title_link": `https://trello.com/c/${req.body.action.data.card.shortLink}`,
													"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
													"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**List Moved From**: ${req.body.action.data.listBefore.name}
**Current List**: ${req.body.action.data.listAfter.name}
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`
												}
											]
										}
									}else if(req.body.action.data.old.name){
										jso = {
											"text": "",
											"attachments": [
												{
													"author_link": req.body.model.url,
													"color": "#f7b300",
									        "author_name": "Trello: "+req.body.model.name,
													"author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
													"title": `${req.body.action.memberCreator.fullName} renamed card ${req.body.action.data.old.name} to ${req.body.action.data.card.name}`,
													"title_link": `https://trello.com/c/${req.body.action.data.card.shortLink}`,
													"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
													"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Old Card Name**: ${req.body.action.data.old.name}
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`
												}
											]
										}
									}else if(req.body.action.data.old.desc){
										jso = {
											"text": "",
											"attachments": [
												{
													"author_link": req.body.model.url,
													"color": "#f7b300",
									        "author_name": "Trello: "+req.body.model.name,
													"author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
													"title": `${req.body.action.memberCreator.fullName} renamed card description in card ${req.body.action.data.card.name}`,
													"title_link": `https://trello.com/c/${req.body.action.data.card.shortLink}`,
													"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
													"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Old Card Descripton**: ${req.body.action.data.old.desc}
**New Card Descripton**: ${req.body.action.data.card.desc}
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`
												}
											]
										}
									}else if(req.body.action.data.old.closed!=undefined){
										jso = {
											"text": "",
											"attachments": [
												{
													"author_link": req.body.model.url,
													"color": "#f7b300",
									        "author_name": "Trello: "+req.body.model.name,
													"author_icon": "https://cdn.discordapp.com/app-icons/202929883863580673/ef8cd047b9be40d935f9d83ea88c324d.jpg",
													"title": `${req.body.action.memberCreator.fullName} ${req.body.action.data.card.closed ? "archived" : "unarchived"} card ${req.body.action.data.card.name}`,
													"title_link": `https://trello.com/c/${req.body.action.data.card.shortLink}`,
													"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
													"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`
													/*"fields": [{
															"title": "```Member```",
															"value": req.body.action.memberCreator.fullName+" ("+req.body.action.memberCreator.username+")",
															"inline": true
													},{
															"title": "```Card```",
															"value": `[${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`,
															"inline": true
													}]*/
												}
											]
										}
									}
									request.post(hookdata[boardid][c].webhook+"/slack")
									.send(jso)
									.end((err2, res3)=>{
										if(res3.header['x-ratelimit-remaining']=='0'){
											rates[b.webhook] = res3.header['x-ratelimit-reset']
										}
									})
									break;
								default:
									console.log("Unreadable action "+req.body.action.type);
									console.log(req.body.action);
									break;
							}
						}
					}
				})
			})
		}
  });
});

router.get("/", (req, res) => {
  res.status(200).json({status: 200, message: "ok"});
	console.log('got head request')
});


module.exports = router;
