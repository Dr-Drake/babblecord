/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./src/views/**/*.ejs",
    "/public/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        'chat-blue': '#7587F7',
        'chat-dark-blue': "#677CF7",
        'bubble-blue': "#E7E9FD",
        'bubble-green': "#E0FCD6"
      },
      spacing: {
        '3%': '3%',
        '5%': '5%', 
        '10%': '10%',
        "15%": '15%'  
      }
    }
  },
  plugins: [
    {
      tailwindcss: {},
      autoprefixer: {},
    },
  ],
}
