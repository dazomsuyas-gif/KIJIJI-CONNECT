export const businessContact = {
  phone: '+255768868546',
  whatsappUrl: 'https://wa.me/255768868546',
  emails: [
    'msuyakelvin27@gmail.com',
    'kelvinmsuya63@gmai.com',
    'dazomsuyas@gmail.com',
  ],
  instagramHandles: ['mk_africa21', 'kelvin_electronic_tz'],
} as const

export const businessContactLinks = [
  {
    label: 'WhatsApp',
    value: businessContact.phone,
    href: businessContact.whatsappUrl,
  },
  ...businessContact.emails.map((email) => ({
    label: 'Email',
    value: email,
    href: `mailto:${email}`,
  })),
  ...businessContact.instagramHandles.map((handle) => ({
    label: 'Instagram',
    value: `@${handle}`,
    href: `https://instagram.com/${handle}`,
  })),
] as const

export const businessSupportEmail = businessContact.emails[0]
