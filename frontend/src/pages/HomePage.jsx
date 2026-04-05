import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../constants';
import { fetchProducts, fetchCategories } from '../lib/api';

const CATEGORY_ICONS = {
    vetements: '👕',
    jouets: '🧸',
    alimentation: '🍼',
    hygiene: '🧴',
    mobilier: '🛏️',
};

const HomePage = () => {
    const { t, i18n } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [cats, prods] = await Promise.all([
                    fetchCategories(),
                    fetchProducts(),
                ]);
                
                setCategories(cats || []);
                if (prods && prods.length > 0) {
                    // Take 6 random products as "featured"
                    const shuffled = [...prods].sort(() => Math.random() - 0.5).slice(0, 6);
                    setFeaturedProducts(shuffled);
                }
            } catch (e) {
                console.error('Error loading homepage data:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <>
            {/* Hero Banner */}
            <section style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                padding: 'clamp(2rem, 5vw, 5rem) 0',
                borderRadius: '0 0 2.5rem 2.5rem',
                marginBottom: '3rem',
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', marginBottom: '1rem', animation: 'fadeIn 0.8s ease' }}>🍼</div>
                    <h1 className="animate-fade-in" style={{ fontSize: 'var(--text-xl)', marginBottom: '1rem' }}>
                        {t('hero_title')}
                    </h1>
                    <p className="animate-fade-in" style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-light)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                        {t('hero_desc')}
                    </p>
                    <Link to="/products" className="btn btn-primary animate-fade-in" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
                        {t('btn_catalog')} →
                    </Link>
                </div>
            </section>

            <div className="container">
                {/* Categories Section */}
                <section style={{ marginBottom: '4rem' }}>
                    <h2 style={{ marginBottom: '2rem', textAlign: 'center', fontSize: 'var(--text-lg)' }}>{t('categories')}</h2>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>{t('loading')}</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                            {categories.map(cat => (
                                <Link key={cat.id} to={`/products?category=${cat.id}`} style={{ textDecoration: 'none' }}>
                                    <div
                                        className="glass"
                                        style={{
                                            padding: '2rem 1rem',
                                            borderRadius: 'var(--radius-lg)',
                                            textAlign: 'center',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                            cursor: 'pointer',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
                                            {CATEGORY_ICONS[cat.slug] || '🛍️'}
                                        </div>
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}
                                            onError={e => { e.target.style.display = 'none'; }}
                                        />
                                        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: '600' }}>{t(`cat_${cat.slug}`)}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Featured Products */}
                <section style={{ marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: 'var(--text-lg)' }}>{t('latest_products')}</h2>
                        <Link to="/products" className="btn btn-secondary">Voir tout →</Link>
                    </div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>{t('loading')}</div>
                    ) : (
                        <div className="product-grid">
                            {featuredProducts.map(product => (
                                <div key={product.id} className="product-card animate-fade-in">
                                    <Link to={`/product/${product.id}`}>
                                        <img
                                            src={getImageUrl(product.images?.[0])}
                                            alt={product.name}
                                            onError={e => { e.target.src = 'https://placehold.co/300x250?text=BabyStore'; }}
                                        />
                                    </Link>
                                    <div>
                                        <span style={{ background: 'var(--color-secondary)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', display: 'inline-block', marginBottom: '0.5rem' }}>
                                            {product.categories ? t(`cat_${product.categories.slug}`) : 'Bébé'}
                                        </span>
                                        <Link to={`/product/${product.id}`}>
                                            <h3 style={{ fontSize: 'var(--text-base)', marginBottom: '0.3rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {i18n.language === 'fr' ? product.name : (product.translations?.[i18n.language]?.name || product.name)}
                                            </h3>
                                        </Link>
                                        <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--text-xs)', marginBottom: '0.8rem' }}>
                                            {'⭐'.repeat(Math.round(product.rating || 4))} ({product.num_reviews || 0} {t('reviews')})
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
                                                R$ {product.price?.toFixed(2)}
                                            </span>
                                            <Link to={`/product/${product.id}`} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                                {t('view')}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
};

export default HomePage;
