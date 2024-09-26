import moment from "moment";

let startDate = moment("2024-06-23 06:00:00.000");
export const startTimeOptions: moment.Moment[] = [];

for (let i = 0; i < 6; i++) {
    // console.log(initDate.toLocaletimeString());
    startTimeOptions.push(startDate.clone());
    startDate.add(30, 'minutes');
}

let endDate = moment("2024-06-27 21:00:00.000");
export const endTimeOptions: moment.Moment[] = [];

for (let i = 0; i < 6; i++) {
    // console.log(initDate.toLocaletimeString());
    endTimeOptions.push(endDate.clone());
    endDate.add(30, 'minutes');
}

export const timeFormatKey = (time: moment.Moment) => time.format("hh:mm A");

export type ScheduleSettings = {
    startDate?: string,
    endDate?: string,
    startTime?: string,
    endTime?: string,
    name?: string
}

export function convertFormToDates(data: ScheduleSettings) {
    let dayStart = moment(`${data.startTime} ${data.startDate}`, "hh:mm AA YYYY-MM-DD");
    let dayEnd = moment(`${data.endTime} ${data.startDate}`, "hh:mm AA YYYY-MM-DD");
    dayEnd.add(30,'minutes');

    let numDays = moment(data.endDate, 'YYYY-MM-DD').diff(moment(data.startDate, 'YYYY-MM-DD'), 'days') + 1;
    let startDates = [];
    let endDates = [];

    for(let i=0; i<numDays; ++i) {

        startDates.push(dayStart.toISOString());
        endDates.push(dayEnd.toISOString());

        dayStart.add(1, 'days');
        dayEnd.add(1, 'days');
    }

    return {
        startDates,
        endDates
    };
}

