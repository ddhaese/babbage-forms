import React from "react";
import FormComponent from "./FormComponent";

class TextArea extends FormComponent {
	Capture = iEvent => {
		const { target } = iEvent;
		const Event = {
			Value: target.value,
			Type: target.type,
			MaxLength: target.maxLength,
			MinLength: target.minLength,
			Validity: target.validity
		};

		return Event;
	};

	Data_Extract = iEvent => {
		this.Log("Data_Extract");

		let Data_Value = iEvent.Value;

		return Data_Value;
	};

	render() {
		const { title, required, Read_Only, Context } = this.props;
		const { Field_Id, Field_Object } = Context;
		const { Data } = this.state;

		return (
			<textarea
				{...Field_Object.Attributes}
				name={Field_Id}
				title={title}
				required={required}
				onChange={this.On_Change}
				onBlur={this.On_Blur}
				disabled={Read_Only}
				value={Data}
			/>
		);
	}
}

export default TextArea;
