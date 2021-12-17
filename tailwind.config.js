module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      gray: '#1E1F22F2',
      darkGray: '#1E1F2280',
      bar: {
        0: '#89DFDB',
        1: '#F4BBD1',
        2: '#F7C893',
        3: '#F1DC75',
        4: '#CBC6FB',
        5: '#12ADA6',
        6: '#4F4F50', // 'other' color
      },
      border: {
        primary: '#FFFFFF4D', // 30%
        secondary: '#FFFFFF1A', // 10%
        active: '#FFFFFFE5', // 90%
      },
      transparent: 'transparent',
    },
    textColor: {
      primary: '#FFFFFF',
      secondary: '#D3D3D3',
      positive: '#90DDB0',
      negative: '#C84343',
    },
    fontFamily: {
      sans: 'Graphik',
      'sans-light': 'Graphik Light',
      'sans-bold': 'Graphik Bold',
      'sans-semibold': 'Graphik Semibold',
      'sans-medium': 'Graphik Medium',
    },
    fontSize: {
      header: ['28px', '28px'],
      subheading: ['16px', '16px'],
      title: ['14px', '14px'],
      body: ['12px', '13.2px'],
      caption: ['10px', '11px'], // weight 600 for label
      captionColored: ['10px', '10px'],
    },
    extend: {
      boxShadow: {
        '3xl': '0px 4px 4px 0px #00000040',
      },
      width: {
        fit: 'fit-content',
        half: '50%',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
