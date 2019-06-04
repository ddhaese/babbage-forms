import React from "react";
import WrapperComponent from "./WrapperComponent";
import Form from "./Form";
import Cfg from "../dat/cfg";
import { Form_Roles, Input_Types, T } from "../scr/Logic";
import "../stl/RegisterCompany.css";

class RegisterCompany extends WrapperComponent {
	constructor(props) {
		super(props);

		const { Add_Action } = props;

		Add_Action("Stage_Event", {
			Type: Input_Types.A,
			Attributes: { href: Cfg.Links.Stage_Event_Link }
		});
	}

	render() {
		const { Context } = this.props;
		const { Acad_Year } = Context;
		const Acad_Year_Str = Acad_Year + "-" + (Acad_Year + 1);

		this.Log("Rendering");

		// For testing purposes
		Context.Entity = "Company";
		Context.Entity_Id = "3d26f3e57840d9f0614c8caa24006c8b";
		Context.Global_Read_Only = false;

		return (
			<div id="register-company">
				<div id="register-company-intro" className="long-text">
					{T("Register_Company_Intro", null, {
						Acad_Year: Acad_Year_Str
					})}
				</div>
				<Form
					Context={this.props.Context}
					Roles={[Form_Roles.Global_Read_Only_Reporter]}
				/>
			</div>
		);
	}
}

export default RegisterCompany;
