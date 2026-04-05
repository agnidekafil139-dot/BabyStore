import { useState, useEffect } from 'react';
import { Package, Truck } from 'lucide-react';
import { fetchOrders, markOrderDelivered } from '../../lib/api';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const AdminOrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deliveringId, setDeliveringId] = useState(null);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await fetchOrders();
            setOrders(data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err.message || 'Error loading orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const deliverHandler = async (id) => {
        if (window.confirm('Marquer cette commande comme livrée ?')) {
            try {
                setDeliveringId(id);
                await markOrderDelivered(id);
                alert('Commande marquée comme livrée');
                loadOrders();
            } catch (err) {
                console.error('Error delivering order:', err);
                alert(err.message || 'Error marking as delivered');
            } finally {
                setDeliveringId(null);
            }
        }
    };

    if (loading) return <Loader />;
    if (error) return <Message variant="danger">{error}</Message>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={24} /> Gestion des Commandes
                </h1>
            </div>

            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-secondary)' }}>
                            <th style={{ padding: '1rem' }}>ID</th>
                            <th style={{ padding: '1rem' }}>UTILISATEUR</th>
                            <th style={{ padding: '1rem' }}>DATE</th>
                            <th style={{ padding: '1rem' }}>TOTAL</th>
                            <th style={{ padding: '1rem' }}>PAYÉE</th>
                            <th style={{ padding: '1rem' }}>LIVRÉE</th>
                            <th style={{ padding: '1rem' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} style={{ borderBottom: '1px solid var(--color-secondary)' }}>
                                <td style={{ padding: '0.7rem 1rem' }}>{order.id.substring(0, 10)}...</td>
                                <td style={{ padding: '0.7rem 1rem' }}>{order.profiles?.name || 'Inconnu'}</td>
                                <td style={{ padding: '0.7rem 1rem' }}>{order.created_at.substring(0, 10)}</td>
                                <td style={{ padding: '0.7rem 1rem', fontWeight: 600 }}>R$ {order.total_price.toFixed(2)}</td>
                                <td style={{ padding: '0.7rem 1rem' }}>
                                    {order.is_paid ? (
                                        <span style={{ color: '#1a7a4a', fontWeight: 'bold' }}>Oui</span>
                                    ) : (
                                        <span style={{ color: '#c00' }}>Non</span>
                                    )}
                                </td>
                                <td style={{ padding: '0.7rem 1rem' }}>
                                    {order.is_delivered ? (
                                        <span style={{ color: '#1a7a4a', fontWeight: 'bold' }}>{order.delivered_at?.substring(0, 10)}</span>
                                    ) : (
                                        <span style={{ color: '#c00' }}>Non</span>
                                    )}
                                </td>
                                <td style={{ padding: '0.7rem 1rem' }}>
                                    {!order.is_delivered && (
                                        <button
                                            onClick={() => deliverHandler(order.id)}
                                            disabled={deliveringId === order.id}
                                            className="btn btn-primary"
                                            style={{
                                                padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem'
                                            }}
                                        >
                                            <Truck size={14} /> {deliveringId === order.id ? '...' : 'Livrer'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>Aucune commande trouvée.</p>
                )}
            </div>
        </div>
    );
};

export default AdminOrdersList;
