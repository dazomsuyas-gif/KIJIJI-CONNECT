export const demoPaymentMethods = [
  { id: 'mpesa', label: 'M-Pesa', provider: 'Vodacom Tanzania', kind: 'mobile' },
  { id: 'mixx', label: 'Mixx by Yas', provider: 'Formerly Tigo Pesa', kind: 'mobile' },
  { id: 'airtel-money', label: 'Airtel Money', provider: 'Airtel Tanzania', kind: 'mobile' },
  { id: 'halopesa', label: 'HaloPesa', provider: 'Halotel Tanzania', kind: 'mobile' },
  { id: 'azampesa', label: 'AzamPesa', provider: 'AzamPay', kind: 'mobile' },
  { id: 'bank-transfer', label: 'Bank transfer', provider: 'CRDB / NMB demo', kind: 'bank' },
  { id: 'card', label: 'Bank card', provider: 'Visa / Mastercard demo', kind: 'card' },
] as const

export type DemoPaymentMethodId = (typeof demoPaymentMethods)[number]['id']

export type DemoPaymentRequest = {
  method: DemoPaymentMethodId
  phone: string
  amount: number
  productName: string
}

export type DemoPaymentResult = {
  reference: string
  status: 'SIMULATED'
  message: string
}

export async function createDemoPayment(request: DemoPaymentRequest): Promise<DemoPaymentResult> {
  if (!Number.isFinite(request.amount) || request.amount <= 0) {
    throw new Error('Payment amount must be greater than zero.')
  }
  if (!request.productName.trim()) {
    throw new Error('A product name is required to create a payment demo.')
  }

  await new Promise((resolve) => window.setTimeout(resolve, 450))

  return {
    reference: `KC-DEMO-${Date.now().toString(36).toUpperCase()}`,
    status: 'SIMULATED',
    message: 'Demo only: no payment request was sent to a provider and no money was charged.',
  }
}
