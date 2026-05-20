/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as flowerOrderCustomerConfirmation } from './flower-order-customer-confirmation.tsx'
import { template as flowerOrderFunerariaNotification } from './flower-order-funeraria-notification.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'flower-order-customer-confirmation': flowerOrderCustomerConfirmation,
  'flower-order-funeraria-notification': flowerOrderFunerariaNotification,
}