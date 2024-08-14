import discord, { SlashCommandSubcommandBuilder } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import fs from "node:fs";
import path from "node:path";

import DBAPI from "../../db/db_api";
import CmdUtils, {SubcommandDispatcher} from "../../util/command_utils";



let cmd = new SlashCommandBuilder()
.setName("unregister")
.setDescription("Get a user's profile")
.addStringOption(option => option
    .setName("confirmation")
    .setDescription("Enter confirmation string")
    .setRequired(false)
);



async function execute(interaction: discord.ChatInputCommandInteraction){
    let confirmation = interaction.options.getString("confirmation");
    
    let userID = parseInt(interaction.user.id, 10);

    const confirmedString = interaction.user.username;

    if (confirmation == null){
        interaction.reply(`This action will **delete all data** registered with your discord ID.
**WARNING:** This action is **IRREVERSIBLE**!
Type the command again with your username in the confirmation box to confirm unregistration
(\`/${cmd.name} confirmation:${confirmedString}\`)`)
            return;
    }

    if (confirmation !== confirmedString){
        interaction.reply("Invalid confirmation string!")
        return;
    }

    try {
        await DBAPI.deleteUserData(userID);
    } catch (error) {
        await interaction.reply(`An error occured while trying to delete your data.\n${error}`);
        console.error(error);
    } finally {
        interaction.reply("Succesfully deleted your data!")
    }
}

module.exports = {
    data: cmd,
    execute
}
