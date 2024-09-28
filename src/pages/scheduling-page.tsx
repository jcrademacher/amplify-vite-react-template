import '../styles/home.scss';
import 'react-toastify/dist/ReactToastify.css';
import Button from 'react-bootstrap/Button';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Scheduler } from '../components/scheduler';
import Settings from '../components/settings';
import moment from 'moment';

export enum View {
    MASTER = "Master",
    LEG = "Leg",
    SUPPORT = "Support"
}

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
                    let diff = date.diff(startDate, 'days') + 1;

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
            <span>
                <Button
                    variant='light'
                    onClick={() => setShowSettings(true)}
                    className='btn-stick-right'
                >
                    <FontAwesomeIcon style={{ marginRight: "5px" }} icon={faGear} />
                    Settings
                </Button>
            </span>


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

interface SchedulingPageProps {
    saveSchedule: {
        saving: boolean,
        setSaving: (state: boolean) => void
    }
}

export default function SchedulingPage({ saveSchedule }: SchedulingPageProps) {
    // const notify = (message: string) => toast(message);
    return (
        <div id="home-page">
            <div id="content">
                <ScheduleView saveSchedule={saveSchedule}/> 
            </div>
        </div>
    )
}

import { useScheduleQuery } from '../queries';
import { useScheduleIDMatch } from '../utils/router';

interface ScheduleViewProps {
    saveSchedule: {
        saving: boolean,
        setSaving: (state: boolean) => void
    }
}

function ScheduleView({ saveSchedule }: ScheduleViewProps) {
    const [view, setView] = useState<View>(View.MASTER);
    const [dayView, setDayView] = useState<number>(1);
    // const [activities, setActivities] = useState<Schema["ActivityPrototype"]["type"][]>([]);
    const [showSettings, setShowSettings] = useState(false);

    const match = useScheduleIDMatch();
    const scheduleId = match?.params.scheduleId as string;

    const query = useScheduleQuery(scheduleId);


    // useEffect(() => {
    //     console.log(query.status);
    //     if(query.status === "success") {
    //         emitToast("Opened schedule", ToastType.Success);
    //     }
    // }, [query.status]);

    if (query.isLoading) return (<>Loading...</>);

    else if (query.isError) return (<>Error loading schedule</>);

    else if (query.isSuccess) {

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
                saveSchedule={saveSchedule}
            />
        </>)
    }
}