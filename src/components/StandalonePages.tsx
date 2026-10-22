import { Link } from 'react-router-dom'
import { useState, type FormEvent, type ReactNode } from 'react'
import type { Product } from '../services/marketplaceCatalog'
import { businessContact } from '../config/contact'
import { localDemoSellerId, type LocalProductUpdate } from '../services/localMarketplaceRepository'

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
  if (!product) {
    return <PageSection title="Product not found"><p>This sample listing is not available in the current local catalogue.</p><Link to="/marketplace">Back to marketplace</Link></PageSection>
  }
  const related = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 3)
  const supplierPath = `/suppliers/${slugFor(product.seller)}`
  return (
    <>
      <PageSection title={product.name} eyebrow="Sample listing · indicative price">
        <div className="standalone-product-detail">
          <img className="standalone-detail-image" src={product.image} alt={product.name} />
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
  const { page, product, products, supplierName, cartLines, orders, cartSubtotal, onAddToCart, onUpdateCartQuantity, onRemoveFromCart, onCheckout, onUpdateProduct, onDeleteProduct } = props

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
        <p>These are simulated checkout records only. There is no supplier acceptance, processing, dispatch or delivery in this prototype.</p>
        {orders.length === 0 ? <p className="empty-state">No local demo orders yet. <Link to="/marketplace">Browse sample products</Link></p> : orders.map((order) => (
          <article className="phase-card standalone-order" key={order.id}>
            <div className="section-heading"><div><h2>Order {order.reference}</h2><p>{order.createdAt}</p></div><span className="payment-demo-tag">SIMULATED</span></div>
            <ol className="order-timeline"><li aria-current="step">Checkout simulated — no payment or fulfilment</li><li>Pending — not sent to seller</li><li>Accepted / processing / dispatched / delivered — not available in demo</li></ol>
            {order.lines.map((line) => <p key={line.productName}>{line.productName} × {line.quantity} {line.unit} · {price(line.lineTotal)} indicative</p>)}
            <strong>Simulated total: {price(order.amount)}</strong>
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
    return (
      <PageSection title="Local demo moderation" eyebrow="Sandbox only · no authentication or real permissions">
        <p className="phase-note">This page is a local preview, not a protected administrator or seller dashboard. Browser data and role labels can be edited by users; do not use it to manage real sellers, customers, listings or orders.</p>
        <div className="phase-list">
          <article className="phase-card"><h2>Sample listings to review</h2><p>Moderation actions are not enabled because this demo has no trusted user identity or server-side authorization.</p><Link className="primary-button" to="/marketplace">Browse sample catalogue</Link></article>
          <article className="phase-card"><h2>Order records</h2><p>{orders.length} local simulated records. No customer purchase or fulfilment is represented.</p><Link to="/orders">View demo order history</Link></article>
        </div>
      </PageSection>
    )
  }

  if (page === 'assistant') {
    return <PageSection title="Guided assistant" eyebrow="Local rules · not a connected AI model"><p>Use the assistant launcher at the bottom of the page. It can search sample listings, prepare local forms and open travel guidance. It does not send messages, change verified prices or complete real orders.</p><p>Try: “Find avocado products” or “Find a hotel in Arusha for 2 nights”.</p></PageSection>
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
