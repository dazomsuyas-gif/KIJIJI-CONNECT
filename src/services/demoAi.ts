export type DemoContentRequest = {
  title: string
  kind: string
  topic: string
}

export function generateDemoContent({ title, kind, topic }: DemoContentRequest): string {
  const cleanTopic = topic.trim().replace(/[.!?]+$/, '')
  if (!cleanTopic) {
    throw new Error('Add a topic or product details before generating a draft.')
  }

  if (kind === 'Social media post') {
    return `${title}: ${cleanTopic}. Discover a reliable local option, ask us about availability, and connect with the Kijiji Connect community. #Tanzania #LocalBusiness`
  }

  if (kind === 'Video script') {
    return `Opening: Meet ${cleanTopic}.\nKey message: Share what makes this offer useful and who it serves.\nCall to action: Ask about current availability and connect directly with the seller.`
  }

  if (kind === 'Business article') {
    return `${title}\n\n${cleanTopic} can create practical opportunities for local businesses. Start with clear information, understand customer needs, and confirm availability and terms before making decisions. Build trust through consistent service and transparent communication.`
  }

  return `${cleanTopic}. Learn about the product, confirm current availability and delivery details, and contact the seller to discuss the right option for your needs.`
}
