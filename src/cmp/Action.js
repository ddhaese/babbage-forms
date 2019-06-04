import React from "react";
import WrapperComponent from "./WrapperComponent";
import "../stl/Action.css";
import { Input_Types, T } from "../scr/Logic";

class Action extends WrapperComponent {
	render() {
		const { Action_Name, Action_Object } = this.props;

		this.Log("render: " + Action_Name);

		return (
			<li className="action">
				{Action_Object.Type === Input_Types.A ? (
					<a {...Action_Object.Attributes}>{T(Action_Name)}</a>
				) : (
					<button type={Input_Types.Button} {...Action_Object.Attributes}>
						{T(Action_Name)}
					</button>
				)}
			</li>
		);
	}
}

export default Action;
