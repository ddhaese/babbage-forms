import React from "react";
import FormComponent from "../cmp/FormComponent";
import {Input_Types} from "../scr/Logic";

class Input extends FormComponent {
	constructor(props) {
		super(props);

		const { Field_Object } = props.Context;
		const Default_Length = 50;
		const Default_Type_Options = {
			type: Input_Types.Text,
			maxLength: Default_Length,
			size: Default_Length
		};
		const Type_Options = {
			...Default_Type_Options,
			...Field_Object.Attributes
		};

		this.state.Type_Options = Type_Options;

		this.Input_Ref = React.createRef();
		this.Focus = this.Focus.bind(this);
	}

	Capture = iEvent => {
		const { target } = iEvent;
		let Event = {
			Value: target.value,
			Type: target.type,
			Validity: target.validity
		};

		if (target.checked) Event.Checked = target.checked;
		if (target.maxLength) Event.MaxLength = target.maxLength;
		if (target.minLength) Event.MinLength = target.minLength;
		if (target.pattern) Event.Pattern = target.pattern;

		return Event;
	};

	componentDidMount() {
		const { Field_Id } = this.props.Context;

		if (Number.isInteger(Field_Id)) {
			this.Focus();
		}
	}

	Data_Extract = iEvent => {
		this.Log("Data_Extract");

		let Data_Value = null;

		switch (iEvent.Type) {
			case Input_Types.Checkbox:
				Data_Value = iEvent.Checked;
				break;

			default:
				Data_Value = iEvent.Value;
				break;
		}

		return Data_Value;
	};

	Focus() {
		if (this.Input_Ref && this.Input_Ref.focus) {
			this.Input_Ref.focus();
		}
	}

	render() {
		const { Context, Read_Only, required, title } = this.props;
		const { Type_Options, Data } = this.state;
		const { Field_Id } = Context;

		this.Log("render: " + Data);

		let Input_Component = null;

		Input_Component = (
			<input
				name={Field_Id}
				required={required}
				title={title}
				onChange={this.On_Change}
				onBlur={this.On_Blur}
				value={Data}
				disabled={Read_Only}
				ref={this.Input_Ref}
				{...Type_Options}
			/>
		);
		if (Type_Options.type === Input_Types.Range) {
			Input_Component = (
				<div>
					{Input_Component}
					<span className="range-display">{Data}</span>
				</div>
			);
		}

		return Input_Component;
	}
}

export default Input;
