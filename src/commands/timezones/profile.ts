import discord, { SlashCommandSubcommandBuilder } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import fs from "node:fs";
import path from "node:path";

import DBAPI from "../../db/db_api";
import CmdUtils, {SubcommandDispatcher} from "../../util/command_utils";



let cmd = new SlashCommandBuilder()
.setName("profile")
.setDescription("Get a user's profile")
.addUserOption(option => option
    .setName("user")
    .setDescription("User to get profile of (Default: you)")
    .setRequired(false)
);



async function execute(interaction: discord.ChatInputCommandInteraction){
    let user = interaction.options.getUser("user", false);
    if (user == null) user = interaction.user;
    let userID = Number.parseInt(user.id, 10);
    let userData = await DBAPI.getUserData(userID);

    if (userData == null){
        await interaction.reply(`\`@${user.username}\` has not registered with TimeSync yet!`);
        return;
    }

    const embed = new discord.EmbedBuilder()
    .setColor(discord.Colors.Fuchsia)
    .setTitle(`@${user.username}'s profile`)
    .setThumbnail(user.displayAvatarURL())
    .addFields(
        {
            name: "Timezone",
            value: userData.timezone,
            inline: false
        }
    );
    if (userData.calendar != null){
        embed.addFields(
            {
                name: "Preferred Calendar",
                value: userData.calendar,
                inline: false
            }
        )
    }
    if (userData.sleep_time != null){
        embed.addFields(
            {
                name: "Sleep time",
                value: userData.sleep_time,
                inline: false
            }
        )
    }

    await interaction.reply({
        embeds: [ embed ]
    })
}

module.exports = {
    data: cmd,
    execute
}
