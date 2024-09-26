import '../styles/navbar.scss';
import { UseAuthenticator } from '@aws-amplify/ui-react';
import { useContext } from 'react';
import { Dropdown } from 'react-bootstrap';
import { ScheduleContext } from '../App';

interface NavBarProps {
    signOut: UseAuthenticator["signOut"] | undefined;
    handleFileNew: () => void;
    handleFileOpen: () => void;
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

function NavDropdown({title, items}: DropdownProps) {
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

function NavBar({signOut, handleFileNew, handleFileOpen}: NavBarProps) {
    const schContext = useContext(ScheduleContext);

    const fileItems = [
        { name: "New...", action: handleFileNew, disabled: schContext.id !== undefined},
        { name: "Open...", action: handleFileOpen, disabled: schContext.id !== undefined},
        { name: "Save", action: () => {}, disabled: schContext.id === undefined},
        { name: "Save & Close", action: () => { schContext.setId(undefined) }, disabled: schContext.id === undefined}
    ];

    return (
        <div id="nav">
            <button id="signout-button" onClick={() => { if(signOut) signOut()}}>Sign Out</button>
            <span>
                <b>RYLA Scheduler</b>
            </span>
            <NavDropdown title="File" items={fileItems}/> 
            {/* <NavDropdown title="View" items={viewItems}/> */}
        </div>
    )
}

export default NavBar;
