import moment from "moment-timezone";

export const TIMEZONE = 'America/New_York';

let startDate = moment.tz("2024-06-23 06:00:00.000", TIMEZONE);
export const startTimeOptions: moment.Moment[] = [];

for (let i = 0; i < 6; i++) {
    // console.log(initDate.toLocaletimeString());
    startTimeOptions.push(startDate.clone());
    startDate.add(30, 'minutes');
}

let endDate = moment.tz("2024-06-27 21:00:00.000", TIMEZONE);
export const endTimeOptions: moment.Moment[] = [];

for (let i = 0; i < 6; i++) {
    // console.log(initDate.toLocaletimeString());
    endTimeOptions.push(endDate.clone());
    endDate.add(30, 'minutes');
}

export const timeFormatKey = (time: moment.Moment) => time.toISOString();
export const timeFormatLocal = (time: moment.Moment) => time.clone().tz(TIMEZONE).format("h:mm A");

export function createTime(t?: string | undefined) {
    return t ? moment.tz(t,TIMEZONE) : moment();
}