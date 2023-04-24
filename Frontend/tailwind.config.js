/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./auth/**/*.{html,js,jsx}",
        "./pages/**/*.{html,js,jsx}",
        "./layouts/**/*.{html,js,jsx}",
        "./utilities/**/*.{html,js,jsx}",
    ],
    theme: {
        extend: {
            gridTemplateRows: {
                '16': 'repeat(16, minmax(0, 1fr))',
                '8': 'repeat(8, minmax(0, 1fr))',
            },
            gridRow: {
                'span-12': 'span 12 / span 12',
                'span-14': 'span 14 / span 14',
                'span-15': 'span 15 / span 15',
                'span-16': 'span 16 / span 16',
                'span-7': 'span 7 / span 7',

            },
        },
    },
    plugins: [],
}