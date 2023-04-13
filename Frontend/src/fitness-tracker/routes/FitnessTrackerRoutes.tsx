import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage, DayPage, SettingsPage } from '../pages/';
import { Layout } from '../components';
export const FitnessTrackerRoutes = () => {
	return (
		<Routes>
			<Route path='/' element={<Layout />}>
				<Route index element={<DashboardPage />} />
				<Route path='/day' element={<DayPage />} />
				<Route path='/settings' element={<SettingsPage />} />
				<Route path='*' element={<Navigate to={'/'} replace />} />
			</Route>
		</Routes>
	);
};
