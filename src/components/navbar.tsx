import '../styles/navbar.scss';
import { UseAuthenticator } from '@aws-amplify/ui-react';
import { Dropdown } from 'react-bootstrap';

interface NavBarProps {
    signOut: UseAuthenticator["signOut"] | undefined;
}

type DropdownOptions = {
    name: string,
    action: (...args: any) => void,
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
            {items.map(({ name, disabled }) =>
                <Dropdown.Item disabled={disabled} onClick={()=> console.log("clicked")} key={name}>{name}</Dropdown.Item>
            )}
        </Dropdown.Menu>
        </Dropdown>
    );
}

function NavBar({signOut}: NavBarProps) {
    const fileItems = [
        { name: "New...", action: () => {}, disabled: false},
        { name: "Open...", action: () => {}, disabled: false},
        { name: "Save", action: () => {}, disabled: false},
        { name: "Save & Close", action: () => {}, disabled: false}
    ];

    // const viewItems = [
    //     { name: "Master", route: "day"},
    //     { name: "Leg", route: "week"}
    // ];

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
