import React, { Component } from "react";
import RegisterCompany from "./RegisterCompany";
import "../stl/DetailPane.css";

class DetailPane extends Component {
	constructor(props) {
		super(props);

		let Detail_Components = {
			RegisterCompany
		};

		this.DetailComponent = Detail_Components[this.props.View];

		this.state = { Height: window.innerHeight };
		this.Set_Height = this.Set_Height.bind(this);
	}

	componentDidMount() {
		this.Set_Height();
		window.addEventListener("resize", this.Set_Height);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.Set_Height);
	}

	Set_Height() {
		this.setState({ Height: window.innerHeight });
	}

	render() {
		const { Context, Add_Action, Remove_Action } = this.props;

		return (
			<div id="detail-pane" style={{ height: window.innerHeight - 135 }}>
				<this.DetailComponent
					Context={Context}
					Add_Action={Add_Action}
					Remove_Action={Remove_Action}
				/>
			</div>
		);
	}
}

export default DetailPane;
