import dotenv from "dotenv";
import discord from "discord.js";
import { deploy_cmds, set_client_commands } from "./deploy_cmds";
import { IANATimeZones } from "./util/timezones";
const configdata = require("../config.json");


dotenv.config(); // ENV VARS

const client = new discord.Client({intents: [discord.GatewayIntentBits.Guilds, discord.GatewayIntentBits.GuildMessages, discord.GatewayIntentBits.MessageContent, discord.GatewayIntentBits.GuildIntegrations]});

const TOKEN: string = configdata["token"];

const AUTHOR_ID: string = configdata["author_id"]

client.once(discord.Events.ClientReady, readyClient => {
    console.log("Connected to the Discord Gateway.");
    console.log("Updating client commands...");
    set_client_commands(readyClient);
    console.log("Finished updating client commands.")
    
    console.log(`Client is ready! Logged in as ${readyClient.user.displayName} (${readyClient.user.tag})`);
    client.user?.setPresence({
        activities: [{name: "with JavaScript", type: discord.ActivityType.Playing}],
        status: discord.PresenceUpdateStatus.Online
    })
})


client.on(discord.Events.InteractionCreate, async (interaction: discord.Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    let command;

    try {
        command = interaction.client.commands.get(interaction.commandName);
    } catch (error){
        interaction.reply("This command is not updated with the client. Please try again later.");
    }

    if (!command){
        console.error(`No command matching ${interaction.commandName} was found.`);
		return;
    }

    try {
		await command.execute(interaction);
	} catch (error) {
        const actErr: Error = error as Error;
        console.error(error);
        let channel = interaction.channel;

        let resp = `The previous command had an error while executing :(\n${actErr.name}: ${actErr.message}`;
        if ('code' in actErr){
            resp += `\nCode: \`${actErr.code}\``
        }

        if (interaction.isRepliable()){
            await interaction.reply(resp);
        } else {
            await channel?.send(resp);
        }
	}


})

client.on(discord.Events.MessageCreate, async (message) => {
    if (message.content.startsWith("/sync_cmds")){
        if (message.author.id !== AUTHOR_ID) {
            await message.reply("No permission.")
        }
        let username = client.user?.username;
        if (username !== undefined && !message.content.includes(username)){
            return;
        }

        let beginMsg = await message.reply("Begun syncing commands!");
        try {
            await deploy_cmds(client);
            beginMsg.reply("Commands synced successfully!")
        } catch(error) {
            beginMsg.reply("An error occured while syncing commands!")
        } 
    }
})
client.login(TOKEN);

