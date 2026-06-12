import type { Config } from 'tailwindcss';

// Shirtify theme — stance #28 Neobrutalist pop. Colours read the CSS vars
// defined in packages/ui/src/styles.css so the token source stays single.
// `extend` only — base Tailwind scale is untouched.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        'paper-warm': 'var(--paper-warm)',
        'paper-deep': 'var(--paper-deep)',
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        'ink-3': 'var(--ink-3)',
        'ink-4': 'var(--ink-4)',
        lime: 'var(--lime)',
        'lime-deep': 'var(--lime-deep)',
        'lime-ink': 'var(--lime-ink)',
        blue: 'var(--blue)',
        'blue-deep': 'var(--blue-deep)',
        'blue-tint': 'var(--blue-tint)',
        tomato: 'var(--tomato)',
        'tomato-tint': 'var(--tomato-tint)',
        crit: 'var(--crit)',
        'crit-tint': 'var(--crit-tint)',
        'go-tint': 'var(--go-tint)',
      },
      fontFamily: {
        display: ['"Archivo Black"', '"Archivo"', 'system-ui', 'sans-serif'],
        heavy: ['"Archivo"', '"Space Grotesk"', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderWidth: {
        3: '3px',
        '2.5': '2.5px',
      },
      boxShadow: {
        pop: 'var(--shadow)',
        'pop-sm': 'var(--shadow-sm)',
        'pop-lg': 'var(--shadow-lg)',
        'pop-blue': '4px 4px 0 var(--blue)',
        'pop-crit': '4px 4px 0 var(--crit)',
        'pop-tomato': '4px 4px 0 var(--tomato)',
      },
    },
  },
  plugins: [],
} satisfies Config;
