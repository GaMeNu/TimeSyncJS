import discord from "discord.js"
import { SlashCommandSubcommandBuilder } from "discord.js";

import DBAPI from "../../../db/db_api";
import GM from "../../../util/globals";

const settings: {[key: string]: (userID: number, setting: any) => Promise<void>} = {
    calendar: DBAPI.setUserCalendar
}

async function execute(interaction: discord.ChatInputCommandInteraction) {
    let setting = interaction.options.getString("setting")

    if (setting == undefined){
        await interaction.reply("You must include a setting to unset.");
        return;
    }

    let user = interaction.options.getUser("user");

    if (user !== null && interaction.user.id !== GM.INSTANCE.AUTHOR_ID) {
        await interaction.reply("You do not have permission to change others' settings.");
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

    if (userdata[setting] == null) {
        await interaction.reply(`You do not have setting \`${setting}\` set yet!`);
    }

    try {
        await settings[setting](userIDInt, null); // Delete user's setting
    } catch (error) {
        await interaction.reply(`An error occured while trying to unset setting \`${setting}\`.\n${error}`);
        console.error(error);
    } finally {
        if (user !== null ) await interaction.reply(`Successfully unset setting \`${setting}\` for user \`@${user.username}\`!
(previous value: \`${userdata[setting]}\`)`);
        else await interaction.reply(`Successfully unset setting \`${setting}\` for you!
(previous value: \`${userdata[setting]}\`)`);
    }

}

let cmd = new SlashCommandSubcommandBuilder()
    .setName("unset")
    .setDescription("Unset the value of a specified setting")
    .addStringOption(
        option => option
            .setName("setting")
            .setDescription("Setting to unset the value of")
            .setChoices(Object.keys(settings).map(val => {
                return {name: val, value: val}
            }))
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