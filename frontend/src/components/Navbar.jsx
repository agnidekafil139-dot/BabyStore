import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User, LogOut, Globe } from 'lucide-react';
import { logout } from '../slices/authSlice';
import { useTranslation } from 'react-i18next';
import { logoutUser } from '../lib/api';

const Navbar = () => {
    const { cartItems } = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const logoutHandler = async () => {
        try {
            await logoutUser();
        } catch (err) {
            console.error('Logout error:', err);
        }
        dispatch(logout());
    };

    return (
        <nav className="navbar glass">
            <div className="container navbar-container">
                <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🍼 {t('navbar_title')}
                </Link>
                <div className="nav-links">
                    {/* Language Switcher */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--color-surface)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-md)' }}>
                        <Globe size={18} color="var(--color-text-light)" />
                        <select
                            onChange={(e) => changeLanguage(e.target.value)}
                            value={i18n.language}
                            style={{ border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--color-text)' }}
                        >
                            <option value="fr">FR</option>
                            <option value="en">EN</option>
                            <option value="por">POR</option>
                        </select>
                    </div>

                    <Link to="/products" className="btn" style={{ color: 'var(--color-text)' }}>{t('catalog')}</Link>
                    <Link to="/cart" className="btn btn-secondary" style={{ position: 'relative' }} title={t('cart')}>
                        <ShoppingCart size={20} />
                        {cartItems.length > 0 && (
                            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--color-primary-dark)', color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem' }}>
                                {cartItems.reduce((a, c) => a + c.qty, 0)}
                            </span>
                        )}
                    </Link>

                    {userInfo ? (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                                {userInfo.name || userInfo.email}
                            </span>
                            {userInfo.role === 'admin' && (
                                <Link to="/admin" className="btn" style={{ background: '#eee' }}>{t('admin')}</Link>
                            )}
                            <button onClick={logoutHandler} className="btn" style={{ padding: '0.5rem', color: 'var(--color-text-light)' }} title={t('logout')}><LogOut size={20} /></button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary">{t('login')}</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
