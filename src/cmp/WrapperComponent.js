import { Component } from "react";
import { Message_Types } from "../scr/Logic";

class WrapperComponent extends Component {
	Log = (iMessage, iType = Message_Types.Info) => {
		const { Verbose } = this.props.Context;
		const Message = this.constructor.name + ": " + iMessage;

		if (Verbose && iType === Message_Types.Info) {
			console.log(Message);
		} else if (Verbose && iType === Message_Types.Error) {
			console.error(Message);
		} else if (Verbose && iType === Message_Types.Warning) {
			console.warn(Message);
		} else {
			console.log("Verbose: " + Verbose);
		}
	};
}

export default WrapperComponent;
