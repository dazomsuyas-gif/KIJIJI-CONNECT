export type AppLanguage = 'en' | 'sw'

export const translations: Record<AppLanguage, {
  navigation: Record<string, string>
  headings: {
    home: string
    marketplace: string
    travel: string
    learning: string
    community: string
    account: string
  }
  common: {
    language: string
    theme: string
    light: string
    dark: string
    notFound: string
    backHome: string
    pageIntro: string
  }
}> = {
  en: {
    navigation: {
      Home: 'Home',
      Marketplace: 'Marketplace',
      Travel: 'Travel',
      Learning: 'Learning',
      'Business tools': 'Business tools',
      'AI Studio': 'AI Studio',
      Community: 'Community',
      Payments: 'Payments',
      Integrations: 'Integrations',
      Destinations: 'Destinations',
      Activity: 'Activity',
      Account: 'Account',
      Contact: 'Contact',
    },
    headings: {
      home: 'Make your next move in Tanzania.',
      marketplace: 'Explore local products and suppliers',
      travel: 'Stay, travel and explore with a clearer plan.',
      learning: 'Build practical skills at your own pace.',
      community: 'Share ideas and learn from others',
      account: 'Your account and activity',
    },
    common: {
      language: 'Language',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      notFound: 'Page not found',
      backHome: 'Back to home',
      pageIntro: 'Tanzania-connected trade, learning and travel planning.',
    },
  },
  sw: {
    navigation: {
      Home: 'Mwanzo',
      Marketplace: 'Soko',
      Travel: 'Safari',
      Learning: 'Kujifunza',
      'Business tools': 'Zana za biashara',
      'AI Studio': 'Studio ya AI',
      Community: 'Jamii',
      Payments: 'Malipo',
      Integrations: 'Miunganisho',
      Destinations: 'Maeneo',
      Activity: 'Shughuli',
      Account: 'Akaunti',
      Contact: 'Mawasiliano',
    },
    headings: {
      home: 'Panga hatua yako inayofuata nchini Tanzania.',
      marketplace: 'Gundua bidhaa na wasambazaji wa ndani',
      travel: 'Panga mahali pa kukaa, safari na matembezi.',
      learning: 'Jenga ujuzi wa vitendo kwa kasi yako mwenyewe.',
      community: 'Shiriki mawazo na ujifunze pamoja na wengine',
      account: 'Akaunti yako na shughuli zako',
    },
    common: {
      language: 'Lugha',
      theme: 'Mwonekano',
      light: 'Mwanga',
      dark: 'Giza',
      notFound: 'Ukurasa haujapatikana',
      backHome: 'Rudi mwanzo',
      pageIntro: 'Biashara, kujifunza na mipango ya safari inayohusiana na Tanzania.',
    },
  },
}
