import React from "react";
import Field from "./Field";
import FormComponent from "../cmp/FormComponent";
import Message from "../cmp/Message";
import { T } from "../scr/Logic";
import { cloneDeep } from "lodash/lang";
import { Form_States, Access_Levels, Form_Roles } from "../scr/Logic";

import Dat from "../dat/dat";
import { Do_Nothing } from "../scr/Lib";

class FieldSet extends FormComponent {
	constructor(props) {
		super(props);

		const { DB, Entity_Id, Entity, User_Role } = props.Context;

		// All entities have GUIDs as unique identifiers (Entity_Id). The role
		// index (Role_Index) serves to look up the access rights for each entity
		// (see Dat.json and look for Access fields for more details).
		this.state = {
			...this.state,
			...{ Role_Index: Dat.Form_Roles.indexOf(User_Role) }
		};

		// If an Entity_Id is being provided, then load the data from the db
		// and wait for the db to return before starting to render. If not, then
		// a new entity must be created and the CouchDB's GUID generation engine
		// is relied upon to return a new entity id.
		if (Entity_Id) {
			this.Log("CTOR: Exec Get_Doc" + Entity + " (" + Entity_Id + ")");
			DB.Get_Doc(Entity, Entity_Id, this.On_Get_Doc, this.On_Get_Doc_Error);
		} else {
			this.Log("CTOR: Exec New_Doc");
			DB.New_Doc(Entity, this.On_New_Doc, this.On_New_Doc_Error);
		}
	}

	Data_Propagate = (iThen = Do_Nothing) => {
		const { Context, Data_Pass, Roles } = this.props;
		const { Field_Id } = Context;
		const { Entity_Id } = this.state;

		if (!Roles.includes(Form_Roles.Data_Propagator)) {
			iThen();
			return;
		}

		this.Log("Data_Propagate");

		if (Data_Pass) Data_Pass(Field_Id, Entity_Id, iThen);
	};

	render() {
		const { Role_Index, Data, State, Messages } = this.state;
		const { Label } = this.props;
		let { Context } = this.props;
		const { Entity, Global_Read_Only } = Context;

		if (State === Form_States.Sent) return null;

		Context.Entity = Entity;
		Context.Entity_Id = this.state.Entity_Id || Context.Entity_Id;

		this.Log("render: " + Entity + "(" + Context.Entity_Id + ")");

		// Using the single-point of truth data model as a template, create
		//  recursively the necessary components. Each entity definition is being
		//  represented by the Field_Object variable. This object contains all the
		//  needed information to render the corresponding control as well as
		//  determining its behavior. This object is being carried downstream all
		//  the way.
		const Fields = Object.entries(Dat.Data_Model[Entity]).map(
			([Field_Id, Field_Object]) => {
				// Only show fields for which the current user has access rights
				let Access = Field_Object.Access
					? Field_Object.Access[Role_Index]
					: Access_Levels.Read_Write;

				if (Access === Access_Levels.No_Access) return null;

				let Field_Context = cloneDeep(Context);

				Field_Context.Field_Id = Field_Id;
				Field_Context.Field_Object = Field_Object;
				Field_Context.Local_Read_Only = Access === Access_Levels.Read_Only;

				return (
					<Field
						key={Field_Id}
						Data={Data[Field_Id]}
						Context={Field_Context}
						Roles={[Form_Roles.Local_Read_Only_Reporter]}
					/>
				);
			}
		);

		return (
			<fieldset disabled={Global_Read_Only} className={State.toLowerCase()}>
				<legend>{T(Label || Entity)}</legend>
				{Fields}
				<Message Messages={Messages} Context={Context} />
			</fieldset>
		);
	}
}

export default FieldSet;
