import { z } from 'zod'

export const priceReportSchema = z.object({
  productId: z.string().min(1, 'Choose a product.'),
  marketId: z.string().min(1, 'Choose a market.'),
  priceTzs: z.number().int('Enter a whole-number price.').positive('Price must be greater than zero.').max(100_000_000, 'Price is outside the accepted range.'),
  dateObserved: z.iso.date('Choose a valid observation date.'),
  note: z.string().trim().max(240, 'Keep the note under 240 characters.').optional(),
})

export type PriceReportInput = z.infer<typeof priceReportSchema>
