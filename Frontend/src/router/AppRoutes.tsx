import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthRoutes } from '../auth/routes';
import { FitnessTrackerRoutes } from '../fitness-tracker/routes';

export const AppRoutes = () => {
	return (
		<Routes>
			<Route path='/auth/*' element={<AuthRoutes />} />
			<Route path='/*' element={<FitnessTrackerRoutes />} />


			//TODO: Implement this route when login is already set up
			{/* <Route path='/*' element={<Navigate to='/auth/login'/>} /> */}
		</Routes>
	);
};
