# Configuration
To install the command handler, install `npm` and then in a terminal run this command where you want your bot `npm i @secret-silent-coder/discord-cmd-handler`. After it create your main file (index.js) and add this into it :
```js
const {
    CommandHandler,
    loadCommands
} = require("@secret-silent-coder/discord-cmd-handler");
const Discord = require("discord.js")
const client = new Discord.Client();

client.login("TOKEN HERE");

let settings = {
    logs: {
        consoleLogEnabled: true,//wether to log if someone ran a command in console.
        consoleLogMessage: "",//what to log when someone ran a command. Leave empty to use default one.
        cmdLogEnabled: false,//wether to send a  message  if someone ran command or no to discord.
        cmdLogChannel: "ChannelID HERE",//channel id
        cmdLogMessage: ""//message to send if someone ran a command to discord. leave empty to use default.
    },
    mentionPrefix: true,// this will make so you can <@Your BOt> <CommandName>
    prefix: "?",//prefix
    owners: ["YOUR DISCORD ID", "YOUR TRUSTED FRIEND Discord ID"],//Owner ID to show hidden catogaries
    path: __dirname + "/commands",// path to commands folder
    logCommands: true //This'll Log the commands it loaded.
}
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag} Successfully..!!`)
    loadCommands(client, settings)
    //This will load all commands.
});

client.on("message", (message) => {
    CommandHandler(client, message, settings);
    //This'll run commands.
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
    hide: false
}
```
6. Save the file.
7. Now You can make a file `help.js` and paste this [Code](https://github.com/BIntelligent/CommandHandler#help-command).
8. Save the file.
9. You can make as many as many commands as you like using this [Template](https://github.com/BIntelligent/CommandHandler#commands).
10. Feel free to DM me on Discord `☠ Be Intelligent ☠#2385` if having any issues & Enjoy! 
# Templates
## Commands
```js
const Discord = require("discord.js")
exports.run = async (client, message, args) => {
    try {

        //Put Code Here

    } catch (error) {
        console.error
    }
    message.channel.send("Pong!")
}

exports.help = {
    name: "Command Name",
    description: "Command description",
    usage: "Command usage",
    example: "Command example"
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
} = require("@secret-silent-coder/discord-cmd-handler")
exports.run = async (client, message, args) => {
    let prefix = settingFunction().prefix;
    if (!args[0]) {
        // This will turn the folder (category) into array.
        let module = client.helps.array();

        // This will hide a folder from display that includes "hide: true" in their module.json
        if (!settingFunction().owners.includes(message.author.id)) module = client.helps.array().filter(x => !x.hide);
        require("fs").readdir(require("path").join(__dirname, `/../`), (err, categories) => {
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
            for (let i = 0; i < categories.length; i++) {
                for (let mod of module) {
                    // You can change the .join(" | ") to commas, dots or every symbol.          
                    embed.addField(`${categories[i]}`, `${mod.cmds.map(x => `\`${x}\``).join(" | ") || "No Commands Found!"}`);
                }
            }
            return message.channel.send(embed);
        });



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
