import React from "react";
import WrapperComponent from "./WrapperComponent"
import Action from "./Action";
import FilterPane from "./FilterPane";
import ListPane from "./ListPane";
import DetailPane from "./DetailPane";
import ViewsItem from "./ViewsItem";
import Logo from "../img/Logo.png";
import Title_End from "../img/Titel_End.png";
import Action_Start from "../img/Action_Start.png";
import Dat from "../dat/dat";
import { Filter, Array_Equals } from "../scr/Lib.js";
import { T, Go_To_View, Toggle_Language } from "../scr/Logic";
import "../stl/App.css";

class App extends WrapperComponent {
	constructor(props) {
		super(props);

		const { Language } = this.props.Context;

		this.state = {
			Actions: null,
			Views: null,
			SelectedView: null,
			PanesVis: null,
			Language: Language,
			Profile_Enabled: false
		};

		this.state.Actions = {};
		this.state.Views = Dat.Views[props.Context.User_Role];
		this.state.SelectedView = Object.values(
			Filter(this.state.Views, ([k, v]) => v.Default)
		)[0].View;
		this.state.PanesVis = Dat.Panes_Visibility[this.state.SelectedView];
	}

	Add_Action = (iName, iAction, iCallBack) => {
		let { Actions } = this.state;
		Actions[iName] = iAction;
		this.setState({ Actions: Actions }, iCallBack);
	};

	Remove_Action = iName => {
		let { Actions } = this.state;
		delete Actions[iName];
		this.setState({ Actions: Actions });
	};

	Toggle_Language_App = () => {
		this.setState({ Language: Toggle_Language() });
	};

	render() {
		let AppBodyStyle = {};
		const { Language, Profile_Enabled } = this.state;

		this.Log ("Starting application.")

		if (Array_Equals(this.state.PanesVis, [true, true, false])) {
			AppBodyStyle = { gridTemplateColumns: "15% 40% 45%" };
		} else if (Array_Equals(this.state.PanesVis, [false, true, true])) {
			AppBodyStyle = { gridTemplateColumns: "15% 40% 45%" };
		} else if (Array_Equals(this.state.PanesVis, [false, false, true])) {
			AppBodyStyle = { gridTemplateColumns: "30% 70%" };
		}

		return (
			<div id="app">
				<ul id="app-top-header">
					<li className="spacer" />
					<li id="profile">
						<button type="button" disabled={!Profile_Enabled}>
							{T("Profile")}
						</button>
					</li>
					<li id="lang" className="action">
						<button type="button" onClick={this.Toggle_Language_App}>
							{Language.toUpperCase()}
						</button>
					</li>
				</ul>
				<ul id="app-header">
					<li id="logo">
						<a href="https://www.ap.be/">
							<img src={Logo} alt={T("Logo_Alt")} />
						</a>
					</li>
					<li id="title">
						<a href="https://www.ap.be/">{T("Stage_Tool")}</a>
					</li>
					<li>
						<a href=".">
							<img src={Title_End} alt="" />
						</a>
					</li>
					<li className="spacer" />
					<li>
						<a href=".">
							<img src={Action_Start} alt="" />
						</a>
					</li>

					{Object.entries(this.state.Actions).map(([k, v]) => (
						<Action
							key={k}
							Action_Name={k}
							Action_Object={v}
							Context={this.props.Context}
						/>
					))}
				</ul>

				<div id="app-body" style={AppBodyStyle}>
					<div id="views">
						{Object.entries(this.state.Views).map(([k, v]) => (
							<ViewsItem
								key={k}
								Views_Item_Name={k}
								Views_Item_Object={v}
								Navigate={Go_To_View}
								Context={this.props.Context}
							/>
						))}
					</div>
					{this.state.PanesVis[0] ? (
						<FilterPane
							View={this.state.SelectedView}
							Context={this.props.Context}
							Add_Action={this.Add_Action}
							Remove_Action={this.Remove_Action}
						/>
					) : null}
					{this.state.PanesVis[1] ? (
						<ListPane
							View={this.state.SelectedView}
							Context={this.props.Context}
							Add_Action={this.Add_Action}
							Remove_Action={this.Remove_Action}
						/>
					) : null}
					{this.state.PanesVis[2] ? (
						<DetailPane
							View={this.state.SelectedView}
							Context={this.props.Context}
							Add_Action={this.Add_Action}
							Remove_Action={this.Remove_Action}
						/>
					) : null}
				</div>
			</div>
		);
	}
}

export default App;
