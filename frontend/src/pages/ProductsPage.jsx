import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../constants';
import { fetchProducts, fetchCategories } from '../lib/api';

const ProductsPage = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [productsData, catData] = await Promise.all([
                fetchProducts(),
                fetchCategories(),
            ]);
            setProducts(productsData || []);
            setCategories(catData || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const onFocus = () => fetchData();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchData]);

    const filtered = products.filter(p => {
        const matchCat = selectedCategory ? p.categories?.id === selectedCategory : true;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    if (loading) return (
        <div className="container main-layout" style={{ textAlign: 'center', paddingTop: '4rem' }}>
            <div style={{ fontSize: '3rem', animation: 'spin 1s linear infinite' }}>🍼</div>
            <p style={{ color: 'var(--color-text-light)', marginTop: '1rem' }}>{t('loading')}</p>
        </div>
    );

    if (error) return (
        <div className="container main-layout">
            <div style={{ background: 'var(--color-error)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <p>Erreur: {error}</p>
            </div>
        </div>
    );

    return (
        <div className="container main-layout">
            {/* Header & Search */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1>{t('latest_products')}</h1>
                <input
                    type="text"
                    className="input-control"
                    placeholder={t('search_product')}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth: '280px' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem' }}>
                {/* Sidebar Categories */}
                <aside>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: 'var(--text-base)' }}>{t('categories')}</h3>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li>
                                <button
                                    onClick={() => setSelectedCategory('')}
                                    className="btn"
                                    style={{
                                        width: '100%',
                                        justifyContent: 'flex-start',
                                        background: !selectedCategory ? 'var(--color-primary)' : 'transparent',
                                        fontWeight: !selectedCategory ? '600' : '400',
                                        padding: '0.6rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                >
                                    {t('all_products')} ({products.length})
                                </button>
                            </li>
                            {categories.map(cat => (
                                <li key={cat.id}>
                                    <button
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className="btn"
                                        style={{
                                            width: '100%',
                                            justifyContent: 'flex-start',
                                            background: selectedCategory === cat.id ? 'var(--color-primary)' : 'transparent',
                                            fontWeight: selectedCategory === cat.id ? '600' : '400',
                                            padding: '0.6rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                        }}
                                    >
                                        {t(`cat_${cat.slug}`)}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Products Grid */}
                <div>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '1rem', fontSize: 'var(--text-sm)' }}>
                        {filtered.length} {t('catalog')}
                    </p>
                    {filtered.length === 0 ? (
                        <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                            <p>{t('no_products')}</p>
                        </div>
                    ) : (
                        <div className="product-grid">
                            {filtered.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Inline ProductCard
const ProductCard = ({ product }) => {
    const { t } = useTranslation();

    return (
        <div className="product-card animate-fade-in">
            <Link to={`/product/${product.id}`}>
                <img
                    src={getImageUrl(product.images?.[0])}
                    alt={product.name}
                    onError={e => { e.target.src = 'https://placehold.co/300x250?text=No+Image'; }}
                />
            </Link>
            <div>
                <Link to={`/product/${product.id}`}>
                    <h3 style={{ fontSize: 'var(--text-base)', marginBottom: '0.3rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {product.name}
                    </h3>
                </Link>
                <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--text-xs)', marginBottom: '0.8rem' }}>
                    {'⭐'.repeat(Math.round(product.rating || 4))} ({product.num_reviews || 0} {t('reviews')})
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
                        R$ {product.price?.toFixed(2)}
                    </span>
                    <Link to={`/product/${product.id}`} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                        {t('view')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
