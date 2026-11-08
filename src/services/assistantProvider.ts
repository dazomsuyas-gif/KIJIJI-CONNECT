import { resolveDemoAssistantIntent, type DemoAssistantIntent } from './demoAssistant'

export interface AssistantProvider {
  readonly id: string
  resolve(input: string): DemoAssistantIntent
}

export const localAssistantProvider: AssistantProvider = {
  id: 'local-rules',
  resolve: resolveDemoAssistantIntent,
}
