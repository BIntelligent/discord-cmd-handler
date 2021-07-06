# Chnage Logs
- Version V2
# What's New?
1. It's completely changed from v1.
2. Fixed the cooldown not working bug.
3. Before there were no variables for logging settings.
You can find them [here](https://github.com/BIntelligent/discord-cmd-handler#variables-and-settings-help)
4. Fixed a bug in help command :)

# Configuration
To install the command handler, install `npm` and then in a terminal run this command where you want your bot `npm i @silent-coder/discord-cmd-handler`. After it create your main file (index.js) and add this into it :
```js
const {
    cmdHandler,
    logger
} = require("@silent-coder/discord-cmd-handler");
const Discord = require("discord.js")
const client = new Discord.Client();

client.login("TOKEN HERE");

client.on("ready", () => {
    //I'm using logger and not console beacuse it has colours :) 
    logger.info(`Logged in as ${client.user.tag} Successfully..!!`)
    cmdHandler(client,{
        logs: {
            consoleLogEnabled: true,
            consoleLogMessage: "{user.tag} ( {user.id} ) ran a command: {command} in {guild.name} ( {channel.name} )",
            cmdLogEnabled: false,
            cmdLogChannel: "ChannelID HERE",
            cmdLogMessage: "{user.tag} ( {user.id} ) ran a command: {command} in {guild.name} ( {channel.name} )"
        },
        cooldownMSG: "Calm down, {user.tag}, You still have {time} before you can run the command again.",
        EnableCommmandonEdit: true,
        mentionPrefix: true,
        prefix: "?",
        owners: ["YOUR DISCORD ID", "YOUR TRUSTED FRIEND Discord ID"],
        path: __dirname + "/commands",
        events_path: __dirname + "/events",
        logCommands: true
    });
    //This will load all commands.
});
```
# Usage
After adding the above code to **index.js** you need todo the following steps to make **Command Handler** work:- 

1.  Make a Directory ( Folder ) in the same Directory where your main file ( index.js ) is located. Name the folder `commands`.
2. Open the Directory that you made.
3. Make a new Directory ( Folder ) inside the `commands` Directory. This Folder will be the name of the Category. You can name it anything.
4. Open the Directory that you made.
5. Now make a `module.json` and put this inside it. 
```js
{
   "hide": false
}
```
6. Save the file.
7. Now You can make a file `help.js` and paste this [Code](https://github.com/silent-coder/discord-cmd-handler#help-command).
8. Save the file.
9. You can make as many as many commands as you like using this [Template](https://github.com/silent-coder/discord-cmd-handler#commands).
10. Feel free to DM me on Discord `☠ Be Intelligent ☠#2385` if having any issues & Enjoy! 
# Templates
## Commands
```js
const Discord = require("discord.js")
exports.run = async (client, message, args, logger) => {
    try {

        //Put Code Here

    } catch (error) {
        logger.error(error);
    }
}

exports.help = {
    name: "Command-Name",
    description: "Command-description",
    usage: "Command-usage",
    example: "Command-example"
}

exports.conf = {
    aliases: [], //Other names of the command.
    cooldown: 5 // % seconds of cooldown, Owners have bypass
}
```
## Help Command
This will auto make help command when adding new commands.
```js
const Discord = require("discord.js");
const {
    settingFunction
} = require("@silent-coder/discord-cmd-handler")
exports.run = async (client, message, args) => {
    let prefix = settingFunction().prefix;
    if (!args[0]) {
        // This will turn the folder (category) into array.
        let module = client.helps.array();

        // This will hide a folder from display that includes "hide: true" in their module.json
        if (!settingFunction().owners.includes(message.author.id)) module = client.helps.array().filter(x => !x.hide);

        const embed = new Discord.MessageEmbed()
            .setColor(0x1d1d1d)
            .setTimestamp(new Date())
            .setDescription(`Type \`${prefix}help [command]\` to get more specific information about a command.`)
            .setTitle("My Bot")
            .setAuthor("Bot made by Me.!!")
            .setFooter(
                "Requested by " + message.author.username,
                message.author.displayAvatarURL({
                    format: "png",
                    dynamic: true
                })
            )
        let i = 0;
        for (const mod of module) {
            // You can change the .join(" | ") to commas, dots or every symbol.
            embed.addField(mod.name, mod.cmds.map(x => `\`${x}\``).join(" | "));
            i++
        };
        return message.channel.send(embed);




    } else {
        let cmd = args[0];

        // If the user type the [command], also with the aliases.
        if (client.commands.has(cmd) || client.commands.get(client.aliases.get(cmd))) {
            let command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
            let name = command.help.name; // The command name.
            let desc = command.help.description; // The command description.
            let cooldown = command.conf.cooldown + " second(s)"; // The command cooldown.
            let aliases = command.conf.aliases.join(", ") ? command.conf.aliases.join(", ") : "No aliases provided.";
            let usage = command.help.usage ? command.help.usage : "No usage provided.";
            let example = command.help.example ? command.help.example : "No example provided.";

            let embed = new Discord.MessageEmbed()
                .setColor(0x7289DA)
                .setTitle(name)
                .setDescription(desc)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter("[] optional, <> required. Don't includes these things while typing a command.")
                .addField("Cooldown", cooldown)
                .addField("Aliases", aliases, true)
                .addField("Usage", usage, true)
                .addField("Example", example, true)

            return message.channel.send(embed);
        } else {
            // If the user type the wrong command.
            return message.channel.send({
                embed: {
                    color: "RED",
                    description: "Unknown command."
                }
            });
        }
    }
}

