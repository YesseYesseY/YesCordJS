const config = require("./config.json");
const {DiscordBot, INTENTS, set_debug} = require("./discord.js")

set_debug(true)

const Bot = new DiscordBot(intents=(INTENTS.GUILDS | INTENTS.GUILD_MESSAGES | INTENTS.MESSAGE_CONTENT))

Bot.OnReady = (data) => {
    console.log("User: " + data.user.username);
}

Bot.OnMessageCreate = (data) => {
    if (data.content == "!ping") {
        Bot.send_message(data.channel_id, "Pong!")
    }
}

Bot.start(config.token)
