# TrelloWebhookAPI
Webhook reciever API for Trello Bot

# Requirements
* RethinkDB
* RedisDB
* NodeJS
* [TrelloBot](https://github.com/Trello-Bot-Community/TrelloBot)
* [Turquoise](https://github.com/Trello-Bot-Community/Turquoise)

# Installation
* Clone the repo
* Rename the _config.js to config.js and edit it to your liking.
* Be sure to fill in the details for the Redis and Rethink databases.
* **The recv_port needs to be publically exposed, if behind a firewall, ensure that the port is forwarded!**
* Finally, run `npm install`

# Usage
* Once you run the install command, you can start the program with `npm start`
