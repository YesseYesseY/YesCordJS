const config = require("./config.json");
const {DiscordBot, INTENTS, set_debug} = require("./yescord.js")
const commands = require("./commands.json")

set_debug(true)

const Bot = new DiscordBot(intents=(INTENTS.GUILDS | INTENTS.GUILD_MESSAGES | INTENTS.MESSAGE_CONTENT))

Bot.OnReady = (data) => {
    console.log("User: " + data.user.username);
    // console.log(data)
}

Bot.OnMessageCreate = (data) => {
    if (data.content == "!ping") {
        Bot.send_message(data.channel_id, "Pong!")
    }
}

Bot.OnInteractionCreate = (data) => {
    // console.log(data)
    if (data.data.name == "ping") {
        Bot.respond_with_message(data, "Pong!", ephemeral=true);
    }
    
    else if (data.data.name == "add") {
        Bot.respond_with_message(data, `${data.data.options[0].value} + ${data.data.options[1].value} = ${data.data.options[0].value + data.data.options[1].value}!`);
    }
}

// Bot.register_commands(commands, config.application_id)
Bot.start(config.token)