import { DateTime } from "luxon";

module Inputs {
    export function parseTime(time: string): DateTime {
        
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
        
        // Keep within range
        if (hour < 0  || hour > 23 ) throw SyntaxError("Hour must be within 0 and 23");
        if (minute < 0 || minute > 59) throw SyntaxError("Minute must be between 0 and 59");
        if (second < 0 || second > 59) throw SyntaxError("Second must be between 0 and 59");

        return DateTime.fromObject({
            hour: hour,
            minute: minute,
            second: second
        });
    }

    export function parseDate(date: string): DateTime{
        return DateTime.fromISO(date);
    }

    export function combineDateAndTime(date: DateTime, time: DateTime): DateTime{
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
}

export default Inputs;