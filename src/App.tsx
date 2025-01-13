// import { useEffect, useState } from "react";

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { Routes, Route } from "react-router-dom";
import NavBar from './components/navbar.js';
import SchedulingView from './pages/scheduling-page.js';

import { useState, useRef } from 'react';

import { FileModal } from './components/file';
import { FileNewModal } from './components/file/new.js';
import { FileOpenModal } from './components/file/open.js';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { LandingView } from './pages/landing.js';
import { SchedulerRef } from './components/scheduler/index.js';
import { FileContextProvider } from './components/file/context-provider.js';

function App() {

    const [modal, setModal] = useState<string | undefined>(undefined);

    const schedulerRef = useRef<SchedulerRef>(null);

    return (
        <Authenticator hideSignUp>
            {({ signOut }) => {

                return (
                    <FileContextProvider>
                        <div id="main">
                            <NavBar
                                signOut={signOut}
                                handleFileNew={() => setModal("new")}
                                handleFileOpen={() => setModal("open")}
                                handleSave={async () => {
                                    if (schedulerRef.current) {
                                        await schedulerRef.current.save();
                                    }
                                }}
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
                                    <Route path="/" element={<LandingView />} />
                                    <Route path="/schedule">
                                        <Route path="/schedule/*" element={
                                            <SchedulingView 
                                                saveRef={schedulerRef}
                                            />
                                        } />
                                    </Route>
                                </Routes>
                            </div>
                            <ToastContainer />
                        </div>
                    </FileContextProvider>
                )
            }}
        </Authenticator>
    );
}

export default App;
