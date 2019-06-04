import React from "react";
import FormComponent from "../cmp/FormComponent";
import TextArea from "./TextArea";
import Select from "./Select";
import Input from "./Input";
import InputFile from "./InputFile";
import FieldSet from "./FieldSet";
import Message from "./Message";
import Dat from "../dat/dat";
import { Field_Types, Form_Roles } from "../scr/Logic";

class Control extends FormComponent {
	constructor(props) {
		super(props);

		const { Field_Object } = props.Context;
		let Control_Components = {
			Text: TextArea,
			Input: Input,
			File: InputFile,
			Select: Select
		};

		this.Control_Component = Control_Components[Field_Object.Type];
	}

	render() {
		const { Context, title } = this.props;
		const { Field_Object, Field_Id } = Context;
		const { Messages, Data } = this.state;

		const In_Collection = Number.isInteger(Field_Id);

		this.Log(
			"render: " +
				Field_Id +
				(In_Collection ? "th " + Field_Object.Singular : "")
		);

		if (Object.keys(Dat.Data_Model).includes(Field_Object.Type)) {
			Context.Entity = In_Collection ? Field_Object.Type : Field_Id;
			Context.Entity_Id = Data;

			return (
				<FieldSet
					Context={Context}
					Data={Data}
					Data_Pass={this.Data_Receive}
					Parent_Handler={this.Handler}
					Label={Field_Object.Label}
					Roles={[Form_Roles.Data_Binder, Form_Roles.Data_Propagator]}
				/>
			);
		}

		if (!this.Control_Component) return null;

		const Is_Required = Field_Object.Optional ? false : true;
		let Roles = [
			Form_Roles.Data_Generator,
			Form_Roles.Data_Propagator,
			Form_Roles.Event_Propagator
		];

		if (Field_Object.Type === Field_Types.File) {
			Roles.push(Form_Roles.File_Propagator);
		}

		return (
			<div>
				<this.Control_Component
					Context={Context}
					Data={Data}
					required={Is_Required}
					title={title}
					Event_Pass={this.Event_Receive}
					Data_Pass={this.Data_Receive}
					File_Pass={this.File_Receive}
					Parent_Handler={this.Handler}
					Roles={Roles}
				/>
				<Message Messages={Messages} Context={Context} />
			</div>
		);
	}
}

export default Control;
