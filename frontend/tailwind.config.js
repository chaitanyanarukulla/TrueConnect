/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Color palette based on mockups
        primary: {
          DEFAULT: "#FF6B6B",
          50: "#FFF0F0",
          100: "#FFE1E1",
          200: "#FFC3C3",
          300: "#FFA5A5",
          400: "#FF8787",
          500: "#FF6B6B",
          600: "#FF3D3D",
          700: "#FF0F0F",
          800: "#E00000",
          900: "#B20000",
          950: "#900000",
        },
        secondary: {
          DEFAULT: "#4ECDC4",
          50: "#E6F7F6",
          100: "#D0F0ED",
          200: "#A2E3DD",
          300: "#74D6CD",
          400: "#4ECDC4",
          500: "#33B1A8",
          600: "#278C85",
          700: "#1C6762",
          800: "#10403D",
          900: "#082221",
          950: "#041211",
        },
        accent: {
          DEFAULT: "#FFD166",
          50: "#FFF8E6",
          100: "#FFF1CC",
          200: "#FFE699",
          300: "#FFDB66",
          400: "#FFD166",
          500: "#FFC333",
          600: "#FFB500",
          700: "#CC9100",
          800: "#996D00",
          900: "#664800",
          950: "#4D3600",
        },
        success: "#6BFF92",
        warning: "#FFD166",
        danger: "#FF6B6B",
        light: "#F7F9FC",
        dark: "#2A324B",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "slide-out": "slideOut 0.3s ease-in",
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-out": "fadeOut 0.3s ease-in",
        "pulse": "pulse 1.5s infinite",
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
