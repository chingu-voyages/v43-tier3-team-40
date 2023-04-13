import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HamburgerButton, LogoutButton, MobileMenu, RoutesLinksList } from './';

export const Layout = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	return (
		<>
			<nav className='h-24 py-5 px-3 border-b border-black md:flex md:items-center'>
				<div className='border flex justify-between items-center space-x-3 md:w-1/2'>
					<div className='flex items-center space-x-10'>
						<img src='/assets/Logomark.png' alt='logo' className='w-8 lg:w-10' />
						<h1 className='text-3xl font-bold text-DeepIndigo lg:text-4xl'>Body Balance</h1>
					</div>
					<HamburgerButton isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={setIsMobileMenuOpen} />
				</div>
				<div className='hidden md:flex md:mx-auto'>
					<ul className='flex space-x-5'>
						<RoutesLinksList />
						<LogoutButton />
					</ul>
				</div>
			</nav>
			<MobileMenu isMobileMenuOpen={isMobileMenuOpen} />
			<Outlet />
		</>
	);
};
