import { useState, useEffect } from 'react';
import { Users, Trash2, Edit } from 'lucide-react';
import { fetchUsers, deleteUserProfile, updateUserRole } from '../../lib/api';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const AdminUsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const [editUserId, setEditUserId] = useState(null);
    const [editRole, setEditRole] = useState('');

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await fetchUsers();
            setUsers(data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message || 'Error loading users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                setIsDeleting(true);
                await deleteUserProfile(id);
                alert('Utilisateur supprimé (Profil)');
                loadUsers();
            } catch (err) {
                console.error('Error deleting user:', err);
                alert(err.message || 'Error deleting user');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const updateRoleHandler = async (id) => {
        try {
            setIsUpdating(true);
            await updateUserRole(id, editRole);
            alert('Rôle mis à jour avec succès');
            setEditUserId(null);
            loadUsers();
        } catch (err) {
            console.error('Error updating role:', err);
            alert(err.message || 'Error updating role');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <Loader />;
    if (error) return <Message variant="danger">{error}</Message>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={24} /> Gestion des Utilisateurs
                </h1>
            </div>

            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-secondary)' }}>
                            <th style={{ padding: '1rem' }}>ID</th>
                            <th style={{ padding: '1rem' }}>NOM</th>
                            <th style={{ padding: '1rem' }}>EMAIL</th>
                            <th style={{ padding: '1rem' }}>RÔLE</th>
                            <th style={{ padding: '1rem' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--color-secondary)' }}>
                                <td style={{ padding: '0.7rem 1rem' }}>{user.id.substring(0, 10)}...</td>
                                <td style={{ padding: '0.7rem 1rem' }}>{user.name}</td>
                                <td style={{ padding: '0.7rem 1rem' }}>
                                    <a href={`mailto:${user.email}`} style={{ color: 'var(--color-primary-dark)' }}>{user.email}</a>
                                </td>

                                <td style={{ padding: '0.7rem 1rem' }}>
                                    {editUserId === user.id ? (
                                        <select
                                            value={editRole}
                                            onChange={e => setEditRole(e.target.value)}
                                            style={{ padding: '0.2rem', borderRadius: '4px' }}
                                        >
                                            <option value="user">Client (user)</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    ) : (
                                        <span style={{
                                            color: user.role === 'admin' ? '#1a7a4a' : 'inherit',
                                            fontWeight: user.role === 'admin' ? 'bold' : 'normal'
                                        }}>
                                            {user.role}
                                        </span>
                                    )}
                                </td>

                                <td style={{ padding: '0.7rem 1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {editUserId === user.id ? (
                                            <>
                                                <button
                                                    onClick={() => updateRoleHandler(user.id)}
                                                    disabled={isUpdating}
                                                    style={{ padding: '0.4rem 0.8rem', background: '#1a7a4a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    ✓ {isUpdating ? '...' : 'Sauver'}
                                                </button>
                                                <button
                                                    onClick={() => setEditUserId(null)}
                                                    style={{ padding: '0.4rem 0.8rem', background: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    ✕
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => { setEditUserId(user.id); setEditRole(user.role); }}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center' }}
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => deleteHandler(user.id)}
                                                    disabled={isDeleting || user.role === 'admin'}
                                                    className="btn"
                                                    style={{ padding: '0.4rem 0.8rem', background: '#ffe4e4', color: '#c00', display: 'flex', alignItems: 'center' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>Aucun utilisateur trouvé.</p>
                )}
            </div>
        </div>
    );
};

export default AdminUsersList;
