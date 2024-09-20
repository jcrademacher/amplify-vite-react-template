import '../styles/navbar.scss';
import { UseAuthenticator } from '@aws-amplify/ui-react';

interface NavBarProps {
    signOut: UseAuthenticator["signOut"] | undefined;
}

// interface DropdownProps {
//     title: string;
//     items: {
//         name: string;
//         route: string;
//     }[];
// }

// function NavDropdown({title, items}: DropdownProps) {
//     return (
//         <Dropdown className='nav-item'>
//         <Dropdown.Toggle size="sm" id="dropdown-basic">
//             {title}
//         </Dropdown.Toggle>

//         <Dropdown.Menu>
//             {items.map(({ name }) =>
//                 <Dropdown.Item key={name}>{name}</Dropdown.Item>
//             )}
//         </Dropdown.Menu>
//         </Dropdown>
//     );
// }

function NavBar({signOut}: NavBarProps) {
    // const fileItems: object[] = [
    //     { name: "Save", route: "save"},
    //     { name: "Open", route: "open"}
    // ];

    // const viewItems: object[] = [
    //     { name: "Master", route: "day"},
    //     { name: "Leg", route: "week"}
    // ];

    return (
        <div id="nav">
            <button id="signout-button" onClick={() => { if(signOut) signOut()}}>Sign Out</button>
            <span>
                <b>RYLA Scheduler</b>
            </span>
            {/* <NavDropdown title="File" items={fileItems}/>
            <NavDropdown title="View" items={viewItems}/> */}
        </div>
    )
}

export default NavBar;
