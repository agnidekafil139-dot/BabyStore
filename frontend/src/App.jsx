import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductsList from './pages/admin/AdminProductsList';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import AdminOrdersList from './pages/admin/AdminOrdersList';
import AdminUsersList from './pages/admin/AdminUsersList';
import ProductsPage from './pages/ProductsPage';
import ProductDetails from './pages/ProductDetails';
import { supabase } from './lib/supabase';
import { fetchUserProfile } from './lib/api';
import { setCredentials, logout } from './slices/authSlice';

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        // 1. Listen for auth changes (login, logout, session refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Supabase Auth Event:', event);
            if (session?.user) {
                try {
                    const profile = await fetchUserProfile(session.user.id);
                    dispatch(setCredentials({
                        id: session.user.id,
                        email: session.user.email,
                        name: profile.name,
                        role: profile.role,
                        avatar: profile.avatar,
                    }));
                } catch (err) {
                    console.error('Error fetching profile on auth change:', err);
                }
            } else {
                dispatch(logout());
            }
        });

        return () => subscription.unsubscribe();
    }, [dispatch]);

    return (
        <Router>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/product/:id" element={<ProductDetails />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/products" element={<AdminProductsList />} />
                        <Route path="/admin/products/:id/edit" element={<AdminProductEdit />} />
                        <Route path="/admin/orders" element={<AdminOrdersList />} />
                        <Route path="/admin/users" element={<AdminUsersList />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
