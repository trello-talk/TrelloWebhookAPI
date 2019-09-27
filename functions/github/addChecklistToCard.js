module.exports = function(req, request, webhook, icon){
	request.post(webhook+"/slack")
	.set("User-Agent", Config.useragent)
	.send({
		"text": "",
		"attachments": [
				{
				"author_link": "https://trello.com/" + req.body.action.memberCreator.username,
		        "color": Colors.github.change,
		        "author_name": req.body.action.memberCreator.fullName,
		        "author_icon": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : icon,
		        "title": `${req.body.action.memberCreator.fullName} added checklist ${req.body.action.data.checklist.name} to card ${req.body.action.data.card.name}`,
				"title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
				"text": `[\`${req.body.action.data.card.shortLink}\`](https://trello.com/c/${req.body.action.data.card.shortLink}) Added checklist ${req.body.action.data.checklist.name} to card ${req.body.action.data.card.name}`
		    	}
		    ]
	})
	.end((err2, res3)=>{
		return res3;
	})
}
