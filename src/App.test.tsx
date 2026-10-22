import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { productsSeed } from './services/marketplaceCatalog'

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
    expect(document.querySelectorAll('#travel-booking .travel-offer-card')).toHaveLength(3)
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
})
