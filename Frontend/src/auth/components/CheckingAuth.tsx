import { Fragment } from 'react';

export const CheckingAuth = () => (
	<div className='min-h-screen flex justify-center items-center'>
		<div className='bg-white p-5 rounded-full flex space-x-3 mb-16 shadow-inner'>
			{Array(3).fill(3).map((_, i) => (
				<Fragment key={i}>
					<div className='w-5 h-5 bg-DeepIndigo rounded-full animate-bounce' />
				</Fragment>
			))}
		</div>
	</div>
);
