import type { Schema } from "../../amplify/data/resource.ts";
import { client } from './index.tsx'

export type Schedule = Schema["Schedule"]["type"];
export type CreateSchedule = Schema['Schedule']['createType'];
export type UpdateSchedule = Schema['Schedule']['updateType'];

export async function getSchedules(): Promise<Schedule[]> {
    const { data: items } = await client.models.Schedule.list();

    return items;
}


export async function getSchedule(id: string): Promise<Schedule> {
    const retval = await client.models.Schedule.get({ id: id });
    
    if(retval.data) {
        return retval.data as Schedule;
    }
    else {
        console.log(retval.errors);
        throw new Error(retval.errors?.map((el) => el.message).join(','));
    }
}

export async function createSchedule(data: CreateSchedule): Promise<string> {
    const retval = await client.models.Schedule.create(data);
    // console.log(retval);

    if(!retval.errors && retval.data) {
        return retval.data.id;
    }
    else {
        console.log(retval.errors);
        throw new Error(retval.errors?.map((el) => el.message).join(','));
    }
}

export async function mutateSchedule(data: UpdateSchedule): Promise<void> {
    const retval = await client.models.Schedule.update(data);
    
    if(!retval.errors && retval.data) {
        return;
    }
    else {
        console.log(retval.errors);
        throw new Error(retval.errors?.map((el) => el.message).join(','));
    }
}