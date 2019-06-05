import React from "react";
import FormComponent from "../cmp/FormComponent";
import { Input_Types, T } from "../scr/Logic";

class WeekSpan extends FormComponent {
	constructor(props) {
		super(props);

		const { Field_Object } = props.Context;

		this.state.Attributes = Field_Object.Attributes || {
			multiple: false
		};

		if (typeof this.state.Data === "undefined") {
			this.state.Data = this.state.Attributes.multiple ? [] : "";
		}
	}

	Capture = iEvent => {
		const { target } = iEvent;
		let Event = {
			Type: target.type,
			Selected: [],
			Validity: target.validity
		};

		for (let Index = 0; Index < target.options.length; Index++) {
			const Element = target.options[Index];

			if (Element.selected) {
				Event.Selected.push(Element.value);
			}
		}

		return Event;
	};

	Data_Extract = iEvent => {
		this.Log("Data_Extract");

		let Data_Value = null;

		switch (iEvent.Type) {
			case Input_Types.Select_Multiple:
				Data_Value = iEvent.Selected;
				break;

			default:
				Data_Value = iEvent.Value;
				break;
		}

		return Data_Value;
	};

	render() {
		const { title, required, Read_Only, Context } = this.props;
		const { Field_Id, Field_Object } = Context;
		const { Attributes, Data } = this.state;

		this.Log("Rendering " + Data);

		return (
			<select
				title={title}
				name={Field_Id}
				required={required}
				onBlur={this.On_Blur}
				onChange={this.On_Change}
				disabled={Read_Only}
				value={Data}
				size={Field_Object.List.length}
				{...Attributes}
			>
				{Field_Object.List.map(Elem => (
					<option key={Elem} value={Elem}>
						{T(Elem)}
					</option>
				))}
			</select>
		);
	}
}

export default WeekSpan;
