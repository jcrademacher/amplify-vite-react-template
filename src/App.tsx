// import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { Routes, Route } from "react-router-dom";
import NavBar from './components/navbar.js';
import HomePage from './pages/home-page.js';


// const client = generateClient<Schema>();

function App() {
  // const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  // useEffect(() => {
  //   client.models.Todo.observeQuery().subscribe({
  //     next: (data) => setTodos([...data.items]),
  //   });
  // }, []);

  // function createTodo() {
  //   client.models.Todo.create({ content: window.prompt("Todo content") });
  // }

    
  // function deleteTodo(id: string) {
  //   client.models.Todo.delete({ id })
  // }

  return (  
    <Authenticator>
      {({ signOut }) => {

        // const { authStatus } = useAuthenticator((context) => [context.authStatus, context.user]);

        // console.log(user);

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
