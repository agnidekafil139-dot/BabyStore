import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Pencil, Trash2, Plus, AlertCircle } from 'lucide-react';
import { BASE_URL, getImageUrl } from '../../constants';

const AdminProductsList = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [createLoading, setCreateLoading] = useState(false);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/api/products`);
            const data = await res.json();
            setProducts(data);
            setError('');
        } catch (err) {
            setError('Erreur lors du chargement des produits.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    useEffect(() => {
        const onFocus = () => fetchProducts();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchProducts]);

    const createProductHandler = async () => {
        if (!window.confirm('Créer un nouveau produit (brouillon) ?')) return;
        try {
            setCreateLoading(true);
            const res = await fetch(`${BASE_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify({}),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            window.location.href = `/admin/products/${data._id}/edit`;
        } catch (err) {
            setError(err.message);
        } finally {
            setCreateLoading(false);
        }
    };

    const deleteProductHandler = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
        try {
            setDeletingId(id);
            const res = await fetch(`${BASE_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            if (!res.ok) throw new Error('Erreur de suppression');
            setProducts(products.filter(p => p._id !== id));
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Gestion des Produits</h1>
                <button
                    onClick={createProductHandler}
                    disabled={createLoading}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} /> {createLoading ? 'Création...' : 'Créer un produit'}
                </button>
            </div>

            {error && (
                <div style={{ background: '#ffe4e4', color: '#c00', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {loading ? (
                <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>Chargement...</p>
            ) : (
                <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: 'var(--color-secondary)' }}>
                                <th style={{ padding: '1rem' }}>Image</th>
                                <th style={{ padding: '1rem' }}>Nom (FR)</th>
                                <th style={{ padding: '1rem' }}>Prix</th>
                                <th style={{ padding: '1rem' }}>Catégorie</th>
                                <th style={{ padding: '1rem' }}>Stock</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id} style={{ borderBottom: '1px solid var(--color-secondary)' }}>
                                    <td style={{ padding: '0.7rem 1rem' }}>
                                        <img
                                            src={getImageUrl(product.images?.[0])}
                                            alt={product.name}
                                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                                            onError={(e) => { e.target.src = 'https://placehold.co/50?text=?'; }}
                                        />
                                    </td>
                                    <td style={{ padding: '0.7rem 1rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</td>
                                    <td style={{ padding: '0.7rem 1rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>R$ {product.price?.toFixed(2)}</td>
                                    <td style={{ padding: '0.7rem 1rem' }}>{product.category?.name || '—'}</td>
                                    <td style={{ padding: '0.7rem 1rem' }}>
                                        <span style={{
                                            background: product.countInStock > 0 ? '#e6f9f0' : '#ffe4e4',
                                            color: product.countInStock > 0 ? '#1a7a4a' : '#c00',
                                            padding: '0.2rem 0.7rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.8rem'
                                        }}>
                                            {product.countInStock}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.7rem 1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Link
                                                to={`/admin/products/${product._id}/edit`}
                                                className="btn"
                                                style={{ padding: '0.4rem 0.8rem', background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                                            >
                                                <Pencil size={14} /> Éditer
                                            </Link>
                                            <button
                                                onClick={() => deleteProductHandler(product._id)}
                                                disabled={deletingId === product._id}
                                                className="btn"
                                                style={{ padding: '0.4rem 0.8rem', background: '#ffe4e4', color: '#c00', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                                            >
                                                <Trash2 size={14} /> {deletingId === product._id ? '...' : 'Suppr.'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length === 0 && (
                        <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>Aucun produit trouvé.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminProductsList;
