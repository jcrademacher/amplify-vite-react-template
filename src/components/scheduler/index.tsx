import { View } from '../../pages/home-page'
import '../../styles/scheduler.scss'
import type { Schema } from "../../../amplify/data/resource";
import { act, useEffect, useState } from 'react';
import moment from 'moment';

import { useQuery } from '@tanstack/react-query';
import { checkActivityCreate, checkGlobalActivityCreate, ScheduledGlobalActivity } from './activities';

import { ActivityPrototype } from '../../api/apiActivityPrototype';

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
// import { Activity } from '../../api/apiActivity';

interface SchedulerProps {
    view: View,
    dayView: number
}

let initDate = moment("2024-06-28 07:00:00.000");
const times: moment.Moment[] = [];

for (let i = 0; i < 31; i++) {
    // console.log(initDate.toLocaletimeString());
    times.push(initDate.clone());
    initDate.add(30, 'minutes');
}

// console.log(times.map((t) => t.toString()));
export const getTimes = () => times;
// console.log(getTimes());

// const times = range(700,2030,30);

import { getActivityPrototypesMapped } from '../../api/apiActivityPrototype';
import { ScheduledActivity, Workarea } from './activities';
import { isEqual } from 'lodash';

import {
    LocalActivity,
    GlobalActivity,
    LocalActivityMap,
    GlobalActivityDragStatus,
    GlobalActivityState
} from './types';

import { useHistoryState } from '@uidotdev/usehooks';



// let tmoment: (m: string) => moment.Moment = (m: string) => moment(`2024-01-01 ${m}`);

