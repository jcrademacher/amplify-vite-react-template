import '../styles/navbar.scss';
import { UseAuthenticator } from '@aws-amplify/ui-react';
import { Dropdown } from 'react-bootstrap';
import { useAllActivitiesQuery, useScheduleQuery, useActivityPrototypesQuery } from '../queries';
import ExcelJS from 'exceljs';

interface NavBarProps {
    signOut: UseAuthenticator["signOut"] | undefined;
    handleFileNew: () => void;
    handleFileOpen: () => void;
    handleSave: () => Promise<void>
}

type DropdownOptions = {
    name?: string,
    action?: () => void,
    disabled?: boolean
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
                {items.map(({ name, disabled, action }) => {
                    if (!name && !action && !disabled) {
                        return <Dropdown.Divider/>
                    }
                    else {
                        return <Dropdown.Item disabled={disabled} onClick={action} key={name}>{name}</Dropdown.Item>
                    }
                }
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
}

import { useNavigate } from 'react-router-dom';
import { useScheduleIDMatch } from '../utils/router';
import { useFileContext } from './file/context-provider';

function NavBar({ signOut, handleFileNew, handleFileOpen, handleSave }: NavBarProps) {

    const match = useScheduleIDMatch();
    const navigate = useNavigate();

    const scheduleId = match?.params.scheduleId;

    const actProtoQuery = useActivityPrototypesQuery(scheduleId);
    const schQuery = useScheduleQuery(scheduleId);
    const actsQuery = useAllActivitiesQuery(scheduleId, actProtoQuery.data);

    const fileContext = useFileContext();

    const exportAction = async () => {
        await handleSave();
    
        if (actsQuery.data && schQuery.data) {
            // Create a new workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(schQuery.data.name);
    
            // Set up the headers
            worksheet.columns = [
                { header: 'Activity Name', key: 'name', width: 30 },
                { header: 'Start Time', key: 'startTime', width: 20 },
                { header: 'End Time', key: 'endTime', width: 20 },
                { header: 'Location', key: 'location', width: 20 },
                { header: 'Description', key: 'description', width: 40 }
            ];
    
            // Style the header row
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };
    
            // Add the activities data
            // const rows = actsQuery.data.acts.list()map(activity => ({
            //     name: activity.name,
            //     startTime: new Date(activity.startTime).toLocaleString(),
            //     endTime: new Date(activity.endTime).toLocaleString(),
            //     location: activity.location || '',
            //     description: activity.description || ''
            // }));
    
            // worksheet.addRows(rows);
    
            // // Add schedule information at the bottom
            // worksheet.addRow([]); // Empty row for spacing
            // worksheet.addRow(['Schedule Name:', schQuery.data.name]);
            // worksheet.addRow(['Schedule Description:', schQuery.data.description || '']);
    
            // // Auto-fit columns
            // worksheet.columns.forEach(column => {
            //     column.width = Math.max(
            //         column.width || 10,
            //         ...worksheet.getColumn(column.key).values
            //             .map(v => v ? v.toString().length : 0)
            //     );
            // });
    
            // // Generate and download the file
            // const buffer = await workbook.xlsx.writeBuffer();
            // const blob = new Blob([buffer], { 
            //     type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            // });
            // const url = URL.createObjectURL(blob);
            // const link = document.createElement('a');
            // link.href = url;
            // link.download = `${schQuery.data.name}.xlsx`;
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);
            // URL.revokeObjectURL(url);
        }
    }

    const fileItems: DropdownOptions[] = [
        { name: "New...", action: handleFileNew, disabled: match !== null },
        { name: "Open...", action: handleFileOpen, disabled: match !== null },
        {},
        { name: "Save", action: () => { handleSave() }, disabled: match === null },
        {
            name: "Save & Close",
            action: async () => {
                await handleSave();
                fileContext.setSavedAt(undefined);
                navigate("/");
            }, disabled: match === null
        },
        {},
        {   
            name: "Export...", 
            action: exportAction, 
            disabled: match === null 
        }
    ];
    

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
