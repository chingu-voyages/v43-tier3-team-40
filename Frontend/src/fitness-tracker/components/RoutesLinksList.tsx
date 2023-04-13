import { NavLink } from 'react-router-dom';
import { routesLinks } from '../routes';

export const RoutesLinksList = () => {
	return (
		<>
			{routesLinks.map(route => (
				<li key={route.label} className='text-lg lg:text-xl xl:text-2xl'>
					<NavLink
						className={({ isActive }) =>
							isActive ? 'text-LightIndigo font-medium underline underline-offset-4' : ' text-gray-600'
						}
						to={route.path}>
						{route.label}
					</NavLink>
				</li>
			))}
		</>
	);
};
