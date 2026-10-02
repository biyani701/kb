import type { Domain } from '../schema'

// apps/portfolio domainKnowledgeData. Each domain's topics are Markdown files in the folder named by its id.
export const domains = [
  {
    id: 'credit-cards-payments',
    name: 'Credit cards & payments',
    short: 'Cards & payments',
    summary: 'Knowledge related to credit card processing, payment networks, and transaction flows.',
  },
  {
    id: 'market-reference-data',
    name: 'Market reference data',
    short: 'Market reference data',
    summary: 'Information about market data, reference data management, and financial instruments.',
  },
  {
    id: 'capital-markets',
    name: 'Capital markets',
    short: 'Capital markets',
    summary: 'Knowledge about capital markets, trading, and investment banking operations.',
  },
] as const satisfies readonly Domain[]
