import type { Schema } from "../../amplify/data/resource.ts";
import { client } from './index.tsx'

export type Activity = Schema["Activity"]["type"];

export type ActivityMap = {
    [id: string]: Activity[];
};

export async function getActivities(day: number): Promise<Activity[]> {
    const { data: items } = await client.models.Activity.list({
        filter: {
            day: {
                eq: day
            }
        }
    });

    return items;
}

export async function getActivitiesMapped(day: number): Promise<ActivityMap> {
    const acts = await getActivities(day);
    const retval: ActivityMap = {};

    for (const act of acts) {
        if (act.activityPrototypeId in retval) {
            retval[act.activityPrototypeId].push(act);
        } else {
            retval[act.activityPrototypeId] = [act];
        }
    }

    return retval;
}