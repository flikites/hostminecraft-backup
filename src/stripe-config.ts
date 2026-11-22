export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SYhEy6GWprSWow',
    priceId: 'price_1RdZqbLYEn3C5bpj2aRnz8sl',
    name: 'HostMinecraft Subdomain - Annual',
    description: 'Save $30 per year',
    mode: 'subscription',
    price: 30.00,
    currency: 'usd',
    interval: 'year',
  },
  {
    id: 'prod_SYhDqv21153mpT',
    priceId: 'price_1RdZodLYEn3C5bpjklC3RIsX',
    name: 'HostMinecraft Subdomain - Monthly',
    description: 'Per subdomain',
    mode: 'subscription',
    price: 5.00,
    currency: 'usd',
    interval: 'month',
  },
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}