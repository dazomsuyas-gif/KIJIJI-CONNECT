import { useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { arushaMarkets, getApprovedPriceObservations, lastUpdated, priceProducts, sampleMarketPrices, type MarketPriceObservation } from '../services/marketPrices'
import { localPriceForecastProvider, type ForecastHorizon } from '../services/priceForecast'
import { priceReportSchema } from '../services/priceReportSchema'
import type { DemoRole } from '../services/demoModeration'
import { productsSeed } from '../services/marketplaceCatalog'

type PriceAlert = { id: string; productId: string; targetTzs: number }
type PricesPageProps = { demoRole: DemoRole; onDemoRoleChange: (role: DemoRole) => void }

const reportsKey = 'kijiji-connect-price-reports'
const alertsKey = 'kijiji-connect-price-alerts'
const formatTzs = (amount: number) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(amount)

function readLocal<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) as T : fallback
  } catch (error) {
    console.error(`Could not read local ${key}.`, error)
    return fallback
  }
}

function SummaryChart({ rows }: { rows: Array<{ name: string; value: number }> }) {
  const maximum = Math.max(...rows.map((row) => row.value), 1)
  return (
    <div className="prices-chart" role="img" aria-label="Average sample price by Arusha market" tabIndex={0}>
      <svg viewBox={`0 0 640 ${Math.max(150, rows.length * 38 + 20)}`} aria-hidden="true">
        {rows.map((row, index) => {
          const y = index * 38 + 8
          const width = Math.max(2, row.value / maximum * 360)
          return <g key={row.name}><text x="0" y={y + 17}>{row.name}</text><rect x="235" y={y} width={width} height="23" rx="6" /><text x={Math.min(610, 245 + width)} y={y + 17}>{formatTzs(row.value)}</text></g>
        })}
      </svg>
    </div>
  )
}

function ForecastChart({ history, lower, estimate, upper }: { history: Array<{ date: string; priceTzs: number }>; lower?: number; estimate?: number; upper?: number }) {
  const values = [...history.map((point) => point.priceTzs), ...(lower ? [lower] : []), ...(upper ? [upper] : [])]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  const point = (value: number, index: number) => `${24 + index * 52},${110 - ((value - min) / range) * 86}`
  const historyPoints = history.map((item, index) => point(item.priceTzs, index)).join(' ')
  const last = history[history.length - 1]
  const futureX = 24 + history.length * 52
  const forecastY = (value: number) => 110 - ((value - min) / range) * 86
  return (
    <div className="forecast-chart" role="img" aria-label="Historical sample prices and forecast estimate band" tabIndex={0}>
      <svg viewBox={`0 0 ${Math.max(330, futureX + 30)} 130`} aria-hidden="true">
        <line x1="20" y1="112" x2={futureX + 10} y2="112" />
        <polyline className="forecast-chart__history" points={historyPoints} />
        {last && estimate !== undefined && lower !== undefined && upper !== undefined && <g>
          <line className="forecast-chart__connector" x1={futureX - 28} y1={forecastY(last.priceTzs)} x2={futureX} y2={forecastY(estimate)} />
          <line className="forecast-chart__band" x1={futureX} y1={forecastY(lower)} x2={futureX} y2={forecastY(upper)} />
          <circle cx={futureX} cy={forecastY(estimate)} r="5" />
        </g>}
      </svg>
      <div className="forecast-chart__legend"><span>Observed sample prices</span><span>Estimated range</span></div>
    </div>
  )
}

