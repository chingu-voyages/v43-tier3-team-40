/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}', 
		// Path to the tremor module
		'./node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			colors: {
				BlushingPink: 'rgba(242,230,230,1)',
				DeepIndigo: 'rgba(47, 17, 96, 1)',
				LightIndigo: 'rgba(98, 0, 255, 1)',
			},
			fontFamily: {
				Poppins: ['Poppins', 'sans-serif'],
			},
		},
	},
	plugins: [],
};
