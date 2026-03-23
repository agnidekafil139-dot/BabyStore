import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { BASE_URL, getImageUrl } from '../../constants';

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        style={{
            padding: '0.5rem 1rem', border: 'none', cursor: 'pointer',
            borderBottom: `3px solid ${active ? 'var(--color-primary-dark)' : 'transparent'}`,
            background: 'transparent', fontWeight: active ? 700 : 400,
            color: active ? 'var(--color-primary-dark)' : 'var(--color-text-light)',
            transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '0.95rem'
        }}
    >
        {children}
    </button>
);

const AdminProductEdit = () => {
    const { id } = useParams();
    const { userInfo } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState('fr');

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [images, setImages] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [nameEn, setNameEn] = useState('');
    const [descEn, setDescEn] = useState('');
    const [namePor, setNamePor] = useState('');
    const [descPor, setDescPor] = useState('');

    const applyProductToState = (product) => {
        setName(product.name || '');
        setPrice(product.price ?? 0);
        setDescription(product.description || '');
        setImages((product.images || []).join(', '));
        setCategory(product.category?._id || product.category || '');
        setCountInStock(product.countInStock ?? 0);
        setNameEn(product.translations?.en?.name || '');
        setDescEn(product.translations?.en?.description || '');
        setNamePor(product.translations?.por?.name || '');
        setDescPor(product.translations?.por?.description || '');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productRes, categoriesRes] = await Promise.all([
                    fetch(`${BASE_URL}/api/products/${id}`),
                    fetch(`${BASE_URL}/api/categories`)
                ]);
                const product = await productRes.json();
                const cats = await categoriesRes.json();
                setCategories(cats);
                applyProductToState(product);
            } catch (err) {
                setError('Impossible de charger le produit.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError('');
            const res = await fetch(`${BASE_URL}/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify({
                    name,
                    price: Number(price),
                    description,
                    images: images.split(',').map(img => img.trim()).filter(Boolean),
                    category,
                    countInStock: Number(countInStock),
                    translations: {
                        en: { name: nameEn, description: descEn },
                        por: { name: namePor, description: descPor }
                    }
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            applyProductToState(data);
            setSuccess('Produit mis à jour avec succès ! L’aperçu ci-dessous reflète les données enregistrées.');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '0.7rem 1rem', border: '1px solid var(--color-secondary)',
        borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)',
        fontFamily: 'inherit', fontSize: '0.95rem', boxSizing: 'border-box',
    };
    const labelStyle = { display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' };

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)' }}>
            <p style={{ fontSize: '2rem' }}>🍼</p>
            <p>Chargement...</p>
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Link to="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-light)', textDecoration: 'none' }}>
                    <ArrowLeft size={18} /> Retour
                </Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Modifier le Produit</h1>
            </div>

            {error && (
                <div style={{ background: '#ffe4e4', color: '#c00', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <AlertCircle size={18} /> {error}
                </div>
            )}
            {success && (
                <div style={{ background: '#e6f9f0', color: '#1a7a4a', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <CheckCircle size={18} /> {success}
                </div>
            )}

            <form onSubmit={submitHandler}>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Left column: General info */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Informations générales</h2>

                        <div>
                            <label style={labelStyle}>Catégorie</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle} required>
                                <option value="">-- Choisir une catégorie --</option>
                                {categories.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Prix (R$)</label>
                                <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Stock</label>
                                <input type="number" min="0" value={countInStock} onChange={e => setCountInStock(e.target.value)} style={inputStyle} required />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>URL(s) des images <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--color-text-light)' }}>(séparées par des virgules)</span></label>
                            <textarea
                                value={images}
                                onChange={e => setImages(e.target.value)}
                                rows={3}
                                style={{ ...inputStyle, resize: 'vertical', marginBottom: '0.5rem' }}
                            />

                            <label style={labelStyle}>Ajouter une image depuis le PC</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input
                                    type="file"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const formData = new FormData();
                                            formData.append('image', file);
                                            try {
                                                const res = await fetch(`${BASE_URL}/api/upload`, {
                                                    method: 'POST',
                                                    headers: { Authorization: `Bearer ${userInfo.token}` },
                                                    body: formData,
                                                });
                                                const data = await res.json();
                                                if (!res.ok) throw new Error(data.message);
                                                const imageUrl = data.image.startsWith('http') ? data.image : `${BASE_URL}${data.image}`;
                                                setImages(prev => prev ? `${prev}, ${imageUrl}` : imageUrl);
                                                setSuccess('Image uploadée avec succès');
                                                setTimeout(() => setSuccess(''), 3000);
                                            } catch (err) {
                                                setError(err.message || 'Erreur lors de l\'upload');
                                                setTimeout(() => setError(''), 3000);
                                            }
                                        }
                                    }}
                                    style={{ ...inputStyle, padding: '0.5rem' }}
                                />
                            </div>
                        </div>

                        {/* Image Preview */}
                        {images.split(',')[0]?.trim() && (
                            <div>
                                <label style={{ ...labelStyle, color: 'var(--color-text-light)' }}>Aperçu image principale</label>
                                <img
                                    src={getImageUrl(images.split(',')[0].trim())}
                                    alt="aperçu"
                                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                                    onError={e => { e.target.src = 'https://placehold.co/300x200?text=Erreur'; }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right column: Translated content */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Contenu multilingue</h2>

                        {/* Language Tabs */}
                        <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--color-secondary)', marginBottom: '1.5rem' }}>
                            <TabButton active={activeTab === 'fr'} onClick={() => setActiveTab('fr')}>🇫🇷 Français</TabButton>
                            <TabButton active={activeTab === 'en'} onClick={() => setActiveTab('en')}>🇬🇧 English</TabButton>
                            <TabButton active={activeTab === 'por'} onClick={() => setActiveTab('por')}>🇧🇷 Português</TabButton>
                        </div>

                        {/* French Tab */}
                        {activeTab === 'fr' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', background: 'var(--color-secondary)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)' }}>
                                    ⚠️ Le Français est la langue <b>principale</b> stockée dans le champ standard.
                                </p>
                                <div>
                                    <label style={labelStyle}>Nom (FR)</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Description (FR)</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} style={{ ...inputStyle, resize: 'vertical' }} />
                                </div>
                            </div>
                        )}

                        {/* English Tab */}
                        {activeTab === 'en' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label style={labelStyle}>Name (EN)</label>
                                    <input type="text" value={nameEn} onChange={e => setNameEn(e.target.value)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Description (EN)</label>
                                    <textarea value={descEn} onChange={e => setDescEn(e.target.value)} rows={6} style={{ ...inputStyle, resize: 'vertical' }} />
                                </div>
                            </div>
                        )}

                        {/* Portuguese Tab */}
                        {activeTab === 'por' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label style={labelStyle}>Nome (POR)</label>
                                    <input type="text" value={namePor} onChange={e => setNamePor(e.target.value)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Descrição (POR)</label>
                                    <textarea value={descPor} onChange={e => setDescPor(e.target.value)} rows={6} style={{ ...inputStyle, resize: 'vertical' }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary"
                        style={{ padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
                    >
                        <Save size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductEdit;
