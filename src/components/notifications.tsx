import { Toast } from "react-bootstrap";
import ToastContainer from 'react-bootstrap/ToastContainer';
import { useState } from "react";

interface NotificationManagerProps {
    children: React.ReactNode
}

export default function NotificationManager({ children }: NotificationManagerProps) {
    const [show, setShow] = useState(true);

    return (
        <>
            {children}
            <ToastContainer
                className="p-3"
                position="top-center"
                style={{ zIndex: 3 }}
            >
                <Toast delay={3000} autohide onClose={() => setShow(false)} show={show}>
                    <Toast.Header>
                        <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
                        <strong className="me-auto">Bootstrap</strong>
                        <small>11 mins ago</small>
                    </Toast.Header>
                    <Toast.Body>Hello, world! This is a toast message.</Toast.Body>
                </Toast>
            </ToastContainer>
        </>

    )
}

