/**
 * BabyStore — Supabase Service Layer
 * All database operations go through this module.
 */
import { supabase } from './supabase';

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export async function fetchProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function fetchProductById(id) {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}

export async function createProduct() {
    const { data, error } = await supabase
        .from('products')
        .insert({
            name: 'Nouveau Produit',
            description: 'Description...',
            price: 0,
            count_in_stock: 0,
            images: [],
        })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateProduct(id, productData) {
    const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select('*, categories(*)')
        .single();
    if (error) throw error;
    return data;
}

export async function deleteProduct(id) {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

export async function fetchCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
    if (error) throw error;
    return data;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export async function loginUser(email, password) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (authError) {
        console.error('Auth error:', authError);
        throw authError;
    }

    // Fetch profile to get role & name
    try {
        const profile = await fetchUserProfile(authData.user.id);
        return {
            id: authData.user.id,
            email: authData.user.email,
            name: profile.name,
            role: profile.role,
            avatar: profile.avatar,
        };
    } catch (profileErr) {
        console.error('Profile fetch error:', profileErr);
        // Fallback si profil inexistant - créer un profil par défaut
        console.warn('Creating fallback profile for user:', authData.user.id);
        return {
            id: authData.user.id,
            email: authData.user.email,
            name: '',
            role: 'customer',
            avatar: null,
        };
    }
}

export async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function fetchUserProfile(userId) {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) throw error;
    return profile;
}

export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export async function fetchOrders() {
    const { data, error } = await supabase
        .from('orders')
        .select('*, profiles:user_id(name)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function createOrder(orderData) {
    const session = await getSession();
    if (!session) throw new Error('Vous devez être connecté pour passer commande.');

    const { data, error } = await supabase
        .from('orders')
        .insert({
            user_id: session.user.id,
            order_items: orderData.orderItems,
            shipping_address: orderData.shippingAddress || {},
            payment_method: orderData.paymentMethod || 'PIX',
            total_price: orderData.totalPrice,
        })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function markOrderDelivered(id) {
    const { data, error } = await supabase
        .from('orders')
        .update({ is_delivered: true, delivered_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ─── ADMIN OVERVIEW ──────────────────────────────────────────────────────────

export async function fetchAdminOverview() {
    // Use the admin_overview view for aggregate stats
    const { data: stats, error: statsError } = await supabase
        .from('admin_overview')
        .select('*')
        .single();
    if (statsError) throw statsError;

    // Fetch latest 5 orders for the dashboard
    const { data: latestOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*, profiles:user_id(name)')
        .order('created_at', { ascending: false })
        .limit(5);
    if (ordersError) throw ordersError;

    return {
        totalSales: Number(stats.total_sales) || 0,
        totalOrders: Number(stats.total_orders) || 0,
        totalProducts: Number(stats.total_products) || 0,
        totalUsers: Number(stats.total_users) || 0,
        latestOrders: latestOrders || [],
    };
}

// ─── USERS (Admin) ───────────────────────────────────────────────────────────

export async function fetchUsers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function updateUserRole(userId, role) {
    const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteUserProfile(userId) {
    // Delete the profile row (the auth.users entry remains — requires service role to delete)
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
    if (error) throw error;
}

// ─── IMAGE UPLOAD (Supabase Storage) ─────────────────────────────────────────

export async function uploadProductImage(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

    return data.publicUrl;
}
