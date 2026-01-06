/* eslint-disable max-len */
export const commonButton = `
  transition-all duration-200 ease-out
  disabled:opacity-50 disabled:cursor-not-allowed
  active:scale-[0.98]
`;

export const primaryButton = `
  bg-gradient-to-r from-primary to-primary/90
  text-white font-medium
  shadow-md shadow-primary/20
  hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5
  active:translate-y-0 active:shadow-md
  ${commonButton}
`;

export const secondaryButton = `
  bg-white border-2 border-primary
  text-primary font-medium
  hover:bg-primary/5 hover:shadow-md
  ${commonButton}
`;

export const redButton = primaryButton;
