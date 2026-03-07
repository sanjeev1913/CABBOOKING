/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fef9ee',
                    100: '#fef0d0',
                    200: '#fdde9a',
                    300: '#fcc357',
                    400: '#faa625',
                    500: '#f88a0b',
                    600: '#dd6905',
                    700: '#b74a08',
                    800: '#93390f',
                    900: '#782f10',
                },
                dark: {
                    50: '#f6f7f9',
                    100: '#eceef2',
                    200: '#d4d9e2',
                    300: '#aeb9c7',
                    400: '#8293a6',
                    500: '#61758b',
                    600: '#4d5d75',
                    700: '#3d4c60',
                    800: '#344050',
                    900: '#1c2333',
                    950: '#111827',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'slide-up': 'slideUp 0.3s ease-out',
                'fade-in': 'fadeIn 0.3s ease-out',
            },
            keyframes: {
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
