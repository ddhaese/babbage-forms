import React from "react";
import WrapperComponent from "./WrapperComponent";
import "../stl/Action.css";
import { T } from "../scr/Logic";

class Action extends WrapperComponent {
	render() {
		const { Action_Name, Action_Object } = this.props;

		this.Log("Adding action " + Action_Name);

		return (
			<li className="action">
				{Action_Object.Type === "a" ? (
					<a {...Action_Object.Attributes}>{T(Action_Name)}</a>
				) : (
					<button type="button" {...Action_Object.Attributes}>
						{T(Action_Name)}
					</button>
				)}
			</li>
		);
	}
}

export default Action;
