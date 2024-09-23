// import { useEffect, useState } from "react";

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { Routes, Route } from "react-router-dom";
import NavBar from './components/navbar.js';
import HomePage from './pages/home-page.js';

function App() {
  
  return (  
    <Authenticator hideSignUp>
      {({ signOut }) => {

        return (
          <div id="main">
            <NavBar signOut={signOut}/>
            <div id="app-container">
              <Routes>
                <Route path="/" element={<HomePage/>} />
              </Routes>
            </div>
          </div>
        )
      }}
      </Authenticator>
  );
}

export default App;
