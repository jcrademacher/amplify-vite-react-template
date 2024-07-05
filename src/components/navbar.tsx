import { Nav } from 'react-bootstrap';
import '../styles/navbar.scss';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';

interface NavBarProps {
    signOut: Function;
}

interface DropdownProps {
    title: string;
    items: object[];
}

function NavDropdown({title, items}: DropdownProps) {
    return (
        <Dropdown className='nav-item'>
        <Dropdown.Toggle size="sm" id="dropdown-basic">
            {title}
        </Dropdown.Toggle>

        <Dropdown.Menu>
            {items.map(({ name, route }) =>
                <Dropdown.Item key={name}>{name}</Dropdown.Item>
            )}
        </Dropdown.Menu>
        </Dropdown>
    );
}

function NavBar({signOut}: NavBarProps) {
    const fileItems = [
        { name: "Save", route: "save"},
        { name: "Open", route: "open"}
    ];

    const viewItems = [
        { name: "Master", route: "day"},
        { name: "Leg", route: "week"}
    ];

    return (
        <div id="nav">
            <button id="signout-button" onClick={() => signOut()}>Sign Out</button>
            <span>
                <b>RYLA Scheduler</b>
            </span>
            <NavDropdown title="File" items={fileItems}/>
            <NavDropdown title="View" items={viewItems}/>
        </div>
    )
}

export default NavBar;
