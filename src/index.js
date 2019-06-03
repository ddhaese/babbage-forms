import React from "react";
import ReactDOM from "react-dom";
import "./stl/index.css";
import App from "./cmp/App";
import * as serviceWorker from "./serviceWorker";
import { Set_Language } from "./scr/Logic";

let Root_Element = document.querySelector("#root");

const Context = {
	Language: Set_Language("nl-be"),
	View: "RegisterCompany",
	User: "Anyone",
	User_Avatar: "Ct",
	User_Role: "Contact",
	Acad_Year: new Date().getFullYear(),
	Verbose: true
};

ReactDOM.render(<App Context={Context} />, Root_Element);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

//TODO: Check String for missing translations in dictionary
