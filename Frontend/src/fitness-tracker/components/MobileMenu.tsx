import { LogoutButton, RoutesLinksList } from './';

interface Props {
	isMobileMenuOpen: boolean;
}
export const MobileMenu: React.FC<Props> = ({ isMobileMenuOpen }) => {
	return (
		<div
			className={`${
				isMobileMenuOpen ? 'flex' : 'hidden'
			} absolute top-0 bottom-0 left-0 flex-col items-center w-full min-h-screen py-1 pt-40 text-xl bg-black bg-opacity-80 md:hidden`}>
			<ul className='space-y-5'>
				<RoutesLinksList />
				<LogoutButton />
			</ul>
		</div>
	);
};
