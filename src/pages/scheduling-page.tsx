import '../styles/home.scss';
import 'react-toastify/dist/ReactToastify.css';
import Button from 'react-bootstrap/Button';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useEffect, useState } from 'react';
import Scheduler from '../components/scheduler';
import Settings from '../components/settings';
import moment from 'moment';
import { ScheduleContext } from '../App';

export enum View {
    MASTER = "Master",
    LEG = "Leg",
    SUPPORT = "Support"
}


const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type ViewControlProps = {
    startDates: moment.Moment[],
    view: View,
    setView: (view: View) => void,
    dayView: number,
    setDayView: (day: number) => void,
    setShowSettings: (show: boolean) => void
}

function ViewControl({ startDates, dayView, setDayView, setShowSettings }: ViewControlProps) {
    let startDate = startDates[0];

    return (
        <div id="view-control">
            <span id="view-subselect">
                {startDates.map((date) => {
                    let diff = date.diff(startDate,'days') + 1;

                    return (
                        <Button
                            variant={dayView === diff ? "primary" : "light"}
                            onClick={() => setDayView(diff)}
                            key={date.toISOString()}
                        >
                            {date.format('dddd')} (Day {diff})
                        </Button>
                    );
                })}
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



export default function SchedulingPage() {
    // const notify = (message: string) => toast(message);
    const schContext = useContext(ScheduleContext);


    return (
        <div id="home-page">
            <div id="content">
                {schContext.id ? <ScheduleView /> : <LandingView />}
            </div>
            {/* <ActivityManager/> */}
            {/* <ToastContainer/> */}
        </div>
    )
}

import { useScheduleQuery } from '../queries';

function ScheduleView() {
    const [view, setView] = useState<View>(View.MASTER);
    const [dayView, setDayView] = useState<number>(1);
    // const [activities, setActivities] = useState<Schema["ActivityPrototype"]["type"][]>([]);
    const [showSettings, setShowSettings] = useState(false);

    const schContext = useContext(ScheduleContext);

    const query = useScheduleQuery(schContext.id as string);


    // useEffect(() => {
    //     console.log(query.status);
    //     if(query.status === "success") {
    //         emitToast("Opened schedule", ToastType.Success);
    //     }
    // }, [query.status]);

    if(query.isLoading) return (<>Loading...</>);

    else if(query.isError) return (<>Error loading schedule</>);

    else if(query.isSuccess) {

        return (<>
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
                startDates={query.data.startDates.map((el) => moment(el))}
            />
            <Scheduler
                view={view}
                dayView={dayView}
            />
        </>)
    }
}

function LandingView() {
    return (
        <div id="landing-view">
            <h1>Welcome to the RYLA Scheduler!</h1>
            <p>{"To create a schedule, select File > New..."}<br />
                {"To open a schedule, select File > Open..."}
            </p>
        </div>
    )
}