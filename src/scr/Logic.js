import Dict from "../dat/dict.json";
import ReactMarkdown from "react-markdown";
import React from "react";

export const Access_Levels = Object.freeze({
	No_Access: 0,
	Read_Only: 1,
	Read_Write: 2
});

export const Images = Object.freeze({
	Remove: "Remove",
	Plus: "Plus"
});

export const Field_Types = Object.freeze({
	File: "File"
});

export const Input_Types = Object.freeze({
	A: "a",
	Text: "text",
	Checkbox: "checkbox",
	Button: "button",
	Range: "range",
	File: "file",
	Select_Multiple: "select-multiple"
});

export const Form_States = Object.freeze({
	Error: "Error",
	Ready: "Ready",
	Changed: "Changed",
	Sent: "Sent",
	Global_Read_Only: "Global_Read_Only",
	Local_Read_Only: "Local_Read_Only"
});

export const Form_Roles = Object.freeze({
	Data_Binder: "Data_Binder",
	Data_Generator: "Data_Generator",
	Data_Merger: "Data_Merger",
	Data_Propagator: "Data_Propagator",
	Data_Submitter: "Data_Submitter",
	Data_Validator: "Data_Validator",

	Error_Reporter: "Error_Reporter",
	Error_Propagator: "Error_Propagator",

	Event_Propagator: "Event_Propagator",

	File_Generator: "File_Generator",
	File_Propagator: "File_Propagator",
	File_Submitter: "File_Submitter",

	Global_Read_Only_Reporter: "_Global_Read_Only_Reporter",
	Local_Read_Only_Reporter: "Local_Read_Only_Reporter"
});

export let Message_Types = Object.freeze({
	Error: "Error",
	Warning: "Warning",
	Info: "Info"
});

export function Go_To_View() {}

export function Toggle_Language() {
	if (lang === "nl-be") {
		lang = "en-us";
	} else {
		lang = "nl-be";
	}
	return lang;
}

let lang = "";

export function Set_Language(iLanguage) {
	lang = iLanguage;
	return lang;
}

export function T(iKey, iDefault = null, iReplace = null, iLanguage = lang) {
	if (!Dict[iKey]) {
		return iDefault || iKey;
	}

	let Translation = Dict[iKey][iLanguage] || iDefault || iKey;

	if (iReplace) {
		Object.entries(iReplace).forEach(([From, To]) => {
			Translation = Translation.replace("{" + From + "}", To);
		});
	}

	if (Translation.substring(0, 3) === "MD:") {
		Translation = (
			<ReactMarkdown source={Translation.substr(3, Translation.length)} />
		);
	}

	return Translation;
}
