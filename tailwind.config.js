/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: "#FFB7C5",
          blue: "#93C5FD",
          green: "#86EFAC",
          purple: "#D8B4FE",
          yellow: "#FDE047",
          orange: "#FDBA74",
        },
        brand: {
          primary: "#1e293b", // Slate-800/900 for a sleek black look
          secondary: "#9333EA",
          accent: "#F472B6",
          brown: "#5C4033",
          pink: "#FFB6C1",
        }
      },
      fontFamily: {
        brand: ["'Plus Jakarta Sans'", "sans-serif"],
        playful: ["'Fredoka'", "sans-serif"],
        heading: ["'Comfortaa'", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "3rem",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pop': 'pop 0.3s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
