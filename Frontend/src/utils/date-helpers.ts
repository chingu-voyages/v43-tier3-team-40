interface WeekDay {
	dayName: string;
	dayNumber: number;
}

interface WeekDaysWithMonth {
	month: string;
	days: WeekDay[];
}

 //? This function retrieves the weekdays of a week based on a given date.
export const getWeekDays = (date: Date): WeekDaysWithMonth => {
	const days = [];

	for (let i = 0; i < 7; i++) {
		const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + i - date.getDay());
		const dayName = newDate.toLocaleString('default', { weekday: 'long' });
		const dayNumber = newDate.getDate();
		days.push({ dayName, dayNumber });
	}

	const weekDays = {
		month: date.toLocaleString('default', { month: 'long' }),
		days,
	};

	return weekDays;
};
