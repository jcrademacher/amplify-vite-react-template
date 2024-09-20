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

import { LocalActivity, GlobalActivity, GlobalActivityDragStatus, GlobalActivityState } from "./types";
import { getTimes } from '.';
import { ActivityPrototype, ActivityPrototypeMap } from "../../api/apiActivityPrototype";

import { Button, Spinner } from 'react-bootstrap';
import { range } from 'lodash';

import { useDrag, useDrop } from 'react-dnd';



export const checkActivityCreate: (time: moment.Moment, dayView: number, actProto: ActivityPrototype, acts: LocalActivity[], gacts: GlobalActivity[]) => number = (time, dayView, actProto, acts, gacts) => {
    const times = getTimes();

    let newActStartTime = time.clone();
    let newActEndTime = newActStartTime.clone()
    newActEndTime.add(actProto.duration, 'hours');

    let gact = gacts.find((el) => {
        let startTime = el.startTime;
        // let endTime = el.startTime.clone();
        // endTime.add(el.duration,'hours');

        return newActEndTime.diff(startTime) > 0 && newActStartTime.diff(startTime) < 0;
    });

    if (gact) {
        return -1;
    }

    // console.log("Pre Start Time: ", newActStartTime.toString());

    let schEndTime = times[times.length - 1].clone();
    schEndTime.add(dayView - 1, 'days');
    schEndTime.add(30, 'minutes'); // add to maintain consistency of inclusive start time, exclusive end time

    let schStartTime = times[0].clone();
    schStartTime.add(dayView - 1, 'days');

    let insertAt = undefined;
    let slotFlag = true;

    for (let i = 0; i < acts.length; ++i) {
        let act = acts[i];
        // let nextAct = acts[i+1];

        let actStartTime = act.startTime;
        let actEndTime = actStartTime.clone().add(actProto.duration, 'hours');

        // check that current activity can be slotted into gap, slotFlag indicates from previous iteration
        // whether or not this new activity will overlap with previous
        if (newActEndTime.diff(actStartTime) <= 0 && slotFlag) {
            // insert activity 
            insertAt = i;
            break;
        }
        else {
            slotFlag = newActStartTime.diff(actEndTime) >= 0;
        }
    }

    if (insertAt === undefined && slotFlag) {
        insertAt = acts.length;
    }

    // check for unscheduled activities and an addition to the end, checking for validity within schedule as well
    if (insertAt !== undefined && newActStartTime.diff(schStartTime) >= 0 && newActEndTime.diff(schEndTime) <= 0) {
        return insertAt;
    }
    else {
        return -1;
    }
};

import { LocalActivityMap, ScheduleObjectTypes } from './types';

export const checkGlobalActivityCreate = (newGact: GlobalActivity, actProtos: ActivityPrototypeMap, schActs: LocalActivityMap, gacts: GlobalActivity[]) => {
    let newGactStartTime = newGact.startTime.clone();
    let newGactEndTime = newGactStartTime.clone();
    newGactEndTime.add(newGact.duration, "hours");

    // first check for overlaps with existing scheduled activities
    for (var key in schActs) {
        let acts = schActs[key];

        for (let i = 0; i < acts.length; ++i) {
            let act = acts[i];

            let actStartTime = act.startTime.clone();
            let duration = actProtos[act.activityPrototypeId].duration;
            let actEndTime = actStartTime.clone();
            actEndTime.add(duration, "hours");

            if ((actStartTime.diff(newGactStartTime) >= 0 && actStartTime.diff(newGactEndTime) < 0) ||
                (actEndTime.diff(newGactStartTime)) > 0 && actEndTime.diff(newGactEndTime) <= 0) {
                return -1;
            }
        }
    }

    let insertAt = undefined;
    let slotFlag = true;

    // then check for overlaps with existing global activities and find where it should be inserted
    for (let i = 0; i < gacts.length; ++i) {
        let gactStartTime = gacts[i].startTime.clone();
        let gactEndTime = gactStartTime.clone();
        gactEndTime.add(gacts[i].duration, 'hours');

        if ((gactStartTime.diff(newGactStartTime) >= 0 && gactStartTime.diff(newGactEndTime) < 0) ||
            (gactEndTime.diff(newGactStartTime) > 0 && gactEndTime.diff(newGactEndTime) <= 0)) {
            return -1;
        }
        else if (newGactEndTime.diff(gactStartTime) <= 0 && slotFlag) {
            // insert activity 
            insertAt = i;
            break;
        }
        else {
            slotFlag = newGactStartTime.diff(gactEndTime) >= 0;
        }
    }

    if (insertAt === undefined && slotFlag) {
        insertAt = gacts.length;
    }

    return insertAt !== undefined ? insertAt : -1;
}

