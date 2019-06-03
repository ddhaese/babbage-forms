import { Component } from "react";
import { Message_Types } from "../scr/Logic";

class WrapperComponent extends Component {
	Log = (iMessage, iType = Message_Types.Info) => {
		const { Verbose } = this.props.Context;
		const Message = this.constructor.name + ": " + iMessage;

		if (!Verbose) return;

		switch (iType) {
			case Message_Types.Info:
				console.log(Message);
				break;

			case Message_Types.Error:
				console.error(Message);
				break;

			case Message_Types.Warning:
				console.warn(Message);
				break;

			default:
				break;
		}
	};
}

export default WrapperComponent;
