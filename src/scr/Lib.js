
export function Filter(iCollection, iFilter) {
	return Object.fromEntries(Object.entries(iCollection).filter(iFilter));
}

export function Array_Equals(iArray1, iArray2) {
	if (!iArray2) return false;

	if (iArray1.length !== iArray2.length) return false;

	for (var i = 0, l = iArray1.length; i < l; i++) {
		if (iArray1[i] instanceof Array && iArray2[i] instanceof Array) {
			if (!iArray1[i].equals(iArray2[i])) return false;
		} else if (iArray1[i] !== iArray2[i]) {
			return false;
		}
	}
	return true;
}

export function Stamp_To_String(iTime_Stamp) {
	var Date_Time_String = new Date(iTime_Stamp * 1000);
	return Date_Time_String.toJSON();
}

export function Guid() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
		iChar
	) {
		let Random = (Math.random() * 16) | 0;
		let Value = iChar === "x" ? Random : Random & 0x3 || 0x8;
		return Value.toString(16);
	});
}

export function Do_Nothing (){}
