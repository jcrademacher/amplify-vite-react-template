import '../styles/home.scss';
import ActivityManager from '../components/activity-manager';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ViewControl() {
    return (
        <div id="view-control">
            testing
        </div>
    )
}

export default function HomePage() {
    const notify = (message: string) => toast(message);

    return (
        <div id="home-page">
            <div id="content">
                testing 123 
            </div>
            <ActivityManager/>
            <ToastContainer/>
        </div>
    )
}