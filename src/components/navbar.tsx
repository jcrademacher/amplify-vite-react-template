import '../styles/navbar.scss';
import { UseAuthenticator } from '@aws-amplify/ui-react';
import { Dropdown } from 'react-bootstrap';

interface NavBarProps {
    signOut: UseAuthenticator["signOut"] | undefined;
    handleFileNew: () => void;
    handleFileOpen: () => void;
    saveSchedule: {
        saving: boolean,
        setSaving: (state: boolean) => void
    }
}

type DropdownOptions = {
    name: string,
    action: () => void,
    disabled: boolean
}

interface DropdownProps {
    title: string;
    items: DropdownOptions[];
}

function NavDropdown({ title, items }: DropdownProps) {
    return (
        <Dropdown className='nav-item'>
            <Dropdown.Toggle size="sm" id="dropdown-basic">
                {title}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {items.map(({ name, disabled, action }) =>
                    <Dropdown.Item disabled={disabled} onClick={action} key={name}>{name}</Dropdown.Item>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
}

import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMutationState } from '@tanstack/react-query';
import { useScheduleIDMatch } from '../utils/router';

function NavBar({ signOut, handleFileNew, handleFileOpen, saveSchedule }: NavBarProps) {
    const [willClose, setWillClose] = useState(false);

    const match = useScheduleIDMatch();
    const navigate = useNavigate();

    const fileItems = [
        { name: "New...", action: handleFileNew, disabled: match !== null },
        { name: "Open...", action: handleFileOpen, disabled: match !== null },
        { name: "Save", action: () => { saveSchedule.setSaving(true) }, disabled: match === null },
        {
            name: "Save & Close",
            action: () => {
                saveSchedule.setSaving(true);
                setWillClose(true);
            }, disabled: match === null
        }
    ];

    const data = useMutationState({
        // this mutation key needs to match the mutation key of the given mutation (see above)
        filters: { mutationKey: ['saveSchedule', match?.params.scheduleId as string] },
        select: (mutation) => mutation.state.status,
    });

    useEffect(() => {
        if (willClose && data[data.length-1] === 'success') {
            setWillClose(false);
            navigate('/');
        }
    }, [data]);
    

    return (
        <div id="nav">
            <button id="signout-button" onClick={() => { if (signOut) signOut() }}>Sign Out</button>
            <span>
                <b>RYLA Scheduler</b>
            </span>
            <NavDropdown title="File" items={fileItems} />
            {/* <NavDropdown title="View" items={viewItems}/> */}
        </div>
    )
}

export default NavBar;
