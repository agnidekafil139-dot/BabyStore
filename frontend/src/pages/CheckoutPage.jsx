import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CheckoutPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const cart = useSelector((state) => state.cart);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pixData, setPixData] = useState(null);

    // Calculate prices
    const itemsPrice = cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

    const handleCreatePixPayment = async () => {
        setIsProcessing(true);
        // In real app, call your backend /api/orders then /api/payments/pix
        // Mocking response for UI demonstration
        setTimeout(() => {
            setPixData({
                qrCodeBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // minimal 1x1 black pixel base64 
                copyPasteCode: '00020101021126580014br.gov.bcb.pix0136test-pix-key-1234520400005303986540510.005802BR5911Baby Store6009Sao Paulo62070503***6304ED1A',
            });
            setIsProcessing(false);
        }, 1500);
    };

    return (
        <div className="container main-layout">
            <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>{t('secure_payment')}</h1>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                    <h2>{t('order_summary')}</h2>
                    <div style={{ margin: '1rem 0', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                        {cart.cartItems.map((item, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>{item.qty} x {item.name}</span>
                                <span>R$ {(item.qty * item.price).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        <span>TOTAL:</span>
                        <span style={{ color: 'var(--color-primary-dark)' }}>R$ {itemsPrice.toFixed(2)}</span>
                    </div>

                    {!pixData ? (
                        <button
                            onClick={handleCreatePixPayment}
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '2rem' }}
                            disabled={isProcessing}
                        >
                            {isProcessing ? t('creating_pix') : t('generate_pix')}
                        </button>
                    ) : (
                        <div className="pix-container animate-fade-in" style={{ marginTop: '2rem' }}>
                            <h3 style={{ color: 'var(--color-primary-dark)' }}>{t('pix_payment')}</h3>
                            <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{t('scan_qr')}</p>

                            {/* Dummy QR image, normally a real Base64 string from MercadoPago */}
                            <div className="pix-qr" style={{ background: '#fff', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>

                            <p style={{ fontSize: '0.8rem', marginTop: '1rem', wordBreak: 'break-all', background: '#fff', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                                {pixData.copyPasteCode}
                            </p>
                            <button className="btn btn-secondary" style={{ marginTop: '1rem', fontSize: '0.9rem' }} onClick={() => navigator.clipboard.writeText(pixData.copyPasteCode)}>
                                {t('copy_pix')}
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ padding: '2rem' }}>
                    <h3>{t('pix_advantages')}</h3>
                    <ul style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--color-success)', fontSize: '1.5rem' }}>✓</span>
                            {t('pix_adv_1')}
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--color-success)', fontSize: '1.5rem' }}>✓</span>
                            {t('pix_adv_2')}
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--color-success)', fontSize: '1.5rem' }}>✓</span>
                            {t('pix_adv_3')}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
