import { createSlice } from "@reduxjs/toolkit";
import { normalizeCartItem } from "./cartPricing";

const loadCartFromStorage = () => {
  const storedCart = localStorage.getItem("cartItems");
  if (!storedCart) return [];

  try {
    return JSON.parse(storedCart).map(normalizeCartItem);
  } catch (error) {
    console.error("Failed to parse cartItems", error);
    return [];
  }
};

const loadCouponFromStorage = () => {
  const storedCoupon = localStorage.getItem("cartCoupon");
  if (!storedCoupon || storedCoupon === "undefined" || storedCoupon === "null") {
    return null;
  }
  try {
    return JSON.parse(storedCoupon);
  } catch (error) {
    console.error("Failed to parse cartCoupon", error);
    return null;
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: loadCartFromStorage(),
    coupon: loadCouponFromStorage(),
    isCartOpen: false,
  },
  reducers: {
    addToCart: (state, action) => {
      const item = normalizeCartItem(action.payload);
      if (item.stock !== undefined && item.stock < 1) return;
      // Search by our new unique cartItemId instead of standard SKU
      const existingItem = state.items.find((i) => i.cartItemId === item.cartItemId);

      if (existingItem) {
        const requestedQuantity = existingItem.quantity + item.quantity;
        existingItem.quantity = item.stock
          ? Math.min(requestedQuantity, item.stock)
          : requestedQuantity;
        existingItem.stock = item.stock;
        existingItem.price = item.price;
        existingItem.unitPrice = item.unitPrice;
      } else {
        state.items.push(item);
      }
      localStorage.setItem("cartItems", JSON.stringify(state.items));
      state.isCartOpen = true;
    },
    updateQuantity: (state, action) => {
      const { cartItemId, quantity } = action.payload; // Updated to cartItemId
      const item = state.items.find((i) => i.cartItemId === cartItemId);
      if (item) {
        const requestedQuantity = Math.max(1, quantity);
        item.quantity = item.stock
          ? Math.min(requestedQuantity, item.stock)
          : requestedQuantity;
        const normalized = normalizeCartItem(item);
        Object.assign(item, normalized);
      }
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      // Updated to filter by cartItemId
      state.items = state.items.filter((i) => i.cartItemId !== action.payload);
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      localStorage.removeItem("cartItems");
      localStorage.removeItem("cartCoupon");
    },
    applyCoupon: (state, action) => {
      state.coupon = action.payload;
      localStorage.setItem("cartCoupon", JSON.stringify(action.payload));
    },
    removeCoupon: (state) => {
      state.coupon = null;
      localStorage.removeItem("cartCoupon");
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart, toggleCart, closeCart, applyCoupon, removeCoupon } = cartSlice.actions;
export default cartSlice.reducer;