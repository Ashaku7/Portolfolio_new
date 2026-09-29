import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: '#0a0a0d', gold: '#ddba7b', mist: '#96b6b7' } } }, plugins: [] } satisfies Config;
