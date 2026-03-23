import { useGetUsersQuery, useDeleteUserMutation, useUpdateUserMutation } from '../../slices/adminApiSlice';
import { Users, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';

const AdminUsersList = () => {
    const { data: users, isLoading, error, refetch } = useGetUsersQuery();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

    const [editUserId, setEditUserId] = useState(null);
    const [editRole, setEditRole] = useState('');

    const deleteHandler = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                await deleteUser(id).unwrap();
                alert('Utilisateur supprimé');
                refetch();
            } catch (err) {
                alert(err?.data?.message || err.error);
            }
        }
    };

    const updateRoleHandler = async (id) => {
        try {
            await updateUser({ userId: id, role: editRole }).unwrap();
            alert('Rôle mis à jour avec succès');
            setEditUserId(null);
            refetch();
        } catch (err) {
            alert(err?.data?.message || err.error);
        }
    };

    if (isLoading) return <p style={{ textAlign: 'center', padding: '3rem' }}>Chargement...</p>;
    if (error) return <p style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>Erreur: {error?.data?.message || error.error}</p>;

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
                            <tr key={user._id} style={{ borderBottom: '1px solid var(--color-secondary)' }}>
                                <td style={{ padding: '0.7rem 1rem' }}>{user._id.substring(0, 10)}...</td>
                                <td style={{ padding: '0.7rem 1rem' }}>{user.name}</td>
                                <td style={{ padding: '0.7rem 1rem' }}>
                                    <a href={`mailto:${user.email}`} style={{ color: 'var(--color-primary-dark)' }}>{user.email}</a>
                                </td>

                                <td style={{ padding: '0.7rem 1rem' }}>
                                    {editUserId === user._id ? (
                                        <select
                                            value={editRole}
                                            onChange={e => setEditRole(e.target.value)}
                                            style={{ padding: '0.2rem', borderRadius: '4px' }}
                                        >
                                            <option value="customer">Client (customer)</option>
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
                                        {editUserId === user._id ? (
                                            <>
                                                <button
                                                    onClick={() => updateRoleHandler(user._id)}
                                                    disabled={isUpdating}
                                                    style={{ padding: '0.4rem 0.8rem', background: '#1a7a4a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    ✓ Sauver
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
                                                    onClick={() => { setEditUserId(user._id); setEditRole(user.role); }}
                                                    style={{ padding: '0.4rem 0.8rem', background: 'var(--color-secondary)', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => deleteHandler(user._id)}
                                                    disabled={isDeleting || user.role === 'admin'}
                                                    style={{ padding: '0.4rem 0.8rem', background: '#ffe4e4', color: '#c00', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
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
