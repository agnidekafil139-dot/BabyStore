import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../slices/cartSlice';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../constants';

const CartPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cart = useSelector((state) => state.cart);
    const { cartItems } = cart;

    const addToCartHandler = async (product, qty) => {
        dispatch(addToCart({ ...product, qty }));
    };

    const removeFromCartHandler = (id) => {
        dispatch(removeFromCart(id));
    };

    const checkoutHandler = () => {
        navigate('/login?redirect=/checkout');
    };

    return (
        <div className="container main-layout">
            <h1 style={{ marginBottom: '2rem' }}>{t('cart')}</h1>
            {cartItems.length === 0 ? (
                <div style={{ padding: '2rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
                    <p>{t('empty_cart')}</p>
                    <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>{t('back_shopping')}</Link>
                </div>
            ) : (
                <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
                    <div>
                        {cartItems.map((item) => (
                            <div key={item._id} className="glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', marginBottom: '1rem', borderRadius: 'var(--radius-lg)' }}>
                                <img src={getImageUrl(item.images?.[0])} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} onError={e => { e.target.src = 'https://placehold.co/80?text=?'; }} />
                                <div style={{ flex: 1 }}>
                                    <Link to={`/product/${item._id}`} style={{ fontWeight: 'bold' }}>
                                        {i18n.language === 'fr' ? item.name : (item.translations?.[i18n.language]?.name || item.name)}
                                    </Link>
                                    <p style={{ color: 'var(--color-text-light)' }}>R$ {item.price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <select
                                        value={item.qty}
                                        onChange={(e) => addToCartHandler(item, Number(e.target.value))}
                                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-error)' }}
                                    >
                                        {[...Array(10).keys()].map((x) => (
                                            <option key={x + 1} value={x + 1}>{x + 1}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={() => removeFromCartHandler(item._id)}
                                    className="btn"
                                    style={{ color: 'var(--color-error)' }}
                                >
                                    {t('delete')}
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', height: 'fit-content' }}>
                        <h2 style={{ marginBottom: '1rem' }}>{t('total')}</h2>
                        <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--color-primary-dark)', marginBottom: '1.5rem' }}>
                            R$ {cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
                        </p>
                        <p style={{ color: 'var(--color-text-light)', marginBottom: '1rem' }}>
                            {cartItems.reduce((acc, item) => acc + item.qty, 0)} {t('items_total')}
                        </p>
                        <button
                            onClick={checkoutHandler}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={cartItems.length === 0}
                        >
                            {t('proceed_checkout')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
