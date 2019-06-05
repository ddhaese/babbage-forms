import WrapperComponent from "./WrapperComponent";
import { Form_States, Form_Roles, T, Message_Types } from "../scr/Logic";
import { Do_Nothing } from "../scr/Lib";

class FormComponent extends WrapperComponent {
	constructor(props) {
		super(props);

		const { Roles, Context, Data } = props;
		const { Global_Read_Only, Local_Read_Only } = Context;

		this.state = {
			Messages: {},
			Data: Data,
			State: Roles.includes(Form_Roles.Data_Binder)
				? Form_States.Sent
				: Global_Read_Only
				? Form_States.Global_Read_Only
				: Local_Read_Only
				? Form_States.Local_Read_Only
				: Form_States.Ready
		};

		if (
			Global_Read_Only &&
			Roles.includes(Form_Roles.Global_Read_Only_Reporter)
		) {
			this.state.Messages[Form_States.Global_Read_Only] = this.Message(
				"State_Global_Read_Only"
			);
		} else if (
			Local_Read_Only &&
			Roles.includes(Form_Roles.Local_Read_Only_Reporter)
		) {
			this.state.Messages[Form_States.Local_Read_Only] = this.Message(
				"State_Local_Read_Only"
			);
		}

		this.On_Change = this.On_Change.bind(this);
		this.On_Blur = this.On_Blur.bind(this);
		this.File_Size_Limit = 50000000;
		this.File_Name_Limit = 100;
	}

	Button = (iLabel, iCallBack) => {
		return { Label: iLabel, Callback: iCallBack };
	};

	Data_Propagate = (iThen = Do_Nothing) => {
		const { Context, Data_Pass, Roles } = this.props;
		const { Field_Id } = Context;
		const { Data } = this.state;

		if (!Roles.includes(Form_Roles.Data_Propagator)) {
			iThen();
			return;
		}

		this.Log("Data_Propagate");

		if (Data_Pass) Data_Pass(Field_Id, Data, iThen);
	};

	Data_Receive = (iChild_Id, iNew_Data, iThen = Do_Nothing) => {
		const { Data } = this.state;
		const { Roles } = this.props;

		this.Log(
			"Data_Receive: Receiving " + iNew_Data + " from child " + iChild_Id
		);

		// In case this component has a merger role, then the child data must but
		// combined with data from other children. Depending on the type of
		// the Field_Id the data is treated as an element of an array or an of an
		// object.
		let New_Data = null;
		if (Roles.includes(Form_Roles.Data_Merger)) {
			if (Number.isInteger(iChild_Id)) {
				New_Data = Data;
				New_Data[iChild_Id] = iNew_Data;
			} else {
				New_Data = { ...Data, ...{ [iChild_Id]: iNew_Data } };
			}
		} else {
			New_Data = iNew_Data;
		}

		this.setState({ Data: New_Data }, iThen);
	};

	Data_Submit = () => {
		const { Data } = this.state;
		const { Context, Roles } = this.props;
		const { DB, Entity, Entity_Id, Field_Id } = Context;

		if (!Roles.includes(Form_Roles.Data_Submitter)) return;

		this.Log("Data_Submit: Submitting " + Field_Id + " " + Data);

		this.setState({ State: Form_States.Sent });
		this.Set_Message(Form_States.Sent, "Data_Sent");

		DB.Put_Doc(
			Entity,
			Entity_Id,
			Field_Id,
			Data,
			this.On_Put_Doc,
			this.On_Put_Doc_Error
		);
	};

	Data_Validate = (iThen = Do_Nothing) => {
		const { Data } = this.state;
		const { Context, Roles } = this.props;

		if (!Roles.includes(Form_Roles.Data_Validator)) {
			iThen();
			return;
		}

		const { Field_Object } = Context;
		const Validate = Field_Object.Validation
			? this[Field_Object.Validation]
			: this.Data_Validate_Default;

		this.Log("Data_Validate: Sending " + Data + " for validation");

		Validate(iThen);
	};

	// Validation functions are expected to convert an JavaScript event object into
	// a object that either contains the data (upon success) or the attribute 'Error'
	// (upon failure) in which the error message is being stored.
	Data_Validate_Default = (iThen = Do_Nothing) => {
		if (!this.state.Event) return;
		const { Validity, Pattern, MaxLength, MinLength } = this.state.Event;
		let Errors = [];

		if (Validity.valid) {
			this.Remove_Message(Form_States.Error);
			iThen();
			return;
		}

		if (Validity.valueMissing) {
			Errors.push(T("Error_Missing"));
		} else if (Validity.patternMismatch) {
			Errors.push(T("Error_Pattern", null, { Pattern: Pattern }));
		} else if (Validity.tooLong) {
			Errors.push(T("Error_Too_Long", null, { Max: MaxLength }));
		} else if (Validity.tooShort) {
			Errors.push(T("Error_Too_Short", null, { Min: MinLength }));
		} else {
			Errors.push(T("Error_Value"));
		}

		const Errors_String = Errors.map(E => T(E)).join(" | ");

		if (Errors.length > 0) {
			this.Log("Data_Validate_Default: Errors where found: " + Errors_String);
			this.Set_Message(Form_States.Error, Errors_String);
		}

		this.setState({ Errors: Errors }, iThen);
	};

