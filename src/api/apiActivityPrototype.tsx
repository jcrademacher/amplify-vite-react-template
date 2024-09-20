
import type { Schema } from "../../amplify/data/resource.ts";
import { client } from './index.tsx'

export type ActivityPrototype = Schema["ActivityPrototype"]["type"];
export type ActivityPrototypeMap = {
    [id: string]: ActivityPrototype
}

export async function getActivityPrototypes(): Promise<ActivityPrototype[]> {
    const { data: items, errors } = await client.models.ActivityPrototype.list();
    console.log(errors);
    if (!items) return [];

    let elements = items.filter((act) => act.type === 'element').sort((a, b) => a.name.localeCompare(b.name));
    let programs = items.filter((act) => act.type === 'program').sort((a, b) => a.name.localeCompare(b.name));


    return elements.concat(programs);
}

export async function getActivityPrototypesMapped(): Promise<ActivityPrototypeMap> {
    let protos = await getActivityPrototypes();

    const retval: ActivityPrototypeMap = {};

    for (const proto of protos) {
        retval[proto.id] = proto;
    }

    return retval;
}

export async function mutateActivityPrototype(data: ActivityPrototype): Promise<void> {
    if(data.id) {
        const {errors} = await client.models.ActivityPrototype.update(data);
        console.log(errors);
    }
    else {
        const {errors} = await client.models.ActivityPrototype.create(data);
        console.log(errors);
    }
}

export async function deleteActivityPrototype(id: string): Promise<void> {
    const {errors} = await client.models.ActivityPrototype.delete({id});
    console.log(errors);
}