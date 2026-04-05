import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../constants';

const ProductCard = ({ product }) => {
    const { t, i18n } = useTranslation();
    const displayName = i18n.language === 'fr' ? product.name : (product.translations?.[i18n.language]?.name || product.name);

    return (
        <div className="product-card">
            <Link to={`/product/${product.id}`}>
                <img src={getImageUrl(product.images?.[0]) || 'https://via.placeholder.com/300'} alt={product.name} onError={e => { e.target.src = 'https://via.placeholder.com/300'; }} />
            </Link>
            <div style={{ padding: '0.5rem 0' }}>
                <Link to={`/product/${product.id}`}>
                    <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {displayName}
                    </h3>
                </Link>
                <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
                    {/* A simple placeholder for rating stars */}
                    {'⭐'.repeat(Math.round(product.rating || 0))} ({product.num_reviews || 0} {t('reviews')})
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
                        R$ {product.price.toFixed(2)}
                    </span>
                    <Link to={`/product/${product.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>{t('view')}</Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
