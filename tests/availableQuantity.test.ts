import { describe, it, expect } from 'vitest';
import { availableQuantity, type Item } from '@/types/item';

describe('availableQuantity', () => {
  const baseItem: Item = {
    id: '1',
    name: 'Test',
    imageUrl: '',
    details: '',
    quantity: 1,
    minQuantity: 0,
    skuCodes: [],
    pastSales: 0,
    status: 'not_sold',
    dateAdded: '',
    location: '',
    price: '0',
    feePercent: 0,
    tags: []
  };

  it('returns 0 when a sold item has quantity 1', () => {
    const item: Item = { ...baseItem, status: 'sold' };
    expect(availableQuantity(item)).toBe(0);
  });

  it('returns the quantity when item is not sold', () => {
    const item: Item = { ...baseItem, quantity: 2 };
    expect(availableQuantity(item)).toBe(2);
  });
});
