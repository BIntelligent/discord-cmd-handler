const logger = require("@greencoast/logger");
const fs = require("fs");
const Discord = require("discord.js")
const cooldowns = new Discord.Collection();
let settingFunc;

async function cmdHandler(client, settings) {
    /**
     * Load's commands
     */
    settingFunc = settings;
    client.commands = new Discord.Collection();
    client.aliases = new Discord.Collection();
    client.helps = new Discord.Collection();
    fs.readdir(settings.path, (err, categories) => {
        categories.forEach(category => {
            let moduleConf = require(`${settings.path}/${category}/module.json`);
            moduleConf.path = `${settings.path}/${category}`;
            moduleConf.cmds = [];
            moduleConf.name = category;
            if (moduleConf) { // If there was no module.json in the folder, return.
                client.helps.set(category, moduleConf);
            } else {
              moduleConf.hide = "false";
              }
            fs.readdir(`${settings.path}/${category}`, (err, files) => {
                if (err) logger.error(err);

                files.forEach(file => {
                    if (!file.endsWith(".js")) return; // If the file wasn't ended with .js, ignore it.
                    let prop = require(`${settings.path}/${category}/${file}`);
                    if (settings.logCommands === true) logger.debug(`Loaded ${file}`);
                    client.commands.set(prop.help.name, prop)
                    prop.conf.aliases.forEach(alias => {
                        client.aliases.set(alias, prop.help.name);
                    });
                    client.helps.get(category).cmds.push(prop.help.name);
                    // This will push the data into Collection, which is includes name of the file, aliases, and many.
                });
            });
        });
    });
    // In here, we're can add some events in /events folder, so we don't need to fill it up the server.js with all these events.
    const {
        readdirSync
    } = require("fs"); // You don't need to install this again.
    try {
        const events = readdirSync("./events/");
        for (let event of events) {
            let file = require(`${settings.events_path}`);
            client.on(event.split(".")[0], (...args) => file(client, ...args));
            // This will remove the .js and only with the name of the event.
        }
    } catch (e) {
        logger.error(e)
    }
    /**
     * Run's command on message event.
     */

    client.on("message", (message) => {
        CommandHandler(client, message, settings);
    });

    /**
     * Run's command on messageUpdate event.
     */

    if (settings.EnableCommmandonEdit === true) {
        client.on("messageUpdate", (oldMessage, newMessage) => {
            CommandHandler(client, newMessage, settings);
        });
    };

}


async function CommandHandler(client, message, settings) {

    if (!message.author || message.author.bot || message.author === client.user) return;
    let prefix = settings.prefix;
    if (!prefix) throw new TypeError `No Prefix was Provided.`;

    if (settings.mentionPrefix === true) prefix = message.content.match(new RegExp(`^<@!?${client.user.id}> `)) ? message.content.match(new RegExp(`^<@!?${client.user.id}> `))[0] : settings.prefix;
    if (!message.content.startsWith(prefix)) return;
    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();
    let sender = message.author;
    // Many people don't know what is message.flags.
    // We've already seen a bot who has a message.flags or they would called, parameter things.
    message.flags = []
    while (args[0] && args[0][0] === "-") {
        message.flags.push(args.shift().slice(1)); // Example: /play -soundcloud UP pice
    }
    let commandFile = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
    if (!commandFile) return; // If the commands doesn't exist, ignore it. Don't send any warning on this.
    // This will set a cooldown to a user after typing a command.
    if (!cooldowns.has(commandFile.help.name)) cooldowns.set(commandFile.help.name, new Discord.Collection());
    const member = message.member,
        now = Date.now(),
        timestamps = cooldowns.get(commandFile.help.name),
        cooldownAmount = (commandFile.conf.cooldown || 3) * 1000;
    if (!timestamps.has(member.id)) {
        if (!settings.owners.includes(message.author.id)) {
            // If the user wasn't you or other owners that stored in settings
            timestamps.set(member.id, now);
        }
    } else {
        const expirationTime = timestamps.get(member.id) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.channel.send((settings.cooldownMSG).replace("{time}", timeLeft.toFixed(1)).replace("{user.tag}", message.author.tag).replace("{user.username}", message.author.username) || `Calm down dude, please wait **${timeLeft.toFixed(1)}** seconds to try the command again.`);
        }
        timestamps.set(member.id, now);
        setTimeout(() => timestamps.delete(member.id), cooldownAmount); // This will delete the cooldown from the user by itself.
    }
    try {
        if (commandFile) {
            commandFile.run(client, message, args, logger);
        }
    } catch (error) {
        logger.error(error);
    } finally {
        // If you want to really know, who is typing or using your bot right now.
        if (settings.logs.consoleLogEnabled === true) logger.info((settings.logs.consoleLogMessage).replace("{user.tag}", sender.tag).replace("{user.username}", sender.username).replace("{user.id}", sender.id).replace("{command}", cmd).replace("{guild.name}", message.guild.name).replace("{guild.id}", message.guild.id).replace("{channel.name}", message.channel.name).replace("{channel.id}", message.channel.id) || `${sender.tag} (${sender.id}) ran a command: ${cmd} in ${message.guild.name} (${message.channel.name})`)
        if (settings.logs.cmdLogEnabled === true) {
            try {
                let channel = client.channels.cache.get(settings.logs.cmdLogChannel);
                if (!channel) throw new TypeError `Invalid Channel ID.`;
                channel.send((settings.logs.cmdLogMessage).replace("{user.tag}", sender.tag).replace("{user.username}", sender.username).replace("{user.id}", sender.id).replace("{command}", cmd).replace("{guild.name}", message.guild.name).replace("{guild.id}", message.guild.id).replace("{channel.name}", message.channel.name).replace("{channel.id}", message.channel.id) || `${sender.tag} (${sender.id}) ran a command: ${cmd} in ${message.guild.name} (${message.channel.name})`);
            } catch (error) {}
        };
    };

};

function settingFunction() {
    return settingFunc
}
module.exports = {
    settingFunction,
    logger,
    cmdHandler
};
