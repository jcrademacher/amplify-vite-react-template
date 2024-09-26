import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.scss";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { BrowserRouter } from 'react-router-dom'

Amplify.configure(outputs);

import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { emitToast, ToastType } from "./components/notifications.tsx";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            networkMode: 'always', // or 'offlineFirst' or 'always'
        },
    },
    queryCache: new QueryCache({
        onError: (error) =>
            emitToast(`Something went wrong: ${error.message}`, ToastType.Error),

    })
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </React.StrictMode>
);
