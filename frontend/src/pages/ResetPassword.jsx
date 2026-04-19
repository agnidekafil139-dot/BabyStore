import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

const ResetPassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password,
            });

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            console.error('Reset password error:', err);
            setError(err.message || 'Erreur lors de la mise à jour du mot de passe');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container main-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="glass animate-fade-in" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔐</div>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>
                        Mot de passe mis à jour
                    </h2>
                    <p style={{ color: 'var(--color-text-light)' }}>
                        Votre mot de passe a été mis à jour avec succès.
                    </p>
                    <p style={{ marginTop: '1rem', color: 'var(--color-text-light)', fontSize: 'var(--text-sm)' }}>
                        <a href="/login" style={{ color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>
                            Se connecter
                        </a>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container main-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass animate-fade-in" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-primary-dark)' }}>
                    Nouveau mot de passe
                </h1>
                <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Nouveau mot de passe
                        </label>
                        <input
                            type="password"
                            className="input-control"
                            placeholder="Entrer votre mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Confirmer le mot de passe
                        </label>
                        <input
                            type="password"
                            className="input-control"
                            placeholder="Confirmer votre mot de passe"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    {error && (
                        <div style={{ color: 'var(--color-error, #c00)', fontSize: 'var(--text-sm)' }}>
                            {error}
                        </div>
                    )}
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Chargement...' : 'Mettre à jour'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;