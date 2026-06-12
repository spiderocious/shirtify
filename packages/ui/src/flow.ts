'use client';

// Control-flow utilities (meemaw). Single import source + swap point for the
// SPA apps. Marked 'use client' and kept OUT of the main barrel so the Next.js
// website's Server Components are unaffected.
//
//   import { Show, Repeat } from '@shirtify/ui/flow';
//
// Use these instead of `&&` / `.map()` in JSX (hard-lessons: `&&` renders "0").
export { Show, Repeat } from 'meemaw';
