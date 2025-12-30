/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design system colors (from visual-design-system.md)
        'main-bg': '#1e1e1e',
        'panel-bg': '#252526',
        'sidebar-bg': '#2d2d30',
        'editor-bg': '#1e1e1e',
        'tab-bar-bg': '#2d2d30',
        'input-bg': '#3c3c3c',
        'text-primary': '#cccccc',
        'text-secondary': '#858585',
        'text-tertiary': '#6a6a6a',
        'border': '#3e3e42',
        'divider': '#3e3e42',
        'accent': '#007acc',
        'accent-hover': '#1a8cd8',
        'success': '#4ec9b0',
        'warning': '#dcdcaa',
        'error': '#f48771',
        'info': '#4fc1ff',
      },
    },
  },
  plugins: [],
}

