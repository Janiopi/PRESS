/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#4A1E3C',    // Morado oscuro
          DEFAULT: '#6B2E5B', // Morado medio
          light: '#8B4A7D',   // Morado claro
        },
        accent: {
          red: '#8B1E3F',     // Rojo oscuro/burdeo
          pink: '#C7365F',    // Rosa/rojo más claro
        },
        background: {
          dark: '#2C1B2E',    // Fondo muy oscuro
          card: '#3D2645',    // Fondo de tarjetas
        },
      },
    },
  },
  plugins: [],
};
