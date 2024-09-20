import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import { useForm, SubmitHandler } from "react-hook-form"
import type { Schema } from "../../amplify/data/resource";
import '../styles/settings.scss';
import { Col, ButtonGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';

type ActivityPrototype = Schema["ActivityPrototype"]["type"]

enum SettingsView {
    GENERAL,
    MANAGER,
    SUPPORT
}

interface ActivityListElementProps {
    activity: ActivityPrototype,
    handleDelete: (id: string) => void,
    setEditId: (id: string) => void;
}

function ActivityListElement({ activity, setEditId, handleDelete }: ActivityListElementProps) {
    function capitalize(str: string | undefined) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : 'None';
    }

    return (
        <div className="activity-list-element activity-row-grid">
            <Col>{activity.name}</Col>
            <Col>{activity.duration}</Col>
            <Col>{capitalize(activity.type?.toString())}</Col>
            <Col>{capitalize(activity.zone?.toString())}</Col>
            <Col>{activity.isRequired ? "Yes" : "No"}</Col>
            <Col>{activity.groupSize}</Col>
            <Col>{activity.preferredDays?.join(",")}</Col>
            <Col className='final'>
                <ButtonGroup className="hide">
                    <Button onClick={() => setEditId(activity.id)} size="sm" variant="light">
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </Button>
                    <Button onClick={() => handleDelete(activity.id)} size="sm" variant="danger">
                        <FontAwesomeIcon icon={faTrashCan} />
                    </Button>
                </ButtonGroup>

            </Col>
        </div>
    )
}

interface ActivityAddElementProps {
    handleSave: (data: ActivityPrototype) => void,
    saving: boolean,
    activeActivity?: ActivityPrototype
}

function ActivityAddElement({ saving, handleSave, activeActivity }: ActivityAddElementProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<ActivityPrototype>({ values: activeActivity });

    const onSubmit: SubmitHandler<ActivityPrototype> = async (data) => {
        await handleSave(data);
        // console.log("submitting");
        // console.log(data);

        if(!activeActivity) reset();
    };

    // console.log(errors);

    return (
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            <Col>
                <Form.Control {...register("name", { required: true })}
                    isInvalid={!!errors.name}
                    type="text"
                    placeholder="Name"
                />
            </Col>
            <Col>
                <Form.Select defaultValue="" {...register("duration", { required: true })} isInvalid={!!errors.duration}>
                    <option disabled value="">select</option>
                    <option value={1}>1 hr</option>
                    <option value={1.5}>1.5 hrs</option>
                    <option value={2}>2 hrs</option>
                </Form.Select>
            </Col>
            <Col>
                <Form.Select defaultValue="" {...register("type", { required: true })} isInvalid={!!errors.type}>
                    <option disabled value="">select</option>
                    <option value="element">Element</option>
                    <option value="program">Program</option>
                </Form.Select>
            </Col>
            <Col >
                <Form.Select defaultValue="" {...register("zone", { required: true })} isInvalid={!!errors.zone}>
                    <option disabled value="">select</option>
                    <option value="ridge">Ridge</option>
                    <option value="waterfront">Waterfront</option>
                    <option value="central">Central</option>
                </Form.Select>
            </Col>
            <Col>
                <Form.Check {...register("isRequired")} type="checkbox" label="Required?" />
            </Col>
            <Col >
                <Form.Select defaultValue="" {...register("groupSize", { required: true })} isInvalid={!!errors.groupSize}>
                    <option disabled value="">select</option>
                    <option value={1}>1 LEG</option>
                    <option value={2}>2 LEGs</option>
                </Form.Select>
            </Col>
            <Col>
                {
                    range(1, 5).map((day) => {
                        // const vals = getValues("preferredDays");
                        return (
                            <Form.Check
                                {...register("preferredDays", { validate: (value, _) => Array.isArray(value) && value?.length != 0 })}
                                isInvalid={!!errors.preferredDays}
                                inline
                                type="checkbox"
                                defaultChecked={activeActivity?.preferredDays?.includes(day)}
                                value={day}
                                label={day.toString()}
                                key={day}
                            />
                        );
                    }
                )
                }

            </Col>
            <Col className='final'>
                <Button disabled={saving} variant="primary" type="submit">
                    {saving ?
                        <Spinner as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            style={{ marginRight: "5px" }}
                        /> : <></>
                    }
                    {activeActivity ? "Save" : "Add"}
                </Button>
            </Col>

        </Form>
    )
}

