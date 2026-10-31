import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateItemPrice, normalizeCartItem } from './cartPricing.js';

test('calculateItemPrice applies size variation and discount', () => {
  const item = { basePrice: 1000, priceVariation: 200, discount: 10 };

  assert.equal(calculateItemPrice(item), 1080);
});

test('normalizeCartItem stores a usable price for the cart', () => {
  const item = normalizeCartItem({
    sku: 'SKU-1',
    basePrice: 1000,
    priceVariation: 200,
    discount: 10,
    quantity: 2,
  });

  assert.equal(item.price, 1080);
  assert.equal(item.unitPrice, 1080);
  assert.equal(item.quantity, 2);
});
