import { Link } from 'react-router-dom'
import { useState, type FormEvent, type ReactNode } from 'react'
import type { Product } from '../services/marketplaceCatalog'
import type { AssistantAuditEntry } from '../services/demoAssistant'
import { businessContact } from '../config/contact'
import { localDemoSellerId, type LocalProductUpdate } from '../services/localMarketplaceRepository'
import { moderationStatusFor, type DemoRole, type ModerationRecord, type ModerationStatus } from '../services/demoModeration'
import { arushaDeliveryPlaces, deliveryStatusIndex, deliveryStatusLabel, type DeliveryStatus } from '../services/deliveryTracking'
import { Stepper } from './ui'

export type StandalonePageId =
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
  | 'test-guide'

export type StandaloneCartLine = {
  product: Product
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type StandaloneOrder = {
  id: string
  reference: string
  lines: Array<{ productName: string; quantity: number; unit: string; unitPrice: number; lineTotal: number }>
  amount: number
  createdAt: string
  status: 'SIMULATED'
  deliveryPlaceId?: string
  deliveryPlaceName?: string
  deliveryAddress?: string
  deliveryStatus?: DeliveryStatus
  paidAmount?: number
  balanceAmount?: number
}

type StandalonePagesProps = {
  page: StandalonePageId
  product?: Product
  products: Product[]
  supplierName?: string
  cartLines: StandaloneCartLine[]
  orders: StandaloneOrder[]
  cartSubtotal: number
  onAddToCart: (product: Product) => void
  onUpdateCartQuantity: (productId: number, quantity: string) => void
  onRemoveFromCart: (productId: number) => void
  onCheckout: () => void
  onUpdateProduct: (productId: number, update: LocalProductUpdate) => boolean
  onDeleteProduct: (productId: number) => void
  assistantAuditLog: AssistantAuditEntry[]
  demoRole: DemoRole
  moderationRecords: ModerationRecord[]
  onDemoRoleChange: (role: DemoRole) => void
  onModerationChange: (productId: number, status: ModerationStatus) => boolean
  onUpdateOrderDelivery: (orderId: string, status: DeliveryStatus) => void
}

const price = (amount: number) => new Intl.NumberFormat('en-TZ', {
  style: 'currency',
  currency: 'TZS',
  maximumFractionDigits: 0,
}).format(amount)

const slugFor = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card standalone-product-card">
      <Link to={`/products/${product.id}`} className="standalone-product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="product-body">
        <span className="badge badge--gold">Sample listing</span>
        <h3><Link to={`/products/${product.id}`}>{product.name}</Link></h3>
        <p>{product.description}</p>
        <strong>{price(product.price)} · indicative—confirm with supplier</strong>
        <Link className="secondary-button" to={`/products/${product.id}`}>View product</Link>
      </div>
    </article>
  )
}

