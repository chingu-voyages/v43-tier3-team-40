import { Card, Title, DonutChart, LineChart } from '@tremor/react';

export const DayPage = () => {
	const mealData = [
		{ name: 'protein', calories: 20 },
		{ name: 'carbs', calories: 50 },
		{ name: 'fat', calories: 30 },
	];

	const activitiesData = [
		{
			name: 'Running',
			intensity: 7,
		},
		{
			name: 'Gym',
			intensity: 15,
		},
		{
			name: 'Hiking',
			intensity: 8,
		},
	];
	const activitiesOverTimeData = [
		{ day: new Date().getDay(), activity: 7 },
		{ day: new Date().getDay() + 1, activity: 15 },
		{ day: new Date().getDay() + 2, activity: 8 },
		{ day: new Date().getDay() + 3, activity: 20 },
	];

	const valueFormatter = (number: number) => `${Intl.NumberFormat('us').format(number).toString()}%`;
	const dataFormatter = (number: number) => `${Intl.NumberFormat('us').format(number).toString()}%`;
	return (
		<div className='space-y-5 p-3'>
			<Card className='w-[375px] mx-auto bg-white/50'>
				<Title>Meal Info</Title>
				<DonutChart
					className='mt-6'
					data={mealData}
					category='calories'
					index='name'
					valueFormatter={valueFormatter}
					colors={['slate', 'violet', 'indigo']}
				/>
			</Card>
			<Card className='w-[375px] mx-auto bg-white/50'>
				<Title>Activity Info</Title>
				<DonutChart
					className='mt-6'
					data={activitiesData}
					category='intensity'
					index='name'
					// valueFormatter={valueFormatter}
					colors={['slate', 'violet', 'indigo']}
				/>
			</Card>
			<Card className='w-1/2 mx-auto bg-white'>
				<Title>Graph of activities over time</Title>
				<LineChart
					className='mt-6'
					data={activitiesOverTimeData}
					index='day'
					categories={['activity']}
					colors={['blue']}
					// valueFormatter={dataFormatter}
					yAxisWidth={40}
				/>
			</Card>
		</div>
	);
};
