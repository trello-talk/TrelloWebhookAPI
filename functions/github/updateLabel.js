module.exports = function(req, request, webhook, icon){
	let jso = {}
	if(req.body.action.data.old.name){
		jso = {
			"text": "",
			"attachments": [
				{
					"author_link": req.body.model.url,
					"color": Colors.edit,
	        "author_name": "Trello: "+req.body.model.name,
					"author_icon": opts.icon,
					"title": `${req.body.action.memberCreator.fullName} renamed label ${req.body.action.data.old.name} to ${req.body.action.data.label.name}`,
					"title_link": req.body.model.url,
					"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
					"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})`
				}
			]
		}
	}else if(req.body.action.data.old.color){
		jso = {
			"text": "",
			"attachments": [
				{
					"author_link": req.body.model.url,
					"color": Colors.edit,
	        "author_name": "Trello: "+req.body.model.name,
					"author_icon": opts.icon,
					"title": `${req.body.action.memberCreator.fullName} recolored label ${req.body.action.data.label.name} from ${req.body.action.data.old.color} to ${req.body.action.data.label.color}`,
					"title_link": req.body.model.url,
					"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
					"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})`
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