function ProductDetail({ product, products, onAddToCart }: {
  product?: Product
  products: Product[]
  onAddToCart: (product: Product) => void
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  if (!product) {
    return <PageSection title="Product not found"><p>This sample listing is not available in the current local catalogue.</p><Link to="/marketplace">Back to marketplace</Link></PageSection>
  }
  const related = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 3)
  const gallery = product.images?.length ? product.images : [product.image]
  const visibleImageIndex = Math.min(selectedImageIndex, gallery.length - 1)
  const supplierPath = `/suppliers/${slugFor(product.seller)}`
  return (
    <>
      <PageSection title={product.name} eyebrow="Sample listing · indicative price">
        <div className="standalone-product-detail">
          <div className="product-gallery">
            <img className="standalone-detail-image" src={gallery[visibleImageIndex]} alt={`${product.name} image ${visibleImageIndex + 1} of ${gallery.length}`} />
            {gallery.length > 1 && <div className="product-gallery-thumbnails" role="group" aria-label="Product image gallery">
              {gallery.map((image, index) => <button key={`${image}-${index}`} type="button" className={index === visibleImageIndex ? 'product-gallery-thumbnail is-selected' : 'product-gallery-thumbnail'} aria-label={`View image ${index + 1} of ${gallery.length}`} aria-pressed={index === visibleImageIndex} onClick={() => setSelectedImageIndex(index)}><img src={image} alt="" /></button>)}
            </div>}
          </div>
          <div className="standalone-detail-copy">
            <p>{product.description}</p>
            <p className="phase-note">Illustrative offer only. Price and availability are not verified; confirm specifications and current terms directly with the seller.</p>
            <dl>
              <div><dt>Category</dt><dd>{product.category}</dd></div>
              <div><dt>Retail price</dt><dd>{price(product.price)} · indicative—confirm with supplier</dd></div>
              <div><dt>Wholesale price</dt><dd>{price(product.wholesalePrice)} from {product.minimumWholesaleQty} {product.unit} · indicative</dd></div>
              <div><dt>Sample availability</dt><dd>{product.stock}</dd></div>
              <div><dt>Location</dt><dd>{product.location}</dd></div>
              <div><dt>Buyer types</dt><dd>{product.audience.join(' / ')}</dd></div>
            </dl>
            <Link to={supplierPath}>View sample supplier profile</Link>
            <div className="standalone-actions">
              <button className="primary-button" type="button" onClick={() => onAddToCart(product)}>Add to local demo cart</button>
              <a className="secondary-button" href={`${businessContact.whatsappUrl}?text=${encodeURIComponent(`Hello, I would like to request a quote for ${product.name}. Please confirm the current price and availability. This is an enquiry, not an order.`)}`} target="_blank" rel="noreferrer">Request quote on WhatsApp</a>
            </div>
          </div>
        </div>
      </PageSection>
      {related.length > 0 && <PageSection title="Related sample products"><div className="market-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></PageSection>}
    </>
  )
}

function PageSection({ title, eyebrow = 'Kijiji Connect', children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return <section className="section-block standalone-page"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{children}</section>
}

function SellerListingEditor({ product, onUpdate, onDelete }: {
  product: Product
  onUpdate: (productId: number, update: LocalProductUpdate) => boolean
  onDelete: (productId: number) => void
}) {
  const [priceInput, setPriceInput] = useState(String(product.price))
  const [stockInput, setStockInput] = useState(product.stockQuantity === undefined ? '' : String(product.stockQuantity))
  const [message, setMessage] = useState('')

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const priceValue = Number(priceInput)
    const stockValue = Number(stockInput)
    if (!Number.isSafeInteger(priceValue) || priceValue < 1 || !Number.isSafeInteger(stockValue) || stockValue < 0) {
      setMessage('Enter a positive whole-number price and a whole-number stock quantity of zero or more.')
      return
    }
    setMessage(onUpdate(product.id, { price: priceValue, stockQuantity: stockValue })
      ? 'Price and sample stock saved in this browser only.'
      : 'The local listing could not be updated. Review the error notice and try again.')
  }

  return (
    <article className="phase-card seller-listing-editor">
      <div className="section-heading">
        <div><h2>{product.name}</h2><p>{product.category} · {product.location}</p></div>
        {product.stockQuantity !== undefined && product.stockQuantity <= 5 && <span className="badge badge--gold">Low sample stock</span>}
      </div>
      <p className="phase-note">Sample prices and inventory are not published to other users or verified with a supplier.</p>
      <form className="seller-edit-form" onSubmit={save}>
        <label>Indicative retail price (TZS)<input aria-label={`Retail price for ${product.name}`} required type="number" min="1" step="1" value={priceInput} onChange={(event) => setPriceInput(event.target.value)} /></label>
        <label>Sample stock quantity<input aria-label={`Stock quantity for ${product.name}`} required type="number" min="0" step="1" value={stockInput} onChange={(event) => setStockInput(event.target.value)} /></label>
        <button className="primary-button" type="submit">Save price and stock</button>
        <button className="remove-listing" type="button" onClick={() => {
          if (window.confirm(`Remove the local demo listing “${product.name}”?`)) onDelete(product.id)
        }}>Remove listing</button>
      </form>
      {message && <p role="status">{message}</p>}
    </article>
  )
}

function SellerDashboard({ products, orders, onUpdateProduct, onDeleteProduct }: {
  products: Product[]
  orders: StandaloneOrder[]
  onUpdateProduct: (productId: number, update: LocalProductUpdate) => boolean
  onDeleteProduct: (productId: number) => void
}) {
  const ownListings = products.filter((product) =>
    product.isDemoUserListing && product.ownerId === localDemoSellerId,
  )
  const lowStockCount = ownListings.filter((product) =>
    product.stockQuantity !== undefined && product.stockQuantity <= 5,
  ).length

  return (
    <PageSection title="Seller workspace" eyebrow="Sandbox only · browser-local seller preview">
      <p className="phase-note">This workspace is not protected authentication or a real seller dashboard. Its local owner check is editable in browser data and must never be used to authorize a real account.</p>
      <div className="phase-list">
        <article className="phase-card"><h2>Your sample listings</h2><p>{ownListings.length} local listings · {lowStockCount} low-stock alert(s)</p></article>
        <article className="phase-card"><h2>Demo order records</h2><p>{orders.length} simulated records. This preview does not calculate verified sales or fulfilment.</p><Link to="/orders">View demo order history</Link></article>
      </div>
      {ownListings.length === 0
        ? <p className="empty-state">No local listings yet. <Link to="/marketplace">Create a sample listing in Marketplace</Link></p>
        : <div className="phase-list">{ownListings.map((product) => <SellerListingEditor
          key={product.id}
          product={product}
          onUpdate={onUpdateProduct}
          onDelete={onDeleteProduct}
        />)}</div>}
    </PageSection>
  )
}

export function StandalonePages(props: StandalonePagesProps) {
  const { page, product, products, supplierName, cartLines, orders, cartSubtotal, onAddToCart, onUpdateCartQuantity, onRemoveFromCart, onCheckout, onUpdateProduct, onDeleteProduct, assistantAuditLog, demoRole, moderationRecords, onDemoRoleChange, onModerationChange, onUpdateOrderDelivery } = props

  if (page === 'product-detail') return <ProductDetail product={product} products={products} onAddToCart={onAddToCart} />

  if (page === 'supplier-profile') {
    const listings = products.filter((item) => slugFor(item.seller) === supplierName)
    const name = listings[0]?.seller ?? 'Sample supplier'
    return (
      <PageSection title={name} eyebrow="Sample supplier profile · not independently verified">
        <p className="phase-note">This example profile and its catalogue are illustrative. Kijiji Connect has not verified this supplier, inventory, location or prices.</p>
        <p>{listings[0]?.location ?? 'Tanzania'} · {listings.length} sample listings</p>
        <div className="market-grid">{listings.map((item) => <ProductCard key={item.id} product={item} />)}</div>
        {listings.length === 0 && <p className="empty-state">No matching sample listings are available.</p>}
      </PageSection>
    )
  }

  if (page === 'test-guide') {
    return (
      <PageSection title="Testing guide" eyebrow="Local user-testing checklist">
        <p className="phase-note">This guide separates working browser-local flows from provider features that require configuration. Use a fresh browser profile when you want to test without existing local records.</p>
        <div className="phase-list">
          <details open><summary>Marketplace and delivery</summary><p>Search and filter products, add an item to cart, open checkout, select an Arusha destination, enter a partial payment, and review the balance in Orders.</p></details>
          <details><summary>Sender workflow</summary><p>Open Orders, switch the browser-local role to Seller on the seller workspace, accept an order, mark it sent, and review the destination tracking preview.</p></details>
          <details><summary>Travel</summary><p>Switch Hotels, Flights and Tours, enter dates and travellers, choose an illustrative offer, and review the WhatsApp/email handoff before opening it.</p></details>
          <details><summary>Language Academy</summary><p>Choose a language and level, reveal a flashcard, complete the assessment, and confirm the local streak updates after a passing result.</p></details>
          <details><summary>Assistant and accessibility</summary><p>Use a quick prompt, confirm a local change, try Undo, then navigate with Tab and verify focus remains visible. Live AI, messages and payments are not connected.</p></details>
          <details><summary>What is simulated</summary><p>Catalogue data, cart, payment records, balances, delivery status, destination coordinates, learning progress, roles and assistant history are stored in this browser only.</p></details>
        </div>
      </PageSection>
    )
  }

  if (page === 'cart') {
    return (
      <PageSection title="Your local demo cart" eyebrow="Sandbox · saved only in this browser">
        <p>Prices and offers are illustrative. No items are reserved or purchased until a real backend is configured; this checkout is only a simulation.</p>
        {cartLines.length === 0 ? <div className="empty-state"><p>Your cart is empty.</p><Link to="/marketplace">Browse sample products</Link></div> : (
          <>
            <div className="market-cart-items">{cartLines.map((line) => (
              <div className="market-cart-item" key={line.product.id}>
                <div><Link to={`/products/${line.product.id}`}><strong>{line.product.name}</strong></Link><small>{price(line.unitPrice)} per {line.product.unit} · indicative</small></div>
                <label>Quantity<input aria-label={`Quantity for ${line.product.name}`} type="number" min="1" value={line.quantity} onChange={(event) => onUpdateCartQuantity(line.product.id, event.target.value)} /></label>
                <strong>{price(line.lineTotal)}</strong>
                <button className="remove-listing" type="button" onClick={() => onRemoveFromCart(line.product.id)}>Remove</button>
              </div>
            ))}</div>
            <div className="market-cart-total"><span>Indicative subtotal: {price(cartSubtotal)}</span><button className="primary-button" type="button" onClick={onCheckout}>Review sandbox checkout</button></div>
          </>
        )}
      </PageSection>
    )
  }

  if (page === 'orders') {
    return (
      <PageSection title="Demo order history" eyebrow="Local records · not real orders">
        <p>These are simulated checkout records. This browser preview now records a delivery place, balance, sender acceptance and dispatch state; it does not contact a supplier, payment provider or live GPS service.</p>
        {orders.length === 0 ? <p className="empty-state">No local demo orders yet. <Link to="/marketplace">Browse sample products</Link></p> : orders.map((order) => (
          <article className="phase-card standalone-order" key={order.id}>
            <div className="section-heading"><div><h2>Order {order.reference}</h2><p>{order.createdAt}</p></div><span className="payment-demo-tag">SIMULATED</span></div>
            {(() => {
              const deliveryStatus = order.deliveryStatus ?? 'pending-sender'
              const statusIndex = deliveryStatusIndex(deliveryStatus)
              const place = order.deliveryPlaceName ?? 'Arusha City Centre'
              const selectedPlace = arushaDeliveryPlaces.find((deliveryPlace) => deliveryPlace.name === place) ?? arushaDeliveryPlaces[0]
              return (
                <>
                  <Stepper steps={(['pending-sender', 'accepted', 'sent', 'delivered'] as DeliveryStatus[]).map(deliveryStatusLabel)} current={statusIndex} />
                  <div className="delivery-summary">
                    <strong>Order balance</strong>
                    <span>Total: {price(order.amount)} · Paid (simulated): {price(order.paidAmount ?? order.amount)} · Balance: {price(order.balanceAmount ?? 0)}</span>
                    <span>Delivery: {place}{order.deliveryAddress ? ` · ${order.deliveryAddress}` : ''}</span>
                    <span>GPS: {deliveryStatus === 'sent' || deliveryStatus === 'delivered' ? 'Local tracking point active for Arusha' : 'Activates after sender dispatch'}</span>
                    <a href={`https://www.openstreetmap.org/?mlat=${selectedPlace.latitude}&mlon=${selectedPlace.longitude}#map=15/${selectedPlace.latitude}/${selectedPlace.longitude}`} target="_blank" rel="noreferrer">Review destination on OpenStreetMap</a>
                  </div>
                  {demoRole !== 'viewer' && deliveryStatus !== 'delivered' && <button type="button" className="secondary-button" onClick={() => onUpdateOrderDelivery(order.id, deliveryStatus === 'pending-sender' ? 'accepted' : 'sent')}>{deliveryStatus === 'pending-sender' ? 'Accept order as sender' : 'Mark sent by sender'}</button>}
                  {deliveryStatus === 'sent' && <button type="button" className="primary-button" onClick={() => onUpdateOrderDelivery(order.id, 'delivered')}>Confirm delivery received</button>}
                  {deliveryStatus === 'sent' && <div className="gps-tracking-card"><strong>Arusha delivery tracking</strong><span>Tracking is local preview data, not a live device GPS feed.</span><div className="gps-grid">{arushaDeliveryPlaces.map((deliveryPlace) => <span className={deliveryPlace.name === place ? 'gps-point selected' : 'gps-point'} key={deliveryPlace.id} title={`${deliveryPlace.latitude}, ${deliveryPlace.longitude}`}>{deliveryPlace.name}</span>)}</div></div>}
                </>
              )
            })()}
            {order.lines.map((line) => <p key={line.productName}>{line.productName} × {line.quantity} {line.unit} · {price(line.lineTotal)} indicative</p>)}
            <button type="button" className="secondary-button" onClick={() => window.print()}>Print demo receipt</button>
          </article>
        ))}
      </PageSection>
    )
  }

  if (page === 'seller-dashboard') {
    return <SellerDashboard products={products} orders={orders} onUpdateProduct={onUpdateProduct} onDeleteProduct={onDeleteProduct} />
  }

  if (page === 'admin') {
    const demoListings = products.filter((item) => item.isDemoUserListing)
    const pendingCount = demoListings.filter((item) => moderationStatusFor(moderationRecords, item.id) === 'pending').length
    return (
      <PageSection title="Local demo moderation" eyebrow="Sandbox only · no authentication or real permissions">
        <p className="phase-note">This page is a local preview, not a protected administrator or seller dashboard. Browser data and role labels can be edited by users; do not use it to manage real sellers, customers, listings or orders.</p>
        <article className="phase-card">
          <h2>Demo role switcher</h2>
          <p>Use this control to exercise the interface only. It is not authentication, authorization or a security boundary.</p>
          <label>Browser-local demo role<select aria-label="Browser-local demo role" value={demoRole} onChange={(event) => onDemoRoleChange(event.target.value as DemoRole)}><option value="viewer">Viewer</option><option value="seller">Seller</option><option value="moderator">Moderator</option></select></label>
        </article>
        <div className="phase-list">
          <article className="phase-card"><h2>Sample listings to review</h2><p>{pendingCount} pending · {demoListings.length} browser-local listing(s). Changes are illustrative and do not publish a listing.</p>{demoListings.length === 0 ? <p className="empty-state">No local seller listings are available.</p> : <div className="moderation-list">{demoListings.map((item) => {
            const status = moderationStatusFor(moderationRecords, item.id)
            return <div className="moderation-item" key={item.id}><div><strong>{item.name}</strong><small>{item.seller} · status: {status}</small></div><div className="moderation-actions"><button type="button" className="secondary-button" disabled={demoRole !== 'moderator'} onClick={() => onModerationChange(item.id, 'approved')}>Approve</button><button type="button" className="remove-listing" disabled={demoRole !== 'moderator'} onClick={() => onModerationChange(item.id, 'rejected')}>Reject</button></div></div>
          })}</div>}<Link className="primary-button" to="/marketplace">Browse sample catalogue</Link></article>
          <article className="phase-card"><h2>Order records</h2><p>{orders.length} local simulated records. No customer purchase or fulfilment is represented.</p><Link to="/orders">View demo order history</Link></article>
          <article className="phase-card"><h2>Local assistant audit log</h2><p>Confirmed assistant listing changes in this browser only; this is not a security audit trail.</p>{assistantAuditLog.length === 0 ? <p className="empty-state">No confirmed assistant changes yet.</p> : <ol>{assistantAuditLog.map((entry) => <li key={entry.id}>{entry.createdAt} · {entry.productName}: {entry.action}</li>)}</ol>}</article>
        </div>
      </PageSection>
    )
  }

  if (page === 'assistant') {
    return <PageSection title="Guided assistant" eyebrow="Local rules · not a connected AI model"><p>Use the assistant launcher at the bottom of the page. It can search sample listings, prepare local forms and open travel guidance. It does not send messages, change verified prices or complete real orders.</p><p>Try “Order 50kg avocado” to prepare a cart draft that requires confirmation, or set price/stock for a listing you created in the local Seller workspace. Price and stock changes require confirmation and offer a short undo window.</p><p>Travel: “Find a hotel in Arusha for 2 nights”. No live availability, external AI or messages are connected.</p></PageSection>
  }

  if (page === 'articles') {
    return <PageSection title="Articles and guides" eyebrow="Editorial samples"><p className="empty-state">No reviewed articles are published yet. Business and travel guidance will be added after fact-checking.</p><Link to="/contact">Suggest a topic</Link></PageSection>
  }
  if (page === 'about') {
    return <PageSection title="About Kijiji Connect"><p>Kijiji Connect is a Tanzania-focused prototype bringing marketplace discovery, language practice, travel planning and community concepts into one place.</p><p>Local examples are for demonstration and are not verified business, travel or payment offers.</p></PageSection>
  }
  if (page === 'faq') {
    return <PageSection title="Frequently asked questions"><div className="phase-list"><details><summary>Are listings verified?</summary><p>No. Catalogue examples are illustrative and supplier availability must be confirmed directly.</p></details><details><summary>Does checkout take payment?</summary><p>No. Checkout is a local simulation and does not contact a payment provider.</p></details><details><summary>Does a travel enquiry reserve a room or flight?</summary><p>No. It prepares a user-reviewed enquiry only.</p></details><details><summary>Is the assistant a live AI agent?</summary><p>No. It uses local rule matching and does not send messages automatically.</p></details></div></PageSection>
  }
  if (page === 'privacy' || page === 'terms') {
    return <PageSection title={page === 'privacy' ? 'Privacy notice template' : 'Terms of use template'} eyebrow="Draft · review with a lawyer before launch"><p className="phase-note">This starter information is not legal advice. Have a qualified lawyer review and adapt it to the actual business, hosting, data flows and local laws before publication.</p><h2>Prototype data</h2><p>Some demo preferences, drafts and order simulations are stored in this browser. No real payment is processed through this prototype. Confirm the actual deployment’s analytics, storage, retention and contact workflows before accepting users.</p><h2>Contact</h2><p><a href={businessContact.whatsappUrl}>WhatsApp {businessContact.phone}</a> · {businessContact.emails.map((email) => <span key={email}><a href={`mailto:${email}`}>{email}</a>{' '}</span>)}</p></PageSection>
  }

  return null
}
