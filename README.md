# TimeSyncJS
## A JavaScript/TypeScript rewrite of the [TimeSync](https://www.github.com/GaMeNu/TimeSync) Discord bot.

## But... What is TimeSync?
TimeSync is a Discord bot that allows people to register their timezones and get others' timezones.

TimeSync is based mostly on the Luxon library for handling dates, times, and calendars. It also uses the Intl API for timezones.

For storage, TimeSync uses MySQL (mostly because I had to make it compatible with Eztyl's existing database), but changing the database only requires rewriting the [db folder](./src/db).

## Features
- Registering your timezone and getting others' current time (practically the primary purpose of the bot)
- Easy and smart time conversion using `/time convert`
- **NEW in TimeSyncJS:** Support for different display calendars!

## Setup
The bot requires a `config.json` file to be placed in the home directory of the project (same level as this README file). This is the format for the file:
```json
{
    "token": "Bot token goes here ",
    "client_id": "Bot client ID goes here",
    "author_id": "Your own user ID goes here (used for override permissions in certain commands)",

    "database": "Database name goes here",
    "db_username": "Database username here",
    "db_password": "Database password here",

    "default_calendar": "Default Intl calendar used for the bot. (Use 'iso8601' if unsure)"
}
```

After placing the `config.json` file, run the `create_db.ts` file (located at [`./src/db/create_db.ts`](./src/db/create_db.ts)). This will create the necessary table in the database.

Run `main.ts`, and that's it! TimeSync should now be active!