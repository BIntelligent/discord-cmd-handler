const Discord = require("discord.js");
const logger = require("@greencoast/logger");
const fs = require("fs");

let settingFunc;




async function CommandHandler(client, message, settings) {
    const cooldowns = new Discord.Collection();
    if (message.author.bot || message.author === client.user) return;
    let prefix = settings.prefix;
    if (!prefix) {
        logger.error("No Prefix was Provided.");
        process.exit(1);
    }
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
            // If the user wasn't you or other owners that stored in config.json
            timestamps.set(member.id, now);
        }
    } else {
        const expirationTime = timestamps.get(member.id) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.channel.send(`Calm down dude, please wait **${timeLeft.toFixed(1)}** seconds to try the command again.`);
        }
        timestamps.set(member.id, now);
        setTimeout(() => timestamps.delete(member.id), cooldownAmount); // This will delete the cooldown from the user by itself.
    }
    try {
        if (commandFile) {
            commandFile.run(client, message, args);
        }
    } catch (error) {
        logger.error(error);
    } finally {
        // If you want to really know, who is typing or using your bot right now.
        if (settings.logs.consoleLogEnabled === true) {
            let ConsoleLog = settings.logs.consoleLogMessage || `${sender.tag} (${sender.id}) ran a command: ${cmd} in ${message.guild.name} (${message.channel.name})`;
            logger.info(ConsoleLog);
        }
        if (settings.logs.cmdLogEnabled === true) {
            try {
                let channel = client.channels.cache.get(settings.logs.cmdLogChannel);
                if (!channel) {
                    logger.error("Invalid Channel ID.")
                    process.exit(1);
                }
                let msg = settings.logs.cmdLogMessage || `${sender.tag} (${sender.id}) ran a command: ${cmd} in ${message.guild.name} (${message.channel.name})`;
                channel.send(msg);
            } catch (error) {}
        }
    }

}

//LOAD COMMANDS FUNCTION===========================================

function loadCommands(client, settings) {
    settingFunc = settings;
    client.commands = new Discord.Collection();
    client.aliases = new Discord.Collection();
    client.helps = new Discord.Collection();
    fs.readdir(settings.path, (err, categories) => {
        categories.forEach(category => {
            let moduleConf = require(`${settings.path}/${category}/module.json`);
            moduleConf.path = `${settings.path}/${category}`;
            moduleConf.cmds = [];
            if (moduleConf) { // If there was no module.json in the folder, return.
                client.helps.set(category, moduleConf);
            };
            fs.readdir(`${settings.path}/${category}`, (err, files) => {
                if (err) logger.error(err);
                //let commands = new Array();

                files.forEach(file => {
                    if (!file.endsWith(".js")) return; // If the file wasn't ended with .js, ignore it.
                    let prop = require(`${settings.path}/${category}/${file}`);
                    // let cmdName = file.split(".")[0];
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
}

function settingFunction() {
    return settingFunc
}


module.exports = {
    CommandHandler,
    loadCommands,
    settingFunction
};