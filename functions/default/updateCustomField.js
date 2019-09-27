module.exports = function(req, request, webhook, icon){
  let jso = {}
  if(req.body.action.data.old.name) {
    jso = {
      "author_link": req.body.model.url,
      "color": Colors.edit,
      "author_name": "Trello: "+req.body.model.name,
      "author_icon": icon,
      "title": `${req.body.action.memberCreator.fullName} renamed custom field \"${req.body.action.data.old.name}\" to \"${req.body.action.data.customField.name}\"`,
      "title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
      "thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
      "text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})`
    }
  } else {
    jso = {
      "author_link": req.body.model.url,
      "color": Colors.edit,
      "author_name": "Trello: "+req.body.model.name,
      "author_icon": icon,
      "title": `${req.body.action.memberCreator.fullName} updated the custom field \"${req.body.action.data.customField.name}\"`,
      "title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
      "thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
      "text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})`
    }
  }
  if(Object.keys(jso).length)
    request.post(webhook + "/slack")
    .set("User-Agent", Config.useragent)
    .send({
      "text": "",
      "attachments": [jso]
    }).end((err2, res3)=>{
      return res3;
    });
}
