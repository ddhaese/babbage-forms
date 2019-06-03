import React, { Component } from "react";

import "../stl/ViewsItem.css";
import { T } from "../scr/Logic";

class ViewsItem extends Component {
	render() {
		const { Views_Item_Name, Views_Item_Object, Navigate } = this.props;

		return (
			<div className="views-item" onClick={Navigate(Views_Item_Object.View)}>
				{T(Views_Item_Name)}
			</div>
		);
	}
}

export default ViewsItem;
