import dotenv from "dotenv";
import discord from "discord.js";
import { deploy_cmds, set_client_commands } from "./deploy_cmds";
const configdata = require("../config.json");


dotenv.config(); // ENV VARS

const client = new discord.Client({intents: [discord.GatewayIntentBits.Guilds, discord.GatewayIntentBits.GuildMessages, discord.GatewayIntentBits.MessageContent]});

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


client.on(discord.Events.InteractionCreate, async interaction => {
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
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}


})

client.on(discord.Events.MessageCreate, async (message) => {
    if (message.content === "/sync_cmds"){
        if (message.author.id !== AUTHOR_ID) {
            await message.reply("No permission.")
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

