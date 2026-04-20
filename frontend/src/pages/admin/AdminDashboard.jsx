import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Package, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchAdminOverview } from '../../lib/api';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const StatCard = ({ title, value, color, icon }) => (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
        <div style={{ background: color, padding: '1rem', borderRadius: 'var(--radius-md)', opacity: 0.15, position: 'absolute', top: '1rem', left: '1rem', right: '1rem', bottom: '1rem', zIndex: 0 }} />
        <div style={{ fontSize: '2rem', position: 'relative', zIndex: 1 }}>{icon}</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ color: 'var(--color-text-light)', fontSize: 'var(--text-sm)', marginBottom: '0.3rem' }}>{title}</h3>
            <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--color-text)' }}>{value}</p>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { t } = useTranslation();
    const { userInfo } = useSelector((state) => state.auth);
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadOverview = async () => {
            try {
                setLoading(true);
                const data = await fetchAdminOverview();
                setOverview(data);
            } catch (err) {
                console.error('Error fetching admin overview:', err);
                setError(err.message || 'Error fetching data');
            } finally {
                setLoading(false);
            }
        };
        if (userInfo?.role === 'admin') {
            loadOverview();
        }
    }, [userInfo]);

    if (!userInfo || userInfo.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    const menuItems = [
        { label: t('overview'), icon: <LayoutDashboard size={18} />, path: '/admin', active: true },
        { label: t('products'), icon: <Package size={18} />, path: '/admin/products' },
        { label: t('orders'), icon: <ShoppingBag size={18} />, path: '/admin/orders' },
        { label: t('users'), icon: <Users size={18} />, path: '/admin/users' },
    ];

    return (
        <div className="container main-layout">
            <div className="grid animate-fade-in" style={{ gridTemplateColumns: 'minmax(220px, 1fr) 3fr', gap: '2rem' }}>

                {/* Sidebar */}
                <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', height: 'fit-content' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                        <LayoutDashboard size={22} /> {t('dashboard')}
                    </h2>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className="btn"
                                    style={{
                                        width: '100%',
                                        justifyContent: 'flex-start',
                                        gap: '10px',
                                        background: item.active ? 'var(--color-secondary)' : 'transparent',
                                        fontWeight: item.active ? 600 : 400,
                                        display: 'flex',
                                        alignItems: 'center',
                                        textDecoration: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '0.7rem 1rem',
                                        color: 'var(--color-text)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {item.icon} {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Content */}
                <div>
                    <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                        {t('overview')} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--color-text-light)' }}>— {t('hello_admin', { name: userInfo.name })}</span>
                    </h1>

                    {loading ? (
                        <Loader />
                    ) : error ? (
                        <Message variant="danger">{error}</Message>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                <StatCard icon="💰" title={t('total_sales')} value={`R$ ${(overview.totalSales ?? 0).toFixed(2)}`} color="#f9c6d0" />
                                <StatCard icon="📦" title={t('total_orders')} value={overview.totalOrders} color="#c6e5fb" />
                                <StatCard icon="🛍️" title={t('total_products')} value={overview.totalProducts} color="#c6f9d5" />
                                <StatCard icon="👥" title={t('total_users')} value={overview.totalUsers} color="#f9edc6" />
                            </div>

                            {/* Quick Actions */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{t('quick_actions')}</h2>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <Link
                                        to="/admin/products"
                                        className="btn btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                                    >
                                        <Package size={18} /> {t('manage_products')} <ArrowRight size={16} />
                                    </Link>
                                    <Link
                                        to="/admin/orders"
                                        className="btn"
                                        style={{ background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--color-text)' }}
                                    >
                                        <ShoppingBag size={18} /> {t('view_orders')} <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{t('latest_orders')}</h2>
                            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}>
                                            <th style={{ padding: '1rem' }}>{t('table_id')}</th>
                                            <th style={{ padding: '1rem' }}>{t('table_user')}</th>
                                            <th style={{ padding: '1rem' }}>{t('table_date')}</th>
                                            <th style={{ padding: '1rem' }}>{t('table_total')}</th>
                                            <th style={{ padding: '1rem' }}>{t('table_paid')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {overview.latestOrders.map((order) => (
                                            <tr key={order.id} style={{ borderBottom: '1px solid var(--color-secondary)' }}>
                                                <td style={{ padding: '1rem' }}>{order.id.substring(0, 10)}...</td>
                                                <td style={{ padding: '1rem' }}>{order.profiles?.name || 'Unknown'}</td>
                                                <td style={{ padding: '1rem' }}>{order.created_at.substring(0, 10)}</td>
                                                <td style={{ padding: '1rem' }}>R$ {(order.total_price ?? 0).toFixed(2)}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    {order.is_paid ? (
                                                        <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>{t('yes_pix')}</span>
                                                    ) : (
                                                        <span style={{ color: 'var(--color-error)' }}>{t('no')}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
