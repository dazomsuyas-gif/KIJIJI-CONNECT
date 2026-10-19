import { useState, type FormEvent } from 'react'
import './App.css'
import { generateDemoContent } from './services/demoAi'
import {
  createDemoPayment,
  demoPaymentMethods,
  type DemoPaymentMethodId,
} from './services/demoPayments'

type ProductAudience = 'B2B' | 'B2C'

type Product = {
  id: number
  name: string
  category: string
  description: string
  price: number
  wholesalePrice: number
  minimumWholesaleQty: number
  unit: string
  location: string
  seller: string
  audience: ProductAudience[]
  stock: string
  image: string
  isDemoUserListing?: boolean
}

type Message = {
  id: number
  role: 'user' | 'assistant'
  text: string
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

type AutomationRun = {
  id: string
  workflow: string
  outcome: string
  time: string
}

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Marketplace', href: '#marketplace' },
  { label: 'Payments', href: '#payments' },
  { label: 'AI Studio', href: '#ai-studio' },
  { label: 'Automation', href: '#automation' },
  { label: 'Learn Languages', href: '#learn-languages' },
  { label: 'Community', href: '#community' },
  { label: 'Tourism & Heritage', href: '#tourism-heritage' },
  { label: 'AI Assistant', href: '#ai-assistant' },
  { label: 'Notifications', href: '#notifications' },
  { label: 'My Account', href: '#my-account' },
]

const categories = [
  'All categories',
  'Agricultural products',
  'Food & beverages',
  'Construction materials',
  'Electronics',
  'Household goods',
  'Clothing & fashion',
  'Furniture',
  'Personal care',
  'Office supplies',
  'Tourism products',
  'Other merchandise',
]

const contactLinks = [
  {
    label: 'WhatsApp',
    value: '+255 768 868 546',
    href: 'https://wa.me/255768868546',
  },
  {
    label: 'Email',
    value: 'msuyakelvin27@gmail.com',
    href: 'mailto:msuyakelvin27@gmail.com',
  },
  {
    label: 'Email',
    value: 'kelvinmsuya63@gmail.com',
    href: 'mailto:kelvinmsuya63@gmail.com',
  },
  {
    label: 'Email',
    value: 'dazomsuyas@gmail.com',
    href: 'mailto:dazomsuyas@gmail.com',
  },
  {
    label: 'Instagram',
    value: '@mk_africa21',
    href: 'https://instagram.com/mk_africa21',
  },
  {
    label: 'Instagram',
    value: '@kelvin_electronic_tz',
    href: 'https://instagram.com/kelvin_electronic_tz',
  },
]

const quickPrompts = [
  'How do I register as a seller?',
  'How do I list a product?',
  'How do I request a quote?',
  'How do I contact support?',
]

const storageKeys = {
  products: 'kijiji-connect-products',
  drafts: 'kijiji-connect-drafts',
  posts: 'kijiji-connect-posts',
  lessons: 'kijiji-connect-completed-lessons',
  notifications: 'kijiji-connect-notifications',
  payments: 'kijiji-connect-demo-payments',
  automations: 'kijiji-connect-demo-automation-runs',
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

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback

  try {
    const storedValue = window.localStorage.getItem(key)
    return storedValue ? (JSON.parse(storedValue) as T) : fallback
  } catch (error) {
    console.error(`Could not read ${key} from local storage.`, error)
    return fallback
  }
}

function writeStored<T>(key: string, value: T): void {
  window.localStorage.setItem(key, JSON.stringify(value))
}

const lessonCatalog = [
  { id: 'business-english', language: 'English', level: 'Beginner', title: 'Business English for sellers', text: 'Practice greetings, product details, prices and polite customer replies.' },
  { id: 'french-greetings', language: 'French', level: 'Beginner', title: 'French greetings and introductions', text: 'Learn simple greetings and introduce yourself to a new customer.' },
  { id: 'mandarin-basics', language: 'Chinese', level: 'Beginner', title: 'Mandarin pronunciation basics', text: 'Explore pinyin and tone awareness for practical speaking confidence.' },
  { id: 'swahili-trade', language: 'Swahili', level: 'Beginner', title: 'Swahili for trade', text: 'Useful phrases for asking prices, quantities and delivery details.' },
]

