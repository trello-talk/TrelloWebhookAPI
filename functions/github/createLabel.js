module.exports = function(req, request, webhook, icon){
	request.post(webhook+"/slack")
	.set("User-Agent", Config.useragent)
	.send({
		"attachments": [
			{
				"author_link": req.body.model.url,
        "color": Colors.add,
        "author_name": "Trello: "+req.body.model.name,
        "author_icon": icon,
        "title": `${req.body.action.memberCreator.fullName} created label ${req.body.action.data.label.name} with the color ${req.body.action.data.label.color}`,
				"title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
				"thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
				"text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})`
    	}
    ]
	})
	.end((err2, res3)=>{
		return res3;
	})
}