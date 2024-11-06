import { createThemes } from 'tw-colors';
import plugin from 'tailwindcss/plugin';

const colorRed = '#F1685D';
const colorBeige = '#EBEBE6';
const colorGray = '#F9F9F9';
const colorDarkGray = '#292928';

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
        secondary: colorGray,
        tertiary: colorBeige,
        neutral: colorDarkGray,
        info: colorGray,
        beige: colorBeige,
        gray: colorGray,
        // states:
        's-success': colorRed,
        's-error': colorRed,
        's-warning': colorRed,
        's-info': colorGray,
        's-info-1': colorGray,
        // components:
        'c-default': colorDarkGray,
        'c-hover': colorDarkGray,
        'c-pressed': colorGray,
        'c-disabled-1': colorGray,
        'c-disabled-2': colorBeige,
        'c-error': colorRed,
        // icons:
        'i-primary': colorGray,
        'i-secondary': colorBeige,
        'i-tertiary': colorDarkGray,
        // fonts:
        'f-primary': colorDarkGray,
        'f-secondary': colorBeige,
        'f-tertiary': colorGray,
        'f-disabled-1': colorGray,
        'f-disabled-2': colorBeige,
      },
      dark: {
        primary: colorRed,
        secondary: colorGray,
        tertiary: colorBeige,
        brand: colorRed,

        neutral: colorDarkGray,
        info: colorGray,

        // states:
        's-success': colorRed,
        's-error': colorRed,
        's-warning': colorRed,
        's-info': colorGray,
        's-info-1': colorGray,
        // components:
        'c-default': colorDarkGray,
        'c-hover': colorDarkGray,
        'c-pressed': colorGray,
        'c-disabled-1': colorGray,
        'c-disabled-2': colorBeige,
        'c-error': colorRed,
        // icons:
        'i-primary': colorGray,
        'i-secondary': colorBeige,
        'i-tertiary': colorDarkGray,
        // fonts:
        'f-primary': colorDarkGray,
        'f-secondary': colorBeige,
        'f-tertiary': colorGray,
        'f-disabled-1': colorGray,
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
        function({ addComponents, theme }) {
          addComponents({
            '.active-button': {
              '@apply transition-all duration-100 ease-in-out': {},
              '&:hover': {
                '@apply -translate-y-[2%] shadow-md': {},
              },
              '&:active': {
                '@apply translate-y-[2%] shadow-none': {},
              },
            },
          });
        },
      });
    }),
  ],
};
