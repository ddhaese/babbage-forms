import React from "react";
import WrapperComponent from "./WrapperComponent";

import { T, Input_Types } from "../scr/Logic";
import "../stl/Message.css";

class Message extends WrapperComponent {
	constructor(props) {
		super(props);
		this.State_To_Type = {
			Error: "error",
			Ready: "info",
			Changed: "warning",
			Sent: "warning",
			Read_Only: "read-only"
		};
	}

	render() {
		const { Messages } = this.props;

		if (!Messages) return null;
		if (Object.entries(Messages).length === 0) return null;

		const Messages_JSX = Object.entries(Messages).map(([State, Message]) => (
			<div key={State} className={"message " + this.State_To_Type[State]}>
				<span>{Message.Text}</span>
				{Message.Buttons
					? Message.Buttons.map(Button => (
							<button
								type={Input_Types.Button}
								key={Button.Label}
								onClick={Button.Callback}
							>
								{T(Button.Label)}
							</button>
					  ))
					: null}
			</div>
		));

		return Messages_JSX;
	}
}

export default Message;
