import { Navigate, Route, Routes } from 'react-router-dom';
import { FitnessTrackerRoutes } from '../fitness-tracker/routes';
import { CheckingAuth } from '../auth/components';
import { AuthRoutes } from '../auth/routes';
import { useAuthContext } from '../hooks';

export const AppRoutes = () => {
	const { status } = useAuthContext();
	if (status === 'checking') {
		return <CheckingAuth />;
	}
	return (
		<Routes>
			{status === 'authenticated' ? (
				<Route path='/*' element={<FitnessTrackerRoutes />} />
			) : (
				<Route path='/auth/*' element={<AuthRoutes />} />
			)}
			<Route path='/*' element={<Navigate to='/auth/login' />} />
		</Routes>
	);
};
