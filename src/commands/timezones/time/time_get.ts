import discord, { SlashCommandSubcommandBuilder } from "discord.js";
import { DateTime } from "luxon";
import DBAPI from "../../../db/db_api";
const configdata = require("../../../../config.json");

async function execute(interaction: discord.ChatInputCommandInteraction){
    const DEFAULT_CALENDAR = configdata["default_calendar"];
    
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
    }

    if (calendar == null) {
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
            value: `**${date.toLocaleString(DateTime.TIME_24_WITH_SECONDS)}**`,
            inline: false
        }
    ]);

    // Check default calendar
    if (calendar !== DEFAULT_CALENDAR){
        embed.addFields({
                name: "Current Date",
                value: `**${date.toFormat("LLL dd, yyyy")}**`,
                inline: true
            },
            {
                name: `Current Date (default)`,
                value: `**${date.reconfigure({outputCalendar: DEFAULT_CALENDAR}).toFormat("LLL dd, yyyy")}**`,
                inline: true
            }
        )
    } else {
        embed.addFields({
                name: "Current Date",
                value: `**${date.toFormat("LLL dd, yyyy")}**`,
                inline: false
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