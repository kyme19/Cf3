import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import { StateContextProvider } from './context';
import connectDB from './database/config';
import App from "./App";
import "./index.css";

// Connect to MongoDB
connectDB();

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <ThirdwebProvider activeChain={"sepolia"} clientId="9b045ff14b10aeaf0ab445e879c8aa3b">
        <Router>
            <StateContextProvider>
                <App />
            </StateContextProvider>
        </Router>
    </ThirdwebProvider>
);
