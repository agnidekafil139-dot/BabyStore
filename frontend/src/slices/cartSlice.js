import { createSlice } from '@reduxjs/toolkit';

const loadCart = () => {
    try {
        const saved = JSON.parse(localStorage.getItem('cart') || '{}');
        return {
            cartItems: saved.cartItems || [],
            shippingAddress: saved.shippingAddress || {},
            paymentMethod: saved.paymentMethod || 'PIX',
        };
    } catch {
        return { cartItems: [], shippingAddress: {}, paymentMethod: 'PIX' };
    }
};

const initialState = loadCart();

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const existItem = state.cartItems.find((x) => x.id === item.id);

            if (existItem) {
                state.cartItems = state.cartItems.map((x) => x.id === existItem.id ? item : x);
            } else {
                state.cartItems = [...state.cartItems, item];
            }
            localStorage.setItem('cart', JSON.stringify(state));
        },
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter((x) => x.id !== action.payload);
            localStorage.setItem('cart', JSON.stringify(state));
        },
        saveShippingAddress: (state, action) => {
            state.shippingAddress = action.payload;
            localStorage.setItem('cart', JSON.stringify(state));
        },
        savePaymentMethod: (state, action) => {
            state.paymentMethod = action.payload;
            localStorage.setItem('cart', JSON.stringify(state));
        },
        clearCartItems: (state) => {
            state.cartItems = [];
            localStorage.setItem('cart', JSON.stringify(state));
        }
    },
});

export const { addToCart, removeFromCart, saveShippingAddress, savePaymentMethod, clearCartItems } = cartSlice.actions;
export default cartSlice.reducer;
