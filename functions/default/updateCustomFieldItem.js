module.exports = function(req, request, webhook, icon){
  let jso = {}
  let removed = req.body.action.data.customFieldItem.value === null
  let added = req.body.action.data.old.value === null
  switch(req.body.action.data.customField.type){
    case "checkbox":
      jso = {
        "author_link": req.body.model.url,
        "color": Colors.lite.edit,
        "author_name": "Trello: "+req.body.model.name,
        "author_icon": icon,
        "title": `${req.body.action.memberCreator.fullName} ${removed ? "un" : ""}checked custom field \"${req.body.action.data.customField.name}\" on card \"${req.body.action.data.card.name}\"`,
        "title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
        "thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
        "text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`
      }
      break;
    case "text":
      jso = {
        "author_link": req.body.model.url,
        "color": Colors.lite.edit,
        "author_name": "Trello: "+req.body.model.name,
        "author_icon": icon,
        "title": `${req.body.action.memberCreator.fullName} ${removed ? "removed" : "changed"} custom field \"${req.body.action.data.customField.name}\" on card \"${req.body.action.data.card.name}\"`,
        "title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
        "thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
        "text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})
${!added ? `**Old Value**: ${req.body.action.data.old.value.text}\n`: ""}${!removed ? `**New Value**: ${req.body.action.data.customFieldItem.value.text}`: ""}`
      }
      break;
    case "number":
      jso = {
        "author_link": req.body.model.url,
        "color": Colors.lite.edit,
        "author_name": "Trello: "+req.body.model.name,
        "author_icon": icon,
        "title": `${req.body.action.memberCreator.fullName} ${removed ? "removed" : "changed"} custom field \"${req.body.action.data.customField.name}\" on card \"${req.body.action.data.card.name}\"`,
        "title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
        "thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
        "text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})
${!added ? `**Old Value**: ${req.body.action.data.old.value.number}\n`: ""}${!removed ? `**New Value**: ${req.body.action.data.customFieldItem.value.number}`: ""}`
      }
      break;
    case "date":
      jso = {
        "author_link": req.body.model.url,
        "color": Colors.lite.edit,
        "author_name": "Trello: "+req.body.model.name,
        "author_icon": icon,
        "title": `${req.body.action.memberCreator.fullName} ${removed ? "removed" : "changed"} custom field \"${req.body.action.data.customField.name}\" on card \"${req.body.action.data.card.name}\"`,
        "title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
        "thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
        "text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})
${!added ? `**Old Value**: ${new Date(req.body.action.data.old.value.date).toUTCString()}\n`: ""}${!removed ? `**New Value**: ${new Date(req.body.action.data.customFieldItem.value.date).toUTCString()}`: ""}`
      }
      break;
    case "list":
      removed = req.body.action.data.customFieldItem.idValue === null
      added = req.body.action.data.old.idValue === null
      jso = {
        "author_link": req.body.model.url,
        "color": Colors.lite.edit,
        "author_name": "Trello: "+req.body.model.name,
        "author_icon": icon,
        "title": `${req.body.action.memberCreator.fullName} ${removed ? "removed" : "changed"} custom field \"${req.body.action.data.customField.name}\" on card \"${req.body.action.data.card.name}\"`,
        "title_link": `https://trello.com/b/${req.body.action.data.board.shortLink}`,
        "thumb_url": req.body.action.memberCreator.avatarHash ? "https://trello-avatars.s3.amazonaws.com/"+req.body.action.memberCreator.avatarHash+"/170.png" : undefined,
        "text": `**Member**: ${req.body.action.memberCreator.fullName} (${req.body.action.memberCreator.username})
**Card**: [${req.body.action.data.card.name}](https://trello.com/c/${req.body.action.data.card.shortLink})`
      }
      break;
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
