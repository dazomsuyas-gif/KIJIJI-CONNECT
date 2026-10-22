export type AppPageId =
  | 'home'
  | 'marketplace'
  | 'travel'
  | 'learning'
  | 'automation'
  | 'ai-studio'
  | 'community'
  | 'payments'
  | 'integrations'
  | 'destinations'
  | 'activity'
  | 'account'
  | 'contact'

export type AppRoute = {
  path: string
  page: AppPageId
  sectionId: string
  title: string
}

export const appRoutes: AppRoute[] = [
  { path: '/', page: 'home', sectionId: 'home', title: 'Home' },
  { path: '/marketplace', page: 'marketplace', sectionId: 'marketplace', title: 'Marketplace' },
  { path: '/travel', page: 'travel', sectionId: 'travel-booking', title: 'Travel planning' },
  { path: '/learning', page: 'learning', sectionId: 'learn-languages', title: 'Language academy' },
  { path: '/business-tools', page: 'automation', sectionId: 'automation', title: 'Business tools' },
  { path: '/ai-studio', page: 'ai-studio', sectionId: 'ai-studio', title: 'AI Studio' },
  { path: '/community', page: 'community', sectionId: 'community', title: 'Community' },
  { path: '/payments', page: 'payments', sectionId: 'payments', title: 'Payments' },
  { path: '/integrations', page: 'integrations', sectionId: 'integrations', title: 'Integrations' },
  { path: '/destinations', page: 'destinations', sectionId: 'tourism-heritage', title: 'Destinations' },
  { path: '/activity', page: 'activity', sectionId: 'notifications', title: 'Activity' },
  { path: '/account', page: 'account', sectionId: 'my-account', title: 'My account' },
  { path: '/contact', page: 'contact', sectionId: 'ai-assistant', title: 'Contact and support' },
]

export function getRouteForPath(pathname: string) {
  return appRoutes.find((route) => route.path === pathname)
}

export function getRouteForSection(sectionId: string) {
  return appRoutes.find((route) => route.sectionId === sectionId)
}

export function getRouteForTarget(targetId: string) {
  const sectionId = targetId === 'product-listing-form' || targetId === 'product-name'
    ? 'marketplace'
    : targetId === 'marketplace-search'
      ? 'marketplace'
      : targetId === 'catalog-search'
        ? 'marketplace'
    : targetId === 'travel-enquiry-form'
      ? 'travel-booking'
      : targetId
  return getRouteForSection(sectionId)
}
