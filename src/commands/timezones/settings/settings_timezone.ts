import discord from "discord.js";
import { SlashCommandSubcommandBuilder } from "discord.js";
import Fuse from "fuse.js";

import DBAPI from "../../../db/db_api";
import { IANATimeZones } from "../../../util/timezones";

import FuzzyTz from "../../../util/fuzzy_tz";
import Globals from "../../../util/globals";




async function execute(interaction: discord.ChatInputCommandInteraction) {
    let tz = interaction.options.getString("timezone")
    if (tz == undefined || tz == null){
        await interaction.reply("You must include a timezone.");
        return;
    }

    let user = interaction.options.getUser("user");

    if (user !== null && interaction.user.id !== Globals.AUTHOR_ID){
        interaction.reply("You do not have permission to change others' timezone.");
        return;
    }

    // Check whether the timezone exists
    if (!IANATimeZones.includes(tz)){

        let searchPage = FuzzyTz.fuzzySearchPageTz(tz, 0, 10);

        // Generate response string 
        let response = `Could not find specified timezone \`${tz}\`.`

        if (searchPage.totalResultsCount > 0){

            response += " Did you mean any of the folllowing options?\n"
            searchPage.results.forEach(element => {
                response += `- \`${element}\`\n`
            })

            if (searchPage.totalResultsCount > searchPage.results.length){
                let unincluded = (searchPage.totalResultsCount - searchPage.results.length)
                response += `\`${unincluded}\` more options are hidden...`
            }
        }
        await interaction.reply(response);
        return;
    }
    
    let userID: string;

    if (user !== null) userID = user.id;
    else userID = interaction.user.id;

    let userIDInt = Number.parseInt(userID, 10);

    let res = await DBAPI.setUserTimezone(userIDInt, tz);
    try {
        if (user !== null ) await interaction.reply(`Successfully set \`@${user.username}\`'s timezone to \`${tz}\`!`);
        else await interaction.reply(`Successfully set your timezone to \`${tz}\`!`);
    } catch (error) {
        await interaction.reply(`An error occured while trying to set the timezone.\n${error}`);
        console.error(error);
    }

}

let cmd = new SlashCommandSubcommandBuilder()
        .setName("timezone")
        .setDescription("Set your timezone")
        .addStringOption(option => 
            option
            .setName("timezone")
            .setDescription("Your timezone of choice")
            .setRequired(true)
        ).addUserOption(option => 
            option
            .setName("user")
            .setDescription("A user to set timezone of (requires permissions)")
        );

module.exports = {
    data: cmd,
    execute
}