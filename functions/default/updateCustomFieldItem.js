/*
 This file is part of Turquoise.
 Copyright (c) Snazzah 2016 - 2019
 Copyright (c) Yamboy1 (and contributors) 2019 - 2020

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
