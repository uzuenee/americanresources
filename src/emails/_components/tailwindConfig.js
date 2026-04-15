import { pixelBasedPreset } from '@react-email/components';

// Mirrors the brand tokens in src/app/globals.css so emails feel like the same
// product. pixelBasedPreset is required: it converts rem/em to px so Outlook
// and Gmail render predictably.
export const tailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        navy: '#1B2A4A',
        'navy-light': '#2E4A7A',
        'navy-pale': '#D6DEE8',
        'navy-dark': '#0D1B2A',
        offwhite: '#F9F6F1',
        'offwhite-alt': '#F4F1EB',
        surface: '#FEFDFB',
        'text-primary': '#1A1A18',
        // Darker than the app's --color-text-muted (#78736A) so small footer
        // body text on offwhite clears WCAG AA (≥4.5:1). Email only.
        'text-muted': '#5A5650',
        'text-on-dark': '#EAE7E0',
        accent: '#C62828',
        'accent-light': '#FEE2E2',
        'accent-hover': '#D32F2F',
        copper: '#C4956A',
        'copper-dark': '#A67B50',
        'copper-light': '#DEB990',
        sage: '#6B7F5E',
        'sage-light': '#E8EDE4',
        border: '#DDD9D2',
        success: '#059669',
        danger: '#DC2626',
      },
      fontFamily: {
        serif: ['"Barlow Condensed"', '"Arial Narrow"', 'Georgia', 'serif'],
        sans: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
};