function GeneralSettings() {
    return (
        <div className="settings">
            General
        </div>
    )
}


import { useMutation, useQuery } from '@tanstack/react-query';
import { getActivityPrototypesMapped, mutateActivityPrototype, deleteActivityPrototype } from '../api/apiActivityPrototype';
import { range } from 'lodash';

// const emptyActivity: Activity = {} as Activity;

function ManagerSettings() {
    const [editId, setEditId] = useState("");

    const query = useQuery({
        queryKey: ["activityPrototypesMapped"],
        queryFn: getActivityPrototypesMapped
    });

    const actProtos = query.data ? Object.keys(query.data).map((k) => query.data[k]) : [];

    const mutation = useMutation({
        mutationFn: mutateActivityPrototype,
        onSuccess: async () => { 
            await query.refetch()
            setEditId("");
        }
    });

    const deleteAct = useMutation({
        mutationFn: deleteActivityPrototype,
        onSuccess: async () => {
            await query.refetch()
            setEditId("");
        }
    });

    return (
        <div className='settings'>
            <div className="activity-row-grid header">
                <Col>
                    Name
                </Col>
                <Col>
                    Duration
                </Col>
                <Col>
                    Type
                </Col>
                <Col>
                    Zone
                </Col>
                <Col>
                    Required?
                </Col>
                <Col >
                    Group Size
                </Col>
                <Col>
                    Preferred Days
                </Col>
                <Col className='final' />
            </div>
            <div className='activity-row-grid activity-add-element'>
                <ActivityAddElement
                    handleSave={mutation.mutate}
                    saving={mutation.isPending && !editId}
                />
            </div>

            {query.isSuccess ? actProtos.map((act) => (
                act.id === editId ?
                    <div className='activity-row-grid activity-add-element'>
                        <ActivityAddElement
                            handleSave={mutation.mutate}
                            
                            saving={mutation.isPending}
                            activeActivity={act}
                        />
                    </div> :
                    <ActivityListElement
                        handleDelete={deleteAct.mutate}
                        key={act.id}
                        activity={act}
                        setEditId={setEditId}
                    />
            )) : "Loading..."}

        </div>
    )
}

function SupportSettings() {
    return (
        <div className='settings'>
            Support Settings
        </div>
    )
}

type SettingsProps = {
    show?: boolean
    handleClose: Function
    // handleSave: (data: Activity) => void,
    // handleDelete: (id: string) => void,
    // data: Activity,
    // saving: boolean,
    // deleting: boolean
}

export default function Settings({ show = false, handleClose }: SettingsProps) {
    const [settingsView, setSettingsView] = useState<SettingsView>(SettingsView.GENERAL);




    // console.log(errors);

    function renderView() {
        switch (settingsView) {
            case SettingsView.GENERAL:
                return <GeneralSettings />
            case SettingsView.MANAGER:
                return <ManagerSettings />
            case SettingsView.SUPPORT:
                return <SupportSettings />
        }
    }

    return (
        <Modal id='settings-modal' show={show} size="lg" centered onHide={() => handleClose()}>
            <Modal.Header closeButton>
                <Modal.Title>Settings</Modal.Title>
                {/* <Modal.Title>{data.id ? "Edit activity" : "Add activity"}</Modal.Title> */}
            </Modal.Header>
            <Modal.Body>
                <div id="settings">
                    <div id="sidebar">
                        <Button
                            variant={settingsView === SettingsView.GENERAL ? "primary" : 'light'}
                            onClick={() => setSettingsView(SettingsView.GENERAL)}
                        >
                            General
                        </Button>
                        <Button
                            variant={settingsView === SettingsView.MANAGER ? "primary" : 'light'}
                            onClick={() => setSettingsView(SettingsView.MANAGER)}
                        >
                            Activity Manager
                        </Button>
                        <Button
                            variant={settingsView === SettingsView.SUPPORT ? "primary" : 'light'}
                            onClick={() => setSettingsView(SettingsView.SUPPORT)}
                        >
                            Support
                        </Button>
                    </div>
                    <div id="content">
                        {renderView()}
                    </div>

                </div>
            </Modal.Body>
        </Modal>

    );
}