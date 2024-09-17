import discord from "discord.js";
import SleeptimesManager from "./util/user_sleeptime";
import { DateTime } from "luxon";

module SleepSync {
    export function main(client: discord.Client){
        client.on(discord.Events.MessageCreate, async (message) => {
            const userId = parseInt(message.author.id, 10);
            const userData = await SleeptimesManager.getUser(userId);
            let sleeptime = await SleeptimesManager.getSleeptimeDateTime(userId);
            if (userData == null || sleeptime == null) return;
            const currentTime = await DateTime.local({
                zone: userData?.timezone
            });
            sleeptime = currentTime.set({
                hour: sleeptime.hour,
                minute: sleeptime.minute,
                second: sleeptime.second
            });

            let wakeupTime = currentTime.set({
                hour: 6,
                minute: 0,
                second: 0
            })

            // Handle case for cross-date sleeptimes (AKA MOST human beings)
            if (wakeupTime.hour < sleeptime.hour) {
                // Are we supposed to be asleep yet?
                if (currentTime.hour > sleeptime.hour) wakeupTime = wakeupTime.plus({day: 1});
                else sleeptime = sleeptime.minus({day: 1});
            }

            let res = (sleeptime < currentTime && currentTime < wakeupTime);
            if (res){
                await message.reply(`### Why are you not asleep!?\nAccording to my calculations, you should've been asleep at \`${sleeptime.toFormat("HH:mm:ss")}\`!`)
            }
        });
    }
}

export default SleepSync;