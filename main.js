const { json } = require('stream/consumers');
const WebSocket = require('ws');
const axios = require('axios');
const os = require('os');
const config = require('./config.json');

var token = config.token;
if (!token.startsWith("Bot ")) token = "Bot " + token;

const ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");

const INTENTS = {
    GUILDS: 1 << 0,
    GUILD_MEMBERS: 1 << 1,
    GUILD_MODERATION: 1 << 2,
    GUILD_EMOJIS_AND_STICKERS: 1 << 3,
    GUILD_INTEGRATIONS: 1 << 4,
    GUILD_WEBHOOKS: 1 << 5,
    GUILD_INVITES: 1 << 6,
    GUILD_VOICE_STATES: 1 << 7,
    GUILD_PRESENCES: 1 << 8,
    GUILD_MESSAGES: 1 << 9,
    GUILD_MESSAGE_REACTIONS: 1 << 10,
    GUILD_MESSAGE_TYPING: 1 << 11,
    DIRECT_MESSAGES: 1 << 12,
    DIRECT_MESSAGE_REACTIONS: 1 << 13,
    DIRECT_MESSAGE_TYPING: 1 << 14,
    MESSAGE_CONTENT: 1 << 15,
    GUILD_SCHEDULED_EVENTS: 1 << 16,
    AUTO_MODERATION_CONFIGURATION: 1 << 20,
    AUTO_MODERATION_EXECUTION: 1 << 21
};

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

        var intents = (INTENTS.GUILDS | INTENTS.GUILD_MESSAGES | INTENTS.MESSAGE_CONTENT);
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