const tourismPlaces = [
  { title: 'Arusha National Park', location: 'Arusha', text: 'A scenic park with wildlife, mountain views and hiking routes close to the city.', image: '/tanzania-landscape.jpg', imageAlt: 'Representative savannah landscape; not a verified photograph of the park.' },
  { title: 'Olduvai Gorge', location: 'Ngorongoro', text: 'A significant archaeological site linked to human origins and ongoing research.', image: '/kijiji-travel-art.svg', imageAlt: 'Illustration inspired by Tanzania tourism.' },
  { title: 'Cultural Heritage Centre', location: 'Arusha', text: 'Discover arts, crafts, heritage displays and local knowledge.', image: '/kijiji-market-art.svg', imageAlt: 'Illustration of a local marketplace.' },
]

const whatsappUrl = (message: string) =>
  `https://wa.me/255768868546?text=${encodeURIComponent(message)}`

const whatsappSupportUrl = whatsappUrl('Hello Kijiji Connect, I need support with selling or buying on the platform.')

const productsSeed: Product[] = [
  {
    id: 1,
    name: 'Fresh Avocado Grade A',
    category: 'Agricultural products',
    description: 'Large, export-ready avocados harvested in Arusha with careful grading and packing.',
    price: 4200,
    wholesalePrice: 3200,
    minimumWholesaleQty: 30,
    unit: 'kg',
    location: 'Arusha Urban',
    seller: 'Green Valley Farms',
    audience: ['B2B', 'B2C'],
    stock: 'In stock',
    image: '/fresh-produce.jpg',
  },
  {
    id: 2,
    name: 'Cement 50kg Premium',
    category: 'Construction materials',
    description: 'High-strength Portland cement suitable for construction and masonry projects.',
    price: 28000,
    wholesalePrice: 24500,
    minimumWholesaleQty: 10,
    unit: 'bag',
    location: 'Moshi Road',
    seller: 'BuildPro Supplies',
    audience: ['B2B', 'B2C'],
    stock: 'Low stock',
    image: '/kijiji-construction-art.svg',
  },
  {
    id: 3,
    name: 'Solar Rechargeable Lantern',
    category: 'Electronics',
    description: 'Portable, rechargeable lighting for homes, shops and field use with USB charging.',
    price: 26000,
    wholesalePrice: 21000,
    minimumWholesaleQty: 25,
    unit: 'piece',
    location: 'Central Arusha',
    seller: 'VoltEast Traders',
    audience: ['B2B', 'B2C'],
    stock: 'Available',
    image: '/kijiji-electronics-art.svg',
  },
  {
    id: 4,
    name: 'Premium Chai Masala Blend',
    category: 'Food & beverages',
    description: 'Handcrafted spiced tea blend for cafés, lodges and home kitchens.',
    price: 8500,
    wholesalePrice: 6200,
    minimumWholesaleQty: 40,
    unit: 'pack',
    location: 'Njiro',
    seller: 'Amani Kitchen Co.',
    audience: ['B2C'],
    stock: 'In stock',
    image: '/fresh-produce.jpg',
  },
  {
    id: 5,
    name: 'Ergonomic Office Chair',
    category: 'Office supplies',
    description: 'Supportive seating for startups, schools and home offices with easy adjustability.',
    price: 175000,
    wholesalePrice: 152000,
    minimumWholesaleQty: 5,
    unit: 'piece',
    location: 'Sokoine Road',
    seller: 'Urban Workspace',
    audience: ['B2B'],
    stock: 'Available',
    image: '/kijiji-product-art.svg',
  },
  {
    id: 6,
    name: 'Safari Travel Kit',
    category: 'Tourism products',
    description: 'Compact travel set for tourists and tour operators including reusable bottle and daypack.',
    price: 34000,
    wholesalePrice: 27000,
    minimumWholesaleQty: 20,
    unit: 'box',
    location: 'Arusha City Centre',
    seller: 'Serengeti Trail Goods',
    audience: ['B2B', 'B2C'],
    stock: 'Preorder',
    image: '/kijiji-travel-art.svg',
  },
]

