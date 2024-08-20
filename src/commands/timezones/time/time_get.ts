import discord, { SlashCommandSubcommandBuilder } from "discord.js";
import { DateTime } from "luxon";
import DBAPI from "../../../db/db_api";
import { formatDate, formatTime } from "../../../util/timezones";
import Globals from "../../../util/globals";

async function execute(interaction: discord.ChatInputCommandInteraction){
    const DEFAULT_CALENDAR = Globals.DEFAULT_CALENDAR;
    
    let user = interaction.options.getUser("user", true);
    let userID = Number.parseInt(user.id, 10);
    let userData = await DBAPI.getUserData(userID);
    let originalUserData = await DBAPI.getUserData(parseInt(interaction.user.id, 10));

    if (userData === null){
        await interaction.reply(`\`@${user.username}\` has not set their timezone yet.`);
        return;
    }

    let timezone = userData.timezone;

    let calendar;

    if (originalUserData != null){
        calendar = originalUserData.calendar;
    } else {
        calendar = DEFAULT_CALENDAR // Default calendar
    }

    const date = DateTime.local({
        zone: timezone,
        outputCalendar: calendar
    })

    // Generate repsonse embed
    let embed = new discord.EmbedBuilder()
    .setColor(discord.Colors.Fuchsia)
    .setTitle(`${user.displayName}'s time`)
    .setThumbnail(user.displayAvatarURL())
    .addFields([{
            name: "Current Time",
            value: `**${formatTime(date)}**`,
            inline: false
        },
        {
            name: "Current Date",
            value: `**${formatDate(date)}**`,
            inline: calendar !== DEFAULT_CALENDAR
        }
    ]);
    

    // Check default calendar
    if (calendar !== DEFAULT_CALENDAR){
        embed.addFields(
            {
                name: `Current Date (default)`,
                value: `**${formatDate(date.reconfigure({outputCalendar: DEFAULT_CALENDAR}))}**`,
                inline: true
            }
        )
    }

    embed.addFields(
        {
            name: "Time Zone",
            value: `${timezone}`,
            inline: false
        }
    );

    await interaction.reply({
        embeds: [embed]
    });

}

let cmd = new SlashCommandSubcommandBuilder()
        .setName("get")
        .setDescription("Get a user's timezone")
        .addUserOption(option => 
            option
            .setName("user")
            .setDescription("A user to get timezone of")
            .setRequired(true)
        );

module.exports = {
    data: cmd,
    execute
}