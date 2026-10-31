export const calculateItemPrice = (item = {}) => {
  const basePrice = Number(item.basePrice ?? 0);
  const priceVariation = Number(item.priceVariation ?? 0); // This is now the custom surcharge
  const discount = Number(item.discount ?? 0);
  const currentBasePrice = basePrice + priceVariation;

  return discount > 0 ? currentBasePrice - currentBasePrice * (discount / 100) : currentBasePrice;
};

export const normalizeCartItem = (item = {}) => {
  const normalized = { ...item };
  const unitPrice = calculateItemPrice(normalized);

  normalized.unitPrice = unitPrice;
  normalized.price = unitPrice;

  if (!normalized.quantity || Number(normalized.quantity) < 1) {
    normalized.quantity = 1;
  }

  if (normalized.stock !== undefined && normalized.stock !== null) {
    normalized.stock = Number(normalized.stock);
    if (normalized.stock > 0) {
      normalized.quantity = Math.min(normalized.quantity, normalized.stock);
    }
  }

  // NEW: Generate a strictly unique cart ID
  if (normalized.size === "CUSTOM" && normalized.customMeasurements) {
    // Encodes measurements so differing custom items don't merge
    const measureString = Object.entries(normalized.customMeasurements)
      .map(([k, v]) => `${k}:${v}`).sort().join('|');
    normalized.cartItemId = `${normalized.sku}-${measureString}`;
  } else {
    normalized.cartItemId = normalized.sku; // Standard sizes use SKU as unique ID
  }

  return normalized;
};