const suppliers = [
  {
    name: 'Green Valley Farms',
    category: 'Agriculture',
    location: 'Arusha Urban',
    items: 18,
  },
  {
    name: 'BuildPro Supplies',
    category: 'Construction',
    location: 'Moshi Road',
    items: 12,
  },
  {
    name: 'VoltEast Traders',
    category: 'Electronics',
    location: 'Central Arusha',
    items: 8,
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

const productArtworkFor = (category: string) => {
  if (category === 'Agricultural products' || category === 'Food & beverages') return '/fresh-produce.jpg'
  if (category === 'Construction materials') return '/kijiji-construction-art.svg'
  if (category === 'Electronics') return '/kijiji-electronics-art.svg'
  if (category === 'Tourism products') return '/kijiji-travel-art.svg'
  return '/kijiji-product-art.svg'
}

function App() {
  const [activeFilter, setActiveFilter] = useState<'All Products' | 'B2B' | 'B2C'>('All Products')
  const [activeCategory, setActiveCategory] = useState('All categories')
  const [searchText, setSearchText] = useState('')
  const [products, setProducts] = useState<Product[]>(() =>
    readStored(storageKeys.products, productsSeed).map((product) =>
      product.image.startsWith('/') ? product : { ...product, image: productArtworkFor(product.category) },
    ),
  )
  const [drafts, setDrafts] = useState<Draft[]>(() => readStored(storageKeys.drafts, []))
  const [posts, setPosts] = useState<CommunityPost[]>(() => readStored(storageKeys.posts, []))
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => readStored(storageKeys.lessons, []))
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => readStored(storageKeys.notifications, []))
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(() => readStored(storageKeys.payments, []))
  const [automationRuns, setAutomationRuns] = useState<AutomationRun[]>(() => readStored(storageKeys.automations, []))
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null)
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      text: 'Hello! I am the guided Kijiji Connect assistant. Ask me about buying, selling, wholesale enquiries, or business support.',
    },
  ])

  const persist = <T,>(key: string, value: T) => {
    try {
      writeStored(key, value)
    } catch (error) {
      console.error(`Could not save ${key} to local storage.`, error)
      setStorageError('Your browser could not save this demo data. Check browser storage settings and try again.')
    }
  }

  const visibleProducts = products.filter((product) => {
    const matchesFilter =
      activeFilter === 'All Products' || product.audience.includes(activeFilter)
    const matchesCategory =
      activeCategory === 'All categories' || product.category === activeCategory
    const searchableText = `${product.name} ${product.category} ${product.description} ${product.seller} ${product.location}`.toLowerCase()
    const matchesSearch = searchableText.includes(searchText.trim().toLowerCase())
    return matchesFilter && matchesCategory && matchesSearch
  })

  const selectedPaymentMethod = demoPaymentMethods.find((method) => method.id === paymentMethod)
  const parsedQuantity = Number(paymentQuantity)
  const checkoutUnitPrice =
    checkoutProduct && parsedQuantity >= checkoutProduct.minimumWholesaleQty
      ? checkoutProduct.wholesalePrice
      : checkoutProduct?.price ?? 0
  const checkoutTotal = checkoutUnitPrice * (Number.isInteger(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 0)

  const getAssistantReply = (input: string) => {
    const lower = input.toLowerCase()

    if (lower.includes('sell') || lower.includes('register') || lower.includes('business')) {
      return 'To register as a seller, create a business profile, add your products, set wholesale and retail prices, and confirm delivery areas. After approval, you can publish listings and manage enquiries from your seller dashboard.'
    }

    if (lower.includes('quote') || lower.includes('wholesale') || lower.includes('bulk')) {
      return 'For wholesale or quotation requests, select the product, choose quantity, and send the request to the supplier. The seller can then confirm stock, minimum order quantity, and delivery arrangements before acceptance.'
    }

    if (lower.includes('list') || lower.includes('product')) {
      return 'To list a product, add a clear title, category, pricing, wholesale terms, unit of measure, stock status, and a business profile. Keep product descriptions accurate and add operational details such as delivery areas and stock availability.'
    }

    if (lower.includes('contact') || lower.includes('support') || lower.includes('help')) {
      return 'You can contact the platform support team by WhatsApp at +255 768 868 546, or email msuyakelvin27@gmail.com, kelvinmsuya63@gmail.com, or dazomsuyas@gmail.com. You can also reach the business Instagram pages at @mk_africa21 and @kelvin_electronic_tz.'
    }

    if (lower.includes('buy') || lower.includes('order') || lower.includes('request')) {
      return 'Buyers can browse the catalogue, filter by category and audience, request a quote, and submit an order request. Sellers review the enquiry and update the status from pending to accepted, processing, dispatched, or delivered.'
    }

    if (lower.includes('hello') || lower.includes('hi')) {
      return 'Hello! I can help with listing products, seller onboarding, order requests, quotation support, and direct contact details for the business team.'
    }

    return 'I can help with marketplace onboarding, product listings, wholesale enquiries, order requests, and support links. Try asking about selling, buying, quotes, or contact support.'
  }

  const handleSendMessage = () => {
    const trimmed = chatInput.trim()
    if (!trimmed) return

    const nextUserMessage: Message = { id: Date.now(), role: 'user', text: trimmed }
    const nextAssistantMessage: Message = {
      id: Date.now() + 1,
      role: 'assistant',
      text: getAssistantReply(trimmed),
    }

    setMessages((current) => [...current, nextUserMessage, nextAssistantMessage])
    setChatInput('')
  }

  const handleGenerateDraft = () => {
    const title = draftForm.title.trim()
    const topic = draftForm.topic.trim()
    if (!title || !topic) return
    setStorageError('')

    let generatedText: string
    try {
      generatedText = generateDemoContent({ title, kind: draftForm.kind, topic })
    } catch (error) {
      console.error('Could not generate a demo content draft.', error)
      setStorageError(error instanceof Error ? error.message : 'The demo content draft could not be generated.')
      return
    }

    const draft: Draft = { id: Date.now(), title, kind: draftForm.kind, text: generatedText }
    const nextDrafts = [draft, ...drafts]
    const nextNotifications = [{ id: Date.now() + 1, title: 'Content draft created', text: `${title} is saved in your AI Studio.`, time: 'Just now' }, ...notifications]
    setDrafts(nextDrafts)
    setNotifications(nextNotifications)
    persist(storageKeys.drafts, nextDrafts)
    persist(storageKeys.notifications, nextNotifications)
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

  const handleRemoveProduct = (productId: number) => {
    setStorageError('')
    const nextProducts = products.filter((product) => product.id !== productId || !product.isDemoUserListing)
    setProducts(nextProducts)
    persist(storageKeys.products, nextProducts)
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

  const handleToggleLesson = (lessonId: string) => {
    setStorageError('')
    const nextLessons = completedLessons.includes(lessonId)
      ? completedLessons.filter((id) => id !== lessonId)
      : [...completedLessons, lessonId]
    setCompletedLessons(nextLessons)
    persist(storageKeys.lessons, nextLessons)
  }

  const handleOpenCheckout = (product: Product) => {
    setCheckoutProduct(product)
    setPaymentMethod('mpesa')
    setPaymentPhone('')
    setPaymentQuantity('1')
    setPaymentError('')
  }

  const handleCloseCheckout = () => {
    if (paymentProcessing) return
    setCheckoutProduct(null)
    setPaymentError('')
  }

  const handleSimulatePayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!checkoutProduct) return

    const quantity = Number(paymentQuantity)
    if (!Number.isInteger(quantity) || quantity < 1) {
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
      const result = await createDemoPayment({
        method: paymentMethod,
        phone: paymentPhone.trim(),
        amount: checkoutTotal,
        productName: checkoutProduct.name,
      })
      const record: PaymentRecord = {
        id: result.reference,
        reference: result.reference,
        productName: checkoutProduct.name,
        amount: checkoutTotal,
        method: paymentMethod,
        createdAt: new Date().toLocaleString(),
        status: result.status,
      }
      const nextPayments = [record, ...paymentRecords]
      const notice: NotificationItem = {
        id: Date.now() + 2,
        title: 'Demo checkout simulated',
        text: `${checkoutProduct.name}: ${result.message}`,
        time: 'Just now',
      }
      const nextNotifications = [notice, ...notifications]
      setPaymentRecords(nextPayments)
      setNotifications(nextNotifications)
      persist(storageKeys.payments, nextPayments)
      persist(storageKeys.notifications, nextNotifications)
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
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <img className="brand-mark" src="/kijiji-connect-logo.svg" alt="" aria-hidden="true" />
          <div>
            <p className="brand-name">Kijiji Connect</p>
            <span className="brand-subtitle">Arusha marketplace</span>
          </div>
        </div>

        <nav className="main-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="main-nav__item">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="topbar-actions">
          <button type="button" className="ghost-button">
            Search
          </button>
          <button type="button" className="primary-button" onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })}>
            Sell now
          </button>
        </div>
      </header>

      <main className="page-shell">
        {storageError && <p className="storage-error" role="alert">{storageError}</p>}
        <section id="home" className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">Kijiji Connect · Interactive prototype</span>
            <h1>Local opportunity. Connected across Tanzania.</h1>
            <p>
              Discover local businesses, find products and services, and take your next step with one connected marketplace.
            </p>

            <div className="search-panel">
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                aria-label="Search products and suppliers"
                placeholder="Search products, businesses, tourism guides, or lessons"
              />
              <button type="button" className="primary-button" onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })}>
                Search
              </button>
            </div>

            <div className="hero-stats" aria-label="Platform summary">
              <div>
                <strong>Local</strong>
                <span>Built for Tanzanian trade</span>
              </div>
              <div>
                <strong>B2B + B2C</strong>
                <span>Wholesale and retail</span>
              </div>
              <div>
                <strong>One place</strong>
                <span>Market, learn and connect</span>
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

        <section id="ai-studio" className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow">AI Content Studio • Local demo mode</span>
              <h2>Prepare content for your business</h2>
            </div>
          </div>

          <div className="phase-layout">
            <form className="phase-form" onSubmit={(event) => { event.preventDefault(); handleGenerateDraft() }}>
              <label>Draft title<input required value={draftForm.title} onChange={(event) => setDraftForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. Fresh mangoes from Arusha" /></label>
              <label>Content type<select value={draftForm.kind} onChange={(event) => setDraftForm((current) => ({ ...current, kind: event.target.value }))}><option>Product description</option><option>Social media post</option><option>Business article</option><option>Video script</option></select></label>
              <label>Topic and details<textarea required rows={3} value={draftForm.topic} onChange={(event) => setDraftForm((current) => ({ ...current, topic: event.target.value }))} placeholder="Describe what the content should communicate" /></label>
              <button type="submit" className="primary-button">Create draft</button>
              <small>Uses the local demo generator. No prompt leaves your browser and no external AI model is connected.</small>
            </form>
            <div className="phase-list">
              {drafts.length === 0 && <p className="empty-state">Your saved drafts will appear here.</p>}
              {drafts.map((draft) => <article key={draft.id} className="phase-card"><span className="badge badge--gold">{draft.kind}</span><h3>{draft.title}</h3><p>{draft.text}</p><button type="button" className="remove-listing" onClick={() => handleRemoveDraft(draft.id)}>Delete draft</button></article>)}
            </div>
          </div>
        </section>

        <section id="automation" className="section-block">
          <div className="section-heading">
            <div><span className="eyebrow">Business automation • Demo</span><h2>Let routine work follow a clear process</h2></div>
            <span className="status-pill">Local simulations only</span>
          </div>
          <p className="phase-note">Try a sample workflow to see its local result. These demos do not send messages, update stock, or call external systems.</p>
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

        <section id="learn-languages" className="section-block">
          <div className="section-heading"><div><span className="eyebrow">Language learning • Sample lessons</span><h2>Build practical communication skills</h2></div><span className="status-pill">{completedLessons.length} of {lessonCatalog.length} completed</span></div>
          <div className="lesson-grid">
            {lessonCatalog.map((lesson) => {
              const isComplete = completedLessons.includes(lesson.id)
              return <article key={lesson.id} className="lesson-card"><span className="status-pill">{lesson.language} · {lesson.level}</span><h3>{lesson.title}</h3><p>{lesson.text}</p><button type="button" className={isComplete ? 'secondary-button' : 'primary-button'} onClick={() => handleToggleLesson(lesson.id)}>{isComplete ? 'Mark incomplete' : 'Mark lesson complete'}</button></article>
            })}
          </div>
        </section>

        <section id="community" className="section-block">
          <div className="section-heading"><div><span className="eyebrow">Community • Local demo</span><h2>Share ideas and learn from others</h2></div></div>
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

        <section id="tourism-heritage" className="section-block">
          <div className="section-heading"><div><span className="eyebrow">Tourism & Heritage • Preview</span><h2>Explore places and cultural heritage</h2></div></div>
          <div className="tour-grid">{tourismPlaces.map((place) => <article key={place.title} className="tour-card"><img src={place.image} alt={place.imageAlt} loading="lazy" onError={(event) => { if (event.currentTarget.src.endsWith('/kijiji-product-art.svg')) event.currentTarget.hidden = true; else event.currentTarget.src = '/kijiji-product-art.svg' }} /><div className="tour-card__body"><span className="badge badge--gold">{place.location}</span><h3>{place.title}</h3><p>{place.text}</p></div></article>)}</div>
          <p className="phase-note">Visitor details and availability should be confirmed with official destination operators before travel.</p>
        </section>

        <section id="ai-assistant" className="section-block assistant-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">AI Business Assistant</span>
              <h2>Guided marketplace help</h2>
            </div>
            <span className="status-pill">Rule-based • demo mode</span>
          </div>

          <div className="assistant-layout">
            <div className="assistant-panel">
              <div className="chat-window" aria-live="polite">
                {messages.map((message) => (
                  <div key={message.id} className={message.role === 'user' ? 'chat-bubble user' : 'chat-bubble assistant'}>
                    {message.text}
                  </div>
                ))}
              </div>

              <div className="chat-input-row">
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSendMessage()
                  }}
                  placeholder="Ask about selling, buying, quotes, or support..."
                  aria-label="Chat with AI assistant"
                />
                <button type="button" className="primary-button" onClick={handleSendMessage}>
                  Send
                </button>
              </div>

              <div className="prompt-row">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="prompt-chip"
                    onClick={() => setChatInput(prompt)}
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
                {contactLinks.map((item) => (
                  <a key={`${item.label}-${item.value}`} href={item.href} className="contact-item" target="_blank" rel="noreferrer">
                    <span className="contact-label">{item.label}</span>
                    <strong>{item.value}</strong>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="marketplace" className="section-block marketplace-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Marketplace · Sample listings</span>
              <h2>Explore local products and suppliers</h2>
            </div>
            <a className="primary-button compact seller-register-link" href={whatsappUrl('Hello, I would like to register as a seller on Kijiji Connect.')} target="_blank" rel="noreferrer">
              Ask about seller registration
            </a>
          </div>

          <div className="market-toolbar">
            <div className="toggle-row" aria-label="Product audience filter">
              {['All Products', 'B2B', 'B2C'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={activeFilter === filter ? 'segment active' : 'segment'}
                  onClick={() => setActiveFilter(filter as 'All Products' | 'B2B' | 'B2C')}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="filter-chips" aria-label="Category filter">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={activeCategory === category ? 'chip active' : 'chip'}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="listing-form-wrap">
            <h3>Publish a demo listing</h3>
            <p>Enter accurate details to add a listing in this browser. Listings are not visible to other users until a backend is connected.</p>
            <form className="listing-form" onSubmit={(event) => { event.preventDefault(); handleAddProduct() }}>
              <label>Product name<input required value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} /></label>
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

          <p className="market-result-count" role="status">{visibleProducts.length} products shown{searchText.trim() ? ` for "${searchText.trim()}"` : ''}</p>
          <div className="market-grid">
            {visibleProducts.map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-image-wrap">
                  <img src={product.image} alt={product.name} onError={(event) => { if (event.currentTarget.src.endsWith('/kijiji-product-art.svg')) event.currentTarget.hidden = true; else event.currentTarget.src = '/kijiji-product-art.svg' }} />
                  <span className="product-status">{product.stock}</span>
                </div>

                <div className="product-body">
                  <div className="product-meta-row">
                    <span className="badge badge--green">{product.category}</span>
                    <span className="badge badge--gold">Sample listing</span>
                  </div>

                  <h3>{product.name}</h3>
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
                      <button type="button" className="primary-button buy-button" onClick={() => handleOpenCheckout(product)}>Buy now</button>
                      {product.isDemoUserListing && <button type="button" className="remove-listing" onClick={() => handleRemoveProduct(product.id)}>Remove</button>}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="payments" className="section-block">
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
        </section>

        <section id="notifications" className="section-block">
          <div className="section-heading"><div><span className="eyebrow">Notifications</span><h2>Recent activity in this browser</h2></div>{notifications.length > 0 && <button type="button" className="ghost-button small notification-clear" onClick={handleClearNotifications}>Clear notifications</button>}</div>
          <div className="phase-list">
            {notifications.length === 0 && <p className="empty-state">Activity from new drafts and community posts will appear here.</p>}
            {notifications.map((item) => <article key={item.id} className="phase-card notification-card"><div><h3>{item.title}</h3><p>{item.text}</p></div><small>{item.time}</small><button type="button" className="remove-listing" aria-label={`Dismiss ${item.title}`} onClick={() => handleRemoveNotification(item.id)}>Dismiss</button></article>)}
          </div>
        </section>

        <section id="my-account" className="section-block">
          <div className="section-heading"><div><span className="eyebrow">My Account • Local preview</span><h2>Your activity overview</h2></div></div>
          <div className="account-grid">
            <article className="phase-card account-summary"><div className="profile-avatar">KM</div><div><h3>Kelvin Msuya</h3><p>Business owner · Arusha, Tanzania</p><small>Demo profile—no account authentication is configured.</small></div></article>
            <article className="phase-card"><h3>Workspace activity</h3><ul className="activity-list"><li>Marketplace listings: {products.length}</li><li>Content drafts: {drafts.length}</li><li>Community posts: {posts.length}</li><li>Lessons completed: {completedLessons.length}</li></ul></article>
          </div>
        </section>

        <section className="section-block supplier-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Supplier discovery · Sample profiles</span>
              <h2>Example businesses from the local catalogue</h2>
            </div>
          </div>

          <div className="supplier-grid">
            {suppliers.map((supplier) => (
              <article key={supplier.name} className="supplier-card">
                <div className="supplier-icon">{supplier.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <div className="supplier-headline">
                    <h3>{supplier.name}</h3>
                    <span className="badge badge--gold">Sample profile</span>
                  </div>
                  <p>{supplier.category}</p>
                  <small>{supplier.location}</small>
                </div>
                <div className="supplier-footer">
                  <span>{supplier.items} products</span>
                  <button type="button" className="ghost-button small">View profile</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block insight-section">
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
      </main>

      {checkoutProduct && (
        <div className="checkout-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) handleCloseCheckout() }}>
          <section className="checkout-dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
            <div className="checkout-heading">
              <div><span className="eyebrow">Sandbox checkout</span><h2 id="checkout-title">Review your order</h2></div>
              <button type="button" className="checkout-close" aria-label="Close checkout" onClick={handleCloseCheckout} disabled={paymentProcessing}>×</button>
            </div>
            <div className="checkout-product"><div><strong>{checkoutProduct.name}</strong><small>{checkoutProduct.seller} · {checkoutProduct.location}</small></div><strong>{formatTzs(checkoutTotal)}</strong></div>
            <form className="checkout-form" onSubmit={handleSimulatePayment}>
              <label>Quantity
                <input type="number" min="1" step="1" required value={paymentQuantity} onChange={(event) => setPaymentQuantity(event.target.value)} />
              </label>
              <p className="checkout-price-note">{parsedQuantity >= checkoutProduct.minimumWholesaleQty ? `Wholesale price applies from ${checkoutProduct.minimumWholesaleQty} ${checkoutProduct.unit}.` : `Retail price: ${formatTzs(checkoutProduct.price)} per ${checkoutProduct.unit}.`}</p>
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
        <div>
          <p>Arusha, Tanzania</p>
          <small>Sample business information for development only.</small>
        </div>
        <div className="footer-contact-block">
          <p>Business contact</p>
          <small>
            <a href="https://wa.me/255768868546" target="_blank" rel="noreferrer">WhatsApp: +255 768 868 546</a>
          </small>
          <small>
            <a href="mailto:msuyakelvin27@gmail.com">msuyakelvin27@gmail.com</a>
          </small>
          <small>
            <a href="https://instagram.com/mk_africa21" target="_blank" rel="noreferrer">Instagram: @mk_africa21</a>
          </small>
        </div>
      </footer>
    </div>
  )
}

export default App
