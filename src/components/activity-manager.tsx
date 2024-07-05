import '../styles/activity-manager.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useState } from 'react';
import Form from 'react-bootstrap/Form';

// import Card from 'react-bootstrap/Card';

interface ActivityCardProps {
    name: string,
    duration: number,
    isRequired?: boolean,
    handleShow: Function
}

function ActivityCard({ name, duration, handleShow }: ActivityCardProps) {
  return (
    <div className="activity-card element">
        <div>
            <div className='title'>{name}</div>
            <div className='subtitle'>{duration} hrs</div>
        </div>
        <FontAwesomeIcon className='clickable' onClick={() => handleShow()} icon={faPenToSquare}/> 
    </div>
  );
}

interface ActivityEditModalProps {
    show?: boolean,
    handleClose: Function,
    handleSave: Function
}

function ActivityEditModal({ show = false, handleSave, handleClose}: ActivityEditModalProps) {
    return (
        <Modal show={show} onHide={() => handleClose()}>
            <Modal.Header closeButton>
                <Modal.Title>Edit activity</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3" controlId="formName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" placeholder="Enter name" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formRequired">
                        <Form.Check type="checkbox" label="Required?" />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => handleSave()}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default function ActivityManager() {
    const [show, setShow] = useState(false);
    // const [currentActivity, setCurrentActivity] = useState();

    const handleClose = () => setShow(false);
    const handleShow = () => {
        setShow(true);
    }
    
    const handleSave = () => {

        setShow(false);
    }

    return (
        <div id="act-manager">
            <h5>Activity Manager</h5>
            <ActivityEditModal handleSave={handleSave} show={show} handleClose={handleClose}/>
            <ActivityCard handleShow={handleShow} name="Moby Deck" duration={1}/>
            <ActivityCard handleShow={handleShow} name="River Crossing" isRequired duration={1}/>
            <ActivityCard handleShow={handleShow} name="Lord of the Rings" isRequired duration={1}/>
        </div>
    )
}
