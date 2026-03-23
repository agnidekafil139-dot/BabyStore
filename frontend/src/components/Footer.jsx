import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-secondary)', padding: '4rem 0 2rem 0', marginTop: 'auto' }}>
            <div className="container grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                <div>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary-dark)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🍼</span> BabyStore
                    </h3>
                    <p style={{ color: 'var(--color-text-light)', lineHeight: '1.6', marginBottom: '1rem', fontSize: 'var(--text-sm)' }}>
                        {t('footer_desc')}<br />
                        {t('footer_secure')}
                    </p>
                </div>
                <div>
                    <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>{t('quick_links')}</h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: 'var(--text-sm)' }}>
                        <li><Link to="/" style={{ color: 'var(--color-text-light)', textDecoration: 'none' }}>{t('home')}</Link></li>
                        <li><Link to="/products" style={{ color: 'var(--color-text-light)', textDecoration: 'none' }}>{t('catalog')}</Link></li>
                        <li><Link to="/cart" style={{ color: 'var(--color-text-light)', textDecoration: 'none' }}>{t('my_cart')}</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>{t('information')}</h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: 'var(--text-sm)' }}>
                        <li><span style={{ color: 'var(--color-text-light)', cursor: 'pointer' }}>{t('about_us')}</span></li>
                        <li><span style={{ color: 'var(--color-text-light)', cursor: 'pointer' }}>{t('privacy_policy')}</span></li>
                        <li><span style={{ color: 'var(--color-text-light)', cursor: 'pointer' }}>{t('terms_conditions')}</span></li>
                    </ul>
                </div>
                <div>
                    <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>{t('contact')}</h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--color-text-light)', fontSize: 'var(--text-sm)' }}>
                        <li>📍 123 Baby Avenue, SP</li>
                        <li>📞 +55 11 9999-9999</li>
                        <li>✉️ contact@babystore.com</li>
                    </ul>
                </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--color-text-light)', borderTop: '1px solid var(--color-secondary)', paddingTop: '1.5rem', fontSize: '0.9rem' }}>
                <p>&copy; {new Date().getFullYear()} BabyStore. {t('all_rights_reserved')}</p>
            </div>
        </footer>
    );
};

export default Footer;
