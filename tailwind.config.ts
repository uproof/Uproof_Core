import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          /* Sky-blue family, slightly more saturated/darker for better contrast */
          50: '#f0f9ff',
          100: '#e6f8ff',
          200: '#bfeaff',
          300: '#7fd7ff',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0077c9', /* was #0284c7 - darker and slightly more saturated */
          700: '#00599f', /* was #0369a1 */
          800: '#034b7b', /* was #075985 */
          900: '#023657', /* was #0c4a6e */
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
