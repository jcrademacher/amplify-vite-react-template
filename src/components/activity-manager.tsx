import '../styles/activity-manager.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faPlus } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import { useForm, SubmitHandler } from "react-hook-form"

// import Card from 'react-bootstrap/Card';

type Activity = Schema["ActivityPrototype"]["type"]

type ActivityCardProps = {
    activity: Activity,
    handleShow: () => void
}

function ActivityCard({ activity, handleShow}: Activity & ActivityCardProps) {

  return (
    <div className="activity-card element">
        <div>
            <div className='title'>{activity.name}</div>
            <div className='subtitle'>{activity.duration} hrs</div>
        </div>
        <Button size='sm' variant="light" onClick={handleShow}><FontAwesomeIcon  icon={faPenToSquare}/> </Button>
    </div>
  );
}

type ActivityEditModalProps = {
    show?: boolean,
    handleClose: Function,
    handleSave: (data: Activity) => void,
    handleDelete: (id: string) => void,
    data: Activity,
    saving: boolean,
    deleting: boolean
}

function ActivityEditModal({ show = false, saving, deleting, handleSave, handleDelete, handleClose, data}: ActivityEditModalProps) {
    // const [saving, setSaving] = useState(false);


    // let defaultData = data ? data : {
    //     name: "",
    //     duration: 1,
    //     type: "element",
    //     isRequired: false
    // }

    // console.log(defaultData);
    // console.log(data);
    // console.log(data);

    // let values = data ? data : EmptyActivity;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<Activity>({ values: data, resetOptions: { keepDirtyValues: true }});

    // useEffect(() => {
    //     reset(data);
    // }, [data]);

    // if (data) {
    //     reset(data);
    // }
    // const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data

    const onSubmit: SubmitHandler<Activity> = async (data) => {
        // const form = event.currentTarget;
        // console.log(event);
        // console.log("submitting");

        // setValidated(true);
        // if (form.checkValidity() === false) {
        //     event.preventDefault();
        //     event.stopPropagation();
        // }
        // setValidated(true);
        // setSaving(true);
            
        // await timeout(1000);
        await handleSave(data);

        // setValidated(()=>false);
        // setSaving(false);
        
        reset();
    };

    function _handleClose() {
        reset();
        handleClose();
    }

    // console.log(errors);
    
    return (
        <Modal show={show} onHide={() => _handleClose()}>
            <Modal.Header closeButton>
                <Modal.Title>{data.id ? "Edit activity" : "Add activity"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form noValidate onSubmit={handleSubmit(onSubmit)}>

                    <Form.Group className="mb-3" controlId="formName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control {...register("name", {required: true})} 
                            isInvalid={!!errors.name} 
                            type="text" 
                            placeholder="Enter name"
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="formDuration">
                        <Form.Label>Duration</Form.Label>
                        <Form.Select {...register("duration", { required: true })} isInvalid={!!errors.duration}>
                            <option value={1}>1 hr</option>
                            <option value={1.5}>1.5 hrs</option>
                            <option value={2}>2 hrs</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formType">
                        <Form.Label>Activity Type</Form.Label>
                        <Form.Select {...register("type", { required: true })} isInvalid={!!errors.type}>
                            <option value="element">Element</option>
                            <option value="program">Program</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formRequired">
                        <Form.Check {...register("isRequired")} type="checkbox" label="Required?" />
                    </Form.Group>

                    <Button style={{ marginRight: "5px" }} disabled={saving} variant="primary" type="submit">
                        {saving ? 
                            <Spinner as="span"
                                animation="border"
                                size="sm"
                                role="status" 
                                style={{ marginRight: "5px" }}
                            /> : <></>
                        }
                        Save Changes
                    </Button>
                    {
                        data.id ?
                            <Button onClick={() => handleDelete(data.id)} disabled={deleting} variant="danger" >
                                {deleting ? 
                                    <Spinner as="span"
                                        animation="border"
                                        size="sm"
                                        role="status" 
                                        style={{ marginRight: "5px" }}
                                    /> : <></>
                                }
                                Delete Activity
                            </Button> : <></>
                    }
                </Form>
            </Modal.Body>
        </Modal>
     
    );
}

import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { render } from 'sass';

const client = generateClient<Schema>();

const emptyActivity: Activity = {
    name: "",
    duration: 0,
    type: "",
    isRequired: false
}

let renderCount = 0;

export default function ActivityManager() {
    const [show, setShow] = useState(false);
    // const [editing, setEditing] = useState(false);
    // const [currentActivity, setCurrentActivity] = useState();
    const [activities, setActivities] = useState<Schema["ActivityPrototype"]["type"][]>([]);
    const [activeActivity, setActiveActivity] = useState<Activity>(emptyActivity);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fetchActivities = async () => {
        const { data: items, errors } = await client.models.ActivityPrototype.list();
        items.sort((a,b) => (a.name.localeCompare(b.name)));
        setActivities(items);
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const saveActivity = async (data: Activity) => {
        setSaving(true);

        if(data.id) {
            const {errors} = await client.models.ActivityPrototype.update(data);
            console.log(errors);
        }
        else {
            const {errors} = await client.models.ActivityPrototype.create(data);
            console.log(errors);
        }
        // console.log("")
        
        setSaving(false);
        setShow(false);
        
        fetchActivities();
    }

    const deleteActivity = async (id: string) => {
        setDeleting(true);
        const {errors} = await client.models.ActivityPrototype.delete({id});

        setDeleting(false);
        setShow(false);
        fetchActivities();
    }

    const handleClose = () => {
        setShow(false);
    }

    const _handleShow = (act: Activity) => {
        setActiveActivity(act);
        setShow(true);
    }

    // console.log(renderCount);
    // renderCount++;
    return (
        <div id="act-manager">
            <div id="header">
                Activity Manager
                <Button 
                    size="sm" 
                    variant="light"
                    onClick={() => _handleShow(emptyActivity)}
                >
                    <FontAwesomeIcon icon={faPlus}/>
                </Button>
            </div>
            
            <ActivityEditModal 
                saving={saving}
                deleting={deleting}
                data={activeActivity} 
                handleSave={saveActivity}
                handleDelete={deleteActivity} 
                show={show} 
                handleClose={handleClose}
            />
            {activities.map((activity) => (
                <ActivityCard 
                    handleShow={() => _handleShow(activity)} 
                    key={activity.id} 
                    activity={activity}
                />
            ))}
        </div>
    )
}