export function PricesPage({ demoRole, onDemoRoleChange }: PricesPageProps) {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [marketFilter, setMarketFilter] = useState(searchParams.get('market') ?? '')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedProductId, setSelectedProductId] = useState(searchParams.get('product') ?? 'tomatoes')
  const [horizon, setHorizon] = useState<ForecastHorizon>(7)
  const [reports, setReports] = useState<MarketPriceObservation[]>(() => readLocal(reportsKey, []))
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => readLocal(alertsKey, []))
  const [reportMessage, setReportMessage] = useState('')
  const [reportError, setReportError] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [reportForm, setReportForm] = useState(() => ({ productId: searchParams.get('product') ?? 'tomatoes', marketId: 'kilombero', priceTzs: '', dateObserved: new Date().toISOString().slice(0, 10), note: '' }))
  const categories = [...new Set(priceProducts.map((product) => product.category))]
  const approvedObservations = useMemo(() => getApprovedPriceObservations(reports), [reports])
  const filteredProducts = priceProducts.filter((product) =>
    (!query || `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase()))
    && (!category || product.category === category),
  )
  const selectedProduct = priceProducts.find((product) => product.id === selectedProductId) ?? priceProducts[0]
  const observations = approvedObservations.filter((item) =>
    item.productId === selectedProduct.id
    && (!marketFilter || item.marketId === marketFilter)
    && (!startDate || item.dateObserved >= startDate)
    && (!endDate || item.dateObserved <= endDate),
  )
  const marketRows = arushaMarkets.flatMap((market) => {
    const prices = observations.filter((item) => item.marketId === market.id)
    if (!prices.length) return []
    const average = Math.round(prices.reduce((sum, item) => sum + item.priceTzs, 0) / prices.length)
    return [{ market, average, min: Math.min(...prices.map((item) => item.priceTzs)), max: Math.max(...prices.map((item) => item.priceTzs)), count: prices.length }]
  }).sort((left, right) => sortDirection === 'asc' ? left.average - right.average : right.average - left.average)
  const overallAverage = observations.length ? Math.round(observations.reduce((sum, item) => sum + item.priceTzs, 0) / observations.length) : 0
  const overallMin = observations.length ? Math.min(...observations.map((item) => item.priceTzs)) : 0
  const overallMax = observations.length ? Math.max(...observations.map((item) => item.priceTzs)) : 0
  const spreadPercent = overallAverage ? Math.round((overallMax - overallMin) / overallAverage * 100) : 0
  const listing = productsSeed.find((item) => item.name.toLowerCase().includes(selectedProduct.name.toLowerCase()))
  const forecast = localPriceForecastProvider.forecast(
    approvedObservations.filter((item) => item.productId === selectedProduct.id).map((item) => ({ date: item.dateObserved, priceTzs: item.priceTzs })),
    horizon,
  )
  const triggeredAlerts = alerts.filter((alert) => alert.productId === selectedProduct.id && overallAverage > 0 && overallAverage <= alert.targetTzs)

  const saveReports = (next: MarketPriceObservation[]) => {
    try {
      localStorage.setItem(reportsKey, JSON.stringify(next))
      setReports(next)
    } catch (error) {
      console.error('Could not save local price reports.', error)
      setReportError('Could not save this report in the browser. Check available storage and try again.')
    }
  }
  const saveAlerts = (next: PriceAlert[]) => {
    try {
      localStorage.setItem(alertsKey, JSON.stringify(next))
      setAlerts(next)
    } catch (error) {
      console.error('Could not save local price alerts.', error)
      setAlertMessage('Could not save this alert in the browser. Check available storage and try again.')
    }
  }
  const submitReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setReportError('')
    setReportMessage('')
    const parsed = priceReportSchema.safeParse({
      ...reportForm,
      priceTzs: Number(reportForm.priceTzs),
    })
    if (!parsed.success) {
      setReportError(parsed.error.issues[0]?.message ?? 'Review the report details and try again.')
      return
    }
    const report: MarketPriceObservation = {
      ...parsed.data,
      id: `buyer-${reports.length + 1}`,
      unit: priceProducts.find((item) => item.id === parsed.data.productId)?.unit ?? 'unit',
      source: 'buyer report',
      status: 'pending',
    }
    saveReports([report, ...reports])
    setReportMessage('Price report submitted to the local moderation queue. It will not affect averages until approved.')
    setReportForm((current) => ({ ...current, priceTzs: '', note: '' }))
  }
  const moderateReport = (reportId: string, status: 'approved' | 'rejected') => {
    saveReports(reports.map((report) => report.id === reportId ? { ...report, status } : report))
  }
  const addAlert = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const target = Number(new FormData(event.currentTarget).get('targetPrice'))
    if (!Number.isSafeInteger(target) || target <= 0) {
      setAlertMessage('Enter a positive whole-number target price.')
      return
    }
    saveAlerts([{ id: `alert-${alerts.length + 1}`, productId: selectedProduct.id, targetTzs: target }, ...alerts])
    setAlertMessage('Local price alert saved. No external notification will be sent.')
    event.currentTarget.reset()
  }

  return (
    <section className="section-block prices-page" data-route-page="prices" aria-labelledby="prices-title">
      <div className="section-heading"><div><span className="eyebrow">Arusha · local price comparison</span><h1 id="prices-title">Compare prices by market</h1><p>Explore clearly labelled sample observations, compare markets, and contribute prices for moderator review.</p></div></div>
      <p className="phase-note"><strong>Sample data:</strong> all seeded prices below are illustrative and are not verified market quotes. Estimates from sample data are not a guarantee.</p>
      <div className="prices-toolbar">
        <label>Search products<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tomatoes, cement, rice…" /></label>
        <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Market<select value={marketFilter} onChange={(event) => setMarketFilter(event.target.value)}><option value="">All markets</option>{arushaMarkets.map((market) => <option key={market.id} value={market.id}>{market.name}</option>)}</select></label>
        <label>From date<input aria-label="From date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
        <label>To date<input aria-label="To date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
      </div>
      <div className="prices-content-grid">
        <aside className="prices-product-list" aria-label="Products">
          <h2>Products</h2>
          {filteredProducts.map((product) => <button key={product.id} className={selectedProduct.id === product.id ? 'prices-product is-active' : 'prices-product'} type="button" onClick={() => setSelectedProductId(product.id)}><span>{product.name}</span><small>{product.category} · per {product.unit}</small></button>)}
          {!filteredProducts.length && <p className="empty-state">No products match. Adjust your search or category.</p>}
        </aside>
        <div className="prices-main">
          <section className="best-market-card" aria-labelledby="best-market-heading">
            <div><span className="eyebrow">Best place to buy · sample data</span><h2 id="best-market-heading">{marketRows[0]?.market.name ?? 'No market match'}</h2><p>{selectedProduct.name} · {selectedProduct.unit} · lowest average in the selected date range.</p></div>
            <strong>{marketRows[0] ? formatTzs(marketRows[0].average) : '—'}</strong>
          </section>
          <div className="prices-stat-grid">
            <article><span>Market average</span><strong>{overallAverage ? formatTzs(overallAverage) : '—'}</strong></article>
            <article><span>Minimum</span><strong>{overallMin ? formatTzs(overallMin) : '—'}</strong></article>
            <article><span>Maximum</span><strong>{overallMax ? formatTzs(overallMax) : '—'}</strong></article>
            <article><span>Spread</span><strong>{spreadPercent}%</strong></article>
          </div>
          {listing && overallAverage > 0 && <p className="price-listing-comparison"><Link to={`/products/${listing.id}`}>Compare with marketplace listing</Link>: sample listing {formatTzs(listing.price)} per {listing.unit}; selected market average {formatTzs(overallAverage)}. Listing is illustrative, not verified.</p>}
          <div className="prices-table-wrap">
            <table className="prices-table"><caption>{selectedProduct.name} price by market · sample data{marketFilter ? ` · ${marketRows.length} selected market` : ''}</caption><thead><tr><th>Market</th><th><button type="button" onClick={() => setSortDirection((value) => value === 'asc' ? 'desc' : 'asc')}>Average {sortDirection === 'asc' ? '↑' : '↓'}</button></th><th>Min–max</th><th>Observations</th></tr></thead><tbody>
              {marketRows.map((row, index) => <tr key={row.market.id} className={index === 0 ? 'is-cheapest' : ''}><th scope="row">{row.market.name}<small>{row.market.area}</small></th><td>{formatTzs(row.average)} / {selectedProduct.unit}{index === 0 && <span className="cheapest-tag">Lowest sample average</span>}</td><td>{formatTzs(row.min)}–{formatTzs(row.max)}</td><td>{row.count}</td></tr>)}
              {!marketRows.length && <tr><td colSpan={4}>No observations match the selected date range.</td></tr>}
            </tbody></table>
          </div>
          <SummaryChart rows={marketRows.map((row) => ({ name: row.market.name, value: row.average }))} />
          <p className="prices-updated">Sample rows last updated {new Date(lastUpdated).toLocaleDateString()} · sample data, not a market guarantee.</p>
          <section className="forecast-panel" aria-labelledby="forecast-heading">
            <div className="section-heading"><div><span className="eyebrow">Local statistical estimate</span><h2 id="forecast-heading">Price trend estimate</h2></div><label>Horizon<select value={horizon} onChange={(event) => setHorizon(Number(event.target.value) as ForecastHorizon)}><option value={7}>7 days</option><option value={14}>14 days</option><option value={30}>30 days</option></select></label></div>
            <p className="forecast-honesty">Estimate from sample data, not a guarantee.</p>
            {forecast.status === 'ready' ? <><div className="forecast-estimate"><strong>{formatTzs(forecast.estimateTzs ?? 0)}</strong><span>Expected sample estimate in {horizon} days · {forecast.confidence} confidence</span><small>Range: {formatTzs(forecast.lowerTzs ?? 0)}–{formatTzs(forecast.upperTzs ?? 0)}</small></div><ForecastChart history={forecast.history} lower={forecast.lowerTzs} estimate={forecast.estimateTzs} upper={forecast.upperTzs} /><p>{forecast.explanation}</p></> : <p>{forecast.explanation}</p>}
          </section>
          <section className="price-alert-panel" aria-labelledby="price-alert-heading">
            <h2 id="price-alert-heading">Local price alerts</h2><p>Saved in this browser only. Alerts do not send push, SMS or email notifications.</p>
            {triggeredAlerts.map((alert) => <p className="price-alert-trigger" key={alert.id} role="status">Sample average is at or below your target of {formatTzs(alert.targetTzs)}.</p>)}
            <form onSubmit={addAlert}><label htmlFor="target-price">Alert when average is at or below (TZS)</label><div><input id="target-price" name="targetPrice" type="number" min="1" step="1" required /><button className="primary-button" type="submit">Save local alert</button></div></form>
            <ul>{alerts.map((alert) => <li key={alert.id}>{priceProducts.find((product) => product.id === alert.productId)?.name}: {formatTzs(alert.targetTzs)} <button type="button" aria-label={`Remove ${alert.id}`} onClick={() => saveAlerts(alerts.filter((item) => item.id !== alert.id))}>Remove</button></li>)}</ul>
            {alertMessage && <p role="status">{alertMessage}</p>}
          </section>
        </div>
      </div>
      <section className="price-report-panel" aria-labelledby="price-report-heading">
        <div className="section-heading"><div><span className="eyebrow">Community contribution · moderation required</span><h2 id="price-report-heading">Report a price</h2><p>Reports remain separate from sample rows and only approved reports count in averages.</p></div></div>
        <form className="price-report-form" onSubmit={submitReport}>
          <label>Product<select value={reportForm.productId} onChange={(event) => setReportForm((current) => ({ ...current, productId: event.target.value }))}>{priceProducts.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.unit}</option>)}</select></label>
          <label>Market<select value={reportForm.marketId} onChange={(event) => setReportForm((current) => ({ ...current, marketId: event.target.value }))}>{arushaMarkets.map((market) => <option key={market.id} value={market.id}>{market.name}</option>)}</select></label>
          <label>Price (TZS)<input type="number" min="1" step="1" required value={reportForm.priceTzs} onChange={(event) => setReportForm((current) => ({ ...current, priceTzs: event.target.value }))} /></label>
          <label>Date observed<input type="date" required value={reportForm.dateObserved} onChange={(event) => setReportForm((current) => ({ ...current, dateObserved: event.target.value }))} /></label>
          <label className="price-report-form__note">Optional note<input maxLength={240} value={reportForm.note} onChange={(event) => setReportForm((current) => ({ ...current, note: event.target.value }))} /></label>
          <button type="submit" className="primary-button">Submit for review</button>
        </form>
        {reportError && <p role="alert" className="storage-error">{reportError}</p>}
        {reportMessage && <p role="status">{reportMessage}</p>}
        <div className="price-report-queue"><div className="section-heading"><h3>Price reports · Sample rows are separate</h3><label>Demo role<select aria-label="Demo role for price moderation" value={demoRole} onChange={(event) => onDemoRoleChange(event.target.value as DemoRole)}><option value="viewer">Viewer</option><option value="seller">Seller</option><option value="moderator">Moderator</option></select></label></div>
          {reports.map((report) => <article key={report.id}><div><strong>{priceProducts.find((product) => product.id === report.productId)?.name}</strong><span>{arushaMarkets.find((market) => market.id === report.marketId)?.name} · {formatTzs(report.priceTzs)} · {report.dateObserved}</span><small>Buyer report · {report.status}{report.note ? ` · ${report.note}` : ''}</small></div>{report.status === 'pending' && demoRole === 'moderator' && <div><button type="button" onClick={() => moderateReport(report.id, 'approved')}>Approve</button><button type="button" onClick={() => moderateReport(report.id, 'rejected')}>Reject</button></div>}</article>)}
          {!reports.length && <p>No buyer reports yet. Seeded rows remain labelled sample data and are not reports.</p>}
        </div>
      </section>
      <p className="prices-page__footnote">{sampleMarketPrices.length} seeded observations across {priceProducts.length} sample products and {arushaMarkets.length} Arusha locations. All seeded rows use source “sample”.</p>
    </section>
  )
}
