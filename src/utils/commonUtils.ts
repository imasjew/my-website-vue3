import { ElNotification } from "element-plus";

export const formatDate = (value: number) => {
	const minutes = Math.floor((value % (60 * 60)) / 60);
	let formedMinutes: string;
	if (minutes < 10) {
		formedMinutes = "0" + minutes;
	} else {
		formedMinutes = minutes.toString();
	}
	const seconds = Math.round(value % 60);
	let formedSeconds: string;
	if (seconds < 10) {
		formedSeconds = "0" + seconds;
	} else {
		formedSeconds = seconds.toString();
	}
	return formedMinutes + ":" + formedSeconds;
}

export const showSuccess = (title: string, msg: string = "") => {
	ElNotification({
		title: title,
		message: msg,
		type: "success",
	});
};

export const showReject = (title: string, msg: string = "") => {
	ElNotification({
		title: title,
		message: msg,
		type: "error",
	});
};