import {
    useFloating, useDismiss, useClick, useInteractions,
    autoUpdate,
    offset,
    flip,
    shift,
    arrow,
    FloatingArrow
} from '@floating-ui/react';

import { useState, useRef, useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Form from 'react-bootstrap/Form';

import {
    GlobalActivityDragStatus,
    GlobalActivityState,
    TimeMap,
    Activity,
    LocalIDMap
} from "./types";

import { ActivityPrototypeMap } from "../../api/apiActivityPrototype";
import { LocalLegActivity, LocalGlobalActivity } from '../../api/apiActivity';

import { Button } from 'react-bootstrap';
import { range } from 'lodash';

import { useDrag, useDrop } from 'react-dnd';

export function addActivity<T extends Activity>(newAct: T, object: TimeMap<T>) {
    object[newAct.startTime] = { ...newAct };
}

export function removeActivity<T extends Activity>(act: T, object: TimeMap<T>) {
    delete object[act.startTime];
}

export function updateActivity<T extends Activity>(newAct: T, object: TimeMap<T>) {
    object[newAct.startTime] = newAct;
}

const checkTimeDurationInObject: (startTime: moment.Moment, duration: number, object: TimeMap<LocalLegActivity> | TimeMap<LocalGlobalActivity>) => boolean = (startTime, duration, object) => {
    let timeCheck = startTime.clone();

    for (let i = 0; i < 2 * duration; ++i) {
        let key = timeCheck.toISOString();

        if (object && key in object) {
            return false;
        }

        timeCheck.add(30, 'minutes');
    }

    return true;
}

export const checkActivityCreate = (startTime: moment.Moment, duration: number, dayEnd: moment.Moment, acts: TimeMap<LocalLegActivity>, gacts: TimeMap<LocalGlobalActivity>) => {
    let canCreateActs = checkTimeDurationInObject(startTime, duration, acts);
    let canCreateGacts = checkTimeDurationInObject(startTime, duration, gacts);

    // console.log(canCreateActs);
    // console.log(canCreateGacts);

    let actEnd = startTime.clone();
    actEnd.add(duration,'hours');

    // console.log("activity end", actEnd);

    if(actEnd.diff(dayEnd) > 0) {
        return false;
    }
    
    return canCreateActs && canCreateGacts;
    
};

import { ScheduleObjectTypes } from './types';

export const checkGlobalActivityCreate = (startTime: moment.Moment, duration: number, dayEnd: moment.Moment, actProtos: ActivityPrototypeMap, schActs: LocalIDMap<LocalLegActivity>, gacts: TimeMap<LocalGlobalActivity>) => {
    // check against existin global activities
    let canCreate = checkTimeDurationInObject(startTime, duration, gacts);
    if (!canCreate) {
        return false;
    }

    let actEnd = startTime.clone();
    actEnd.add(duration,'hours');

    if(actEnd.diff(dayEnd) > 0) {
        return false;
    }

    // then check for overlaps with existing scheduled activities
    for (const key in actProtos) {
        let actProtoDuration = actProtos[key].duration;
        let thisActs = schActs[key];

        let canCreate = checkTimeDurationInObject(startTime, duration, thisActs);
        if(!canCreate) return false;

        let timeBackCheck = startTime.clone()
        timeBackCheck.subtract(actProtoDuration, 'hours');
        timeBackCheck.add(30,'minutes');

        canCreate = checkTimeDurationInObject(timeBackCheck, actProtoDuration, thisActs);
        
        if (!canCreate) return false;
    }

    return true;
}

interface WorkareaProps {
    id: string,
    time: moment.Moment,
    handleCreate: (id: string, time: moment.Moment, newAct?: LocalLegActivity) => void,
    handleMoveActivity: (newId: string, newTime: moment.Moment, oldAct: LocalLegActivity) => void,
    handleMoveGlobalActivity: (newTime: moment.Moment, oldAct: LocalGlobalActivity) => void,
    state: GlobalActivityState,
    setState: (newState: GlobalActivityState) => void,
    handleCreateGlobalActivity: () => void,
}

export function Workarea({
    id,
    time,
    handleCreate,
    handleMoveActivity,
    handleMoveGlobalActivity,
    state,
    setState,
    handleCreateGlobalActivity
}: WorkareaProps) {
    const originTime = state.originCell ? state.originCell[1] : undefined;
    const currentTime = state.currentCell ? state.currentCell[1] : undefined;

    let dragHighlight: boolean;

    if (originTime && currentTime) {
        dragHighlight = time.diff(originTime) >= 0 && time.diff(currentTime) <= 0;
    }
    else {
        dragHighlight = false;
    }

    const [{ isOver }, drop] = useDrop(
        () => ({
            accept: [ScheduleObjectTypes.LegActivity, ScheduleObjectTypes.GlobalActivity],
            drop: (item: LocalLegActivity | LocalGlobalActivity, monitor) => {
                const itemType = monitor.getItemType();
                if (itemType === ScheduleObjectTypes.LegActivity) {
                    handleMoveActivity(id, time, item as LocalLegActivity);
                }
                else if (itemType === ScheduleObjectTypes.GlobalActivity) {
                    handleMoveGlobalActivity(time, item as LocalGlobalActivity);
                }
            },
            collect: (monitor) => ({
                isOver: !!monitor.isOver()
            })
        }),
        [id, time]
    );

    return (
        <div
            ref={drop}
            className={`workarea ${dragHighlight ? "dragging" : ""} ${isOver ? "hover-class" : ""}`}
            onClick={() => handleCreate(id, time)}
            onMouseDown={() => setState({
                status: GlobalActivityDragStatus.MOUSEDOWN,
                originCell: [id, time]
            })}
            onMouseUp={() => {
                // console.log("workarea mouseup");
                if (state.status === GlobalActivityDragStatus.DRAGGING) {
                    handleCreateGlobalActivity();
                }

                setState({
                    status: GlobalActivityDragStatus.NONE,
                    currentCell: undefined,
                    originCell: undefined
                });
            }}
            onMouseEnter={() => {
                if (state.status !== GlobalActivityDragStatus.NONE) {
                    setState({
                        ...state,
                        status: GlobalActivityDragStatus.DRAGGING,
                        currentCell: [id, time]
                    });
                }
            }}
        />
    )
}

export interface ScheduledActivityProps {
    activeAct: LocalLegActivity,
    timeIndex: number,
    duration: number,
    groupSize: number,
    handleSave: (newAct: LocalLegActivity) => void,
    handleDelete: (newAct: LocalLegActivity) => void
}

export function ScheduledActivity({ activeAct, timeIndex, duration, groupSize, handleDelete, handleSave }: ScheduledActivityProps) {
    type ActivityOptions = {
        leg: number[],
        shadow: boolean
    };

    let di = duration * 2;
    let gridRow = `${timeIndex + 2} / span ${di}`;
    let leg = activeAct.leg;

    // console.log(leg);

    const notScheduled = leg.some((el) => el < 1 || el > 12) || leg.length !== groupSize;

    // this state determines whether or not the dialog opens upon initial scheduling of the activity
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(notScheduled);
    }, [notScheduled]);

    const arrowRef = useRef(null);

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange(nextOpen, _, reason) {
            setIsOpen(nextOpen);

            // Other ones include 'reference-press' and 'ancestor-scroll'
            // if enabled.
            if ((reason === 'escape-key' || reason === 'outside-press' || reason === 'click') && notScheduled) {
                onDelete();
            }
            else {
                onClose();
            }
        },
        middleware: [offset(10), flip(), shift(), arrow({
            element: arrowRef,
        })],
        whileElementsMounted: autoUpdate,
        placement: 'right'
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<ActivityOptions>({ values: !activeAct.leg.some((el) => el === 0) ? {
        leg: activeAct.leg,
        shadow: activeAct.shadow
    } : undefined });

    // console.log(errors);

    const click = useClick(context);
    const dismiss = useDismiss(context);

    // Merge all the interactions into prop getters
    const { getReferenceProps, getFloatingProps } = useInteractions([
        click,
        dismiss
    ]);

    const onSubmit: SubmitHandler<ActivityOptions> = async (data) => {
        setIsOpen(false);
        activeAct = { ...activeAct, ...data };

        // console.log(data);

        handleSave(activeAct);
        onClose();
    }

    const onDelete = () => {
        setIsOpen(false);
        handleDelete(activeAct);
        onClose();
    }

    const onClose = () => {
        reset(activeAct);
    }

    const [, drag] = useDrag(() => ({
        type: ScheduleObjectTypes.LegActivity,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        }),
        item: activeAct
    }), [activeAct]);

    return (
        <>
            <div
                ref={(el) => { refs.setReference(el); drag(el); }}
                {...getReferenceProps()}
                className='scheduled'
                style={{
                    gridRow: gridRow
                }}
            // draggable={!notScheduled}
            // onDragStart={() => console.log("drag start")}
            >
                {leg.some((el) => el === 0) ? "" : leg.join(",")}
            </div>
            {isOpen && (
                <div
                    ref={refs.setFloating}
                    style={floatingStyles}
                    className='activity-popover'
                    {...getFloatingProps()}
                >
                    <div id='header'>Edit Activity</div>
                    <div id='body'>
                        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
                            {range(0, groupSize).map((_, i) => (
                                <Form.Control {...register(`leg.${i}`, { 
                                        valueAsNumber: true, 
                                        required: true, 
                                        validate: (val) => val > 0 && val <= 12 && Number.isInteger(val)
                                    })}
                                    isInvalid={!!(errors?.leg ? errors.leg[i] : false)}
                                    type="number"
                                    placeholder="Leg Number"
                                    autoFocus={i === 0}
                                    key={i}
                                />
                            ))}

                            <Form.Check {...register("shadow")} type="checkbox" label="Shadow?" />

                            <div id="form-footer">
                                <Button variant="primary" type="submit">
                                    {/* {saving ?
                                        <Spinner as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            style={{ marginRight: "5px" }}
                                        /> : <></>
                                    } */}
                                    Save
                                </Button>
                                <Button onClick={onDelete} variant="danger">
                                    Delete
                                </Button>
                            </div>
                        </Form>
                    </div>
                    <FloatingArrow ref={arrowRef} context={context} />
                </div>
            )}
        </>
    );
}

