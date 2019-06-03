import React from "react";
import FormComponent from "./FormComponent";
import IconButton from "./IconButton";
import { Form_States } from "../scr/Logic";

class InputFile extends FormComponent {
	constructor(props) {
		super(props);

		const { Field_Object } = props.Context;

		const Default_Type_Options = { type: "file" };
		const Type_Options = {
			...Default_Type_Options,
			...Field_Object.Attributes
		};

		this.state.Type_Options = Type_Options;

		this.Input_Ref = React.createRef();
		this.Focus = this.Focus.bind(this);
	}

	componentDidMount() {
		this.Focus();
	}

	Focus() {
		if (this.Input_Ref && this.Input_Ref.focus) {
			this.Input_Ref.focus();
		}
	}

	On_Blur = () => {};

	// The input of type "file" behaves differently then others and needs special
	// treatment. Upon selecting one or more files, the control triggers an
	// onChange event instead of an onBlur event. Hence, a submit upon changing is
	// required here.

	On_Add_File = iEvent => {
		this.Log("On_Add_File");

		const { target } = iEvent;
		const File = target.files[0];

		const Work_Flow = [
			this.Data_Propagate,
			this.File_Propagate,
			this.Handle_Parent
		];

		this.setState(
			{
				Files: {
					[File.name]: {
						content_type: File.type,
						data: File
					}
				},
				Data: File.name,
				State: Form_States.Changed
			},
			() => {
				this.Handler(Work_Flow);
			}
		);
	};

	On_Remove_File = () => {
		this.Log("On_Remove_File");

		const Work_Flow = [
			this.Data_Propagate,
			this.File_Propagate,
			this.Handle_Parent
		];

		this.setState({ Data: "", Files: {}, State: Form_States.Changed }, () => {
			this.Handler(Work_Flow);
		});
	};

	render() {
		const { Context, Read_Only, required, title } = this.props;
		const { Type_Options, Data } = this.state;
		const { Field_Id } = Context;

		this.Log("Rendering " + Data);

		let Input_Component = null;

		if (Data) {
			Input_Component = (
				<div>
					<span className="file-input">{Data}</span>
					<IconButton
						Image="Remove"
						Callback={this.On_Remove_File}
						Title="Remove"
						Read_Only={Read_Only}
					/>
				</div>
			);
		} else {
			Input_Component = (
				<input
					name={Field_Id}
					required={required}
					title={title}
					onChange={this.On_Add_File}
					value={Data}
					disabled={Read_Only}
					ref={this.Input_Ref}
					{...Type_Options}
				/>
			);
		}

		return Input_Component;
	}
}

export default InputFile;
