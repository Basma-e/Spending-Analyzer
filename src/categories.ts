import type { BuiltInCategoryId } from './types';

const RULES: { category: BuiltInCategoryId; keywords: string[] }[] = [
  {
    category: 'food',
    keywords: [
      'restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'chipotle', 'subway',
      'doordash', 'uber eats', 'grubhub', 'instacart', 'grocery', 'kroger', 'safeway',
      'whole foods', 'trader joe', 'aldi', 'publix', 'food', 'pizza', 'burger', 'taco',
      'dining', 'bakery', 'deli', 'wendy', 'dunkin', 'panera', 'costco whse', 'heb ',
      'walmart super', 'market', 'kitchen', 'bar & grill', 'sushi', 'thai', 'chinese',
    ],
  },
  {
    category: 'gas',
    keywords: [
      'shell', 'chevron', 'exxon', 'mobil', 'bp ', 'arco', 'speedway', 'marathon',
      'sunoco', 'valero', 'circle k', 'gas station', 'fuel', 'petro', '76 ', 'conoco',
      'costco gas', 'wawa', 'sheetz', 'quiktrip', 'racetrac',
    ],
  },
  {
    category: 'shopping',
    keywords: [
      'amazon', 'amzn', 'target', 'walmart', 'best buy', 'home depot', 'lowes',
      'ikea', 'nike', 'adidas', 'ebay', 'etsy', 'mall', 'retail', 'store', 'shop',
      'clothing', 'fashion', 'apple.com', 'zara', 'h&m', 'costco', 'tj maxx',
      'marshalls', 'ross ', 'nordstrom', 'macys', 'kohls', 'wayfair', 'shein',
    ],
  },
  {
    category: 'necessities',
    keywords: [
      'rent', 'mortgage', 'insurance', 'electric', 'utility', 'utilities', 'water bill',
      'internet', 'comcast', 'xfinity', 'verizon', 'at&t', 't-mobile', 'phone bill',
      'pharmacy', 'cvs', 'walgreens', 'medical', 'doctor', 'hospital', 'dental',
      'health', 'prescription', 'loan payment', 'tuition', 'daycare', 'childcare',
      'hoa', 'property tax', 'car payment', 'auto loan',
    ],
  },
];

export function categorizeDescription(description: string): string {
  const lower = description.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.category;
    }
  }
  return 'other';
}
