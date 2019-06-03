import React, { Component } from "react";
import "../stl/IconButton.css";
import { T } from "../scr/Logic";

class IconButton extends Component {
	render() {
		const { Callback, Read_Only } = this.props;
		let { Image, Title } = this.props;

		Title = typeof Title === "string" ? T(Title) : Title;

		return (
			<button
				className={"icon-button " + Image.toLowerCase()}
				onClick={Callback}
				title={Title}
				disabled={Read_Only || false}
			/>
		);
	}
}

export default IconButton;
