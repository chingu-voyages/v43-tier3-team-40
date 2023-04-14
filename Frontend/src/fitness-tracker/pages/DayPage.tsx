import { useEffect, useState } from 'react';
import { dateHelpers } from '../../utils';
import { bodyBalanceApi } from '../../api';
import { IDayUserData } from '../../interfaces';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { doughnutChartData } from '../../utils/doughnutChartData';

ChartJS.register(ArcElement, Tooltip, Legend);

export const DayPage = () => {
	//Date hardcoded to bring some data from the test_backend
	const date = new Date(2023, 3, 5);
	const [weekDays, setWeekDays] = useState(dateHelpers.getWeekDays(date));
	const [userDayData, setUserDayData] = useState<IDayUserData | undefined>(undefined);
	useEffect(() => {
		const days = async () => {
			try {
				const { data } = await bodyBalanceApi.get<IDayUserData>(`/days/getFullDay/${date}`);
				setUserDayData(data);
			} catch (error) {
				console.log(error);
			}
		};
		days();
	}, []);

	return (
		<section className='p-5 space-y-5'>
			<div className='bg-DeepIndigo h-96 rounded-[33px] px-3 py-5 flex flex-col justify-evenly'>
				<h1 className='text-center capitalize text-white text-3xl'>{weekDays.month}</h1>
				<div className='flex w-full snap-x snap-mandatory scroll-px-10 gap-5 overflow-x-scroll scroll-smooth px-3'>
					{weekDays.days.map(day => {
						return (
							<div
								key={day.dayNumber}
								className='w-[50%] h-32 shrink-0 snap-start snap-always rounded-xl border sm:w-[44%] md:w-[30%]'>
								<div className='flex flex-col justify-center items-center space-y-3 h-full text-white capitalize'>
									<p>{day.dayName.substring(0, 3)}</p>
									<p className='font-bold text-xl'>{day.dayNumber}</p>
								</div>
							</div>
						);
					})}
				</div>
				<div className='bg-white w-full p-7 rounded-2xl'>
					{!userDayData ? (
						<span>Loading...</span>
					) : userDayData.day.activities.length === 0 ? (
						<span>No activities today</span>
					) : (
						<ul>
							{userDayData.day.activities.map(activity => (
								<li key={activity}>{activity}</li>
							))}
						</ul>
					)}
				</div>
			</div>
			<div className=' h-[384px] rounded-2xl bg-white flex flex-col justify-center relative'>
				<Doughnut
					data={{
						labels: ['Activity'],
						datasets: [
							{
								data: [100],
								backgroundColor: 'rgba(98, 0, 255, 1)',
							},
						],
					}}
				/>
			</div>
		</section>
	);
};
