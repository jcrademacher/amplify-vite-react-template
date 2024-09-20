import type { Schema } from "../../amplify/data/resource.ts";
import { client } from './index.tsx'

type Schedule = Schema["Schedule"]["type"];

export async function getSchedules(): Promise<Schedule[]> {
    const { data: items, errors } = await client.models.Schedule.list();

    return items;
}


export async function getSchedule(id: string): Promise<Schedule> {
    const { data: items, errors } = await client.models.Schedule.get({ id: id });
    
    return items;
}