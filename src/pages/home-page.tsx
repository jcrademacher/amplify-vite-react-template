import { Tabs } from '@aws-amplify/ui-react'
import '../styles/home.scss';
import ActivityManager from '../components/activity-manager';

function ViewControl() {
    return (
        <div id="view-control">
            testing
        </div>
    )
}

export default function HomePage() {
    return (
        <div id="home-page">
            <div id="content">
                testing 123 
            </div>
            <ActivityManager/>
        </div>
    )
}