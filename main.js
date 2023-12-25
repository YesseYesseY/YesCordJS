const { json } = require('stream/consumers');
const WebSocket = require('ws');
const axios = require('axios');
const os = require('os');
const config = require('./config.json');

var token = config.token;
if (!token.startsWith("Bot ")) token = "Bot " + token;

const ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");

ws.addEventListener('open', () => {
    console.log('WebSocket connected');
});

ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.op == 10) {
        ws.send(JSON.stringify({
            "op": 1,
            "d": null
        }));

        var intents = 0;
        intents |= 1 << 0; // GUILDS
        intents |= 1 << 9; // GUILD_MESSAGES
        intents |= 1 << 15; // MESSAGE_CONTENT
        console.log("Intents: " + intents);
        ws.send(JSON.stringify({
            "op": 2,
            "d": {
                "token": token,
                "properties": {
                    "$os": os.platform(),
                    "$browser": "YesCordJS",
                    "$device": "YesCordJS"
                },
                "intents": intents
            }
        }));
    }
    else if (data.op == 11) {
        console.log("Heartbeat ACK");
    }
    else if (data.op == 0) {
        console.log("Dispatch: " + data.t);
        if (data.t == "READY") {
            console.log("User: " + data.d.user.username);
        }

        if (data.t == "MESSAGE_CREATE") {
            // console.log(data.d)
            if (data.d.content == "!ping") {
                axios.post("https://discord.com/api/v10/channels/" + data.d.channel_id + "/messages", {
                    content: "Pong!"
                }, {
                    headers: {
                        "Authorization": token
                    }
                })
            }
        }
    }
    else 
    {
        console.log("Unknown OP: " + data.op);
    }
});

ws.addEventListener('close', () => {
    console.log('WebSocket closed');
});

ws.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
});

