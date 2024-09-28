
// import { Button, Modal } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';

interface FileModalProps {
    title?: string;
    show: boolean;
    handleClose: () => void;
    children?: React.ReactNode;
}

export function FileModal({ show, handleClose, title, children }: FileModalProps) {
    return (
        <Modal show={show} size="lg" centered onHide={() => handleClose()}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
                {/* <Modal.Title>{data.id ? "Edit activity" : "Add activity"}</Modal.Title> */}
            </Modal.Header>
            <Modal.Body>
                {children}
            </Modal.Body>
        </Modal>
    );
}

