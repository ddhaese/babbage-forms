import React from "react";
import FieldSet from "./FieldSet";
import Control from "./Control";
import FormComponent from "../cmp/FormComponent";
import ControlCollection from "./ControlCollection";
import Message from "./Message";
import { T, Form_Roles } from "../scr/Logic";
import Dat from "../dat/dat";

class Field extends FormComponent {
	render() {
		const { Context, Data } = this.props;
		const { Field_Object, Field_Id } = Context;
		const { Messages } = this.state;
		const Label = T("Field_" + Field_Id);
		const Description = T("Field_" + Field_Id + "_Desc", T("Enter_Value"));
		const Cardinality = Field_Object.Cardinality || [1, 1];
		const Is_Required = Field_Object.Optional ? false : true;

		let Sub_Component = null;

		this.Log("Rendering " + Field_Id + " with " + Data);

		// If it concerns a collection of controls
		if (Cardinality[1] > 1) {
			Sub_Component = (
				<ControlCollection
					Context={Context}
					Data={Data}
					Data_Pass={this.Data_Receive}
					Parent_Handler={this.Handler}
					Roles={[
						Form_Roles.Data_Merger,
						Form_Roles.Error_Reporter,
						Form_Roles.Data_Submitter,
						Form_Roles.Data_Propagator
					]}
				/>
			);

			// If it concerns a foreign key to another type of entity
		} else if (Object.keys(Dat.Data_Model).includes(Field_Object.Type)) {
			Context.Entity = Field_Id;
			Context.Entity_Id = Data;

			Sub_Component = (
				<FieldSet
					Context={Context}
					Data={Data}
					Data_Pass={this.Data_Receive}
					Parent_Handler={this.Handler}
					Label={Field_Object.Label}
					Roles={[Form_Roles.Data_Binder, Form_Roles.Data_Propagator]}
				/>
			);
		} else {
			let Roles = [
				Form_Roles.Data_Submitter,
				Form_Roles.Error_Reporter,
				Form_Roles.Data_Validator
			];

			if (Field_Object.Type === "File") {
				Roles.push(Form_Roles.File_Submitter);
			}
			Sub_Component = (
				<Control
					Context={Context}
					Data={Data}
					title={Description}
					Roles={Roles}
				/>
			);
		}

		return (
			<div className={Is_Required ? "field required" : "field"}>
				<label htmlFor={Field_Id} title={Description}>
					{Label}
				</label>
				<br />
				{Sub_Component}
				<Message Messages={Messages} Context={Context} />
			</div>
		);
	}
}

export default Field;
