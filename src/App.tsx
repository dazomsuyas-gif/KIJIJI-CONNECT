import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom'
import './App.css'
import { generateDemoContent } from './services/demoAi'
import {
  businessContact,
  businessContactLinks,
  businessSupportEmail,
} from './config/contact'
import {
  createDemoPayment,
  demoPaymentMethods,
  type DemoPaymentMethodId,
} from './services/demoPayments'
import { resolveDemoAssistantIntent, type AssistantSection } from './services/demoAssistant'
import {
  languageCourses,
  type LearningLevelId,
} from './services/languageLearning'
import { LanguageLearningStudio } from './components/LanguageLearningStudio'
import { SupabaseAuthPanel } from './components/SupabaseAuthPanel'
import { getRouteForPath, getRouteForTarget } from './config/routes'
import { translations, type AppLanguage } from './config/translations'
import { storageRepository } from './services/storageRepository'
import {
  deleteOwnedDemoProduct,
  localDemoSellerId,
  normalizeLocalListing,
  updateOwnedDemoProduct,
  type LocalProductUpdate,
} from './services/localMarketplaceRepository'
import type { StandalonePageId } from './components/StandalonePages'
import {
  catalogueLastUpdated,
  marketplaceCategories as categories,
  productsSeed,
  productArtworkFor,
  sampleAvailability,
  type Product,
  type ProductAudience,
} from './services/marketplaceCatalog'
import type { TravelType } from './services/travelCatalog'
import {
  TravelPlanningStudio,
  type TravelAssistantCommand,
  type TravelBookingRequest,
} from './components/TravelPlanningStudio'

const StandalonePages = lazy(() =>
  import('./components/StandalonePages').then((module) => ({ default: module.StandalonePages })),
)

type Message = {
  id: number
  role: 'user' | 'assistant'
  text: string
  actions?: { label: string; href: string }[]
}

type Draft = {
  id: number
  title: string
  kind: string
  text: string
}

type CommunityPost = {
  id: number
  title: string
  room: string
  text: string
  author: string
}

type NotificationItem = {
  id: number
  title: string
  text: string
  time: string
}

type PaymentRecord = {
  id: string
  reference: string
  productName: string
  amount: number
  method: DemoPaymentMethodId
  createdAt: string
  status: 'SIMULATED'
}

type CartItem = {
  productId: number
  quantity: number
}

type OrderLine = {
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  lineTotal: number
}

type DemoOrderRecord = {
  id: string
  reference: string
  lines: OrderLine[]
  amount: number
  createdAt: string
  status: 'SIMULATED'
}

type AutomationRun = {
  id: string
  workflow: string
  outcome: string
  time: string
}

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Travel', href: '/travel' },
  { label: 'Learning', href: '/learning' },
  { label: 'Business tools', href: '/business-tools' },
  { label: 'AI Studio', href: '/ai-studio' },
  { label: 'Community', href: '/community' },
  { label: 'Payments', href: '/payments' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Activity', href: '/activity' },
  { label: 'Account', href: '/account' },
  { label: 'Contact', href: '/contact' },
]

const quickPrompts = [
  'Find avocado products',
  'Find a hotel in Arusha for 2 nights for 2 guests',
  'Start my Swahili learning path',
  'Contact support',
]

const storageKeys = {
  products: 'kijiji-connect-products',
  cart: 'kijiji-connect-demo-cart',
  orders: 'kijiji-connect-demo-orders',
  drafts: 'kijiji-connect-drafts',
  posts: 'kijiji-connect-posts',
  lessons: 'kijiji-connect-completed-lessons',
  notifications: 'kijiji-connect-notifications',
  payments: 'kijiji-connect-demo-payments',
  automations: 'kijiji-connect-demo-automation-runs',
  assistantMessages: 'kijiji-connect-assistant-messages',
  travelRequests: 'kijiji-connect-travel-requests',
  lessonScores: 'kijiji-connect-language-scores',
  writingDrafts: 'kijiji-connect-language-writing',
}

const assistantGreeting: Message = {
  id: 1,
  role: 'assistant',
  text: 'Welcome to Kijiji Connect. I can guide you through the marketplace, hotel and trip-planning enquiries, CEFR-informed language practice and business tools. I use local demonstrations—not a live AI service—and I never reserve or message a provider without your review.',
}

const sectionLabels: Record<AssistantSection, string> = {
  home: 'Home',
  marketplace: 'Marketplace',
  payments: 'Payments',
  'ai-studio': 'AI Studio',
  automation: 'Automation',
  'learn-languages': 'Language learning',
  community: 'Community',
  'travel-booking': 'Travel bookings',
  'tourism-heritage': 'Tourism & Heritage',
  'ai-assistant': 'AI Assistant',
  notifications: 'Notifications',
  'my-account': 'My Account',
}

const automationWorkflows = [
  { id: 'order-follow-up', title: 'Order follow-up', trigger: 'A demo order is created', action: 'Prepare a buyer confirmation checklist', outcome: 'Buyer follow-up checklist prepared. No messages were sent.' },
  { id: 'stock-alert', title: 'Low-stock reminder', trigger: 'A seller marks stock as low', action: 'Create a seller restock reminder', outcome: 'Restock reminder created in the local activity feed.' },
  { id: 'content-repurpose', title: 'Repurpose a product draft', trigger: 'A product draft is saved', action: 'Prepare a social caption outline', outcome: 'Social caption outline prepared locally. No external AI was called.' },
]

function createAutomationRun(workflow: (typeof automationWorkflows)[number]) {
  const timestamp = Date.now()
  const time = new Date(timestamp).toLocaleString()
  return {
    run: {
      id: `run-${timestamp}`,
      workflow: workflow.title,
      outcome: workflow.outcome,
      time,
    } satisfies AutomationRun,
    notification: {
      id: timestamp + 1,
      title: `${workflow.title} demo run`,
      text: workflow.outcome,
      time: 'Just now',
    } satisfies NotificationItem,
  }
}

function createLocalId() {
  return Date.now()
}

function readStored<T>(key: string, fallback: T): T {
  return storageRepository.read(key, fallback)
}

function loadProducts(): Product[] {
  return readStored<Product[]>(storageKeys.products, [])
    .filter((product) => product.isDemoUserListing)
    .map((product) => normalizeLocalListing(
      product.image.startsWith('/') ? product : { ...product, image: productArtworkFor(product.category) },
    ))
}

function writeStored<T>(key: string, value: T): void {
  storageRepository.write(key, value)
}

