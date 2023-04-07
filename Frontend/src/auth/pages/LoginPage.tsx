import { ErrorMessage, Field, Form, Formik } from 'formik';
import { NavLink } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuthContext } from '../../hooks';

export const LoginPage = () => {
	const { startLogin } = useAuthContext();
	const validationSchema = Yup.object({
		email: Yup.string().email('Unvalid email.').required('Email is required'),
		password: Yup.string().min(6, 'Password must have at least 6 characters').required('Password is required.'),
	});
	return (
		<Formik
			initialValues={{ email: '', password: '' }}
			onSubmit={({ email, password }) => {
				startLogin(email, password);
			}}
			validationSchema={validationSchema}>
			<div className='w-full h-screen flex items-center justify-center px-5'>
				<Form className='w-full md:w-1/3 rounded-lg border-4 border-DeepIndigo'>
					<div className='flex font-bold justify-center mt-6 mb-6'>
						<h1 className='text-2xl text-center'>Welcome to BodyBalance!</h1>
					</div>
					<div className='px-6 pb-10'>
						<div className='w-full mb-2'>
							<div className='flex flex-col'>
								<label htmlFor='email'>Email</label>
								<Field type='text' name='email' placeholder='johndoe@google.com' className='auth-input' />
								<ErrorMessage name='email' component='span' className='text-red-600' />
							</div>
						</div>
						<div className='w-full mb-2'>
							<div className='flex flex-col'>
								<label htmlFor='password'>Password</label>
								<Field type='password' name='password' placeholder='Password...' className='auth-input' />
								<ErrorMessage name='password' component='span' className='text-red-600' />
							</div>
						</div>
						<button type='submit' className='auth-button'>
							Login
						</button>
						<span>
							Don't have an account yet?{' '}
							<NavLink to='/auth/register' className='underline underline-offset-2'>
								Register
							</NavLink>
						</span>
					</div>
				</Form>
			</div>
		</Formik>
	);
};
