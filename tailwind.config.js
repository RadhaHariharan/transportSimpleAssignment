const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('ng-invalid-input', '&.ng-invalid.ng-touched, &.ng-invalid.ng-dirty');
    }),
  ],
}