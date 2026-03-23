import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { addToCart } from '../slices/cartSlice';
import { BASE_URL, getImageUrl } from '../constants';

const ProductDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);
    const [activeImg, setActiveImg] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${BASE_URL}/api/products/${id}`);
                if (!res.ok) throw new Error('Produit introuvable');
                const data = await res.json();
                setProduct(data);
            } catch (err) {
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const addToCartHandler = () => {
        dispatch(addToCart({ ...product, qty: Number(qty) }));
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) return (
        <div className="container main-layout" style={{ textAlign: 'center', paddingTop: '4rem' }}>
            <p style={{ fontSize: '3rem' }}>🍼</p>
            <p style={{ color: 'var(--color-text-light)', marginTop: '1rem' }}>{t('loading')}</p>
        </div>
    );

    if (!product) return (
        <div className="container main-layout">
            <div style={{ background: 'var(--color-error)', padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <p>{t('product_not_found')}</p>
                <Link to="/products" className="btn btn-secondary" style={{ marginTop: '1rem' }}>{t('back_catalog')}</Link>
            </div>
        </div>
    );

    return (
        <div className="container main-layout">
            {/* Breadcrumb */}
            <nav style={{ marginBottom: '1.5rem', color: 'var(--color-text-light)', fontSize: 'var(--text-sm)' }}>
                <Link to="/" style={{ color: 'var(--color-text-light)' }}>{t('home')}</Link>
                {' / '}
                <Link to="/products" style={{ color: 'var(--color-text-light)' }}>{t('catalog')}</Link>
                {' / '}
                <span>{product.name}</span>
            </nav>

            {/* Product Layout */}
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
                {/* Left: Images */}
                <div>
                    {/* Main Image */}
                    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--color-surface)', border: '1px solid var(--color-secondary)', marginBottom: '1rem' }}>
                        <img
                            src={getImageUrl(product.images?.[activeImg] || product.images?.[0])}
                            alt={product.name}
                            style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                            onError={e => { e.target.src = 'https://placehold.co/600x400?text=No+Image'; }}
                        />
                    </div>
                    {/* Thumbnails */}
                    {product.images?.length > 1 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImg(idx)}
                                    style={{
                                        border: `2px solid ${activeImg === idx ? 'var(--color-primary-dark)' : 'transparent'}`,
                                        borderRadius: 'var(--radius-md)',
                                        overflow: 'hidden',
                                        width: '80px', height: '80px',
                                        cursor: 'pointer',
                                        background: 'none',
                                        padding: 0,
                                    }}
                                >
                                    <img src={getImageUrl(img)} alt={`img-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Details */}
                <div>
                    <span style={{ background: 'var(--color-secondary)', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', marginBottom: '1rem', display: 'inline-block' }}>
                        {product.category ? t(`cat_${product.category.slug}`) : ''}
                    </span>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', marginBottom: '0.5rem', marginTop: '0.5rem' }}>
                        {i18n.language === 'fr' ? product.name : (product.translations?.[i18n.language]?.name || product.name)}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span>{'⭐'.repeat(Math.round(product.rating || 4))}</span>
                        <span style={{ color: 'var(--color-text-light)', fontSize: 'var(--text-sm)' }}>
                            {product.rating?.toFixed(1)} ({product.numReviews} {t('reviews')})
                        </span>
                    </div>

                    <div style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '1.5rem' }}>
                        R$ {product.price?.toFixed(2)}
                    </div>

                    <p style={{ color: 'var(--color-text-light)', lineHeight: 1.8, marginBottom: '2rem' }}>
                        {i18n.language === 'fr' ? product.description : (product.translations?.[i18n.language]?.description || product.description)}
                    </p>

                    {/* Stock status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <span style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: product.countInStock > 0 ? '#4caf50' : '#f44336',
                            display: 'inline-block'
                        }}></span>
                        <span style={{ fontSize: 'var(--text-sm)', color: product.countInStock > 0 ? '#4caf50' : '#f44336' }}>
                            {product.countInStock > 0 ? `${t('in_stock')} (${product.countInStock} ${t('available')})` : t('out_of_stock')}
                        </span>
                    </div>

                    {product.countInStock > 0 && (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <label style={{ fontWeight: 500 }}>{t('quantity')} :</label>
                            <select
                                value={qty}
                                onChange={e => setQty(Number(e.target.value))}
                                className="input-control"
                                style={{ width: '80px' }}
                            >
                                {[...Array(Math.min(product.countInStock, 10)).keys()].map(x => (
                                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '1rem', fontSize: '1rem', opacity: product.countInStock === 0 ? 0.5 : 1 }}
                            disabled={product.countInStock === 0}
                            onClick={addToCartHandler}
                        >
                            {added ? t('added') : t('add_to_cart')}
                        </button>
                        <Link
                            to="/cart"
                            className="btn btn-secondary"
                            style={{ flex: 1, padding: '1rem', textAlign: 'center' }}
                        >
                            {t('view_cart')}
                        </Link>
                    </div>

                    {/* Guarantees */}
                    <div className="glass" style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: 'var(--text-sm)' }}>
                                <span>🛡️</span><span>{t('guarantee_safety')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: 'var(--text-sm)' }}>
                                <span>⚡</span><span>{t('guarantee_pix')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: 'var(--text-sm)' }}>
                                <span>🚚</span><span>{t('guarantee_delivery')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
