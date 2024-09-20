export type LocalActivity = {
    scheduleId: string,
    startTime: moment.Moment,
    shadow: boolean,
    leg: number[],
    supportName: string,
    activityPrototypeId: string
};

export type LocalActivityMap = {
    [id: string]: LocalActivity[]
}



export type GlobalActivity = {
    startTime: moment.Moment,
    duration: number, // duration in hours
    name?: string
}

export enum ScheduleObjectTypes {
    LocalActivity = 'LocalActivity',
    GlobalActivity = "GlobalActivity"
}

// export type ScheduleObject = {
//     type: ScheduleObjectTypes,
//     value: LocalActivity | GlobalActivity
// }

export enum GlobalActivityDragStatus {
    NONE = "none",
    MOUSEDOWN = "mousedown",
    DRAGGING = "dragging"
}

export type GlobalActivityState = {
    status: GlobalActivityDragStatus,
    originCell?: [id: string, time: moment.Moment], // [element prototype ID, time]
    currentCell?: [id: string, time: moment.Moment]
}