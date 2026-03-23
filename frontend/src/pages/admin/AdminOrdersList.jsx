import { useGetOrdersQuery, useDeliverOrderMutation } from '../../slices/adminApiSlice';
import { Package, Truck } from 'lucide-react';

const AdminOrdersList = () => {
    const { data: orders, isLoading, error, refetch } = useGetOrdersQuery();
    const [deliverOrder, { isLoading: isDelivering }] = useDeliverOrderMutation();

    const deliverHandler = async (id) => {
        if (window.confirm('Marquer cette commande comme livrée ?')) {
            try {
                await deliverOrder(id).unwrap();
                alert('Commande marquée comme livrée');
                refetch();
            } catch (err) {
                alert(err?.data?.message || err.error);
            }
        }
    };

    if (isLoading) return <p style={{ textAlign: 'center', padding: '3rem' }}>Chargement...</p>;
    if (error) return <p style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>Erreur: {error?.data?.message || error.error}</p>;

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
                            <tr key={order._id} style={{ borderBottom: '1px solid var(--color-secondary)' }}>
                                <td style={{ padding: '0.7rem 1rem' }}>{order._id.substring(0, 10)}...</td>
                                <td style={{ padding: '0.7rem 1rem' }}>{order.user?.name || 'Inconnu'}</td>
                                <td style={{ padding: '0.7rem 1rem' }}>{order.createdAt.substring(0, 10)}</td>
                                <td style={{ padding: '0.7rem 1rem', fontWeight: 600 }}>R$ {order.totalPrice.toFixed(2)}</td>
                                <td style={{ padding: '0.7rem 1rem' }}>
                                    {order.isPaid ? (
                                        <span style={{ color: '#1a7a4a', fontWeight: 'bold' }}>Oui</span>
                                    ) : (
                                        <span style={{ color: '#c00' }}>Non</span>
                                    )}
                                </td>
                                <td style={{ padding: '0.7rem 1rem' }}>
                                    {order.isDelivered ? (
                                        <span style={{ color: '#1a7a4a', fontWeight: 'bold' }}>{order.deliveredAt.substring(0, 10)}</span>
                                    ) : (
                                        <span style={{ color: '#c00' }}>Non</span>
                                    )}
                                </td>
                                <td style={{ padding: '0.7rem 1rem' }}>
                                    {!order.isDelivered && (
                                        <button
                                            onClick={() => deliverHandler(order._id)}
                                            disabled={isDelivering}
                                            style={{
                                                padding: '0.4rem 0.8rem', background: 'var(--color-primary)', color: 'white',
                                                border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem'
                                            }}
                                        >
                                            <Truck size={14} /> Livrer
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
