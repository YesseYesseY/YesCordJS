const WebSocket = require("ws");
const axios = require("axios");
const os = require("os");

// TODO: Use events ?

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

yesdebug = false

/** @param {boolean} val  */
function set_debug(val) {
    yesdebug = val
}

function debug_log(message) {
    if (yesdebug) {
        console.log(message)
    }
}

function debug_error(message, error) {
    if (yesdebug) {
        console.error(message, error)
    }
}

class DiscordBot {
    constructor(intents=0) {
        this.intents = intents;

        /** @description READY gateway event */
        this.OnReady = undefined;

        /** @description MESSAGE_CREATE gateway event */
        this.OnMessageCreate = undefined;
    }

    /** @param {string} token */
    start(token) {
        if (!token.startsWith("Bot ")) token = "Bot " + token;
        this.token = token;
        this.ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");
        this.ws.addEventListener("open", this._on_ws_open);
        this.ws.addEventListener("close", this._on_ws_close);
        this.ws.addEventListener("error", this._on_ws_error);
        this.ws.addEventListener("message", (event) => {
            this._on_ws_message(event)
        });
    }

    /**
     * @param {string} url 
     * @param {object} body 
     * @private
     */
    _send_authed_post_request(url, body) {
        axios.post(url, body, {
            headers: {
                "Authorization": this.token
            }
        });
    }

    /** @private */
    _on_ws_open() {
        debug_log("WebSocket connected");
    }
    
    /** @private */
    _on_ws_close() {
        debug_log("WebSocket closed");
    }
    
    /** @private */
    _on_ws_error(error) {
        debug_error("WebSocket error:", error);
    }

    /** @private */
    _on_ws_message(event) {
        const data = JSON.parse(event.data);
    
        if (data.op == 10) {
            this.ws.send(JSON.stringify({
                "op": 1,
                "d": null
            }));
    
            this.ws.send(JSON.stringify({
                "op": 2,
                "d": {
                    "token": this.token,
                    "properties": {
                        "$os": os.platform(),
                        "$browser": "YesCordJS",
                        "$device": "YesCordJS"
                    },
                    "intents": this.intents
                }
            }));
        }
        else if (data.op == 11) {
            debug_log("Heartbeat ACK");
        }
        else if (data.op == 0) {
            debug_log("Dispatch: " + data.t);
            
            if (data.t == "READY") {
                if (this.OnReady != undefined) {
                    this.OnReady(data.d);
                }
            }
    
            if (data.t == "MESSAGE_CREATE") {
                if (this.OnMessageCreate != undefined) {
                    this.OnMessageCreate(data.d);
                }
            }
        }
        else 
        {
            debug_log("Unknown OP: " + data.op);
        }
    }
    
    /**
     * @param {string|number} channel_id 
     * @param {string} content 
     */
    send_message(channel_id, content) {
        this._send_authed_post_request(`https://discord.com/api/v10/channels/${channel_id}/messages`, {
            content: content
        });
    }
}

module.exports = {
    DiscordBot,
    INTENTS,
    set_debug
}