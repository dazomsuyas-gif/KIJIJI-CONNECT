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
  | 'product-detail'
  | 'supplier-profile'
  | 'cart'
  | 'orders'
  | 'seller-dashboard'
  | 'admin'
  | 'assistant'
  | 'articles'
  | 'about'
  | 'faq'
  | 'privacy'
  | 'terms'

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
  { path: '/cart', page: 'cart', sectionId: 'cart-page', title: 'Shopping cart' },
  { path: '/orders', page: 'orders', sectionId: 'orders-page', title: 'Demo orders' },
  { path: '/seller', page: 'seller-dashboard', sectionId: 'seller-page', title: 'Seller workspace' },
  { path: '/admin', page: 'admin', sectionId: 'admin-page', title: 'Demo moderation' },
  { path: '/assistant', page: 'assistant', sectionId: 'assistant-page', title: 'Guided assistant' },
  { path: '/articles', page: 'articles', sectionId: 'articles-page', title: 'Articles' },
  { path: '/about', page: 'about', sectionId: 'about-page', title: 'About Kijiji Connect' },
  { path: '/faq', page: 'faq', sectionId: 'faq-page', title: 'Frequently asked questions' },
  { path: '/privacy', page: 'privacy', sectionId: 'privacy-page', title: 'Privacy notice' },
  { path: '/terms', page: 'terms', sectionId: 'terms-page', title: 'Terms of use' },
]

export function getRouteForPath(pathname: string) {
  const staticRoute = appRoutes.find((route) => route.path === pathname)
  if (staticRoute) return staticRoute

  if (/^\/products\/\d+$/.test(pathname)) {
    return { path: pathname, page: 'product-detail' as const, sectionId: 'product-detail-page', title: 'Product details' }
  }
  if (/^\/suppliers\/[^/]+$/.test(pathname)) {
    return { path: pathname, page: 'supplier-profile' as const, sectionId: 'supplier-profile-page', title: 'Supplier profile' }
  }
  return undefined
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
