// import { useEffect, useState } from "react";

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { Routes, Route } from "react-router-dom";
import NavBar from './components/navbar.js';
import SchedulingPage from './pages/scheduling-page.js';

function App() {
  
  return (  
    <Authenticator>
      {({ signOut }) => {

        return (
          <div id="main">
            <NavBar signOut={signOut}/>
            <div id="app-container">
              <Routes>
                <Route path="/" element={<SchedulingPage/>} />
              </Routes>
            </div>
          </div>
        )
      }}
      </Authenticator>
  );
}

export default App;
