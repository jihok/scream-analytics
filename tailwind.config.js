module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      gradientFrom: '#0E0F10',
      gradientTo: '#1B2729',
      darkGray: '#0E0F1080',
      bar: {
        0: '#00FFFF',
        1: '#FF0F6C',
        2: '#A20BFF',
        3: '#6CFFBD',
        4: '#FF26B2',
        5: '#FF9900',
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
      positive: '#4EFC97',
      negative: '#FF3939',
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
        tableAsset: '3px 0px 15px -2px #00000066',
      },
      width: {
        fit: 'fit-content',
        half: '50%',
      },
      minWidth: {
        fit: 'fit-content',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
