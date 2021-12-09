module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      gray: '#1E1F22F2',
      darkGray: '#1E1F2280',
      bar: {
        0: '#89DFDB',
        1: '#F4BBD1',
        2: '#F1DC75',
        3: '#F7C893',
        4: '#CBC6FB',
        5: '#12ADA6',
        6: '#4F4F50', // 'other' color
      },
      border: '#FFFFFF4D',
    },
    textColor: {
      primary: '#FFFFFF',
      secondary: '#D3D3D3',
      positive: '#90DDB0',
      negative: '#C84343',
    },

    fontSize: {
      header: ['28px', '28px'],
      subheading: ['16px', '16px'],
      title: ['14px', '14px'],
      body: ['12px', '13.2px'],
      caption: ['10px', '11px'], // weight 600 for label
      captionColored: ['10px', '10px'],
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
