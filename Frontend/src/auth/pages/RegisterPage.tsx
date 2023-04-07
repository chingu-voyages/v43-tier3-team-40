import { Field, Formik, Form, ErrorMessage } from 'formik';
import { NavLink } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuthContext } from '../../hooks';
export const RegisterPage = () => {
	const { startRegister } = useAuthContext();
	const validationSchema = Yup.object({
		name: Yup.string().min(5, 'Name must have at least 5 characters').required('Name is required.'),
		email: Yup.string().email('Invalid email address').required('Email is required.'),
		password: Yup.string().min(6, 'Password must have at least 6 characters.').required('Password is required'),
		confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Password must match'),
	});
	return (
		<>
			<Formik
				initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
				onSubmit={({ confirmPassword, email, name, password }) => {
					startRegister(name, email, password);
				}}
				validationSchema={validationSchema}>
				<div className='w-full h-screen flex items-center justify-center px-5'>
					<Form className='w-full md:w-1/3 rounded-lg border-4 border-DeepIndigo'>
						<div className='flex font-bold justify-center mt-6'>
							<h1 className='text-2xl text-center'>Welcome to BodyBalance!</h1>
						</div>
						<div className='px-6 pb-10'>
							<h2 className='text-md text-center text-DeepIndigo mb-8'>Fill the fields to create an account.</h2>
							<div className='w-full mb-2'>
								<div className='flex flex-col'>
									<label htmlFor='name'>Name</label>
									<Field type='text' name='name' placeholder='John Doe' className='auth-input' />
									<ErrorMessage name='name' component='span' className='text-red-600' />
								</div>
							</div>
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
							<div className='w-full mb-2'>
								<div className='flex flex-col'>
									<label htmlFor='confirmPassword'>Confirm password</label>
									<Field
										type='password'
										name='confirmPassword'
										placeholder='Confirm password...'
										className='auth-input'
									/>
									<ErrorMessage name='confirmPassword' component='span' className='text-red-600' />
								</div>
							</div>
							<button type='submit' className='auth-button'>
								Register
							</button>
							<span>
								Already have an account?{' '}
								<NavLink to='/auth/login' className='underline underline-offset-2'>
									Login
								</NavLink>
							</span>
						</div>
					</Form>
				</div>
			</Formik>
		</>
	);
};