export default function Scheduler({ view, dayView }: SchedulerProps) {
   
    const actProtoQuery = useQuery({
        queryKey: ['activityPrototypesMapped'],
        queryFn: getActivityPrototypesMapped
    });

    const activities = actProtoQuery.data ? actProtoQuery.data : {};
    let { state, set, undo, redo, canUndo, canRedo } = useHistoryState<LocalActivityMap>({});
    let localSchActs = state;
    let setLocalSchActs = set;

    const handleUndo = (evt: KeyboardEvent) => {
        evt.stopImmediatePropagation();
        if ((evt.key === 'Z' || evt.key === 'z') && (evt.ctrlKey || evt.metaKey) && !evt.shiftKey) {
            undo();
            console.log("undo");
        } 
        else if ((evt.key === 'Z' || evt.key === 'z') && (evt.ctrlKey || evt.metaKey) && evt.shiftKey) {
            redo();
            console.log("redo");
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', handleUndo);

        return () => {
            window.removeEventListener('keydown', handleUndo);
        }
    },[undo]);
    
    
    // const [localSchActs, setLocalSchActs] = useState<LocalActivityMap>({});

    const [gactState, setGactState] = useState<GlobalActivityState>({
        status: GlobalActivityDragStatus.NONE
    });
    // const [thisDayStart, setThisDayStart] = useState<moment.Moment>(initDate);

    let thisDayStart = times[0].clone();
    thisDayStart.add(dayView - 1, 'days');

    let testEnd = times[0].clone();
    testEnd.add(30, "minutes");

    // const testGactStart = times[4].clone();
    // testGactStart.add(1,"day");
    // console.log(testGactStart.toString());

    const [localGlobalActs, setLocalGlobalActs] = useState<GlobalActivity[]>([]);

    const handleMoveActivity = (newId: string, newTime: moment.Moment, oldAct: LocalActivity) => {
        let newActs = localSchActs[newId] ? [...localSchActs[newId]] : [];
        let oldId = oldAct.activityPrototypeId;
        let oldActs = [...localSchActs[oldId]]; 

        let newActProto = activities[newId];

        let insertAt = checkActivityCreate(newTime, dayView, newActProto, newActs, localGlobalActs);

        if (insertAt > -1) {
            let newAct = { ...oldAct };

            let oldActProto = activities[oldAct.activityPrototypeId];
            let gsdiff = oldActProto.groupSize - newActProto.groupSize;

            if (gsdiff > 0) {
                newAct.leg = newAct.leg.slice(0, newActProto.groupSize);
            }
            else {
                newAct.leg = newAct.leg.slice(0, oldActProto.groupSize); // copies
            }

            newAct.activityPrototypeId = newId;
            newAct.startTime = newTime;

            if(newAct.activityPrototypeId === oldAct.activityPrototypeId) {
                newActs.splice(insertAt, 0, newAct);
                newActs.splice(newActs.findIndex((el) => isEqual(el,oldAct)),1);

                setLocalSchActs({ ...localSchActs, [newId]: newActs });
            }
            else {
                newActs.splice(insertAt, 0, newAct);
                oldActs = oldActs.filter((el) => !isEqual(el, oldAct));

                setLocalSchActs({ ...localSchActs, [oldId]: oldActs, [newId]: newActs });
            }

            console.log(oldActs);
            console.log(newActs);

            
        }
    }

    const handleMoveGlobalActivity = (newTime: moment.Moment, oldAct: GlobalActivity) => {
        setLocalGlobalActs((curGacts) => {
            let newAct: GlobalActivity = { ...oldAct, startTime: newTime };
            let oldIndex = curGacts.findIndex((el) => isEqual(el, oldAct));

            let removedGacts = [...curGacts];
            removedGacts.splice(oldIndex, 1);

            let insertAt = checkGlobalActivityCreate(newAct, activities, localSchActs, removedGacts);

            if (insertAt > -1) {
                removedGacts.splice(insertAt, 0, newAct);
                return removedGacts;
            }
            else {
                return curGacts;
            }
        });
    }

    const handleCreateActivity = (id: string, time: moment.Moment) => {
        var newAct: LocalActivity;

        // console.log(existingAct);
        let actProto = activities[id];

        newAct = {
            scheduleId: "fsadkl",
            startTime: time,
            shadow: false,
            leg: [0],
            supportName: "",
            activityPrototypeId: id
        };

        let acts = localSchActs[id];
        acts = acts ? [...acts] : [];

        let insertAt = checkActivityCreate(newAct.startTime, dayView, actProto, acts, localGlobalActs);

        if (insertAt > -1) {
            acts.splice(insertAt, 0, newAct);
            setLocalSchActs({ ...localSchActs, [id]: acts });
        }
    }

    const handleCreateGlobalActivity = () => {
        let startTime = gactState.originCell ? gactState.originCell[1] : undefined;
        let endTime = gactState.currentCell ? gactState.currentCell[1] : undefined;

        if (startTime && endTime && endTime.diff(startTime) >= 0) {
            let newAct = {
                startTime: startTime,
                duration: endTime.diff(startTime, "hours", true) + 0.5
            };

            // console.log(newAct);
            let insertAt = checkGlobalActivityCreate(newAct, activities, localSchActs, localGlobalActs);

            if (insertAt >= 0) {
                // console.log(insertAt);
                let newGacts = [...localGlobalActs];
                newGacts.splice(insertAt, 0, newAct);
                setLocalGlobalActs(newGacts);
            }
        }
    }

    const handleSaveGlobalActivity = (newGact: GlobalActivity, index: number) => {
        const newGacts = [...localGlobalActs];
        newGacts[index] = newGact;
        setLocalGlobalActs(newGacts);
    }

    const handleDeleteGlobalActivity = (newGact: GlobalActivity, index: number) => {
        let newGacts = localGlobalActs.filter((el, i) => i !== index);
        setLocalGlobalActs(newGacts);
    }

    const handleSaveActivity = (newAct: LocalActivity, index: number) => {
        let id = newAct.activityPrototypeId;
        let acts = [...localSchActs[id]];

        acts[index] = newAct;
        setLocalSchActs({ ...localSchActs, [id]: acts });
    }

    const handleDeleteActivity = (newAct: LocalActivity, index?: number) => {
        let id = newAct.activityPrototypeId;
        let acts = [...localSchActs[id]];

        if (index !== undefined) {
            acts.splice(index, 1);
        }
        else {
            // delete without index, maybe will use ID later when server hooked up
            acts = acts.filter((el) => !isEqual(el, newAct));
        }

        setLocalSchActs({ ...localSchActs, [id]: acts });
    }

    const renderGlobalActivities: () => JSX.Element[] = () => (
        localGlobalActs.map((gact, index) => {
            let timeIndex = gact.startTime.diff(thisDayStart, 'hours', true) * 2;

            if (gact.startTime.isSame(thisDayStart, 'date')) {
                return (
                    <ScheduledGlobalActivity
                        key={gact.startTime.toISOString()}
                        gactIndex={index}
                        activeAct={gact}
                        timeIndex={timeIndex}
                        span={Object.keys(activities).length}
                        handleDelete={handleDeleteGlobalActivity}
                        handleSave={handleSaveGlobalActivity}
                    />
                );
            }
            else {
                return (<></>);
            }
        })
    );

    const renderTimes: () => JSX.Element[] = () => (
        times.map((time, index) => (
            <div key={index} onClick={undo} className='time'>{time.format("h:mm a")}</div>
        ))
    );

    const renderColumn: (el: ActivityPrototype) => JSX.Element[] = (el) => {

        let thisActs = localSchActs[el.id]; //?.filter((a) => a.startTime.isSame(thisDayStart, 'day'));
        // console.log(thisActsTimes);
        let retval = [<div className={`header ${el.type}`} key={el.id}>{el.name}</div>];
        let i = 0;
        let acti = thisActs?.findIndex((a) => a.startTime.isSame(thisDayStart, 'day'));
        let gacti = localGlobalActs.findIndex((ga) => ga.startTime.isSame(thisDayStart, 'day'));

        while (i < times.length) {
            // console.log(i);
            let time = times[i].clone();
            time.add(dayView - 1, 'days');

            let gact = localGlobalActs[gacti];
            let gactStartTime = gact?.startTime.clone();

            if (gactStartTime && gactStartTime.isSame(time)) {
                // console.log(i);
                i = i + gact.duration * 2;
                ++gacti;

                // console.log("continued");
                continue;
            }

            let act = thisActs ? thisActs[acti] : undefined;
            let actTime = act?.startTime;

            let schEl;

            if (actTime && actTime.isSame(time)) {
                // console.log(i);
                schEl = (
                    <ScheduledActivity
                        activeAct={thisActs[acti]}
                        timeIndex={i}
                        actIndex={acti}
                        duration={el.duration}
                        groupSize={el.groupSize}
                        handleDelete={handleDeleteActivity}
                        handleSave={handleSaveActivity}
                        key={i}
                    />
                );
                ++acti;
                i = i + el.duration * 2;
            }
            else {
                schEl = (
                    <Workarea
                        key={i}
                        id={el.id}
                        time={time}
                        handleMoveActivity={handleMoveActivity}
                        handleMoveGlobalActivity={handleMoveGlobalActivity}
                        handleCreate={handleCreateActivity}
                        handleCreateGlobalActivity={handleCreateGlobalActivity}
                        state={gactState}
                        setState={setGactState}
                    />
                );
                ++i;
            }

            retval.push(schEl);
        }

        return retval;
    }

    if (actProtoQuery.isPending) {
        return <div>Loading...</div>
    }
    else if (actProtoQuery.isError) {
        return <div>Error</div>
    }
    else if (actProtoQuery.isSuccess) {
        // console.log(activities);
        const containerStyle = {
            gridTemplateColumns: `repeat(${Object.keys(activities).length + 1}, minmax(50px,1fr))`,
            gridTemplateRows: `40px repeat(${times.length}, minmax(10px,1fr))`
        };

        return (
            <DndProvider backend={HTML5Backend}>
                <div id="scheduler" style={containerStyle} onMouseUp={() => setGactState({ status: GlobalActivityDragStatus.NONE })}>
                    <div className='header' />
                    {renderTimes()}
                    {renderGlobalActivities()}
                    {...Object.values(activities).map(renderColumn)}
                </div>
            </DndProvider>
        )
    }
}