import '../styles/home.scss';
import 'react-toastify/dist/ReactToastify.css';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { faFloppyDisk, faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import Scheduler from '../components/scheduler';
import Settings from '../components/settings';
import { range } from 'lodash';

export enum View {
    MASTER = "Master",
    LEG = "Leg",
    SUPPORT = "Support"
}


const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type ViewControlProps = {
    numDays: number,
    startDate: Date,
    view: View,
    setView: (view: View) => void,
    dayView: number,
    setDayView: (day: number) => void,
    setShowSettings: (show: boolean) => void
}

function ViewControl({ startDate, numDays, view, setView, dayView, setDayView, setShowSettings }: ViewControlProps) {


    const startDay = startDate.getDay();

    return (
        <div id="view-control">
            <span id="view-subselect">
                {range(startDay + 1, startDay + numDays + 1).map((day) =>
                    <Button
                        variant={dayView === (day - startDay) ? "primary" : "light"}
                        onClick={() => setDayView(day - startDay)}
                        key={day}
                    >
                        {days[day - 1]} (Day {day - startDay})
                    </Button>
                )}
                
            </span>
            <Button
                variant='light'
                onClick={() => setShowSettings(true)}
                className='btn-stick-right'
            >
                <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faGear} />
                Settings
            </Button>

            {/* <ButtonGroup id='view-control-buttons'>
                <Button
                    variant={view === View.MASTER ? 'primary' : 'light'}
                    onClick={() => setView(View.MASTER)}
                >{View.MASTER} View</Button>
                <Button
                    variant={view === View.LEG ? 'primary' : 'light'}
                    onClick={() => setView(View.LEG)}
                >{View.LEG} View</Button>
                <Button
                    variant={view === View.SUPPORT ? 'primary' : 'light'}
                    onClick={() => setView(View.SUPPORT)}
                >{View.SUPPORT} View</Button>
            </ButtonGroup> */}
        </div>
    )
}

export default function HomePage() {
    // const notify = (message: string) => toast(message);
    const [view, setView] = useState<View>(View.MASTER);
    const [dayView, setDayView] = useState<number>(1);
    // const [activities, setActivities] = useState<Schema["ActivityPrototype"]["type"][]>([]);
    const [showSettings, setShowSettings] = useState(false);


    return (
        <div id="home-page">
            <div id="content">
                <Settings
                    show={showSettings}
                    handleClose={() => setShowSettings(false)}
                />
                {/* <div>
                    <Button className="btn-stick-left">New Schedule</Button>
                    <Button className="btn-stick-left" variant="light">Open Schedule</Button>
                    <Button
                        variant='light'
                        onClick={() => setShowSettings(true)}
                        className='btn-stick-right'
                    >
                        <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faGear} />
                        Settings
                    </Button>
                    <Button className="btn-stick-right" variant="light">
                        <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faFloppyDisk} />
                        Save
                    </Button>
                </div>
                <div className="separator" /> */}
                <ViewControl
                    view={view}
                    setView={setView}
                    dayView={dayView}
                    setDayView={setDayView}
                    setShowSettings={setShowSettings}
                    startDate={new Date("Sunday June 23 2024")}
                    numDays={4}
                />
                <Scheduler
                    view={view}
                    dayView={dayView}
                />
                {/* <div id="footer">
                    
                </div> */}

            </div>
            {/* <ActivityManager/> */}
            {/* <ToastContainer/> */}
        </div>
    )
}