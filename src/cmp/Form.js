import React from "react";
import FormComponent from "../cmp/FormComponent";
import FieldSet from "./FieldSet";
import Message from "./Message";
import { Form_States, Form_Roles } from "../scr/Logic";
import { DB } from "../scr/DB";

import "../stl/Form.css";

class Form extends FormComponent {
	constructor(props) {
		super(props);

		this.state.Messages = {
			[Form_States.Ready]: this.Message("Form_Automatic", [
				this.Button("I_Understand", this.Understood)
			])
		};

		this.state.DB = new DB("http://localhost:5984/", true);
	}

	Understood = () => {
		this.Remove_Message(Form_States.Ready);
	};

	render() {
		let { Context } = this.props;
		const { Entity, Entity_Id } = Context;
		const { Messages, State, DB } = this.state;

		this.Log("Rendering form for " + Entity + ": " + Entity_Id);

		Context.DB = DB;

		return (
			<form className={State.toLowerCase()} onSubmit={e => e.preventDefault()}>
				<Message Messages={Messages} Context={Context} />
				<FieldSet
					Context={Context}
					Roles={[Form_Roles.Data_Binder, Form_Roles.Global_Read_Only_Reporter]}
				/>
				<Message Messages={Messages} Context={Context} />
			</form>
		);
	}
}

export default Form;