	Event_Propagate = (iThen = Do_Nothing) => {
		const { Roles, Event_Pass } = this.props;
		const { Event } = this.state;

		if (!Roles.includes(Form_Roles.Event_Propagator)) {
			iThen();
			return;
		}

		this.Log("Event_Propagate");

		if (Event_Pass) Event_Pass(Event, iThen);
	};

	Event_Receive = (iEvent, iThen = Do_Nothing) => {
		this.setState({ Event: iEvent }, iThen);
	};

	File_Propagate = (iThen = Do_Nothing) => {
		const { Context, File_Pass, Roles } = this.props;
		const { Field_Id } = Context;
		const { Files } = this.state;

		if (!Roles.includes(Form_Roles.File_Propagator)) {
			iThen();
			return;
		}

		this.Log("File_Propagate");

		if (File_Pass) {
			File_Pass(Field_Id, Files, iThen);
		}
	};

	File_Receive = (iChild_Id, iNew_Files, iThen = Do_Nothing) => {
		this.Log(
			"File_Receive: Receiving " +
				iNew_Files.length +
				" files from child " +
				iChild_Id
		);

		this.setState({ Files: iNew_Files }, iThen);
	};

	File_Submit = () => {
		const { Files } = this.state;
		const { Context, Roles } = this.props;

		if (!Roles.includes(Form_Roles.File_Submitter) || Files === {}) return;

		this.Log("File_Submit");

		const { DB, Entity, Entity_Id } = Context;

		this.setState({ State: Form_States.Sent });
		this.Set_Message(Form_States.Sent, "Data_Sent");

		DB.Put_Atts(
			Entity,
			Entity_Id,
			Files,
			this.On_Put_Att,
			this.On_Put_Att_Error
		);
	};

	File_Validate = (iThen = Do_Nothing) => {
		const { Data, Files } = this.state;
		let Errors = [];

		if (!Files || Object.keys(Files).length === 0) {
			iThen();
			return;
		}

		this.Log("File_Validate");

		Object.keys(Files).forEach(File_Name => {
			const File = Files[File_Name];
			if (File.data.size > this.File_Size_Limit) {
				Errors.push(T("File_Size_Exceeded"));
			}
		});

		if (Data.length > this.File_Name_Limit) {
			Errors.push(T("File_Name_Exceeded"));
		}

		if (Errors.length > 0) {
			this.Set_Message(Form_States.Error, Errors.map(E => T(E)).join(" | "));
		} else {
			this.Remove_Message(Form_States.Error);
		}

		this.setState({ Errors: Errors }, Errors.length > 0 ? Do_Nothing : iThen);
	};

	Handle_Parent = () => {
		const { Parent_Handler } = this.props;
		const { Roles } = this.props;

		// Should be handling parent stuff if nothing was propagated
		if (
			!Roles.includes(Form_Roles.Data_Propagator) &&
			!Roles.includes(Form_Roles.File_Propagator) &&
			!Roles.includes(Form_Roles.Error_Propagator)
		) {
			return;
		}

		if (Parent_Handler) {
			Parent_Handler();
		} else {
			this.Log("Handle_Parent: expecting Parent Handler!", Message_Types.Error);
		}
	};

	// Handles newly generated/received Data, Files, Errors and Events.
	Handler = (iWork_Flow = null) => {
		if (typeof iWork_Flow === "function") {
			iWork_Flow();
		} else if (Array.isArray(iWork_Flow)) {
			if (iWork_Flow.length === 0) return;

			let Next = iWork_Flow.shift();

			if (typeof Next === "function") {
				Next(() => {
					this.Handler(iWork_Flow);
				});
			} else {
				this.Handler(Next);
			}
		} else if (iWork_Flow != null) {
			Object.values(iWork_Flow).forEach(Work_Flow_Item => {
				this.Handler(Work_Flow_Item);
			});
		} else {
			const Default_Work_Flow = [
				this.Event_Propagate,
				{
					B1: {
						B1A: this.Data_Submit,
						B1B: [this.Data_Propagate, this.Handle_Parent],
						B1C: this.Data_Validate
					},
					B2: {
						B2A: [this.File_Propagate, this.Handle_Parent],
						B2B: [this.File_Validate, this.File_Submit]
					}
				}
			];

			this.Handler(Default_Work_Flow);
		}
	};

