import discord from "discord.js";
import { SlashCommandSubcommandBuilder } from "discord.js";
import Fuse from "fuse.js";

import DBAPI from "../../../db/db_api";
import { IANATimeZones } from "../../../util/timezones";
import GM from "../../../util/globals";


async function execute(interaction: discord.ChatInputCommandInteraction) {
    let calendar = interaction.options.getString("calendar")
    if (calendar == undefined || calendar == null){
        await interaction.reply("You must include a calendar.");
        return;
    }

    let user = interaction.options.getUser("user");

    if (user !== null && interaction.user.id !== GM.INSTANCE.AUTHOR_ID){
        await interaction.reply("You do not have permission to change others' timezone.");
        return;
    }

    if (!Intl.supportedValuesOf('calendar').includes(calendar)){
        await interaction.reply("Invalid calendar type.");
        return;
    }
    
    let userID: string;

    if (user !== null) userID = user.id;
    else userID = interaction.user.id;

    let userIDInt = Number.parseInt(userID, 10);

    // Make sure the user has already registered an "account"
    let userdata = await DBAPI.getUserData(userIDInt);
    if (userdata === null){
        await interaction.reply("Please set your timezone first!");
        return;
    }

    try {
        await DBAPI.setUserCalendar(userIDInt, calendar); // Set user's calendar
    } catch (error) {
        await interaction.reply(`An error occured while trying to set the calendar.\n${error}`);
        console.error(error);
    } finally {
        if (user !== null ) await interaction.reply(`Successfully set \`@${user.username}\`'s calendar to \`${calendar}\`!`);
        else await interaction.reply(`Successfully set your calendar to \`${calendar}\`!`);
    }

}


let cmd = new SlashCommandSubcommandBuilder()
        .setName("calendar")
        .setDescription("Set your preferred calendar")
        .addStringOption(option => 
            option
            .setName("calendar")
            .setDescription("Your calendar of choice")
            .setRequired(true)
            .setChoices(Intl.supportedValuesOf('calendar').map((val) => {
                return {name: val, value: val};
            }))
        ).addUserOption(option => 
            option
            .setName("user")
            .setDescription("A user to set timezone of (requires permissions)")
        );

module.exports = {
    data: cmd,
    execute
}