interface ScheduledGlobalActivityProps {
    activeAct: LocalGlobalActivity,
    handleSave: (newAct: LocalGlobalActivity) => void,
    handleDelete: (newAct: LocalGlobalActivity) => void,
    timeIndex: number,
    span: number
};

export function ScheduledGlobalActivity({ activeAct, handleSave, handleDelete, timeIndex, span }: ScheduledGlobalActivityProps) {
    let gridRow = `${timeIndex + 2} / span ${activeAct.duration * 2}`;

    type GlobalActivityOptions = {
        name: string
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<GlobalActivityOptions>({ values: { name: activeAct.name ? activeAct.name : "" } });

    const arrowRef = useRef(null);

    const notScheduled = activeAct.name ? false : true;

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(notScheduled);
    }, [notScheduled]);

    const onSubmit: SubmitHandler<GlobalActivityOptions> = async (data) => {
        setIsOpen(false);
        let newAct = { ...activeAct, ...data };

        handleSave(newAct);
        onClose();
    }

    const onDelete = () => {
        // console.log("handling delete...");
        setIsOpen(false);
        handleDelete(activeAct);
        onClose();
    }

    const onClose = () => {
        reset(activeAct);
    }

    const [, drag] = useDrag(() => ({
        type: ScheduleObjectTypes.GlobalActivity,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        }),
        item: activeAct
    }), [activeAct]);

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange(nextOpen, _, reason) {
            setIsOpen(nextOpen);
            // console.log("open changed");
            // Other ones include 'reference-press' and 'ancestor-scroll'
            // if enabled.
            if ((reason === 'escape-key' || reason === 'outside-press' || reason === 'click') && notScheduled) {
                onDelete();
            }
            else {
                onClose();
            }
        },
        middleware: [offset(10), flip(), shift(), arrow({
            element: arrowRef,
        })],
        whileElementsMounted: autoUpdate,
        placement: 'bottom'
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);

    // Merge all the interactions into prop getters
    const { getReferenceProps, getFloatingProps } = useInteractions([
        click,
        dismiss
    ]);

    return (
        <>
            <div
                className="global-activity"
                style={{ gridColumn: `2 / span ${span}`, gridRow }}
                ref={(el) => { refs.setReference(el); drag(el) }}
                {...getReferenceProps()}
            // key={}
            >
                {activeAct.name}
            </div>
            {isOpen && (
                <div
                    ref={refs.setFloating}
                    style={floatingStyles}
                    className='activity-popover'
                    {...getFloatingProps()}
                >
                    <div id='header'>Edit Activity</div>
                    <div id='body'>
                        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
                            <Form.Control {...register('name', { required: true })}
                                isInvalid={!!errors.name}
                                type="string"
                                placeholder="Name"
                                autoFocus
                            />

                            <div id="form-footer">
                                <Button variant="primary" type="submit">
                                    {/* {saving ?
                                        <Spinner as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            style={{ marginRight: "5px" }}
                                        /> : <></>
                                    } */}
                                    Save
                                </Button>
                                <Button onClick={onDelete} variant="danger">
                                    Delete
                                </Button>
                            </div>
                        </Form>
                    </div>
                    <FloatingArrow ref={arrowRef} context={context} />
                </div>
            )}
        </>
    )
}
