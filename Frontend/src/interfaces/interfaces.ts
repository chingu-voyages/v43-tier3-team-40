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

export interface MockMeal {
	id: number;
	day_id: number;
	user_id: number;
	calories: number;
	carbs: number;
	protein: number;
	fat: number;
	restrictions: string[];
	time: Date;
}

export interface MockSleep {
	sleep_id: number;
	day_id: number;
	user_id: number;
	start_time: Date;
	end_time: Date;
	success_rating: number;
}

export interface MockActivity {
	activity_id: number;
	day_id: number;
	user_id: number;
	category: string;
	start_time: Date;
	end_time: Date;
	intensity: number;
	success_rating: number;
}
export interface DayMockData {
	day_id: number;
	user_id: number;
	activities: MockActivity[];
	sleeps: MockSleep[];
	meals: MockMeal[];
}
