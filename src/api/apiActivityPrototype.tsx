
import type { Schema } from "../../amplify/data/resource.ts";
import { client } from './index.tsx'

export type ActivityPrototype = Schema["ActivityPrototype"]["type"];
export type ActivityPrototypeMap = {
    [id: string]: ActivityPrototype
}

export async function getActivityPrototypes(scheduleId: string): Promise<ActivityPrototype[]> {
    const { data: items, errors } = await client.models.ActivityPrototype.list({
        filter: {
            scheduleId: {
                eq: scheduleId
            }
        }
    });

    if (!errors && items) {

        let elements = items.filter((act) => act.type === 'element').sort((a, b) => a.name.localeCompare(b.name));
        let programs = items.filter((act) => act.type === 'program').sort((a, b) => a.name.localeCompare(b.name));


        return elements.concat(programs);
    } else {
        console.log(errors);
        throw new Error(errors?.map((el) => el.message).join(','));
    }
}

export async function getActivityPrototypesMapped(scheduleId: string): Promise<ActivityPrototypeMap> {
    let protos = await getActivityPrototypes(scheduleId);

    const retval: ActivityPrototypeMap = {};

    for (const proto of protos) {
        retval[proto.id] = proto;
    }

    return retval;
}

export async function mutateActivityPrototype(data: ActivityPrototype): Promise<void> {
    let retval;

    if (data.id) {
        retval = await client.models.ActivityPrototype.update(data);
    }
    else {
        retval = await client.models.ActivityPrototype.create(data);
    }

    if(!retval.errors) {
        return;
    } 
    else {
        console.log(retval.errors);
        throw new Error(retval.errors?.map((el) => el.message).join(','));
    }
}

export async function deleteActivityPrototype(id: string): Promise<void> {
    const { errors } = await client.models.ActivityPrototype.delete({ id });

    if(!errors) {
        return;
    }
    else {
        console.log(errors);
        throw new Error(errors?.map((el) => el.message).join(', '));
    }
}