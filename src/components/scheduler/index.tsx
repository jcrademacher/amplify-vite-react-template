import { View } from '../../pages/home-page'
import '../../styles/scheduler.scss'
import { useEffect, useState } from 'react';
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
import { ScheduledActivity, Workarea, addActivity, removeActivity, updateActivity } from './activities';

import {
    LocalActivity,
    GlobalActivity,
    GlobalActivityDragStatus,
    GlobalActivityState,
    ScheduleObject
} from './types';

import { useHistoryState } from '@uidotdev/usehooks';



// let tmoment: (m: string) => moment.Moment = (m: string) => moment(`2024-01-01 ${m}`);

export default function Scheduler({ dayView }: SchedulerProps) {
   
    const actProtoQuery = useQuery({
        queryKey: ['activityPrototypesMapped'],
        queryFn: getActivityPrototypesMapped
    });

    const activities = actProtoQuery.data ? actProtoQuery.data : {};
    let { state, set, undo, redo } = useHistoryState<ScheduleObject>({
        acts: {},
        globalActs: {}
    });
    
    let localSch = state;
    let setLocalSch = set;

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
    },[undo, redo]);
    
    
    // const [localSchActs, setLocalSchActs] = useState<LocalActivityMap>({});

    const [gactState, setGactState] = useState<GlobalActivityState>({
        status: GlobalActivityDragStatus.NONE
    });
    // const [thisDayStart, setThisDayStart] = useState<moment.Moment>(initDate);

    let thisDayStart = times[0].clone();
    thisDayStart.add(dayView - 1, 'days');

    let thisDayEnd = times[times.length-1].clone();
    thisDayEnd.add(dayView-1,'days');
    thisDayEnd.add(30,'minutes');

    // const testGactStart = times[4].clone();
    // testGactStart.add(1,"day");
    // console.log(testGactStart.toString());

    const handleMoveActivity = (newId: string, newTime: moment.Moment, oldAct: LocalActivity) => {
        let newActs = localSch.acts[newId] ? {...localSch.acts[newId]} : {};
        let oldId = oldAct.activityPrototypeId;
        let oldActs = {...localSch.acts[oldId]}; 

        let newActProto = activities[newId];
        let sameProto = newId === oldAct.activityPrototypeId;
        
        if(sameProto) {
            removeActivity(oldAct,newActs);
        }
        let canCreate = checkActivityCreate(newTime, newActProto.duration, thisDayEnd, newActs, localSch.globalActs);

        if (canCreate) {
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

            addActivity(newAct,newActs);

            if(sameProto) {
                removeActivity(oldAct,newActs);

                setLocalSch({ ...localSch, acts: { ...localSch.acts, [newId]: newActs }});
            }
            else {
                removeActivity(oldAct,oldActs);

                setLocalSch({ ...localSch, acts: { ...localSch.acts, [oldId]: oldActs, [newId]: newActs }});
            }

            console.log(oldActs);
            console.log(newActs);
            
        }
    }

    const handleMoveGlobalActivity = (newTime: moment.Moment, oldAct: GlobalActivity) => {
        let newAct: GlobalActivity = { ...oldAct, startTime: newTime };
        // let oldIndex = curGacts.findIndex((el) => isEqual(el, oldAct));

        let newGacts = {...localSch.globalActs};
        removeActivity(oldAct,newGacts);

        let canCreate = checkGlobalActivityCreate(newTime, oldAct.duration, thisDayEnd, activities, localSch.acts, newGacts);

        if (canCreate) {
            addActivity(newAct,newGacts);
            
            setLocalSch({...localSch, globalActs: newGacts});
        }
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

        let acts = localSch.acts[id];
        acts = acts ? {...acts} : {};

        let canCreate = checkActivityCreate(time, actProto.duration, thisDayEnd, acts, localSch.globalActs);

        if (canCreate) {
            // acts.splice(insertAt, 0, newAct);
            addActivity(newAct,acts);
            setLocalSch({ ...localSch, acts: { ...localSch.acts, [id]: acts }});
        }
    }

    const handleCreateGlobalActivity = () => {
        let startTime = gactState.originCell ? gactState.originCell[1] : undefined;
        let endTime = gactState.currentCell ? gactState.currentCell[1] : undefined;

        if (startTime && endTime && endTime.diff(startTime) >= 0) {
            let duration = endTime.diff(startTime, "hours", true) + 0.5;

            let newAct = {
                startTime: startTime,
                duration: duration
            };

            // console.log(newAct);
            let canCreate = checkGlobalActivityCreate(startTime, duration, thisDayEnd, activities, localSch.acts, localSch.globalActs);

            if (canCreate) {
                // console.log(insertAt);
                let newGacts = {...localSch.globalActs};
                addActivity(newAct,newGacts);

                setLocalSch({...localSch, globalActs: newGacts});
            }
        }
    }

    const handleSaveGlobalActivity = (newGact: GlobalActivity) => {
        const gacts = {...localSch.globalActs};
        // newGacts[newGact.startTime] = newGact;
        updateActivity(newGact,gacts);
        setLocalSch({...localSch, globalActs: gacts});
    }

    const handleDeleteGlobalActivity = (newGact: GlobalActivity) => {
        const gacts = {...localSch.globalActs};
        removeActivity(newGact,gacts)
        setLocalSch({...localSch, globalActs: gacts});
    }

    const handleSaveActivity = (newAct: LocalActivity) => {
        let id = newAct.activityPrototypeId;
        let acts = {...localSch.acts[id]};

        updateActivity(newAct,acts);
        setLocalSch({ ...localSch, acts: { ...localSch.acts, [id]: acts }});
        // acts[index] = newAct;
        // setLocalSchActs({ ...localSchActs, [id]: acts });
    }

    const handleDeleteActivity = (newAct: LocalActivity) => {
        let id = newAct.activityPrototypeId;
        let acts = {...localSch.acts[id]};

        removeActivity(newAct,acts);
        setLocalSch({ ...localSch, acts: { ...localSch.acts, [id]: acts }});
    }

    const renderGlobalActivities: () => JSX.Element[] = () => {
        let retval = [];
        for(let key in localSch.globalActs) {
            let gact = localSch.globalActs[key];
            let timeIndex = gact.startTime.diff(thisDayStart, 'hours', true) * 2;

            if (gact.startTime.isSame(thisDayStart, 'date')) {
                 retval.push(
                    <ScheduledGlobalActivity
                        key={gact.startTime.toISOString()}
                        activeAct={gact}
                        timeIndex={timeIndex}
                        span={Object.keys(activities).length}
                        handleDelete={handleDeleteGlobalActivity}
                        handleSave={handleSaveGlobalActivity}
                    />
                );
            }
        }

        return retval;
    };
    

    const renderTimes: () => JSX.Element[] = () => (
        times.map((time, index) => (
            <div key={index} className='time'>{time.format("h:mm a")}</div>
        ))
    );

    const renderColumn: (el: ActivityPrototype) => JSX.Element[] = (el) => {

        let thisActs = localSch.acts[el.id]; //?.filter((a) => a.startTime.isSame(thisDayStart, 'day'));
        // console.log(thisActsTimes);
        let retval = [<div className={`header ${el.type}`} key={el.id}>{el.name}</div>];
        let i = 0;
        // let acti = thisActs?.findIndex((a) => a.startTime.isSame(thisDayStart, 'day'));
        // let gacti = localGlobalActs.findIndex((ga) => ga.startTime.isSame(thisDayStart, 'day'));

        while (i < times.length) {
            // console.log(i);
            let time = times[i].clone();
            time.add(dayView - 1, 'days');
            let timeKey = time.toISOString();

            let gact = localSch.globalActs[timeKey];
            let gactStartTime = gact?.startTime.clone();

            if (gactStartTime && gactStartTime.isSame(time)) {
                // console.log(i);
                i = i + gact.duration * 2;

                // console.log("continued");
                continue;
            }

            let act = thisActs ? thisActs[timeKey] : undefined;
            let actTime = act?.startTime;

            let schEl;

            if (actTime && actTime.isSame(time)) {
                // console.log(i);
                schEl = (
                    <ScheduledActivity
                        activeAct={thisActs[timeKey]}
                        timeIndex={i}
                        duration={el.duration}
                        groupSize={el.groupSize}
                        handleDelete={handleDeleteActivity}
                        handleSave={handleSaveActivity}
                        key={i}
                    />
                );
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