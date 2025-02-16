module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      gradientFrom: '#0E0F10',
      gradientTo: '#1B2729',
      darkGray: '#0E0F1080',
      modalOverlay: '#000000E5',
      bar: {
        // NOTE: if these colors are changed, also change the colors on the account page and ReservesBreakdown
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
      health: {
        bad: '#FF3939',
        ok: '#FBFF26',
        good: '#4EFC97',
      },
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
      header: ['24px', '24px'],
      subheading: ['20px', '20px'],
      title: ['16px', '17.6px'],
      body: ['14px', '15.4px'],
      label: ['12px', '12px'],
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
        inputSm: 80,
      },
      minWidth: {
        fit: 'fit-content',
      },
      maxWidth: {
        inputSm: 80,
        inputMd: 120,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
