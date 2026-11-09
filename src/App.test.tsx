import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { productsSeed } from './services/marketplaceCatalog'
import { localDemoSellerId } from './services/localMarketplaceRepository'
import { createLevelAssessment, languageCourses } from './services/languageLearning'

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location-search">{location.pathname}{location.search}</output>
}

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('routed application shell', () => {
  it('renders the requested marketplace page on a direct URL', async () => {
    render(
      <MemoryRouter initialEntries={['/marketplace']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Explore local products and suppliers' })).toBeVisible()
    expect(document.querySelector('main')).toHaveAttribute('data-current-page', 'marketplace')
    expect(document.getElementById('catalog-search')).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe('Marketplace | Kijiji Connect'))
  })

  it('renders product and supplier detail pages on direct URLs', async () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/products/1']}>
        <App />
      </MemoryRouter>,
    )
    await waitFor(() => expect(document.querySelector('main > .standalone-page')).not.toBeNull(), { timeout: 5000 })
    const productPage = within(document.querySelector('main > .standalone-page') as HTMLElement)
    expect(productPage.getByRole('heading', { name: 'Fresh Avocado Grade A', level: 1 })).toBeVisible()
    expect(productPage.getByText(/Price and availability are not verified/)).toBeVisible()
    expect(productPage.getByRole('link', { name: 'View sample supplier profile' })).toHaveAttribute('href', '/suppliers/green-valley-farms-sample')
    unmount()

    render(
      <MemoryRouter initialEntries={['/suppliers/green-valley-farms-sample']}>
        <App />
      </MemoryRouter>,
    )
    await waitFor(() => expect(document.querySelector('main > .standalone-page')).not.toBeNull(), { timeout: 5000 })
    const supplierPage = within(document.querySelector('main > .standalone-page') as HTMLElement)
    expect(supplierPage.getByRole('heading', { name: 'Green Valley Farms (sample)', level: 1 })).toBeVisible()
    expect(supplierPage.getByText(/not independently verified/)).toBeVisible()
  })

  it('lets product detail pages switch between saved gallery images', async () => {
    localStorage.setItem('kijiji-connect-products', JSON.stringify([{
      ...productsSeed[0],
      id: 9010,
      isDemoUserListing: true,
      ownerId: localDemoSellerId,
      images: ['data:image/png;base64,first', 'data:image/png;base64,second'],
    }]))
    render(
      <MemoryRouter initialEntries={['/products/9010']}>
        <App />
      </MemoryRouter>,
    )

    const gallery = await screen.findByRole('group', { name: 'Product image gallery' })
    expect(gallery).toBeVisible()
    fireEvent.click(within(gallery).getByRole('button', { name: 'View image 2 of 2' }))
    expect(screen.getByAltText('Fresh Avocado Grade A image 2 of 2')).toHaveAttribute('src', 'data:image/png;base64,second')
  })

  it('renders a local cart route and the demo seller/admin boundaries', async () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/cart']}>
        <App />
      </MemoryRouter>,
    )
    await waitFor(() => expect(document.querySelector('main > .standalone-page')).not.toBeNull(), { timeout: 5000 })
    const cartPage = within(document.querySelector('main > .standalone-page') as HTMLElement)
    expect(cartPage.getByRole('heading', { name: 'Your local demo cart', level: 1 })).toBeVisible()
    expect(cartPage.getByText('Your cart is empty.')).toBeVisible()
    unmount()

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: 'Local demo moderation' }, { timeout: 5000 })).toBeVisible()
    expect(screen.getByText(/not a protected administrator or seller dashboard/)).toBeVisible()
  })

  it('renders the local tester guide directly', async () => {
    render(
      <MemoryRouter initialEntries={['/test-guide']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Testing guide' })).toBeVisible()
    expect(screen.getByText(/partial payment/)).toBeVisible()
  })

  it('supports the browser-local moderator review flow without granting real permissions', async () => {
    localStorage.setItem('kijiji-connect-products', JSON.stringify([{
      ...productsSeed[0],
      id: 9011,
      isDemoUserListing: true,
      ownerId: localDemoSellerId,
    }]))
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/1 pending/)).toBeVisible()
    const roleSelect = screen.getByLabelText('Browser-local demo role')
    fireEvent.change(roleSelect, { target: { value: 'moderator' } })
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))

    expect(await screen.findByText(/status: approved/)).toBeVisible()
    expect(JSON.parse(localStorage.getItem('kijiji-connect-demo-moderation') ?? '[]')).toEqual(
      [expect.objectContaining({ productId: 9011, status: 'approved', updatedBy: 'moderator' })],
    )
  })

  it('provides a reviewable learning flashcard on the academy route', async () => {
    render(
      <MemoryRouter initialEntries={['/learning']}>
        <App />
      </MemoryRouter>,
    )

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Recall this phrase' })).toBeVisible(), { timeout: 5000 })
    fireEvent.click(screen.getByRole('button', { name: 'Reveal answer' }))
    expect(screen.getByRole('button', { name: 'Hide answer' })).toBeVisible()
  })

  it('records a learning practice day after passing an assessment', async () => {
    render(
      <MemoryRouter initialEntries={['/learning']}>
        <App />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByLabelText('A friendly greeting and self-introduction.')).toBeVisible(), { timeout: 5000 })
    const assessment = createLevelAssessment(languageCourses[0].levels[0])
    assessment.forEach((question) => fireEvent.click(screen.getByLabelText(question.options[question.answerIndex])))
    fireEvent.click(screen.getByRole('button', { name: 'Check my answers' }))
    expect(await screen.findByText(/Passed:/)).toBeVisible()
    expect(JSON.parse(localStorage.getItem('kijiji-connect-learning-practice-days') ?? '[]')).toEqual(
      expect.arrayContaining([expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)]),
    )
  })

  it('lets the local demo seller update only their browser-local listing', async () => {
    const listing = {
      ...productsSeed[0],
      id: 9001,
      isDemoUserListing: true,
      ownerId: localDemoSellerId,
    }
    localStorage.setItem('kijiji-connect-products', JSON.stringify([listing]))
    render(
      <MemoryRouter initialEntries={['/seller']}>
        <App />
      </MemoryRouter>,
    )

    await waitFor(() => expect(document.querySelector('main > .standalone-page')).not.toBeNull(), { timeout: 5000 })
    const sellerPage = within(document.querySelector('main > .standalone-page') as HTMLElement)
    fireEvent.change(sellerPage.getByLabelText('Retail price for Fresh Avocado Grade A'), { target: { value: '4500' } })
    fireEvent.change(sellerPage.getByLabelText('Stock quantity for Fresh Avocado Grade A'), { target: { value: '5' } })
    fireEvent.click(sellerPage.getByRole('button', { name: 'Save price and stock' }))

    expect(await sellerPage.findByText('Price and sample stock saved in this browser only.')).toBeVisible()
    expect(JSON.parse(localStorage.getItem('kijiji-connect-products') ?? '[]')).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 9001, price: 4500, stockQuantity: 5, stock: 'Sample: Low stock' })]),
    )
  })

  it('requires assistant confirmation for seller price changes and supports undo', async () => {
    localStorage.setItem('kijiji-connect-products', JSON.stringify([{
      ...productsSeed[0],
      id: 9002,
      isDemoUserListing: true,
      ownerId: localDemoSellerId,
    }]))
    render(
      <MemoryRouter initialEntries={['/assistant']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ask Kijiji assistant' }))
    const assistantPanel = within(document.querySelector('.assistant-widget__panel') as HTMLElement)
    const input = assistantPanel.getByLabelText('Message the Kijiji Connect assistant')
    fireEvent.change(input, { target: { value: 'Set price of Fresh Avocado to 4500' } })
    fireEvent.submit(input.closest('form') as HTMLFormElement)

    const confirmation = await assistantPanel.findByRole('group', { name: 'Confirm proposed action' })
    expect(confirmation).toHaveTextContent('TZS 4,200')
    expect(confirmation).toHaveTextContent('TZS 4,500')
    expect(JSON.parse(localStorage.getItem('kijiji-connect-products') ?? '[]')).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 9002, price: 4200 })]),
    )

    fireEvent.click(within(confirmation).getByRole('button', { name: 'Confirm change' }))
    expect(await assistantPanel.findByRole('status')).toHaveTextContent('Undo within 30 seconds')
    expect(JSON.parse(localStorage.getItem('kijiji-connect-products') ?? '[]')).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 9002, price: 4500 })]),
    )
    fireEvent.click(assistantPanel.getByRole('button', { name: 'Undo within 30 seconds' }))
    expect(JSON.parse(localStorage.getItem('kijiji-connect-products') ?? '[]')).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 9002, price: 4200 })]),
    )
    expect(JSON.parse(localStorage.getItem('kijiji-connect-assistant-audit-log') ?? '[]')).toHaveLength(2)
  })

  it('requires confirmation before turning an assistant order request into a cart draft', async () => {
    render(
      <MemoryRouter initialEntries={['/assistant']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ask Kijiji assistant' }))
    const assistantPanel = within(document.querySelector('.assistant-widget__panel') as HTMLElement)
    const input = assistantPanel.getByLabelText('Message the Kijiji Connect assistant')
    fireEvent.change(input, { target: { value: 'Order 50kg avocado' } })
    fireEvent.submit(input.closest('form') as HTMLFormElement)

    const confirmation = await assistantPanel.findByRole('group', { name: 'Confirm proposed action' })
    expect(confirmation).toHaveTextContent('50 kg')
    expect(localStorage.getItem('kijiji-connect-demo-cart')).toBeNull()
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Confirm change' }))
    expect(JSON.parse(localStorage.getItem('kijiji-connect-demo-cart') ?? '[]')).toEqual([{ productId: 1, quantity: 50 }])
    expect(assistantPanel.getByText(/not an order, booking or payment/)).toBeVisible()

    fireEvent.click(assistantPanel.getByRole('button', { name: 'Undo within 30 seconds' }))
    expect(localStorage.getItem('kijiji-connect-demo-cart')).toBe('[]')
  })

  it('clears the saved assistant conversation and retains the welcome message', async () => {
    render(
      <MemoryRouter initialEntries={['/assistant']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ask Kijiji assistant' }))
    const assistantPanel = within(document.querySelector('.assistant-widget__panel') as HTMLElement)
    const input = assistantPanel.getByLabelText('Message the Kijiji Connect assistant')
    fireEvent.change(input, { target: { value: 'Find avocado products' } })
    fireEvent.submit(input.closest('form') as HTMLFormElement)
    expect(await assistantPanel.findByText('Find avocado products', { selector: 'p' })).toBeVisible()

    fireEvent.click(assistantPanel.getByRole('button', { name: 'Clear chat' }))

    expect(assistantPanel.queryByText('Find avocado products', { selector: 'p' })).toBeNull()
    expect(assistantPanel.getByText(/Welcome to Kijiji Connect/)).toBeVisible()
    expect(JSON.parse(localStorage.getItem('kijiji-connect-assistant-messages') ?? '[]')).toEqual([
      expect.objectContaining({ id: 1, role: 'assistant' }),
    ])
  })

  it('navigates between pages and updates the page title', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    const navigation = within(document.getElementById('primary-navigation')!)
    fireEvent.click(navigation.getByRole('link', { name: 'Marketplace' }))
    await waitFor(() => expect(document.querySelector('main')).toHaveAttribute('data-current-page', 'marketplace'))

    fireEvent.click(navigation.getByRole('link', { name: 'Travel' }))
    await waitFor(() => expect(document.querySelector('main')).toHaveAttribute('data-current-page', 'travel'))
    await waitFor(() => expect(document.querySelectorAll('#travel-booking .travel-offer-card')).toHaveLength(3), { timeout: 5000 })
  })

  it('shows a not-found page for an unknown URL', () => {
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })

  it('switches language and color theme with saved preferences', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'sw' } })
    expect(await screen.findByRole('heading', { name: 'Panga hatua yako inayofuata nchini Tanzania.' })).toBeVisible()
    expect(document.documentElement).toHaveAttribute('lang', 'sw')

    const themeToggle = document.querySelector<HTMLButtonElement>('.theme-toggle')
    expect(themeToggle).not.toBeNull()
    if (themeToggle) fireEvent.click(themeToggle)
    expect(document.querySelector('.app-shell')).toHaveAttribute('data-theme', 'dark')
    expect(localStorage.getItem('kijiji-connect-language')).toBe('"sw"')
    expect(localStorage.getItem('kijiji-connect-dark-mode')).toBe('true')
  })

  it('filters the sample catalogue and keeps search state in the URL', async () => {
    render(
      <MemoryRouter initialEntries={['/marketplace']}>
        <LocationProbe />
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Showing 1–12 of 41 sample listings/)).toBeVisible()
    expect(document.querySelectorAll('.product-card')).toHaveLength(12)
    fireEvent.change(screen.getByPlaceholderText('Product, category, supplier or location'), { target: { value: 'avocado' } })

    expect(await screen.findByRole('heading', { name: 'Fresh Avocado Grade A' })).toBeVisible()
    expect(document.querySelectorAll('.product-card')).toHaveLength(1)
    expect(screen.getByTestId('location-search')).toHaveTextContent('/marketplace?q=avocado')
  })

  it('keeps a browser-created listing when loading the expanded sample catalogue', async () => {
    const savedListing = {
      ...productsSeed[0],
      id: 99999,
      name: 'My saved local listing',
      isDemoUserListing: true,
    }
    localStorage.setItem('kijiji-connect-products', JSON.stringify([productsSeed[0], savedListing]))

    render(
      <MemoryRouter initialEntries={['/marketplace?page=4']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'My saved local listing' })).toBeVisible()
    expect(screen.getByText(/Showing 37–42 of 42 sample listings/)).toBeVisible()
  })

  it('previews and saves a bounded local listing image', async () => {
    render(
      <MemoryRouter initialEntries={['/marketplace']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Product name'), { target: { value: 'Local image test product' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'A test listing with a local image.' } })
    fireEvent.change(screen.getByLabelText('Retail price (TZS)'), { target: { value: '1000' } })
    fireEvent.change(screen.getByLabelText('Wholesale price (TZS)'), { target: { value: '900' } })
    fireEvent.change(screen.getByLabelText('Business/seller name'), { target: { value: 'Test seller' } })
    const image = new File(['local-image-content'], 'preview.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText(/Listing image/), { target: { files: [image] } })

    const preview = await screen.findByAltText('Preview of your listing image 1')
    await waitFor(() => expect(preview).toHaveAttribute('src', expect.stringMatching(/^data:image\/png;base64,/)))
    fireEvent.submit(screen.getByLabelText('Product name').closest('form') as HTMLFormElement)

    expect(JSON.parse(localStorage.getItem('kijiji-connect-products') ?? '[]')).toEqual(
      expect.arrayContaining([expect.objectContaining({
        name: 'Local image test product',
        image: expect.stringMatching(/^data:image\/png;base64,/),
      })]),
    )
  })

  it('applies combined audience, category, location, price and sample-stock filters', async () => {
    render(
      <MemoryRouter initialEntries={[
        '/marketplace?audience=B2C&category=Food+%26+beverages&location=Njiro&minPrice=8000&maxPrice=10000&stock=Sample%3A+Preorder',
      ]}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Premium Chai Masala Blend' })).toBeVisible()
    expect(document.querySelectorAll('.product-card')).toHaveLength(1)
    expect(screen.getByText(/Showing 1–1 of 1 sample listings/)).toBeVisible()
  })

  it('preserves each marketplace filter while updating filters through the UI', async () => {
    render(
      <MemoryRouter initialEntries={['/marketplace']}>
        <LocationProbe />
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'B2C' }))
    fireEvent.change(screen.getByLabelText('Category filter'), { target: { value: 'Food & beverages' } })
    fireEvent.change(screen.getByLabelText('Location filter'), { target: { value: 'Njiro' } })
    fireEvent.change(screen.getByLabelText('Minimum price'), { target: { value: '8000' } })
    fireEvent.change(screen.getByLabelText('Maximum price'), { target: { value: '10000' } })
    fireEvent.change(screen.getByLabelText('Sample availability filter'), { target: { value: 'Sample: Preorder' } })

    await waitFor(() => {
      const url = screen.getByTestId('location-search').textContent ?? ''
      expect(url).toContain('audience=B2C')
      expect(url).toContain('category=Food')
      expect(url).toContain('location=Njiro')
      expect(url).toContain('minPrice=8000')
      expect(url).toContain('maxPrice=10000')
      expect(url).toContain('stock=Sample')
    })
    expect(await screen.findByRole('heading', { name: 'Premium Chai Masala Blend' })).toBeVisible()
    expect(document.querySelectorAll('.product-card')).toHaveLength(1)
  })

  it('sorts and paginates sample listings', async () => {
    render(
      <MemoryRouter initialEntries={['/marketplace']}>
        <LocationProbe />
        <App />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Sort products'), { target: { value: 'price-asc' } })
    expect(await screen.findByRole('heading', { name: 'Classroom Exercise Books' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Page 2 of 4')).toBeVisible()
    expect(screen.getByTestId('location-search')).toHaveTextContent('sort=price-asc')
    expect(screen.getByTestId('location-search')).toHaveTextContent('page=2')
  })

  it('persists a local cart and creates only an explicitly simulated order record', async () => {
    render(
      <MemoryRouter initialEntries={['/marketplace']}>
        <App />
      </MemoryRouter>,
    )

    const avocadoCard = screen.getByRole('heading', { name: 'Fresh Avocado Grade A' }).closest('article')
    expect(avocadoCard).not.toBeNull()
    if (!avocadoCard) return
    fireEvent.click(within(avocadoCard).getByRole('button', { name: 'Add to cart: Fresh Avocado Grade A' }))
    fireEvent.change(screen.getByLabelText('Quantity for Fresh Avocado Grade A'), { target: { value: '30' } })
    expect(screen.getAllByText(/96,000/)).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: 'Review sandbox checkout' }))
    const checkout = screen.getByRole('dialog')
    expect(within(checkout).getAllByText(/96,000/)).toHaveLength(2)
    fireEvent.change(within(checkout).getByLabelText('Amount to pay now'), { target: { value: '60000' } })
    fireEvent.change(within(checkout).getByLabelText('Area and GPS destination'), { target: { value: 'njiro' } })
    fireEvent.change(within(checkout).getByLabelText('Street, landmark or building'), { target: { value: 'Near Njiro Complex' } })
    fireEvent.change(within(checkout).getByLabelText('Mobile money number'), { target: { value: '+255768868546' } })
    fireEvent.click(within(checkout).getByRole('button', { name: 'Simulate payment' }))

    expect((await screen.findAllByText(/no payment request was sent to a provider and no money was charged/)).length).toBeGreaterThan(0)
    expect(screen.getByText(/0 items · saved only in this browser/)).toBeVisible()
    expect(JSON.parse(localStorage.getItem('kijiji-connect-demo-cart') ?? '[]')).toEqual([])

    expect(JSON.parse(localStorage.getItem('kijiji-connect-demo-orders') ?? '[]')).toEqual([
      expect.objectContaining({
        deliveryPlaceId: 'njiro',
        deliveryAddress: 'Near Njiro Complex',
        deliveryStatus: 'pending-sender',
        paidAmount: 60000,
        balanceAmount: 36000,
      }),
    ])
  })
})
