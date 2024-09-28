import type { Schema } from "../../amplify/data/resource.ts";
import { checkErrors, client } from './index.tsx';
import { LocalIDMap, TimeMap } from "../components/scheduler/types";
import { ActivityPrototypeMap, ActivityPrototype } from "./apiActivityPrototype.tsx";

import moment from "moment";

export type LegActivity = Schema["LegActivity"]["type"];
export type LocalLegActivity = Schema["LegActivity"]['createType'];

export type GlobalActivity = Schema["GlobalActivity"]["type"];
export type LocalGlobalActivity = Schema["GlobalActivity"]['createType'];

export async function getActivities(proto: ActivityPrototype): Promise<LocalLegActivity[]> {
    const retval = await proto.activities();

    if(!retval.errors && retval.data) {
        return retval.data;
    }
    else {
        console.log(retval.errors);
        throw new Error(retval.errors?.map((el) => el.message).join(','));
    }
}

export async function getActivitiesMapped(protos: ActivityPrototypeMap): Promise<LocalIDMap<LocalLegActivity>> {
    const retval: LocalIDMap<LocalLegActivity> = {};

    for(const proto in protos) {
        const acts = await getActivities(protos[proto]);
        
        for(let i=0; i<acts.length; i++) {
            retval[proto] = {
                ...retval[proto],
                [moment(acts[i].startTime).toISOString()]: acts[i]
            }
        }
    }

    return retval;
}

export async function getGlobalActivities(scheduleId: string): Promise<LocalGlobalActivity[]> {
    const retval = await client.models.GlobalActivity.list({
        filter: {
            scheduleId: {
                eq: scheduleId
            }
        }
    });

    if(!retval.errors && retval.data) {
        return retval.data;
    }
    else {
        console.log(retval.errors);
        throw new Error(retval.errors?.map((el) => el.message).join(', '));
    }
}

export async function getGlobalActivitiesMapped(scheduleId: string): Promise<TimeMap<LocalGlobalActivity>> {
    const retval: TimeMap<LocalGlobalActivity> = {};

    const acts = await getGlobalActivities(scheduleId);
    
    for(let i=0; i<acts.length; i++) {
        let gact = acts[i];
        retval[gact.startTime] = gact;
    }

    return retval;
}

export async function saveActivities(oldActs: LocalIDMap<LocalLegActivity>| undefined, oldGacts: TimeMap<LocalGlobalActivity> | undefined, acts: LocalIDMap<LocalLegActivity>, gacts: TimeMap<LocalGlobalActivity>): Promise<{ acts: LocalIDMap<LocalLegActivity>, gacts: TimeMap<LocalGlobalActivity>}> {
    var retval;

    let updatedActs: LocalIDMap<LocalLegActivity> = acts;
    let updatedGacts: TimeMap<LocalGlobalActivity> = gacts;

    // first diff old and new, and delete differences in old
    if(oldActs) {
        let oldActsFlat = Object.values(oldActs).map((el) => Object.values(el)).reduce((acc,val) => acc.concat(val), []);
        // console.log( Object.values(oldActs));
        let newActsFlat = Object.values(acts).map((el) => Object.values(el)).reduce((acc,val) => acc.concat(val), []);

        let diff = oldActsFlat.filter((a) => newActsFlat.findIndex((b) => a.id === b.id) < 0);

        // console.log('old IDs: ', oldIDs);
        // console.log('new IDs: ', newIDs);
        // console.log('diff: ', diff);

        for(const act of diff) {

            let id = act.id;
            if(id) {
                retval = await client.models.LegActivity.delete({
                    id: id
                });
            }
            else {
                throw new Error("Old IDs contains an element that is undefined. This should not happen.");
            }

            checkErrors(retval?.errors);

            delete updatedActs[act.activityPrototypeId][act.startTime];
        }
    }

    if(oldGacts) {
        let oldGactsFlat = Object.values(oldGacts).reduce((acc: LocalGlobalActivity[],val: LocalGlobalActivity) => acc.concat(val), []);
        // console.log( Object.values(oldActs));
        let newGactsFlat = Object.values(gacts).reduce((acc: LocalGlobalActivity[],val: LocalGlobalActivity) => acc.concat(val), []);

        let diff = oldGactsFlat.filter((a) => newGactsFlat.findIndex((b) => a.id === b.id) < 0);

        // console.log('old IDs: ', oldIDs);
        // console.log('new IDs: ', newIDs);
        console.log('diff: ', diff);

        for(const gact of diff) {
            let id = gact.id;

            if(id) {
                retval = await client.models.GlobalActivity.delete({
                    id: id
                });
            }
            else {
                throw new Error("Old IDs contains an element that is undefined. This should not happen.");
            }

            checkErrors(retval?.errors);

            delete updatedGacts[gact.startTime];
        }
    }

    // then update or create new activities
    for(const proto in acts) {
        for(const time in acts[proto]) {
            let act = acts[proto][time];

            // compare to see if act has changed, no need to update if not
            if(oldActs && oldActs[proto] && JSON.stringify(oldActs[proto][time]) === JSON.stringify(act)) {
                continue;
            }

            // console.log(act);

            if(act.id) {
                retval = await client.models.LegActivity.update({
                    id: act.id,
                    activityPrototypeId: act.activityPrototypeId,
                    startTime: act.startTime,
                    supportName: act.supportName,
                    shadow: act.shadow,
                    leg: act.leg
                });

                // console.log('creating: ',retval.data);
            }
            else {
                retval = await client.models.LegActivity.create(act);

                // console.log('updating: ',retval.data);
            }

            checkErrors(retval?.errors);

            if(retval.data)     
                updatedActs[proto] = { ...updatedActs[proto], [time]: retval.data };
        }
    }

    for(const time in gacts) {
        let gact = gacts[time];

        // compare to see if act has changed, no need to update if not
        if(oldGacts && JSON.stringify(oldGacts[time]) === JSON.stringify(gact)) {
            continue;
        }

        if(gact.id) {
            retval = await client.models.GlobalActivity.update({
                id: gact.id,
                startTime: gact.startTime,
                name: gact.name,
                duration: gact.duration,
                scheduleId: gact.scheduleId
            });
        }
        else {
            console.log("creating global activity");
            retval = await client.models.GlobalActivity.create(gact);
        }

        checkErrors(retval?.errors);

        if(retval.data)
            updatedGacts[time] = retval.data;
    }

    console.log(updatedGacts);

    return {
        acts: updatedActs,
        gacts: updatedGacts
    };
}