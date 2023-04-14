export interface IUser {
	username: string;
	email: string;

	// Missing properties...
}
export interface IDayUserData {
	day: Day;
}
export interface Day {
	activities: string[];
	meals: string[];
	sleeps: string[];
	day: {
		id: number;
		date: string;
		user_id: string;
	};
}
