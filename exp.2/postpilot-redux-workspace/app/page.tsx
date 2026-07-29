"use client";
import {Provider} from "react-redux";
import {PostPilot} from "./post-pilot";
import {store} from "./store";
export default function Home(){return <Provider store={store}><PostPilot/></Provider>}