function ChatTranscript({ messages }: { messages: Message[] }) {
  return (
    <div className="chat-window" aria-live="polite" aria-relevant="additions text">
      {messages.map((message) => (
        <div key={message.id} className={message.role === 'user' ? 'chat-bubble user' : 'chat-bubble assistant'}>
          <p>{message.text}</p>
          {message.actions && (
            <div className="chat-message-actions">
              {message.actions.map((action) => (
                <a key={action.href} href={action.href} target="_blank" rel="noreferrer">
                  {action.label}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const tourismPlaces = [
  { title: 'Arusha National Park', location: 'Arusha', text: 'A scenic park with wildlife, mountain views and hiking routes close to the city.', image: '/tanzania-landscape.jpg', imageAlt: 'Representative savannah landscape; not a verified photograph of the park.' },
  { title: 'Olduvai Gorge', location: 'Ngorongoro', text: 'A significant archaeological site linked to human origins and ongoing research.', image: '/kijiji-travel-art.svg', imageAlt: 'Illustration inspired by Tanzania tourism.' },
  { title: 'Cultural Heritage Centre', location: 'Arusha', text: 'Discover arts, crafts, heritage displays and local knowledge.', image: '/kijiji-market-art.svg', imageAlt: 'Illustration of a local marketplace.' },
]

const whatsappUrl = (message: string) =>
  `${businessContact.whatsappUrl}?text=${encodeURIComponent(message)}`

const whatsappSupportUrl = `${businessContact.whatsappUrl}?text=${encodeURIComponent('Hello Kijiji Connect, I need support with selling or buying on the platform.')}`

const suppliers = [
  {
    name: 'Green Valley Farms',
    category: 'Agriculture',
    location: 'Arusha Urban',
  },
  {
    name: 'BuildPro Supplies',
    category: 'Construction',
    location: 'Moshi Road',
  },
  {
    name: 'VoltEast Traders',
    category: 'Electronics',
    location: 'Central Arusha',
  },
]

const trendingTopics = [
  'Agri export opportunities',
  'Tourism recovery trends',
  'Women-owned SMEs',
  'Business financing basics',
]

const formatTzs = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    maximumFractionDigits: 0,
  }).format(value)

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const navigationType = useNavigationType()
  const [searchParams, setSearchParams] = useSearchParams()
  const marketplaceParamsRef = useRef(new URLSearchParams(searchParams))
  const previousPathnameRef = useRef(location.pathname)
  const activeRoute = getRouteForPath(location.pathname)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [language, setLanguage] = useState<AppLanguage>(() =>
    readStored('kijiji-connect-language', 'en'),
  )
  const [homeSearchText, setHomeSearchText] = useState('')
  const [darkMode, setDarkMode] = useState(() =>
    readStored('kijiji-connect-dark-mode', false),
  )
  const t = translations[language]

  const navigateToTarget = (targetId: string, focus = false) => {
    const route = getRouteForTarget(targetId)
    if (!route) {
      console.error(`No application route is configured for target "${targetId}".`)
      return
    }

    setMobileNavOpen(false)
    if (location.pathname === route.path) {
      const target = document.getElementById(focus ? targetId : route.sectionId)
      target?.scrollIntoView({ behavior: 'smooth', block: focus ? 'center' : 'start' })
      if (focus && target instanceof HTMLElement) target.focus({ preventScroll: true })
      return
    }
    navigate(route.path, { state: { scrollTarget: focus ? targetId : route.sectionId } })
  }

  const openMarketplaceSearch = (query: string) => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    const destination = `/marketplace${params.size ? `?${params.toString()}` : ''}`
    if (location.pathname === '/marketplace') {
      marketplaceParamsRef.current = params
      setSearchParams(params, { replace: true })
      navigateToTarget('catalog-search', true)
    } else {
      navigate(destination, { state: { scrollTarget: 'catalog-search' } })
    }
  }

  useEffect(() => {
    if (navigationType === 'POP' || previousPathnameRef.current !== location.pathname) {
      marketplaceParamsRef.current = new URLSearchParams(location.search)
    }
    previousPathnameRef.current = location.pathname
  }, [location.pathname, location.search, navigationType])

  useEffect(() => {
    const route = getRouteForPath(location.pathname)
    document.documentElement.lang = language
    document.title = route
      ? `${route.title} | Kijiji Connect`
      : 'Page not found | Kijiji Connect'
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (description) {
      description.content = route
        ? `${route.title} on Kijiji Connect — ${translations[language].common.pageIntro}`
        : 'The requested Kijiji Connect page could not be found.'
    }

    const targetId = typeof location.state?.scrollTarget === 'string'
      ? location.state.scrollTarget
      : null
    if (targetId) {
      window.requestAnimationFrame(() => {
        const target = document.getElementById(targetId)
        target?.scrollIntoView({ behavior: 'smooth', block: targetId === route?.sectionId ? 'start' : 'center' })
        if (targetId !== route?.sectionId && target instanceof HTMLElement) {
          target.focus({ preventScroll: true })
        }
      })
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [language, location.pathname, location.state])

  const currentPage = activeRoute?.page ?? 'not-found'
  const standalonePageIds: StandalonePageId[] = [
    'product-detail',
    'supplier-profile',
    'cart',
    'orders',
    'seller-dashboard',
    'admin',
    'assistant',
    'articles',
    'about',
    'faq',
    'privacy',
    'terms',
  ]
  const standalonePage = standalonePageIds.find((page) => page === currentPage) ?? null
  const searchText = searchParams.get('q') ?? ''
  const audienceParam = searchParams.get('audience')
  const activeFilter: 'All Products' | ProductAudience =
    audienceParam === 'B2B' || audienceParam === 'B2C' ? audienceParam : 'All Products'
  const categoryParam = searchParams.get('category')
  const activeCategory = categories.includes(categoryParam ?? '') ? categoryParam ?? 'All categories' : 'All categories'
  const locationFilter = searchParams.get('location') ?? ''
  const stockParam = searchParams.get('stock') ?? ''
  const activeStock = [...sampleAvailability, 'Contact to confirm'].includes(stockParam) ? stockParam : ''
  const sortParam = searchParams.get('sort')
  const sortBy: 'relevance' | 'price-asc' | 'price-desc' | 'name-asc' =
    sortParam === 'price-asc' || sortParam === 'price-desc' || sortParam === 'name-asc'
      ? sortParam
      : 'relevance'
  const pageParam = Number(searchParams.get('page') ?? '1')
  const currentCatalogPage = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1
  const minPriceParam = Number(searchParams.get('minPrice') ?? '')
  const maxPriceParam = Number(searchParams.get('maxPrice') ?? '')
  const minPrice = searchParams.has('minPrice') && Number.isFinite(minPriceParam) && minPriceParam >= 0
    ? minPriceParam
    : null
  const maxPrice = searchParams.has('maxPrice') && Number.isFinite(maxPriceParam) && maxPriceParam >= 0
    ? maxPriceParam
    : null

  const updateMarketplaceParams = (updates: Record<string, string>, keepPage = false) => {
    const next = new URLSearchParams(marketplaceParamsRef.current)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    if (!keepPage) next.delete('page')
    marketplaceParamsRef.current = next
    setSearchParams(next, { replace: true })
  }

  const clearMarketplaceParams = () => {
    const next = new URLSearchParams()
    marketplaceParamsRef.current = next
    setSearchParams(next, { replace: true })
  }
  const [products, setProducts] = useState<Product[]>(() => [...productsSeed, ...loadProducts()])
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readStored(storageKeys.cart, []))
  const [orderRecords, setOrderRecords] = useState<DemoOrderRecord[]>(() => readStored(storageKeys.orders, []))
  const [drafts, setDrafts] = useState<Draft[]>(() => readStored(storageKeys.drafts, []))
  const [posts, setPosts] = useState<CommunityPost[]>(() => readStored(storageKeys.posts, []))
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => readStored(storageKeys.lessons, []))
  const [lessonScores, setLessonScores] = useState<Record<string, number>>(() =>
    readStored(storageKeys.lessonScores, {}),
  )
  const [writingDrafts, setWritingDrafts] = useState<Record<string, string>>(() =>
    readStored(storageKeys.writingDrafts, {}),
  )
  const [learningLanguage, setLearningLanguage] = useState('english')
  const [learningLevel, setLearningLevel] = useState<LearningLevelId>('A1')
  const [travelCategory, setTravelCategory] = useState<TravelType>('stays')
  const [travelQuery, setTravelQuery] = useState('Arusha')
  const [travelAssistantCommand, setTravelAssistantCommand] = useState<TravelAssistantCommand | null>(null)
  const [travelRequests, setTravelRequests] = useState<TravelBookingRequest[]>(() =>
    readStored(storageKeys.travelRequests, []),
  )
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => readStored(storageKeys.notifications, []))
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(() => readStored(storageKeys.payments, []))
  const [automationRuns, setAutomationRuns] = useState<AutomationRun[]>(() => readStored(storageKeys.automations, []))
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null)
  const [checkoutCart, setCheckoutCart] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<DemoPaymentMethodId>('mpesa')
  const [paymentPhone, setPaymentPhone] = useState('')
  const [paymentQuantity, setPaymentQuantity] = useState('1')
  const [paymentError, setPaymentError] = useState('')
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [draftForm, setDraftForm] = useState({ title: '', kind: 'Product description', topic: '' })
  const [postForm, setPostForm] = useState({ title: '', room: 'Business & Entrepreneurship', text: '' })
  const [productForm, setProductForm] = useState({
    name: '',
    category: categories[1],
    description: '',
    price: '',
    wholesalePrice: '',
    minimumWholesaleQty: '1',
    unit: 'piece',
    location: 'Arusha',
    seller: '',
    audience: 'B2C' as ProductAudience,
  })
  const [productFormError, setProductFormError] = useState('')
  const [storageError, setStorageError] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() =>
    readStored(storageKeys.assistantMessages, [assistantGreeting]),
  )

  const updateLanguage = (nextLanguage: AppLanguage) => {
    setLanguage(nextLanguage)
    try {
      storageRepository.write('kijiji-connect-language', nextLanguage)
    } catch (error) {
      console.error('Could not save the language preference.', error)
      setStorageError('Your language preference could not be saved in this browser.')
    }
  }

  const toggleDarkMode = () => {
    const nextDarkMode = !darkMode
    setDarkMode(nextDarkMode)
    try {
      storageRepository.write('kijiji-connect-dark-mode', nextDarkMode)
    } catch (error) {
      console.error('Could not save the appearance preference.', error)
      setStorageError('Your appearance preference could not be saved in this browser.')
    }
  }

  const persist = <T,>(key: string, value: T): boolean => {
    try {
      writeStored(key, value)
      return true
    } catch (error) {
      console.error(`Could not save ${key} to local storage.`, error)
      setStorageError('Your browser could not save this demo data. Check browser storage settings and try again.')
      return false
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesFilter =
      activeFilter === 'All Products' || product.audience.includes(activeFilter)
    const matchesCategory =
      activeCategory === 'All categories' || product.category === activeCategory
    const searchableText = `${product.name} ${product.category} ${product.description} ${product.seller} ${product.location}`.toLowerCase()
    const matchesSearch = searchableText.includes(searchText.trim().toLowerCase())
    const matchesLocation = product.location.toLowerCase().includes(locationFilter.trim().toLowerCase())
    const matchesMinPrice = minPrice === null || product.price >= minPrice
    const matchesMaxPrice = maxPrice === null || product.price <= maxPrice
    const matchesStock = !activeStock || product.stock === activeStock
    return matchesFilter && matchesCategory && matchesSearch && matchesLocation && matchesMinPrice && matchesMaxPrice && matchesStock
  }).sort((left, right) => {
    if (sortBy === 'price-asc') return left.price - right.price
    if (sortBy === 'price-desc') return right.price - left.price
    if (sortBy === 'name-asc') return left.name.localeCompare(right.name)
    return left.id - right.id
  })
  const productsPerPage = 12
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage))
  const visiblePage = Math.min(currentCatalogPage, pageCount)
  const visibleProducts = filteredProducts.slice((visiblePage - 1) * productsPerPage, visiblePage * productsPerPage)

  const cartLines = cartItems.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId)
    if (!product || !Number.isInteger(item.quantity) || item.quantity < 1) return []
    const unitPrice = item.quantity >= product.minimumWholesaleQty ? product.wholesalePrice : product.price
    return [{ product, quantity: item.quantity, unitPrice, lineTotal: unitPrice * item.quantity }]
  })
  const cartSubtotal = cartLines.reduce((total, line) => total + line.lineTotal, 0)
  const productIdFromPath = location.pathname.startsWith('/products/')
    ? Number(location.pathname.slice('/products/'.length))
    : null
  const routeProduct = products.find((product) => product.id === productIdFromPath)
  const supplierSlugFromPath = location.pathname.startsWith('/suppliers/')
    ? decodeURIComponent(location.pathname.slice('/suppliers/'.length))
    : undefined
  const selectedPaymentMethod = demoPaymentMethods.find((method) => method.id === paymentMethod)
  const parsedQuantity = Number(paymentQuantity)
  const checkoutUnitPrice =
    checkoutProduct && parsedQuantity >= checkoutProduct.minimumWholesaleQty
      ? checkoutProduct.wholesalePrice
      : checkoutProduct?.price ?? 0
  const checkoutTotal = checkoutCart
    ? cartSubtotal
    : checkoutUnitPrice * (Number.isInteger(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 0)

  const handleSendMessage = (messageText = chatInput) => {
    const trimmed = messageText.trim()
    if (!trimmed) return

    const intent = resolveDemoAssistantIntent(trimmed)
    let reply = ''
    let actions: Message['actions']

    if (intent.type === 'navigate') {
      if (intent.section === 'travel-booking') {
        const lowerMessage = trimmed.toLowerCase()
        const category: TravelType = /\b(?:hotel|hotels|stay|stays|room|accommodation)\b/.test(lowerMessage)
          ? 'stays'
          : /\b(?:flight|flights|ticket|airline|airport)\b/.test(lowerMessage)
            ? 'flights'
            : /\b(?:tour|tours|package|packages|safari)\b/.test(lowerMessage)
              ? 'packages'
              : travelCategory
        setTravelCategory(category)
        const isStayRequest = category === 'stays'
        const destination = trimmed.match(isStayRequest
          ? /\b(?:in|near)\s+([a-z]+(?:\s+[a-z]+){0,2}?)(?=\s+(?:for|with|from|on|between|during|starting)\b|[,.?!]|$)/i
          : /\b(?:in|to|around)\s+([a-z]+(?:\s+[a-z]+){0,2}?)(?=\s+(?:for|with|from|on|between|during|starting)\b|[,.?!]|$)/i)?.[1]
        const guestCount = trimmed.match(/\b(\d{1,2})\s+(?:travellers?|travelers?|guests?|people|adults?)\b/i)?.[1]
        const nightCount = trimmed.match(/\b(\d{1,2})\s+nights?\b/i)?.[1]
        const dates = trimmed.match(/\b20\d{2}-\d{2}-\d{2}\b/g)
        if (destination) setTravelQuery(destination)
        const nonce = createLocalId()
        setTravelAssistantCommand({
          nonce,
          travelers: guestCount,
          nights: nightCount ? Number(nightCount) : undefined,
          checkIn: dates?.[0],
          checkOut: dates?.[1],
        })
        navigateToTarget('travel-booking')
        reply = `I’ve opened ${category === 'stays' ? 'hotel and stay' : category === 'flights' ? 'flight' : 'tour package'} options to help plan your enquiry. Check the travel dates, group size and illustrative prices, then review any enquiry before contacting a provider. Nothing is booked automatically.`
      } else if (intent.section === 'learn-languages') {
        const courseId = /\b(?:swahili|kiswahili)\b/i.test(trimmed)
          ? 'swahili'
          : /\bfrench\b/i.test(trimmed)
            ? 'french'
            : /\b(?:chinese|mandarin)\b/i.test(trimmed)
              ? 'mandarin'
              : 'english'
        const course = languageCourses.find((item) => item.id === courseId) ?? languageCourses[0]
        const nextLesson = course.levels.find((level) => !completedLessons.includes(`${course.id}-${level.id}`))
          ?? course.levels[0]
        setLearningLanguage(course.id)
        setLearningLevel(nextLesson.id)
        navigateToTarget('learn-languages')
        reply = `Opening ${course.name} (${nextLesson.band}). Study the material and pass the short check to record progress. The suggested modules follow learning goals but are not an accredited exam.`
      } else {
        navigateToTarget(intent.section)
        reply = `Opening ${sectionLabels[intent.section]}. You can ask me to help with the next step there.`
      }
    } else if (intent.type === 'search') {
      openMarketplaceSearch(intent.query)
      reply = `Searching marketplace listings for “${intent.query}”. Review the matching listing and choose an action when you are ready.`
    } else if (intent.type === 'draft') {
      const draftDetails = { title: intent.title, kind: intent.kind, topic: intent.topic }
      setDraftForm(draftDetails)
      const generated = handleGenerateDraft(draftDetails)
      navigateToTarget('ai-studio')
      reply = generated
        ? `I created a local ${intent.kind.toLowerCase()} draft about ${intent.topic} and saved it in AI Studio. Please review it before sharing. No external AI was called.`
        : 'I could not save that draft. Please check your browser storage and try again.'
    } else if (intent.type === 'prepare-listing') {
      if (intent.productName) {
        setProductForm((current) => ({ ...current, name: intent.productName }))
      }
      navigateToTarget('product-name', true)
      reply = intent.productName
        ? `I filled in “${intent.productName}” as the listing name. Add accurate pricing and seller details, then publish it yourself to this browser's demo catalogue.`
        : 'The listing form is open. Add your product details and confirm everything before publishing it locally.'
    } else if (intent.type === 'prepare-community-post') {
      setPostForm((current) => ({
        ...current,
        title: intent.title || current.title,
        room: intent.room,
      }))
      navigateToTarget('community')
      reply = 'The community post form is open with your discussion room selected. Add and review the post text, then choose Publish yourself. Nothing is shared with other users.'
    } else if (intent.type === 'run-automation') {
      const workflow = automationWorkflows.find((item) => item.id === intent.workflow)
      if (workflow) {
        handleRunAutomation(workflow)
        navigateToTarget('automation')
        reply = `${workflow.outcome} You can review the run in Automation and Notifications.`
      } else {
        reply = 'I could not find that demo workflow. Open Automation to review the available workflows.'
      }
    } else if (intent.type === 'complete-lesson') {
      const course = languageCourses.find((item) => item.id === intent.lesson) ?? languageCourses[0]
      const nextLesson = course.levels.find((level) => !completedLessons.includes(`${course.id}-${level.id}`))
        ?? course.levels[0]
      setLearningLanguage(course.id)
      setLearningLevel(nextLesson.id)
      navigateToTarget('learn-languages')
      reply = `I opened the next ${course.name} practice module (${nextLesson.band}). Review the lesson and pass its knowledge check to track your progress. This is learning practice, not a certified assessment.`
    } else if (intent.type === 'checkout') {
      const query = intent.productQuery.toLowerCase().trim()
      const product = query
        ? products.find((item) => item.name.toLowerCase().includes(query) || query.includes(item.name.toLowerCase()))
        : undefined
      if (product) {
        handleOpenCheckout(product)
        reply = `I opened the sandbox checkout for ${product.name}. Review the item and quantity yourself; payment is simulated only and no money will be charged.`
      } else {
        openMarketplaceSearch(query)
        reply = query
          ? `I could not match “${intent.productQuery}” to a listing. I searched the marketplace so you can check available products.`
          : 'Open Marketplace to choose a product, or ask me to find a specific item. Checkout is always a sandbox simulation, never a real payment.'
      }
    } else if (intent.type === 'contact') {
      reply = 'Kijiji Connect demo support is not a live automated support desk. You can contact Kelvin directly using one of these links.'
      actions = [
        { label: 'WhatsApp support', href: whatsappSupportUrl },
        { label: 'Email support', href: `mailto:${businessSupportEmail}` },
      ]
    } else {
      reply = 'I can help find marketplace listings, plan a stay or trip enquiry, navigate all sections, explore CEFR-informed language lessons, prepare business content, or reach customer support. Try “find avocado products”, “find a hotel in Arusha for 2 nights for 2 guests”, “start my Swahili learning path”, or “contact support”. I use local guidance—not a connected AI model. Nothing is booked or sent automatically.'
    }

    const timestamp = createLocalId()
    const nextMessages = [
      ...messages,
      { id: timestamp, role: 'user' as const, text: trimmed },
      { id: timestamp + 1, role: 'assistant' as const, text: reply, ...(actions ? { actions } : {}) },
    ].slice(-40)
    setMessages(nextMessages)
    persist(storageKeys.assistantMessages, nextMessages)
    setChatInput('')
  }

  const handleGenerateDraft = (details = draftForm): boolean => {
    const title = details.title.trim()
    const topic = details.topic.trim()
    if (!title || !topic) return false
    setStorageError('')

    let generatedText: string
    try {
      generatedText = generateDemoContent({ title, kind: details.kind, topic })
    } catch (error) {
      console.error('Could not generate a demo content draft.', error)
      setStorageError(error instanceof Error ? error.message : 'The demo content draft could not be generated.')
      return false
    }

    const timestamp = createLocalId()
    const draft: Draft = { id: timestamp, title, kind: details.kind, text: generatedText }
    const nextDrafts = [draft, ...drafts]
    const nextNotifications = [{ id: timestamp + 1, title: 'Content draft created', text: `${title} is saved in your AI Studio.`, time: 'Just now' }, ...notifications]
    setDrafts(nextDrafts)
    setNotifications(nextNotifications)
    persist(storageKeys.drafts, nextDrafts)
    persist(storageKeys.notifications, nextNotifications)
    return true
  }

  const handleAddPost = () => {
    if (!postForm.title.trim() || !postForm.text.trim()) return
    setStorageError('')
    const post: CommunityPost = { id: Date.now(), ...postForm, author: 'Community member' }
    const nextPosts = [post, ...posts]
    const nextNotifications = [{ id: Date.now() + 1, title: 'Community post published', text: post.title, time: 'Just now' }, ...notifications]
    setPosts(nextPosts)
    setNotifications(nextNotifications)
    persist(storageKeys.posts, nextPosts)
    persist(storageKeys.notifications, nextNotifications)
    setPostForm((current) => ({ ...current, title: '', text: '' }))
  }

  const handleAddProduct = () => {
    const price = Number(productForm.price)
    const wholesalePrice = Number(productForm.wholesalePrice)
    const minimumWholesaleQty = Number(productForm.minimumWholesaleQty)
    if (!productForm.name.trim() || !productForm.description.trim() || !productForm.seller.trim()) {
      setProductFormError('Enter a product name, description and seller/business name.')
      return
    }
    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(wholesalePrice) || wholesalePrice <= 0 || !Number.isInteger(minimumWholesaleQty) || minimumWholesaleQty < 1) {
      setProductFormError('Prices must be positive numbers and minimum order quantity must be a whole number of at least 1.')
      return
    }

    setStorageError('')
    const newProduct: Product = {
      id: Date.now(),
      name: productForm.name.trim(),
      category: productForm.category,
      description: productForm.description.trim(),
      price,
      wholesalePrice,
      minimumWholesaleQty,
      unit: productForm.unit.trim() || 'piece',
      location: productForm.location.trim() || 'Arusha',
      seller: productForm.seller.trim(),
      audience: [productForm.audience],
      stock: 'Contact to confirm',
      image: productArtworkFor(productForm.category),
      isDemoUserListing: true,
      ownerId: localDemoSellerId,
    }
    const nextProducts = [newProduct, ...products]
    const nextNotifications = [{ id: Date.now() + 1, title: 'Product listing added', text: `${newProduct.name} was added to this browser’s demo catalogue.`, time: 'Just now' }, ...notifications]
    setProducts(nextProducts)
    setNotifications(nextNotifications)
    persist(storageKeys.products, nextProducts)
    persist(storageKeys.notifications, nextNotifications)
    setProductFormError('')
    setProductForm({ name: '', category: categories[1], description: '', price: '', wholesalePrice: '', minimumWholesaleQty: '1', unit: 'piece', location: 'Arusha', seller: '', audience: 'B2C' })
  }

  const handleUpdateOwnedProduct = (productId: number, update: LocalProductUpdate): boolean => {
    try {
      const nextProducts = updateOwnedDemoProduct(products, localDemoSellerId, productId, update)
      setProducts(nextProducts)
      setStorageError('')
      return persist(storageKeys.products, nextProducts)
    } catch (error) {
      console.error('Could not update the local demo listing.', error)
      setStorageError(error instanceof Error ? error.message : 'Could not update this local demo listing.')
      return false
    }
  }

  const handleRemoveProduct = (productId: number) => {
    try {
      const nextProducts = deleteOwnedDemoProduct(products, localDemoSellerId, productId)
      const nextCart = cartItems.filter((item) => item.productId !== productId)
      setProducts(nextProducts)
      setCartItems(nextCart)
      persist(storageKeys.products, nextProducts)
      persist(storageKeys.cart, nextCart)
      setStorageError('')
    } catch (error) {
      console.error('Could not remove the local demo listing.', error)
      setStorageError(error instanceof Error ? error.message : 'Could not remove this local demo listing.')
    }
  }

  const handleRemoveDraft = (draftId: number) => {
    setStorageError('')
    const nextDrafts = drafts.filter((draft) => draft.id !== draftId)
    setDrafts(nextDrafts)
    persist(storageKeys.drafts, nextDrafts)
  }

  const handleRemovePost = (postId: number) => {
    setStorageError('')
    const nextPosts = posts.filter((post) => post.id !== postId)
    setPosts(nextPosts)
    persist(storageKeys.posts, nextPosts)
  }

  const handleClearNotifications = () => {
    setStorageError('')
    setNotifications([])
    persist(storageKeys.notifications, [])
  }

  const handleRemoveNotification = (notificationId: number) => {
    setStorageError('')
    const nextNotifications = notifications.filter((item) => item.id !== notificationId)
    setNotifications(nextNotifications)
    persist(storageKeys.notifications, nextNotifications)
  }

  const handlePassLearningModule = (lessonId: string, score: number) => {
    const nextLessons = completedLessons.includes(lessonId)
      ? completedLessons
      : [...completedLessons, lessonId]
    const nextScores = { ...lessonScores, [lessonId]: Math.max(score, lessonScores[lessonId] ?? 0) }
    const notice: NotificationItem = {
      id: createLocalId(),
      title: 'Language module passed',
      text: `${lessonId.replace('-', ' ')} · practice score ${score}%. Saved to this browser only.`,
      time: 'Just now',
    }
    const nextNotifications = [notice, ...notifications]
    setCompletedLessons(nextLessons)
    setLessonScores(nextScores)
    setNotifications(nextNotifications)
    persist(storageKeys.lessons, nextLessons)
    persist(storageKeys.lessonScores, nextScores)
    persist(storageKeys.notifications, nextNotifications)
  }

  const handleSaveLearningWriting = (lessonId: string, text: string) => {
    const nextWritingDrafts = { ...writingDrafts, [lessonId]: text }
    setWritingDrafts(nextWritingDrafts)
    persist(storageKeys.writingDrafts, nextWritingDrafts)
  }

  const handleSaveTravelRequest = (request: TravelBookingRequest) => {
    const nextRequests = [request, ...travelRequests].slice(0, 20)
    const nextNotifications: NotificationItem[] = [
      {
        id: createLocalId(),
        title: 'Travel enquiry draft prepared',
        text: `${request.offerName}. No reservation has been made and no message has been sent.`,
        time: 'Just now',
      },
      ...notifications,
    ]
    setTravelRequests(nextRequests)
    setNotifications(nextNotifications)
    persist(storageKeys.travelRequests, nextRequests)
    persist(storageKeys.notifications, nextNotifications)
  }

  const handleOpenCheckout = (product: Product) => {
    setCheckoutCart(false)
    setCheckoutProduct(product)
    setPaymentMethod('mpesa')
    setPaymentPhone('')
    setPaymentQuantity('1')
    setPaymentError('')
  }

  const handleOpenCartCheckout = () => {
    if (cartLines.length === 0) return
    setCheckoutProduct(null)
    setCheckoutCart(true)
    setPaymentMethod('mpesa')
    setPaymentPhone('')
    setPaymentError('')
  }

  const handleCloseCheckout = () => {
    if (paymentProcessing) return
    setCheckoutProduct(null)
    setCheckoutCart(false)
    setPaymentError('')
  }

  const handleAddToCart = (product: Product) => {
    const existing = cartItems.find((item) => item.productId === product.id)
    const nextCart = existing
      ? cartItems.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cartItems, { productId: product.id, quantity: 1 }]
    setCartItems(nextCart)
    persist(storageKeys.cart, nextCart)
  }

  const handleUpdateCartQuantity = (productId: number, value: string) => {
    const quantity = Number(value)
    if (!Number.isInteger(quantity) || quantity < 1) return
    const nextCart = cartItems.map((item) => item.productId === productId ? { ...item, quantity } : item)
    setCartItems(nextCart)
    persist(storageKeys.cart, nextCart)
  }

  const handleRemoveFromCart = (productId: number) => {
    const nextCart = cartItems.filter((item) => item.productId !== productId)
    setCartItems(nextCart)
    persist(storageKeys.cart, nextCart)
  }

  const handleClearCart = () => {
    setCartItems([])
    persist(storageKeys.cart, [])
  }

  const handleSimulatePayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!checkoutProduct && (!checkoutCart || cartLines.length === 0)) return

    const quantity = Number(paymentQuantity)
    if (checkoutProduct && (!Number.isInteger(quantity) || quantity < 1)) {
      setPaymentError('Enter a whole-number quantity of at least 1.')
      return
    }
    if (selectedPaymentMethod?.kind === 'mobile' && !/^(?:\+?255|0)\d{9}$/.test(paymentPhone.replace(/[\s-]/g, ''))) {
      setPaymentError('Enter a Tanzania mobile number, for example 07XXXXXXXX or +2557XXXXXXXX.')
      return
    }

    setPaymentError('')
    setPaymentProcessing(true)
    try {
      const orderLines: OrderLine[] = checkoutCart
        ? cartLines.map((line) => ({
            productName: line.product.name,
            quantity: line.quantity,
            unit: line.product.unit,
            unitPrice: line.unitPrice,
            lineTotal: line.lineTotal,
          }))
        : checkoutProduct
          ? [{
              productName: checkoutProduct.name,
              quantity,
              unit: checkoutProduct.unit,
              unitPrice: checkoutUnitPrice,
              lineTotal: checkoutTotal,
            }]
          : []
      const orderName = checkoutProduct?.name ?? `Cart (${orderLines.length} ${orderLines.length === 1 ? 'product' : 'products'})`
      const result = await createDemoPayment({
        method: paymentMethod,
        phone: paymentPhone.trim(),
        amount: checkoutTotal,
        productName: orderName,
      })
      const record: PaymentRecord = {
        id: result.reference,
        reference: result.reference,
        productName: orderName,
        amount: checkoutTotal,
        method: paymentMethod,
        createdAt: result.createdAt,
        status: result.status,
      }
      const orderRecord: DemoOrderRecord = {
        id: result.reference,
        reference: result.reference,
        lines: orderLines,
        amount: checkoutTotal,
        createdAt: result.createdAt,
        status: result.status,
      }
      const nextPayments = [record, ...paymentRecords]
      const nextOrders = [orderRecord, ...orderRecords]
      const notice: NotificationItem = {
        id: result.timestamp + 2,
        title: 'Demo order recorded',
        text: `${orderName}: ${result.message} No fulfilment or real payment is involved.`,
        time: 'Just now',
      }
      const nextNotifications = [notice, ...notifications]
      setPaymentRecords(nextPayments)
      setOrderRecords(nextOrders)
      setNotifications(nextNotifications)
      persist(storageKeys.payments, nextPayments)
      persist(storageKeys.orders, nextOrders)
      persist(storageKeys.notifications, nextNotifications)
      if (checkoutCart) {
        setCartItems([])
        persist(storageKeys.cart, [])
      }
      setPaymentError(result.message)
    } catch (error) {
      console.error('The demo payment simulation failed.', error)
      setPaymentError(error instanceof Error ? error.message : 'The demo payment could not be simulated.')
    } finally {
      setPaymentProcessing(false)
    }
  }

  const handleRunAutomation = (workflow: (typeof automationWorkflows)[number]) => {
    const { run, notification } = createAutomationRun(workflow)
    const nextRuns = [run, ...automationRuns]
    const nextNotifications = [notification, ...notifications]
    setAutomationRuns(nextRuns)
    setNotifications(nextNotifications)
    persist(storageKeys.automations, nextRuns)
    persist(storageKeys.notifications, nextNotifications)
  }

  const handleClearPaymentRecords = () => {
    setPaymentRecords([])
    persist(storageKeys.payments, [])
  }

  const handleClearAutomationRuns = () => {
    setAutomationRuns([])
    persist(storageKeys.automations, [])
  }

  return (
    <div className="app-shell" data-theme={darkMode ? 'dark' : 'light'}>
      <header className="topbar">
        <div className="brand-wrap">
          <Link className="brand-link" to="/" aria-label="Kijiji Connect home">
            <img className="brand-mark" src="/kijiji-connect-logo.svg" alt="" aria-hidden="true" />
          </Link>
          <div className="brand-copy">
            <p className="brand-name">Kijiji Connect</p>
            <span className="brand-subtitle">Tanzania · Trade, travel & learning</span>
          </div>
        </div>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-expanded={mobileNavOpen}
          aria-controls="primary-navigation"
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {mobileNavOpen ? 'Close menu' : 'Menu'}
        </button>

        <nav id="primary-navigation" className={`main-nav${mobileNavOpen ? ' is-open' : ''}`} aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              className={({ isActive }) => `main-nav__item${isActive ? ' is-active' : ''}`}
              onClick={() => setMobileNavOpen(false)}
            >
              {t.navigation[item.label] ?? item.label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-actions">
          <Link className="ghost-button compact" to="/cart" aria-label={`Open cart, ${cartLines.reduce((total, line) => total + line.quantity, 0)} items`}>
            Cart ({cartLines.reduce((total, line) => total + line.quantity, 0)})
          </Link>
          <button type="button" className="ghost-button" onClick={() => navigateToTarget('catalog-search', true)}>
            Search
          </button>
          <button type="button" className="primary-button" onClick={() => navigateToTarget('product-name', true)}>
            Sell now
          </button>
          <label className="preference-control">
            <span>{t.common.language}</span>
            <select aria-label={t.common.language} value={language} onChange={(event) => updateLanguage(event.target.value as AppLanguage)}>
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
            </select>
          </label>
          <button
            type="button"
            className="theme-toggle"
            aria-pressed={darkMode}
            onClick={toggleDarkMode}
          >
            {darkMode ? t.common.light : t.common.dark}
          </button>
        </div>
      </header>

      <main className="page-shell" data-current-page={currentPage}>
        {!activeRoute ? (
          <section className="section-block route-not-found" aria-labelledby="not-found-heading">
            <span className="eyebrow">404 · Kijiji Connect</span>
            <h1 id="not-found-heading">{t.common.notFound}</h1>
            <p>The page address may have changed, or the page is not available yet.</p>
            <Link className="primary-button" to="/">{t.common.backHome}</Link>
          </section>
        ) : (
          <>
        {storageError && <p className="storage-error" role="alert">{storageError}</p>}
        {standalonePage && (
          <Suspense fallback={<p className="loading-state" role="status">Loading this page…</p>}>
            <StandalonePages
              page={standalonePage}
              product={routeProduct}
              products={products}
              supplierName={supplierSlugFromPath}
              cartLines={cartLines}
              orders={orderRecords}
              cartSubtotal={cartSubtotal}
              onAddToCart={handleAddToCart}
              onUpdateCartQuantity={handleUpdateCartQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              onCheckout={handleOpenCartCheckout}
              onUpdateProduct={handleUpdateOwnedProduct}
              onDeleteProduct={handleRemoveProduct}
            />
          </Suspense>
        )}
        <section id="home" data-route-page="home" className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">One platform · Tanzania-connected</span>
            <h1>{t.headings.home}</h1>
            <p>
              Find local suppliers, build practical language skills, and start planning your northern Tanzania adventure.
            </p>

            <div className="hero-primary-actions">
              <button type="button" className="primary-button" onClick={() => navigateToTarget('marketplace')}>
                Explore the marketplace
              </button>
              <button type="button" className="secondary-button" onClick={() => navigateToTarget('travel-booking')}>
                Plan a trip
              </button>
            </div>

            <div className="search-panel">
              <input
                id="marketplace-search"
                type="search"
                value={homeSearchText}
                onChange={(event) => setHomeSearchText(event.target.value)}
                aria-label="Search products and suppliers"
                placeholder="Search products, businesses, tourism guides, or lessons"
              />
              <button type="button" className="primary-button" onClick={() => openMarketplaceSearch(homeSearchText)}>
                Search
              </button>
            </div>

            <div className="hero-stats" aria-label="Platform summary">
              <div>
                <strong>Local trade</strong>
                <span>Suppliers and buyers</span>
              </div>
              <div>
                <strong>7 learning stages</strong>
                <span>Foundation through extension</span>
              </div>
              <div>
                <strong>Trip planning</strong>
                <span>Routes, stays and local tours</span>
              </div>
            </div>
          </div>

          <div className="hero-highlight">
            <img className="hero-market-art" src="/tanzania-landscape.jpg" alt="Sunset over an open savannah landscape" />
            <div className="highlight-card large">
              <span className="card-label">Sample supplier</span>
              <h3>Fresh produce & construction essentials</h3>
              <ul>
                <li>Export-quality produce</li>
                <li>Bulk pricing available</li>
                <li>On-demand delivery support</li>
              </ul>
            </div>
            <div className="highlight-card small">
              <span className="card-label">Trending now</span>
              <p>{trendingTopics[0]}</p>
            </div>
          </div>
        </section>

        <section id="ai-studio" data-route-page="ai-studio" className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow">AI Studio · Local content assistant</span>
              <h2>Create a stronger first draft for your business.</h2>
            </div>
          </div>

          <div className="phase-layout">
            <form className="phase-form" onSubmit={(event) => { event.preventDefault(); handleGenerateDraft() }}>
              <label>Draft title<input required value={draftForm.title} onChange={(event) => setDraftForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. Fresh mangoes from Arusha" /></label>
              <label>Content type<select value={draftForm.kind} onChange={(event) => setDraftForm((current) => ({ ...current, kind: event.target.value }))}><option>Product description</option><option>Social media post</option><option>Business article</option><option>Video script</option></select></label>
              <label>Topic and details<textarea required rows={3} value={draftForm.topic} onChange={(event) => setDraftForm((current) => ({ ...current, topic: event.target.value }))} placeholder="Describe what the content should communicate" /></label>
              <button type="submit" className="primary-button">Create draft</button>
              <small>Creates starter copy in this browser only. Review factual claims and tone before sharing; no external AI model is connected.</small>
            </form>
            <div className="phase-list">
              {drafts.length === 0 && <p className="empty-state">Your saved drafts will appear here.</p>}
              {drafts.map((draft) => <article key={draft.id} className="phase-card"><span className="badge badge--gold">{draft.kind}</span><h3>{draft.title}</h3><p>{draft.text}</p><button type="button" className="remove-listing" onClick={() => handleRemoveDraft(draft.id)}>Delete draft</button></article>)}
            </div>
          </div>
        </section>

        <section id="automation" data-route-page="automation" className="section-block">
          <div className="section-heading">
            <div><span className="eyebrow">Business operations · Local workflow preview</span><h2>Make recurring business tasks easier to follow.</h2></div>
            <span className="status-pill">Connected services require integration</span>
          </div>
          <p className="phase-note">Preview operational checklists in this browser. No messages are sent, stock is updated or external service is contacted. See Integrations to review what would be required to connect live workflows.</p>
          <div className="automation-grid">
            {automationWorkflows.map((workflow) => (
              <article key={workflow.id} className="automation-card">
                <span className="automation-icon" aria-hidden="true">{workflow.id === 'order-follow-up' ? '01' : workflow.id === 'stock-alert' ? '02' : '03'}</span>
                <h3>{workflow.title}</h3>
                <p><strong>When:</strong> {workflow.trigger}</p>
                <p><strong>Then:</strong> {workflow.action}</p>
                <button type="button" className="secondary-button" onClick={() => handleRunAutomation(workflow)}>Run demo workflow</button>
              </article>
            ))}
          </div>
          {automationRuns.length > 0 && <div className="automation-history"><div className="history-heading"><h3>Recent demo runs</h3><button type="button" className="remove-listing" onClick={handleClearAutomationRuns}>Clear run history</button></div>{automationRuns.slice(0, 3).map((run) => <div key={run.id} className="automation-run"><strong>{run.workflow}</strong><span>{run.outcome}</span><small>{run.time}</small></div>)}</div>}
        </section>

        <section id="learn-languages" data-route-page="learning" className="section-block">
          <div className="section-heading"><div><span className="eyebrow">Language learning · CEFR-informed pathways</span>          <h2>{t.headings.learning}</h2></div></div>
          <LanguageLearningStudio
            completedLessonIds={completedLessons}
            levelScores={lessonScores}
            onLessonPassed={handlePassLearningModule}
            languageId={learningLanguage}
            onLanguageChange={setLearningLanguage}
            levelId={learningLevel}
            onLevelChange={setLearningLevel}
            onPlacementSuggestion={setLearningLevel}
            writingDrafts={writingDrafts}
            onSaveWriting={handleSaveLearningWriting}
          />
        </section>

        <section id="travel-booking" data-route-page="travel" className="section-block travel-booking-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Tanzania travel planning · Enquiry-only demo</span>
              <h2>{t.headings.travel}</h2>
            </div>
            <span className="status-pill">No live fares or hotel availability</span>
          </div>
          <TravelPlanningStudio
            category={travelCategory}
            onCategoryChange={setTravelCategory}
            query={travelQuery}
            onQueryChange={setTravelQuery}
            assistantCommand={travelAssistantCommand}
            requests={travelRequests}
            onRequestCreated={handleSaveTravelRequest}
          />
        </section>

        <section id="community" data-route-page="community" className="section-block">
          <div className="section-heading"><div><span className="eyebrow">Community • Local demo</span><h2>{t.headings.community}</h2></div></div>
          <div className="phase-layout">
            <form className="phase-form" onSubmit={(event) => { event.preventDefault(); handleAddPost() }}>
              <label>Discussion room<select value={postForm.room} onChange={(event) => setPostForm((current) => ({ ...current, room: event.target.value }))}><option>Business & Entrepreneurship</option><option>Education & Careers</option><option>Tourism & Travel</option><option>Culture & Community Stories</option></select></label>
              <label>Title<input required value={postForm.title} onChange={(event) => setPostForm((current) => ({ ...current, title: event.target.value }))} /></label>
              <label>Your post<textarea required rows={4} value={postForm.text} onChange={(event) => setPostForm((current) => ({ ...current, text: event.target.value }))} /></label>
              <button type="submit" className="primary-button">Publish to this browser</button>
              <small>Posts are stored only in this browser. Community moderation and multi-user publishing need a backend.</small>
            </form>
            <div className="phase-list">
              {posts.length === 0 && <p className="empty-state">Be the first to start a discussion.</p>}
              {posts.map((post) => <article key={post.id} className="phase-card"><span className="badge badge--green">{post.room}</span><h3>{post.title}</h3><p>{post.text}</p><small>{post.author}</small><button type="button" className="remove-listing" onClick={() => handleRemovePost(post.id)}>Delete post</button></article>)}
            </div>
          </div>
        </section>

        <section id="tourism-heritage" data-route-page="destinations" className="section-block">
          <div className="section-heading"><div><span className="eyebrow">Tourism & Heritage · Regional inspiration</span><h2>Explore Tanzania with local context.</h2></div></div>
          <div className="tour-grid">{tourismPlaces.map((place) => <article key={place.title} className="tour-card"><img src={place.image} alt={place.imageAlt} loading="lazy" onError={(event) => { if (event.currentTarget.src.endsWith('/kijiji-product-art.svg')) event.currentTarget.hidden = true; else event.currentTarget.src = '/kijiji-product-art.svg' }} /><div className="tour-card__body"><span className="badge badge--gold">{place.location}</span><h3>{place.title}</h3><p>{place.text}</p><button type="button" className="secondary-button" onClick={() => {
            setTravelCategory('packages')
            setTravelQuery(place.location === 'Ngorongoro' ? 'Arusha' : place.location)
            navigateToTarget('travel-booking')
          }}>Explore nearby plans</button></div></article>)}</div>
          <p className="phase-note">Visitor details and availability should be confirmed with official destination operators before travel.</p>
        </section>

        <section id="integrations" data-route-page="integrations" className="section-block integration-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Customer channels · Integration readiness</span>
              <h2>Designed to connect—once secure services are configured.</h2>
            </div>
            <span className="status-pill">Live integrations not configured</span>
          </div>
          <p className="phase-note">The guided assistant can prepare local drafts and contact links. It does not send or read customer messages, access an inbox, confirm bookings or initiate payments.</p>
          <div className="integration-grid">
            {[
              { name: 'AI service & booking assistant', status: 'Provider and server endpoint required', description: 'Secure server integration, privacy notice and tested booking knowledge base.' },
              { name: 'WhatsApp Business', status: 'Not connected', description: 'Business API number, consent, verified webhook and approved templates.' },
              { name: 'Email & customer support', status: 'Prefilled draft links only', description: 'Verified sending domain, backend mail service, inbox ownership and reply handling.' },
              { name: 'Hotels, airlines & tour operators', status: 'Not connected', description: 'Contracted inventory API or verified licensed-provider booking links.' },
              { name: 'Mobile money & card payments', status: 'Sandbox display only', description: 'An authorized payment gateway, server-side checkout, signed webhooks and reconciliation.' },
              { name: 'Customer accounts & reservations', status: 'Not configured', description: 'Secure authentication, database, role permissions and privacy-compliant retention.' },
            ].map((integration) => (
              <article className="integration-card" key={integration.name}>
                <span className="integration-status-dot" aria-hidden="true" />
                <div><span className="integration-card__label">Connection status</span><h3>{integration.name}</h3></div>
                <strong>{integration.status}</strong>
                <p>{integration.description}</p>
              </article>
            ))}
          </div>
          <div className="integration-next-step">
            <div><strong>Start an integration conversation</strong><span>WhatsApp and email open a draft for you to review. They do not contact anyone until you press Send.</span></div>
            <a className="primary-button compact" href={whatsappUrl('Hello, I would like to discuss setting up secure email, WhatsApp Business, AI assistant, booking, and payment integrations for Kijiji Connect.')} target="_blank" rel="noreferrer">Contact about integrations</a>
          </div>
        </section>

        <section id="ai-assistant" data-route-page="contact" className="section-block assistant-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Site-wide guided assistant</span>
              <h2>Get help and complete demo tasks across the platform</h2>
            </div>
            <span className="status-pill">Local assistant • no external AI</span>
          </div>

          <div className="assistant-layout">
            <div className="assistant-panel">
              <ChatTranscript messages={messages} />

              <div className="chat-input-row">
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Search, create a draft, run a demo workflow..."
                  aria-label="Chat with AI assistant"
                />
                <button type="button" className="primary-button" onClick={() => handleSendMessage()}>
                  Send
                </button>
              </div>

              <div className="prompt-row">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="prompt-chip"
                    onClick={() => handleSendMessage(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="contact-panel">
              <h3>Contact & support</h3>
              <a className="primary-button contact-cta" href={whatsappSupportUrl} target="_blank" rel="noreferrer">
                Chat on WhatsApp
              </a>
              <div className="contact-list">
                {businessContactLinks.map((item) => (
                  <a key={`${item.label}-${item.value}`} href={item.href} className="contact-item" target="_blank" rel="noreferrer">
                    <span className="contact-label">{item.label}</span>
                    <strong>{item.value}</strong>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="marketplace" data-route-page="marketplace" className="section-block marketplace-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Marketplace · Sample listings</span>
              <h2>{t.headings.marketplace}</h2>
            </div>
            <a className="primary-button compact seller-register-link" href={whatsappUrl('Hello, I would like to register as a seller on Kijiji Connect.')} target="_blank" rel="noreferrer">
              Ask about seller registration
            </a>
          </div>

          <p className="phase-note">The catalogue contains more than 40 illustrative examples, not verified supplier offers. Sample prices and stock labels are placeholders; confirm availability and pricing directly with sellers. Sample catalogue date: {catalogueLastUpdated}. Search and filter settings can be shared as a URL.</p>

          <div className="market-search-panel">
            <label htmlFor="catalog-search">Search products and suppliers</label>
            <input
              id="catalog-search"
              type="search"
              value={searchText}
              onChange={(event) => updateMarketplaceParams({ q: event.target.value })}
              placeholder="Product, category, supplier or location"
            />
          </div>

          <div className="market-toolbar">
            <div className="toggle-row" role="group" aria-label="Product audience filter">
              {['All Products', 'B2B', 'B2C'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={activeFilter === filter ? 'segment active' : 'segment'}
                  aria-pressed={activeFilter === filter}
                  onClick={() => updateMarketplaceParams({ audience: filter === 'All Products' ? '' : filter })}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="market-filters">
              <label>Category
                <select aria-label="Category filter" value={activeCategory} onChange={(event) => updateMarketplaceParams({ category: event.target.value === 'All categories' ? '' : event.target.value })}>
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label>Location
                <input aria-label="Location filter" type="search" value={locationFilter} onChange={(event) => updateMarketplaceParams({ location: event.target.value })} placeholder="Any location" />
              </label>
              <label>Minimum price (TZS)
                <input aria-label="Minimum price" type="number" min="0" value={searchParams.get('minPrice') ?? ''} onChange={(event) => updateMarketplaceParams({ minPrice: event.target.value })} />
              </label>
              <label>Maximum price (TZS)
                <input aria-label="Maximum price" type="number" min="0" value={searchParams.get('maxPrice') ?? ''} onChange={(event) => updateMarketplaceParams({ maxPrice: event.target.value })} />
              </label>
              <label>Sample availability
                <select aria-label="Sample availability filter" value={activeStock} onChange={(event) => updateMarketplaceParams({ stock: event.target.value })}>
                  <option value="">Any sample status</option>
                  {[...sampleAvailability, 'Contact to confirm'].map((stock) => <option key={stock}>{stock}</option>)}
                </select>
              </label>
              <label>Sort by
                <select aria-label="Sort products" value={sortBy} onChange={(event) => updateMarketplaceParams({ sort: event.target.value === 'relevance' ? '' : event.target.value })}>
                  <option value="relevance">Catalogue order</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </label>
              <button type="button" className="ghost-button small" onClick={clearMarketplaceParams}>Clear filters</button>
            </div>
          </div>

          <section className="market-cart-panel" aria-labelledby="market-cart-title">
            <div className="market-cart-heading">
              <div>
                <h3 id="market-cart-title">Your local demo cart</h3>
                <p aria-live="polite">{cartLines.reduce((total, line) => total + line.quantity, 0)} items · saved only in this browser</p>
              </div>
              {cartLines.length > 0 && <button type="button" className="remove-listing" onClick={handleClearCart}>Empty cart</button>}
            </div>
            {cartLines.length === 0 ? (
              <p className="empty-state">Add sample listings to prepare a sandbox checkout. Nothing is reserved or purchased.</p>
            ) : (
              <>
                <div className="market-cart-items">
                  {cartLines.map((line) => (
                    <div key={line.product.id} className="market-cart-item">
                      <div>
                        <strong>{line.product.name}</strong>
                        <small>{formatTzs(line.unitPrice)} per {line.product.unit} · illustrative price</small>
                      </div>
                      <label>
                        Quantity
                        <input
                          type="number"
                          min="1"
                          step="1"
                          aria-label={`Quantity for ${line.product.name}`}
                          value={line.quantity}
                          onChange={(event) => handleUpdateCartQuantity(line.product.id, event.target.value)}
                        />
                      </label>
                      <strong>{formatTzs(line.lineTotal)}</strong>
                      <button
                        type="button"
                        className="remove-listing"
                        aria-label={`Remove ${line.product.name} from cart`}
                        onClick={() => handleRemoveFromCart(line.product.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="market-cart-total">
                  <span>Illustrative subtotal</span>
                  <strong>{formatTzs(cartSubtotal)}</strong>
                  <button type="button" className="primary-button" onClick={handleOpenCartCheckout}>Review sandbox checkout</button>
                </div>
              </>
            )}
          </section>

          <div id="product-listing-form" className="listing-form-wrap">
            <h3>Publish a demo listing</h3>
            <p>Enter accurate details to add a listing in this browser. Listings are not visible to other users until a backend is connected.</p>
            <form className="listing-form" onSubmit={(event) => { event.preventDefault(); handleAddProduct() }}>
              <label>Product name<input id="product-name" required value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} /></label>
              <label>Category<select value={productForm.category} onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))}>{categories.filter((category) => category !== 'All categories').map((category) => <option key={category}>{category}</option>)}</select></label>
              <label>Description<textarea required rows={3} value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} /></label>
              <label>Retail price (TZS)<input required type="number" min="1" step="1" value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} /></label>
              <label>Wholesale price (TZS)<input required type="number" min="1" step="1" value={productForm.wholesalePrice} onChange={(event) => setProductForm((current) => ({ ...current, wholesalePrice: event.target.value }))} /></label>
              <label>Minimum wholesale quantity<input required type="number" min="1" step="1" value={productForm.minimumWholesaleQty} onChange={(event) => setProductForm((current) => ({ ...current, minimumWholesaleQty: event.target.value }))} /></label>
              <label>Unit<input value={productForm.unit} onChange={(event) => setProductForm((current) => ({ ...current, unit: event.target.value }))} /></label>
              <label>Location<input value={productForm.location} onChange={(event) => setProductForm((current) => ({ ...current, location: event.target.value }))} /></label>
              <label>Business/seller name<input required value={productForm.seller} onChange={(event) => setProductForm((current) => ({ ...current, seller: event.target.value }))} /></label>
              <label>Buyer type<select value={productForm.audience} onChange={(event) => setProductForm((current) => ({ ...current, audience: event.target.value as ProductAudience }))}><option value="B2C">B2C retail</option><option value="B2B">B2B wholesale</option></select></label>
              {productFormError && <p className="storage-error" role="alert">{productFormError}</p>}
              <button type="submit" className="primary-button">Publish listing locally</button>
            </form>
          </div>

          <p className="market-result-count" role="status">
            {filteredProducts.length === 0
              ? 'No sample listings match these filters.'
              : `Showing ${(visiblePage - 1) * productsPerPage + 1}–${Math.min(visiblePage * productsPerPage, filteredProducts.length)} of ${filteredProducts.length} sample listings${searchText.trim() ? ` for "${searchText.trim()}"` : ''}.`}
          </p>
          <div className="market-grid">
            {visibleProducts.map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-image-wrap">
                    <Link to={`/products/${product.id}`} aria-label={`View ${product.name} details`}>
                      <img src={product.image} alt={product.name} loading="lazy" onError={(event) => { if (event.currentTarget.src.endsWith('/kijiji-product-art.svg')) event.currentTarget.hidden = true; else event.currentTarget.src = '/kijiji-product-art.svg' }} />
                    </Link>
                  <span className="product-status">{product.stock}</span>
                </div>

                <div className="product-body">
                  <div className="product-meta-row">
                    <span className="badge badge--green">{product.category}</span>
                    <span className="badge badge--gold">Sample listing</span>
                  </div>

                  <h3><Link to={`/products/${product.id}`}>{product.name}</Link></h3>
                  <p>{product.description}</p>

                  <div className="product-pricing">
                    <div>
                      <span className="label">Retail</span>
                      <strong>{formatTzs(product.price)}</strong>
                    </div>
                    <div>
                      <span className="label">Wholesale</span>
                      <strong>{formatTzs(product.wholesalePrice)}</strong>
                    </div>
                  </div>

                  <div className="product-details">
                    <span>MOQ: {product.minimumWholesaleQty} {product.unit}</span>
                    <span>{product.location}</span>
                    <span>{product.audience.join(' / ')}</span>
                  </div>

                  <div className="seller-row">
                    <div>
                      <strong>{product.seller}</strong>
                      <small>{product.unit}</small>
                    </div>
                    <div className="seller-actions">
                      <a className="secondary-button contact-seller" href={whatsappUrl(`Hello, I am interested in ${product.name} from ${product.seller}. Please share availability and pricing.`)} target="_blank" rel="noreferrer">Ask about product</a>
                      <button
                        type="button"
                        className="secondary-button add-to-cart-button"
                        aria-label={`Add ${product.name} to cart`}
                        onClick={() => handleAddToCart(product)}
                      >
                        {cartItems.find((item) => item.productId === product.id)
                          ? `Add another (${cartItems.find((item) => item.productId === product.id)?.quantity} in cart)`
                          : 'Add to cart'}
                      </button>
                      <Link className="secondary-button" to={`/products/${product.id}`}>Details</Link>
                      <button type="button" className="primary-button buy-button" onClick={() => handleOpenCheckout(product)}>Buy now</button>
                      {product.isDemoUserListing && <button type="button" className="remove-listing" onClick={() => handleRemoveProduct(product.id)}>Remove</button>}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="empty-state">
              <p>Try another search or clear the filters to see the full sample catalogue.</p>
              <button type="button" className="secondary-button" onClick={clearMarketplaceParams}>Clear all filters</button>
            </div>
          )}
          {pageCount > 1 && (
            <nav className="market-pagination" aria-label="Marketplace pages">
              <button type="button" className="secondary-button" disabled={visiblePage === 1} onClick={() => updateMarketplaceParams({ page: String(visiblePage - 1) }, true)}>Previous</button>
              <span aria-live="polite">Page {visiblePage} of {pageCount}</span>
              <button type="button" className="secondary-button" disabled={visiblePage === pageCount} onClick={() => updateMarketplaceParams({ page: String(visiblePage + 1) }, true)}>Next</button>
            </nav>
          )}
        </section>

        <section id="payments" data-route-page="payments" className="section-block">
          <div className="section-heading">
            <div><span className="eyebrow">Tanzania payment methods • Sandbox</span><h2>Choose a familiar way to pay</h2></div>
            <span className="status-pill">Demo API · No real charges</span>
          </div>
          <p className="phase-note">Explore simulated mobile money, bank transfer and card checkout. These are interface placeholders only—not live provider connections or an exhaustive list. Do not enter real payment secrets or card details.</p>
          <div className="payment-method-grid">
            {demoPaymentMethods.map((method, index) => (
              <article key={method.id} className="payment-method-card">
                <span className={`payment-method-mark payment-mark-${index + 1}`}>{method.label.slice(0, 2).toUpperCase()}</span>
                <div><h3>{method.label}</h3><p>{method.provider}</p></div>
                <span className="payment-demo-tag">Sandbox</span>
              </article>
            ))}
          </div>
          <div className="payment-history">
            <div className="payment-history-heading"><div><h3>Recent checkout simulations</h3><p>Local records only; no settlement or payment confirmation.</p></div><div className="payment-history-actions"><strong>{paymentRecords.length} demo {paymentRecords.length === 1 ? 'record' : 'records'}</strong>{paymentRecords.length > 0 && <button type="button" className="remove-listing" onClick={handleClearPaymentRecords}>Clear history</button>}</div></div>
            {paymentRecords.length === 0 ? <p className="empty-state">Checkout simulations will be listed here.</p> : paymentRecords.slice(0, 5).map((record) => (
              <div key={record.id} className="payment-record">
                <div><strong>{record.productName}</strong><small>{demoPaymentMethods.find((method) => method.id === record.method)?.label ?? record.method} · {record.createdAt}</small></div>
                <strong>{formatTzs(record.amount)}</strong>
                <span className="payment-demo-tag">{record.status}</span>
                <small>{record.reference}</small>
              </div>
            ))}
          </div>
          <div className="payment-history">
            <div className="payment-history-heading">
              <div><h3>Local demo order log</h3><p>These records are checkout simulations only—not paid, confirmed, or fulfilled orders.</p></div>
              <strong>{orderRecords.length} demo {orderRecords.length === 1 ? 'order' : 'orders'}</strong>
            </div>
            {orderRecords.length === 0 ? (
              <p className="empty-state">Orders created through sandbox checkout will appear here.</p>
            ) : orderRecords.slice(0, 10).map((order) => (
              <div key={order.id} className="payment-record">
                <div>
                  <strong>{order.lines.map((line) => `${line.productName} × ${line.quantity}`).join(', ')}</strong>
                  <small>{order.createdAt} · {order.lines.length} {order.lines.length === 1 ? 'product' : 'products'}</small>
                </div>
                <strong>{formatTzs(order.amount)}</strong>
                <span className="payment-demo-tag">{order.status}</span>
                <small>{order.reference}</small>
              </div>
            ))}
          </div>
        </section>

        <section id="notifications" data-route-page="activity" className="section-block">
          <div className="section-heading"><div><span className="eyebrow">Notifications</span><h2>Recent activity in this browser</h2></div>{notifications.length > 0 && <button type="button" className="ghost-button small notification-clear" onClick={handleClearNotifications}>Clear notifications</button>}</div>
          <div className="phase-list">
            {notifications.length === 0 && <p className="empty-state">Activity from new drafts and community posts will appear here.</p>}
            {notifications.map((item) => <article key={item.id} className="phase-card notification-card"><div><h3>{item.title}</h3><p>{item.text}</p></div><small>{item.time}</small><button type="button" className="remove-listing" aria-label={`Dismiss ${item.title}`} onClick={() => handleRemoveNotification(item.id)}>Dismiss</button></article>)}
          </div>
        </section>

        <section id="my-account" data-route-page="account" className="section-block">
          <div className="section-heading"><div><span className="eyebrow">MY ACCOUNT · AUTHENTICATION SETUP</span><h2>{t.headings.account}</h2></div></div>
          <div className="account-grid">
            <SupabaseAuthPanel />
            <article className="phase-card"><h3>Workspace activity</h3><ul className="activity-list"><li>Marketplace listings: {products.length}</li><li>Cart items: {cartLines.reduce((total, line) => total + line.quantity, 0)}</li><li>Demo order records: {orderRecords.length}</li><li>Content drafts: {drafts.length}</li><li>Community posts: {posts.length}</li><li>Lessons completed: {completedLessons.length}</li></ul></article>
          </div>
        </section>

        <section className="section-block supplier-section" data-route-page="home">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Supplier discovery · Sample profiles</span>
              <h2>Example businesses from the local catalogue</h2>
            </div>
          </div>

          <div className="supplier-grid">
            {suppliers.map((supplier) => {
              const listingCount = products.filter((product) =>
                product.seller.toLowerCase().includes(supplier.name.toLowerCase()),
              ).length
              return (
                <article key={supplier.name} className="supplier-card">
                  <div className="supplier-icon">{supplier.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div className="supplier-headline">
                        <h3><Link to={`/suppliers/${supplier.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}>{supplier.name}</Link></h3>
                      <span className="badge badge--gold">Sample profile</span>
                    </div>
                    <p>{supplier.category}</p>
                    <small>{supplier.location}</small>
                  </div>
                  <div className="supplier-footer">
                    <span>{listingCount} sample listing{listingCount === 1 ? '' : 's'}</span>
                    <button
                      type="button"
                      className="ghost-button small"
                      onClick={() => openMarketplaceSearch(supplier.name)}
                    >
                      View supplier listings
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="section-block insight-section" data-route-page="home">
          <div className="feature-panel">
            <div>
              <span className="eyebrow">Marketplace advantages</span>
              <h2>Designed for practical buying, selling and discovery.</h2>
            </div>
            <ul>
              <li>Search and filter illustrative product and supplier listings.</li>
              <li>Review sample wholesale pricing and minimum order quantities.</li>
              <li>Connect a secure backend before handling real orders and payments.</li>
            </ul>
          </div>
        </section>
          </>
        )}
      </main>

      <aside className={`assistant-widget${assistantOpen ? ' is-open' : ''}`} aria-label="Kijiji Connect guided assistant">
        <section id="assistant-widget-panel" className="assistant-widget__panel" aria-label="Guided assistant chat" hidden={!assistantOpen}>
            <div className="assistant-widget__heading">
              <div>
                <strong>Kijiji Connect assistant</strong>
                <span>Guided help · local demo</span>
              </div>
              <button type="button" className="ghost-button small" aria-label="Close assistant" onClick={() => setAssistantOpen(false)}>Close</button>
            </div>
            <ChatTranscript messages={messages} />
            <form className="chat-input-row assistant-widget__form" onSubmit={(event) => { event.preventDefault(); handleSendMessage() }}>
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask or request an action..."
                aria-label="Message the Kijiji Connect assistant"
              />
              <button type="submit" className="primary-button">Send</button>
            </form>
            <div className="prompt-row assistant-widget__prompts">
              {quickPrompts.map((prompt) => (
                <button key={prompt} type="button" className="prompt-chip" onClick={() => handleSendMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
            <p className="assistant-widget__disclaimer">Local guidance only. No external AI or live transactions.</p>
        </section>
        <button
          type="button"
          className="assistant-widget__launcher"
          aria-controls="assistant-widget-panel"
          aria-expanded={assistantOpen}
          onClick={() => setAssistantOpen((current) => !current)}
        >
          <span aria-hidden="true">{assistantOpen ? '×' : '✦'}</span>
          {assistantOpen ? 'Close assistant' : 'Ask Kijiji assistant'}
        </button>
      </aside>

      {(checkoutProduct || checkoutCart) && (
        <div className="checkout-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) handleCloseCheckout() }}>
          <section className="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
            <div className="checkout-heading">
              <div><span className="eyebrow">Sandbox checkout</span><h2 id="checkout-title">Review your demo order</h2></div>
              <button type="button" className="checkout-close" aria-label="Close checkout" onClick={handleCloseCheckout} disabled={paymentProcessing}>×</button>
            </div>
            {checkoutProduct ? (
              <div className="checkout-product"><div><strong>{checkoutProduct.name}</strong><small>{checkoutProduct.seller} · {checkoutProduct.location}</small></div><strong>{formatTzs(checkoutTotal)}</strong></div>
            ) : (
              <div className="checkout-cart-summary">
                {cartLines.map((line) => (
                  <div key={line.product.id} className="checkout-product">
                    <div><strong>{line.product.name}</strong><small>{line.quantity} {line.product.unit} · {formatTzs(line.unitPrice)} each</small></div>
                    <strong>{formatTzs(line.lineTotal)}</strong>
                  </div>
                ))}
                <div className="checkout-product checkout-product-total"><strong>Illustrative subtotal</strong><strong>{formatTzs(checkoutTotal)}</strong></div>
              </div>
            )}
            <form className="checkout-form" onSubmit={handleSimulatePayment}>
              {checkoutProduct && (
                <>
                  <label>Quantity
                    <input type="number" min="1" step="1" required value={paymentQuantity} onChange={(event) => setPaymentQuantity(event.target.value)} />
                  </label>
                  <p className="checkout-price-note">{parsedQuantity >= checkoutProduct.minimumWholesaleQty ? `Illustrative wholesale price applies from ${checkoutProduct.minimumWholesaleQty} ${checkoutProduct.unit}.` : `Illustrative retail price: ${formatTzs(checkoutProduct.price)} per ${checkoutProduct.unit}.`}</p>
                </>
              )}
              <fieldset className="payment-method-picker">
                <legend>Choose a demo payment method</legend>
                {demoPaymentMethods.map((method) => (
                  <label key={method.id} className={paymentMethod === method.id ? 'payment-choice selected' : 'payment-choice'}>
                    <input type="radio" name="payment-method" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} />
                    <span><strong>{method.label}</strong><small>{method.provider}</small></span>
                  </label>
                ))}
              </fieldset>
              {selectedPaymentMethod?.kind === 'mobile' && <label>Mobile money number<input type="tel" required inputMode="tel" autoComplete="tel" value={paymentPhone} onChange={(event) => setPaymentPhone(event.target.value)} placeholder="+255 7XX XXX XXX" /></label>}
              {selectedPaymentMethod?.kind !== 'mobile' && <p className="checkout-price-note">No bank or card details are requested or processed in this demo.</p>}
              <p className="payment-warning">Simulation only: pressing the button below will not contact a payment provider or charge money.</p>
              {paymentError && <p className={paymentError.startsWith('Demo only:') ? 'payment-result' : 'storage-error'} role="status">{paymentError}</p>}
              <button type="submit" className="primary-button checkout-submit" disabled={paymentProcessing}>{paymentProcessing ? 'Simulating checkout…' : 'Simulate payment'}</button>
            </form>
          </section>
        </div>
      )}

      <footer className="page-footer">
        <div>
          <p className="brand-name">Kijiji Connect</p>
          <small>Professional platform for trade, community, learning and heritage.</small>
        </div>
        <nav className="footer-sitemap" aria-label="Footer sitemap">
          <p>Explore</p>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/seller">Seller workspace · demo</Link>
          <Link to="/admin">Moderation · demo</Link>
          <Link to="/learning">Language Academy</Link>
          <Link to="/travel">Travel planning</Link>
          <Link to="/articles">Articles</Link>
          <Link to="/about">About</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
        <div>
          <p>Arusha, Tanzania</p>
          <small>Sample business information for development only.</small>
        </div>
        <div className="footer-contact-block">
          <p>Business contact</p>
          <small>
            <a href={businessContact.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp: {businessContact.phone}</a>
          </small>
          {businessContact.emails.map((email) => <small key={email}><a href={`mailto:${email}`}>{email}</a></small>)}
          {businessContact.instagramHandles.map((handle) => <small key={handle}><a href={`https://instagram.com/${handle}`} target="_blank" rel="noreferrer">Instagram: @{handle}</a></small>)}
        </div>
      </footer>
    </div>
  )
}

export default App