interface WorkareaProps {
    id: string,
    time: moment.Moment,
    handleCreate: (id: string, time: moment.Moment, newAct?: LocalActivity) => void,
    handleMoveActivity: (newId: string, newTime: moment.Moment, oldAct: LocalActivity) => void,
    handleMoveGlobalActivity: (newTime: moment.Moment, oldAct: GlobalActivity) => void,
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

    const [hovering, setHovering] = useState(false);

    let dragHighlight: boolean;

    if (originTime && currentTime) {
        dragHighlight = time.diff(originTime) >= 0 && time.diff(currentTime) <= 0;
    }
    else {
        dragHighlight = false;
    }

    const [{ isOver }, drop] = useDrop(
        () => ({
            accept: [ScheduleObjectTypes.LocalActivity, ScheduleObjectTypes.GlobalActivity],
            drop: (item: LocalActivity | GlobalActivity, monitor) => {
                const itemType = monitor.getItemType();
                if(itemType === ScheduleObjectTypes.LocalActivity) {
                    handleMoveActivity(id,time,item as LocalActivity);
                }
                else if(itemType === ScheduleObjectTypes.GlobalActivity) {
                    handleMoveGlobalActivity(time,item as GlobalActivity);
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
                setHovering(true);

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
    activeAct: LocalActivity,
    timeIndex: number,
    actIndex: number,
    duration: number,
    groupSize: number,
    handleSave: (newAct: LocalActivity, index: number) => void,
    handleDelete: (newAct: LocalActivity, index: number) => void
}

export function ScheduledActivity({ activeAct, actIndex, timeIndex, duration, groupSize, handleDelete, handleSave }: ScheduledActivityProps) {
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
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setIsOpen(notScheduled);
    }, [notScheduled]);

    const arrowRef = useRef(null);

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange(nextOpen, event, reason) {
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
        reset,
        control
    } = useForm<ActivityOptions>({ values: !activeAct.leg.some((el) => el === 0) ? activeAct : undefined });

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

        handleSave(activeAct, actIndex);
        onClose();
    }

    const onDelete = () => {
        setIsOpen(false);
        handleDelete(activeAct, actIndex);
        onClose();
    }

    const onClose = () => {
        reset(activeAct);
    }

    const [, drag] = useDrag(() => ({
        type: ScheduleObjectTypes.LocalActivity,
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
                            {range(0, groupSize).map((el, i) => (
                                <Form.Control {...register(`leg.${i}`, { valueAsNumber: true, required: true, max: 12, min: 1 })}
                                    isInvalid={!!(errors?.leg ? errors.leg[i] : false)}
                                    type="number"
                                    placeholder="Leg Number"
                                    autoFocus={i === 0}
                                    key={i}
                                />
                            ))}

                            <Form.Check {...register("shadow")} type="checkbox" label="Shadow?" />

                            <div id="form-footer">
                                <Button disabled={saving} variant="primary" type="submit">
                                    {saving ?
                                        <Spinner as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            style={{ marginRight: "5px" }}
                                        /> : <></>
                                    }
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
    activeAct: GlobalActivity,
    handleSave: (newAct: GlobalActivity, index: number) => void,
    handleDelete: (newAct: GlobalActivity, index: number) => void,
    timeIndex: number,
    span: number,
    gactIndex: number
};

export function ScheduledGlobalActivity({ activeAct, handleSave, handleDelete, timeIndex, span, gactIndex }: ScheduledGlobalActivityProps) {
    let gridRow = `${timeIndex + 2} / span ${activeAct.duration * 2}`;

    type GlobalActivityOptions = {
        name: string
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control
    } = useForm<GlobalActivityOptions>({ values: { name: activeAct.name ? activeAct.name : "" } });

    const arrowRef = useRef(null);

    const notScheduled = activeAct.name ? false : true;

    const [isOpen, setIsOpen] = useState(notScheduled);
    const [saving, setSaving] = useState(false);

    const onSubmit: SubmitHandler<GlobalActivityOptions> = async (data) => {
        setIsOpen(false);
        let newAct = { ...activeAct, ...data };

        // console.log(data);

        handleSave(newAct, gactIndex);
        onClose();
    }

    const onDelete = () => {
        // console.log("handling delete...");
        setIsOpen(false);
        handleDelete(activeAct, gactIndex);
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
        onOpenChange(nextOpen, event, reason) {
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
                                <Button disabled={saving} variant="primary" type="submit">
                                    {saving ?
                                        <Spinner as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            style={{ marginRight: "5px" }}
                                        /> : <></>
                                    }
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
