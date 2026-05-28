/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          brand: {
            dark: '#1e3a5f',
            primary: '#1e3a5f',
            green: '#2d8a6e',
            accent: '#34d399',
            light: '#f0f4f1',
            bg: '#f5f7f5',
            surface: '#ffffff',
            border: '#e2e8f0',
          },
          text: {
            primary: '#0f172a',
            secondary: '#64748b',
            muted: '#94a3b8',
          }
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          serif: ['Playfair Display', 'Georgia', 'serif'],
        },
      },
    },
    plugins: [],
  }