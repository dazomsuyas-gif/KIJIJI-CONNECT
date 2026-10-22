import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

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
})
