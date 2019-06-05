import React from "react";
import Control from "./Control";
import FormComponent from "../cmp/FormComponent";
import ControlCollection from "./ControlCollection";
import Message from "./Message";
import { Field_Types, Form_Roles, T } from "../scr/Logic";

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

		this.Log("render: " + Field_Id + " with " + Data);

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

		} else {
			let Roles = [
				Form_Roles.Data_Submitter,
				Form_Roles.Error_Reporter,
				Form_Roles.Data_Validator
			];

			if (Field_Object.Type === Field_Types.File) {
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
