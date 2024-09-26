// import { useEffect, useState } from "react";

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { Routes, Route } from "react-router-dom";
import NavBar from './components/navbar.js';
import SchedulingPage from './pages/scheduling-page.js';

import { createContext, useState } from 'react';

import { FileModal } from './components/file';
import { FileNewModal } from './components/file/new.js';
import { FileOpenModal } from './components/file/open.js';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export const ScheduleContext = createContext({
    id: undefined as string | undefined,
    setId: (id: string | undefined) => {}
});

function App() {

    const [scheduleId, setScheduleId] = useState<string | undefined>(undefined);
    const [modal, setModal] = useState<string | undefined>(undefined);


    return (
        <Authenticator hideSignUp>
            {({ signOut }) => {

                return (
                    <div id="main">
                        <ScheduleContext.Provider value={{
                            id: scheduleId,
                            setId: setScheduleId
                        }}>
                            <NavBar
                                signOut={signOut}
                                handleFileNew={() => setModal("new")}
                                handleFileOpen={() => setModal("open")}
                            />
                            <FileModal
                                show={modal === "new"}
                                handleClose={() => setModal(undefined)}
                                title="New Schedule"
                            >
                                <FileNewModal
                                    handleCancel={() => setModal(undefined)}
                                />
                            </FileModal>
                            <FileModal
                                show={modal === "open"}
                                handleClose={() => setModal(undefined)}
                                title="Open Schedule"
                            >
                                <FileOpenModal
                                    handleCancel={() => setModal(undefined)}
                                />
                            </FileModal>
                            <div id="app-container">
                                <Routes>
                                    <Route path="/" element={<SchedulingPage />} />
                                </Routes>
                            </div>
                        </ScheduleContext.Provider>
                        <ToastContainer/>
                    </div>
                )
            }}
        </Authenticator>
    );
}

export default App;