exports.help = {
    name: "help",
    description: "Show a command list.",
    usage: "help [command]",
    example: "/help verify"
}

exports.conf = {
    aliases: ["?"],
    cooldown: 5
}
```
# Variables and Settings Help.
```js
/**
 =====================================================
 * Setting: "consoleLogEnabled",
 * This Setting is a @Boolean Which means either "true" or either "false".
 * It's for to either log when a User executes a command.
 * e.g if it's set to true it will log a message like this:-
 * "MyNameGamerXD ran a command: help in My-Server at bot-commands."
 * if it's set to false it won't log that.
 * =====================================================
 * Setting: "consoleLogMessage",
 * This settings is a @string which means you hav eto give a input e.g a sentence.
 * It's the message which will get logged  when Setting: "consoleLogEnabled" is set to true.
 * Variables for this setting are as follows:-
 * - {user.tag} || for User's tag. e.g "MyNameGamerXD#5789"
 * - {user.username} || for User's username. e.g "MyNameGamerXD"
 * - {user.id} || for User's id. e.g "1234567890"
 * - {command} || Command that User executed.
 * - {guild.name} || Name of guild where command was executed.
 * - {guild.id} || ID of guild where command was executed.
 * - {channel.name} || Name of Channel where command was executed.
 * - {channel.id} || ID of Channel where command was executed.
 * =====================================================
 * setting: "EnableCommmandonEdit"
 * This Setting is a @Boolean Which means either "true" or either "false".
 * It's for if you want the command to execute if someone edits the message.
 * ===================================================== * 
 * setting: "cmdLogEnabled",
 * This Setting is a @Boolean Which means either "true" or either "false".
 * It's for either to send a message in a discord log channel that someone ran a comamnd. 
 * =====================================================
 * setting: "cmdLogChannel",
 * This Setting is a @Number.
 * If setting: "cmdLogEnabled" is set to true than a discord channel id is required in here.
 * =====================================================
 * setting: "cmdLogChannel",
 * This settings is a @string which means you hav eto give a input e.g a sentence.
 * It's the message which will get logged  when Setting: "cmdLogChannel" is set to true.
 * Variables for this setting are as follows:-
 * - {user.tag} || for User's tag. e.g "MyNameGamerXD#5789"
 * - {user.username} || for User's username. e.g "MyNameGamerXD"
 * - {user.id} || for User's id. e.g "1234567890"
 * - {command} || Command that User executed.
 * - {guild.name} || Name of guild where command was executed.
 * - {guild.id} || ID of guild where command was executed.
 * - {channel.name} || Name of Channel where command was executed.
 * - {channel.id} || ID of Channel where command was executed.
 * ===================================================== * 
 * setting: "cooldownMSG",
 * This setting is a @string which means you hav eto give a input e.g a sentence.
 * It's the message which will be sent when a user is spamming commands.
 * Variables for this setting are as follows:-
 * - {time} || for time left. e.g 10 (seconds)
 * - {user.tag} || for User's tag. e.g "MyNameGamerXD#5789"
 * - {user.username} || for User's username. e.g "MyNameGamerXD"
 * =====================================================
 * setting: "mentionPrefix",
 * This Setting is a @Boolean Which means either "true" or either "false".
 * It's so if you want to run a command by mentioning the bot.
 * Example:-
 *          "@myBot ping"
 * That above example will work same as if you have done "<YouPrefixHere>ping".
 * =====================================================
 * setting: "prefix",
 * This is a @string so you have to put a unique symbol here.
 * It's a unique symbol which everyone can use before the command to use your bot.
 * Example:-
 *          "?".
 * =====================================================
 * setting: "owners",
 * It's a @Array which mean you can add mutiple values to it.
 * It's for owner's. owner's of the bot can put there discord ID's in here and this will amke so they can bypass cooldown's and can see / use hidden commands.
 * =====================================================
 * setting: "path",
 * It's the path to your commands folder.
 * =====================================================
 * setting: "logCommands",
 * This Setting is a @Boolean Which means either "true" or either "false".
 * This Setting si for wether you want to log that which commands are loaded on startup of bot.
 * 
 */
```