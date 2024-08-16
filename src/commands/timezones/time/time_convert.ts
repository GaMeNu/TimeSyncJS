import discord, { SlashCommandBuilder } from "discord.js";
import { SlashCommandSubcommandBuilder } from "discord.js";
import { DateTime } from "luxon";
import DBAPI from "../../../db/db_api";
import { formatDate, formatTime, IANATimeZones } from "../../../util/timezones";
import FuzzyTz from "../../../util/fuzzy_tz";
const configdata = require("../../../../config.json");

function parseTime(time: string, step: number): DateTime {
	
	let hour, minute, second, stepMinute,
		pm = time.match(/p/i) !== null,
		num = time.replace(/[^0-9]/g, '');
	
	// Parse for hour, minute, second
	switch(num.length) {
        case 6:
            hour = parseInt(num[0] + num[1], 10);
            minute = parseInt(num[2] + num[3], 10);
            second = parseInt(num[4] + num[5], 10);
            break;
        case 5:
            hour = parseInt(num[0], 10);
            minute = parseInt(num[1] + num[2], 10);
            second = parseInt(num[3] + num[4], 10);
            break;
        case 4:
            hour = parseInt(num[0] + num[1], 10);
            minute = parseInt(num[2] + num[3], 10);
            second = 0;
            break;
        case 3:
            hour = parseInt(num[0], 10);
            minute = parseInt(num[1] + num[2], 10);
            second = 0;
            break;
        case 2:
        case 1:
            hour = parseInt(num[0] + (num[1] || ''), 10);
            minute = 0;
            second = 0;
            break;
        default:
            throw SyntaxError("Cannot have more than 6 digits in an hour");
	}
	
	// Make sure hour is in 24 hour format
	if( pm === true && hour > 0 && hour < 12 ) hour += 12;
	
	// Force pm for hours between 13:00 and 23:00
	if( hour >= 13 && hour <= 23 ) pm = true;
	
	// Handle step
	if( step ) {
		// Step to the nearest hour requires 60, not 0
		if( step === 0 ) step = 60;
		// Round to nearest step
		stepMinute = (Math.round(minute / step) * step) % 60;
		// Do we need to round the hour up?
		if( stepMinute === 0 && minute >= 30 ) {
			hour++;
			// Do we need to switch am/pm?
			if( hour === 12 || hour === 24 ) pm = !pm;
		}
		minute = stepMinute;
	}
	
	// Keep within range
	if (hour <= 0  || hour >= 24 ) throw SyntaxError("Hour must be within 0 and 24");
	if (minute < 0 || minute > 59) throw SyntaxError("Minute must be between 0 and 59");
    if (second < 0 || second > 59) throw SyntaxError("Second must be between 0 and 59");

    return DateTime.fromObject({
        hour: hour,
        minute: minute,
        second: second
    });
}

function parseDate(date: string): DateTime{
    return DateTime.fromISO(date);
}

function combineDateAndTime(date: DateTime, time: DateTime): DateTime{
    return DateTime.local(
        date.year, 
        date.month,
        date.day, 
        time.hour, 
        time.minute, 
        time.second, 
        { zone: date.zone }
    );
}

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
    const DEFAULT_CALENDAR = configdata["default_calendar"];

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
            interaction.reply("Source timezone is null, and user is not registered!");
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
        let newDate = parseDate(dateRaw);
        date = DateTime.fromObject({
            year: newDate.year,
            month: newDate.month,
            day: newDate.day
        }, {
            zone: source_tz
        })
    }

    let timeRaw = interaction.options.getString("time");
    if (timeRaw == null)
        time = DateTime.local({zone: source_tz});
    else {
        let newTime = parseDate(timeRaw);
        time = DateTime.fromObject({
            hour: newTime.hour,
            minute: newTime.minute,
            second: newTime.second,
        }, {
            zone: source_tz
        })
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

    let datetime = combineDateAndTime(date, time).reconfigure({outputCalendar: calendar});

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