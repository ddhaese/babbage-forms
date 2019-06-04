import React from "react";
import Control from "./Control";
import IconButton from "./IconButton";
import FormComponent from "../cmp/FormComponent";
import Message from "./Message";
import { cloneDeep } from "lodash/lang";
import { Field_Types, Images, T } from "../scr/Logic";

import { Form_States, Form_Roles } from "../scr/Logic";
import { Do_Nothing } from "../scr/Lib";

class ControlCollection extends FormComponent {
	constructor(props) {
		super(props);

		if (typeof this.state.Data === "undefined") {
			this.state.Data = [];
		}
	}

	Remove_Control = iIndex => {
		let { Data } = this.state;

		Data.splice(iIndex, 1);

		const Work_Flow = {
			B1A: this.Data_Submit,
			B1B: [this.Data_Propagate, this.Handle_Parent],
			B1C: this.Data_Validate_Cardinality
		};

		this.setState({ Data: Data, State: Form_States.Changed }, () => {
			this.Handler(Work_Flow);
		});
	};

	Data_Validate_Cardinality = (iThen = Do_Nothing) => {
		const { Data } = this.state;
		const { Field_Object } = this.props.Context;

		if (Data.length > Field_Object.Cardinality[1]) {
			let Error_Message = T("Exceeding_Cardinality", null, {
				Max: Field_Object.Cardinality[1]
			});
			this.Set_Message(Form_States.Error, Error_Message);
		} else if (Data.length < Field_Object.Cardinality[0]) {
			let Error_Message = T("Below_Cardinality", null, {
				Min: Field_Object.Cardinality[0]
			});
			this.Set_Message(Form_States.Error, Error_Message);
		} else {
			this.Remove_Message(Form_States.Error);
		}
	};

	Add_Control = () => {
		let { Data } = this.state;

		Data.push("");

		const Work_Flow = {
			B1A: this.Data_Submit,
			B1B: [this.Data_Propagate, this.Handle_Parent],
			B1C: this.Data_Validate_Cardinality
		};

		this.setState({ Data: Data, State: Form_States.Changed }, () => {
			this.Handler(Work_Flow);
		});
	};

	render() {
		const { Context } = this.props;
		const { Messages, State, Data } = this.state;
		const { Field_Object, Field_Id } = Context;
		const Actions_Disabled = [
			Form_States.Read_Only,
			Form_States.Error
		].includes(State);
		const Singular = Field_Object.Singular;

		this.Log("render: " + Field_Id + " with " + Data);

		const Control_Array = Data.map((Data_Element, Index) => {
			let Field_Context = cloneDeep(Context);
			let Roles = [
				Form_Roles.Data_Propagator,
				Form_Roles.Error_Reporter,
				Form_Roles.Data_Validator
			];

			if (Field_Object.Type === Field_Types.File) {
				Roles.push([Form_Roles.File_Submitter]);
			}

			Field_Context.Field_Id = Index;

			return (
				<div key={Index}>
					<div className="collection-control">
						<Control
							Context={Field_Context}
							Data={Data_Element}
							Data_Pass={this.Data_Receive}
							Parent_Handler={this.Handler}
							Roles={Roles}
						/>
						<IconButton
							Image={Images.Remove}
							Callback={() => {
								this.Remove_Control(Index);
							}}
							Title="Button_Remove_Control"
							Read_Only={Actions_Disabled}
						/>
					</div>
				</div>
			);
		});

		return (
			<div className={"control-collection " + State.toLowerCase()}>
				{Control_Array}
				<IconButton
					Image={Images.Plus}
					Callback={this.Add_Control}
					Title={T("Button_Add_Control", null, {
						Item: T(Singular).toLowerCase()
					})}
					Read_Only={Actions_Disabled}
				/>

				<Message Messages={Messages} Context={Context} />
			</div>
		);
	}
}

export default ControlCollection;
