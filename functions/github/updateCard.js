/*
 This file is part of Turquoise.
 Copyright (c) Snazzah ???-2019
 Copyright (c) Yamboy1 (and contributors) 2019

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

module.exports = function(req, request, webhook, icon){
	let jso = {}
	if(req.body.action.data.listBefore){
		jso = {
			"text": "",
			"attachments": [
				{
					"author_link": req.body.model.url,
					"color": Colors.edit,
	        "author_name": "Trello: "+req.body.model.name,
					"author_icon": icon,
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
					"color": Colors.edit,
	        "author_name": "Trello: "+req.body.model.name,
					"author_icon": icon,
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
					"color": Colors.edit,
	        "author_name": "Trello: "+req.body.model.name,
					"author_icon": icon,
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
					"color": Colors.edit,
	        "author_name": "Trello: "+req.body.model.name,
					"author_icon": icon,
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
	request.post(webhook+"/slack")
	.set("User-Agent", Config.useragent)
	.send(jso)
	.end((err2, res3)=>{
		return res3;
	})
}
