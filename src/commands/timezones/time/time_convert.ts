import discord, { SlashCommandBuilder } from "discord.js";
import { SlashCommandSubcommandBuilder } from "discord.js";
import { DateTime } from "luxon";
import DBAPI from "../../../db/db_api";
import { formatDate, formatTime, IANATimeZones } from "../../../util/timezones";
import FuzzyTz from "../../../util/fuzzy_tz";
import GM from "../../../util/globals";
import Inputs from "../../../util/inputs";



function generateInvalidTzPage(tz: string): string {

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
    return response;
    
}

async function execute(interaction: discord.ChatInputCommandInteraction){
    const DEFAULT_CALENDAR = GM.INSTANCE.DEFAULT_CALENDAR;

    const userID = Number.parseInt(interaction.user.id, 10);
    const userData = await DBAPI.getUserData(userID);
    let isRegisteredUser = userData != null;

    // Define all vars
    let target_tz: string;
    let source_tz: string | null;
    let date: DateTime;
    let time: DateTime;
    let calendar: string | null | undefined;

    // Assign target timezone
    target_tz = interaction.options.getString("target_tz", true);
    if (!IANATimeZones.includes(target_tz)){
        await interaction.reply(generateInvalidTzPage(target_tz));
        return;
    }

    // Assign source timezone
    source_tz = interaction.options.getString("source_tz", false);

    if (source_tz === null) {
        if (!isRegisteredUser){
            interaction.reply("Could not get source timezone! source_tz is unfilled, and you do not appear to have a registered timezone.");
            return;
        }
        // At this point we're pretty sure the user has a registered timezone
        source_tz = (userData as DBAPI.User).timezone;
    }

    if (!IANATimeZones.includes(source_tz)){
        await interaction.reply(generateInvalidTzPage(source_tz));
        return;
    }

    let dateRaw = interaction.options.getString("date");
    if (dateRaw == null)
        date = DateTime.local({zone: source_tz});
    else {
        try {
            let newDate = Inputs.parseDate(dateRaw);
            date = DateTime.fromObject({
                year: newDate.year,
                month: newDate.month,
                day: newDate.day
            }, {
                zone: source_tz
            })
        } catch {
            interaction.reply("An error occured while attempting to parse input date.\nAre you sure your format is correct?");
            return;
        }
    }

    let timeRaw = interaction.options.getString("time");
    if (timeRaw == null)
        time = DateTime.local({zone: source_tz});
    else {
        try {
            let newTime = Inputs.parseDate(timeRaw);
            time = DateTime.fromObject({
                hour: newTime.hour,
                minute: newTime.minute,
                second: newTime.second,
            }, {
                zone: source_tz
            })
        } catch {
            interaction.reply("An error occured while attempting to parse input time.\nAre you sure your format is correct?")
            return;
        }
    }

    calendar = interaction.options.getString("calendar");

    // Loose equality to check for null or undefined
    if (calendar == null && isRegisteredUser) {
        calendar = userData?.calendar;
    } 
    // We check again
    if (calendar == null) {
        calendar = DEFAULT_CALENDAR;
    }
    calendar = calendar as string | undefined;
    // By here we should DEFINITELY have a calendar set!
    // ...right?

    let datetime = Inputs.combineDateAndTime(date, time).reconfigure({outputCalendar: calendar});

    let converted = datetime.setZone(target_tz);
    let offsetM = converted.offset - datetime.offset;
    let offsetTxt = `${(offsetM / 60)} hour(s)`

    if (offsetM % 60 !== 0){
        offsetTxt += ` ${(offsetM % 60)} minute(s)`
    }

    const embed = new discord.EmbedBuilder()
    .setColor(discord.Colors.Fuchsia)
    .setTitle("Time Conversion")
    .addFields(
        {
            name: "Converted Time",
            value: `${formatTime(converted)}\n${formatDate(converted)}`,
            inline: true
        },
        {
            name: "Target Timezone",
            value: target_tz,
            inline: true
        },
        {
            name: " ",
            value: " ",
            inline: false
        },
        {
            name: "Original Time",
            value: `${formatTime(datetime)}\n${formatDate(datetime)}`,
            inline: true
        },
        {
            name: "Original Timezone",
            value: source_tz,
            inline: true
        },
        {
            name: " ",
            value: " ",
            inline: false
        },
        {
            name: "Time Difference",
            value: offsetM !== 0 ? offsetTxt : "No difference",
            inline: true
        },
        {
            name: "Unix Timestamp",
            value: datetime.valueOf().toString(),
            inline: true
        }
    );

    await interaction.reply({
        embeds: [ embed ]
    });
}

let cmd = new SlashCommandSubcommandBuilder()
        .setName("convert")
        .setDescription("Convert a time from one timezone to another")
        .addStringOption(option => option
            .setName("target_tz")
            .setDescription("Target timezone to convert to.")
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("source_tz")
            .setDescription("Source timezone to convert time from. (Default: sender's timezone)")
            .setRequired(false)
        )
        .addStringOption(option => option
            .setName("date")
            .setDescription("Date to convert. Format: YYYY-MM-DD (Default: current date)")
            .setRequired(false)
        )
        .addStringOption(option => option
            .setName("time")
            .setDescription("Time to convert. Format: HH:MM(:SS) (Default: current time)")
            .setRequired(false)
        )
        .addStringOption(option => option
            .setName("calendar")
            .setDescription("Calendar to use. (Default: user's default, then bot's default)")
            .setRequired(false)
            .setChoices(Intl.supportedValuesOf('calendar').map((val) => {
                return {name: val, value: val};
            }))
        );

module.exports = {
    data: cmd,
    execute
}