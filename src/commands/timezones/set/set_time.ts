import discord from "discord.js";
import { SlashCommandSubcommandBuilder } from "discord.js";
import Fuse from "fuse.js";

import DBAPI from "../../../db/db_api";
import { IANATimeZones } from "../../../util/timezones";

let configdata = require("../../../../config.json");


async function execute(interaction: discord.ChatInputCommandInteraction) {
    let tz = interaction.options.getString("timezone")
    if (tz == undefined || tz == null){
        await interaction.reply("You must include a timezone.");
        return;
    }

    let user = interaction.options.getUser("user");

    if (user !== null && interaction.user.id !== configdata["author_id"]){
        interaction.reply("You do not have permission to change others' timezone.");
        return;
    }

    // Check whether the timezone exists
    if (!IANATimeZones.includes(tz)){

        // Perform fuzzy search for closest IANA timezone
        let fuse = new Fuse(IANATimeZones, {
            includeScore: true,
            shouldSort: true
        });
        let tzRes = fuse.search(tz).filter((val) => {
            if (val.score == undefined) return true;
            return (val.score <= 0.4);
        });

        // A few datas we need for the repsonse generation
        let tooManyResults = tzRes.length > 10;
        let originalLen = tzRes.length;

        if (tooManyResults) tzRes = tzRes.slice(0, 10);

        // Generate response string 
        let response = "Could not find specified timezones."
        if (originalLen > 0) {
            response += " Did you mean any of the folllowing options?\n"
            tzRes.forEach(element => {
                let name = element.item;
                response += `- \`${name}\`\n`
            })

            if (tooManyResults) {
                let unincluded = (originalLen - tzRes.length)
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