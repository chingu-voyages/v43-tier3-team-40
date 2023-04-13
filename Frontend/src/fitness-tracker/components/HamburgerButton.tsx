interface Props {
	isMobileMenuOpen: boolean;
	toggleMobileMenu: React.Dispatch<React.SetStateAction<boolean>>;
}
export const HamburgerButton: React.FC<Props> = ({ isMobileMenuOpen, toggleMobileMenu }) => {
	return (
		<>
			<button
				className={`z-40 block h-10 w-10 p-2 focus:outline-none space-y-1 transition-all md:hidden`}
				onClick={() => toggleMobileMenu(!isMobileMenuOpen)}>
				<span
					className={`transition-all h-1 bg-DeepIndigo block ${
						isMobileMenuOpen && 'rotate-45 translate-y-1 bg-LightIndigo'
					}  `}></span>
				<span className={`transition-all h-1 bg-DeepIndigo ${isMobileMenuOpen ? 'hidden' : 'block'}`}></span>
				<span
					className={`transition-all h-1 bg-DeepIndigo block ${
						isMobileMenuOpen && '-rotate-45 -translate-y-1 bg-LightIndigo'
					}`}></span>
			</button>
		</>
	);
};