	Message = (iText, iButtons = null) => {
		const Text = typeof iText === "string" ? T(iText) : iText;

		return { Text: Text, Buttons: iButtons };
	};

	On_Blur = () => {
		const { State, Data } = this.state;
		const { Field_Id } = this.props.Context;

		if (State !== Form_States.Changed) return;

		this.Log("On_Blur: Field " + Field_Id + " changed to " + Data);

		const Work_Flow = [
			this.Event_Propagate,
			this.Data_Propagate,
			this.Handle_Parent
		];

		this.setState({ State: Form_States.Ready }, () => {
			this.Handler(Work_Flow);
		});
	};

	On_Change = iEvent => {
		const Event = this.Capture(iEvent);
		const Data = this.Data_Extract(Event);

		this.setState({ Event: Event, Data: Data, State: Form_States.Changed });
	};

	On_Get_Doc = iResponse => {
		const { Entity, Entity_Id } = this.props.Context;

		this.Remove_Message(Form_States.Sent);

		this.Log(
			"On_Get_Doc: " + Entity + " (" + Entity_Id + ") loaded successfully."
		);

		this.setState({ Data: iResponse, State: Form_States.Ready });
	};

	On_Get_Doc_Error = iResponse => {
		let Errors = [];

		this.Log("On_Get_Doc_Error: " + iResponse.error, Message_Types.Error);

		this.Set_Message(Form_States.Error, "Error_Server");
		Errors.push(iResponse.error);

		this.setState({ State: Form_States.Error, Errors: Errors });
	};

	On_New_Doc = iId => {
		const Work_Flow = [this.Data_Propagate, this.Handle_Parent];
		this.Remove_Message(Form_States.Sent);

		this.Log("On_New_Doc: " + iId);

		this.setState(
			{ Entity_Id: iId, Data: {}, State: Form_States.Ready },
			() => {
				this.Handler(Work_Flow);
			}
		);
	};

	On_New_Doc_Error = iResponse => {
		const Error = iResponse.error;

		this.Log("On_New_Doc_Error: " + Error, Message_Types.Error);

		this.Remove_Message(Form_States.Sent);

		this.setState({
			Error: Error,
			State: Form_States.Error
		});
	};

	On_Put_Att = iResponse => {
		this.Remove_Message(Form_States.Sent);

		this.Log("On_Put_Att: Successful.");

		this.setState({ State: Form_States.Ready });
	};

	On_Put_Att_Error = iResponse => {
		let { Errors } = this.state;
		Errors.push(iResponse.message);

		this.Log("On_Put_Att_Error: " + Error);

		this.Remove_Message(Form_States.Sent);
		Errors.forEach(Error => {
			this.Set_Message(Form_States.Error, Error);
		});

		this.setState({ State: Form_States.Ready });
	};

	On_Put_Doc = iResponse => {
		const { Roles } = this.props;
		const { Data } = this.state;

		const Then = Roles.includes(Form_Roles.Data_Propagator)
			? this.Data_Propagate
			: Do_Nothing;

		this.Log("On_Put_Doc: DB returned with data " + Data);

		this.setState({ State: Form_States.Ready, Data: Data }, Then);
		this.Remove_Message(Form_States.Sent);
	};

	On_Put_Doc_Error = iError => {
		const { Roles } = this.props;
		const Then =
			Roles === Form_Roles.Data_Propagator ? this.Data_Propagate : Do_Nothing;

		this.Log("On_Put_Doc_Error: DB returned with error: " + iError.error);

		this.setState({ State: Form_States.Error }, Then);
		this.Set_Message(
			Form_States.Error,
			T("Put_Doc_Error", null, { Error: iError.error })
		);
	};

	On_Put_File = iData => {
		if (iData.error) {
			this.Log("On_Put_File: DB returned with error: " + iData.error);
		} else {
			this.Log("On_Put_File: DB returned with data " + iData);
		}
	};

	Remove_Message = iState => {
		let { Messages } = this.state;

		delete Messages[iState];

		this.Log("Remove_Message: Removing message for state " + iState);

		this.setState({ Messages: Messages });
	};

	Set_Message = (iState, iText, iButtons = undefined) => {
		let { Messages } = this.state;

		Messages[iState] = this.Message(iText, iButtons);
		this.Log("Set_Message: Adding message '" + iText + "' for state " + iState);

		this.setState({ Messages: Messages });
	};
}

export default FormComponent;
