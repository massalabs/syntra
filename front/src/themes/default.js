import { createThemes } from 'tw-colors';
import plugin from 'tailwindcss/plugin';

const colorRed = '#F1685D';
const colorBeige = '#EBEBE6';
const colorGrey = '#495A54';
const colorDarkGrey = '#292928';

/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  theme: {
    fontFamily: {
      Urbane: ['Urbane', 'sans-serif'],
      Poppins: ['Poppins', 'sans-serif'],
    },
  },
  plugins: [
    createThemes({
      light: {
        primary: colorRed,
        secondary: colorBeige,
        tertiary: colorBeige,
        neutral: colorGrey,
        info: colorGrey,
        // states:
        's-success': colorRed,
        's-error': colorRed,
        's-warning': colorRed,
        's-info': colorGrey,
        's-info-1': colorGrey,
        // components:
        'c-default': colorGrey,
        'c-hover': colorGrey,
        'c-pressed': colorGrey,
        'c-disabled-1': colorGrey,
        'c-disabled-2': colorBeige,
        'c-error': colorRed,
        // icons:
        'i-primary': colorGrey,
        'i-secondary': colorBeige,
        'i-tertiary': colorDarkGrey,
        // fonts:
        'f-primary': colorGrey,
        'f-secondary': colorBeige,
        'f-tertiary': colorGrey,
        'f-disabled-1': colorGrey,
        'f-disabled-2': colorBeige,
      },
      dark: {
        primary: colorGrey,
        secondary: colorGrey,
        tertiary: colorBeige,
        brand: colorRed,
        neutral: colorBeige,
        info: colorGrey,
        // states:
        's-success': colorRed,
        's-error': colorRed,
        's-warning': colorRed,
        's-info': colorGrey,
        's-info-1': colorGrey,
        // components:
        'c-default': colorBeige,
        'c-hover': colorGrey,
        'c-pressed': colorGrey,
        'c-disabled-1': colorGrey,
        'c-disabled-2': colorBeige,
        'c-error': colorRed,
        // icons:
        'i-primary': colorBeige,
        'i-secondary': colorGrey,
        'i-tertiary': colorRed,
        // fonts:
        'f-primary': colorBeige,
        'f-secondary': colorGrey,
        'f-tertiary': colorRed,
        'f-disabled-1': colorGrey,
        'f-disabled-2': colorBeige,
      },
    }),
    plugin(function ({ addComponents, theme }) {
      addComponents({
        '.mas-banner': {
          fontSize: '36px',
          fontWeight: '600',
          fontFamily: theme('fontFamily.Urbane'),
          lineHeight: '44px',
          fontStyle: 'normal',
        },
        '.mas-title': {
          fontSize: '34px',
          fontWeight: '600',
          fontFamily: theme('fontFamily.Urbane'),
          lineHeight: '40px',
        },
        '.mas-subtitle': {
          fontSize: '20px',
          fontWeight: '500',
          fontFamily: theme('fontFamily.Urbane'),
          lineHeight: '24px',
        },
        '.mas-h2': {
          fontSize: '20px',
          fontWeight: '300',
          fontFamily: theme('fontFamily.Urbane'),
          lineHeight: '24px',
        },
        '.mas-h3': {
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: theme('fontFamily.Urbane'),
          lineHeight: '16px',
        },
        '.mas-buttons': {
          fontSize: '16px',
          fontWeight: '600',
          fontFamily: theme('fontFamily.Urbane'),
          lineHeight: '20px',
        },
        '.mas-menu-active': {
          fontSize: '16px',
          fontWeight: '600',
          fontFamily: theme('fontFamily.Urbane'),
          lineHeight: '20px',
        },
        '.mas-menu-default': {
          fontSize: '16px',
          fontWeight: '500',
          fontFamily: theme('fontFamily.Urbane'),
          lineHeight: '20px',
        },
        '.mas-menu-underline': {
          fontSize: '16px',
          fontWeight: '500',
          fontFamily: theme('fontFamily.Urbane'),
          lineHeight: '20px',
          textDecoration: 'underline',
          fontStyle: 'normal',
        },
        '.mas-body': {
          fontSize: '16px',
          fontWeight: '500',
          fontFamily: theme('fontFamily.Poppins'),
          lineHeight: '24px',
          fontStyle: 'normal',
        },
        '.mas-body2': {
          fontSize: '14px',
          fontWeight: '400',
          fontFamily: theme('fontFamily.Poppins'),
          lineHeight: '20px',
        },
        '.mas-caption': {
          fontSize: '12px',
          fontWeight: '400',
          fontFamily: theme('fontFamily.Poppins'),
          lineHeight: '16px',
        },
        '.mas-caption-underline': {
          fontSize: '12px',
          fontWeight: '400',
          fontFamily: theme('fontFamily.Poppins'),
          lineHeight: '16px',
          textDecoration: 'underline',
          fontStyle: 'normal',
        },
      });
    }),
  ],
};
