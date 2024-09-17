import { DateTime } from "luxon";
import Inputs from "./inputs";
import DBAPI from "../db/db_api";

class SleeptimesManager{
    static sleeptimes: {[key: string]: DBAPI.User} = {};

    public static async getUser(userId: number): Promise<DBAPI.User | null> {
        const strId = userId.toString();
        let userdata = this.sleeptimes[strId];
        if (userdata == null){
            let ud = await DBAPI.getUserData(userId);
            if (ud == null) return null;
            if (ud.sleep_time == null) return null;
            userdata = ud;
            this.sleeptimes[strId] = ud;
        }
        return userdata;
    }

    public static async getSleeptimeDateTime(userId: number): Promise<DateTime | null>{
        const user = await this.getUser(userId);
        if (user == null) return null;
        return Inputs.parseTime(user.sleep_time!);
    }

    public static removeUser(userId: number){
        delete this.sleeptimes[userId.toString()];
    }

    public static clearSleeptimes() {
        this.sleeptimes = {};
    }
}

export default SleeptimesManager;