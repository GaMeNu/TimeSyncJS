import discord from "discord.js";
import { SlashCommandSubcommandBuilder } from "discord.js";
import Fuse from "fuse.js";

import DBAPI from "../../../db/db_api";
import { IANATimeZones } from "../../../util/timezones";

import FuzzyTz from "../../../util/fuzzy_tz";
import GM from "../../../util/globals";
import Inputs from "../../../util/inputs";
import { DateTime } from "luxon";




async function execute(interaction: discord.ChatInputCommandInteraction) {
    let sleeptimeRaw = interaction.options.getString("sleeptime", true)

    let user = interaction.options.getUser("user");

    if (user !== null && interaction.user.id !== GM.INSTANCE.AUTHOR_ID){
        interaction.reply("You do not have permission to change others' settings.");
        return;
    }

    let userID: string;
    if (user !== null) userID = user.id;
    else userID = interaction.user.id;

    const userIDInt = parseInt(userID, 10)

    let sleeptime: DateTime;
    try {
        sleeptime = Inputs.parseTime(sleeptimeRaw);
    } catch {
        interaction.reply("An error has occured while attemptimg to parse input time.\nAre you sure your format is correct?");
        return;
    }

    let sleeptimeFmt = `${sleeptime.hour}:${sleeptime.minute}:${sleeptime.second}`;

    let userdata = await DBAPI.getUserData(userIDInt);
    if (userdata === null){
        await interaction.reply("Please set your timezone first!");
        return;
    }
    
    try {
        await DBAPI.reconfigureUser(userIDInt, {sleep_time: sleeptimeFmt});
    } catch (error) {
        await interaction.reply("An error has occured while trying to set the sleep time!")
        console.error(error);
        return;
    }

    if (user !== null ) await interaction.reply(`Successfully set \`@${user.username}\`'s sleep time to \`${sleeptimeFmt}\`!`);
    else await interaction.reply(`Successfully set your sleep time to \`${sleeptimeFmt}\`!`);
}

let cmd = new SlashCommandSubcommandBuilder()
        .setName("sleeptime")
        .setDescription("Set your sleep time (for reminders to go eepy)")
        .addStringOption(option => 
            option
            .setName("sleeptime")
            .setDescription("Your sleep time of choice. Format: HH:MM(:SS)")
            .setRequired(true)
        ).addUserOption(option => 
            option
            .setName("user")
            .setDescription("A user to set sleeptime of (requires permissions)")
        );

module.exports = {
    data: cmd,
    execute
}