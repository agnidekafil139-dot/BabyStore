import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

const ForgotPassword = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) throw resetError;

            setSuccess(true);
        } catch (err) {
            console.error('Reset password error:', err);
            setError(err.message || "Erreur lors de l'envoi du lien de réinitialisation");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container main-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="glass animate-fade-in" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>
                        Vérifiez votre email
                    </h2>
                    <p style={{ color: 'var(--color-text-light)' }}>
                        Un lien de réinitialisation a été envoyé à votre adresse email.
                    </p>
                    <p style={{ marginTop: '1.5rem', color: 'var(--color-text-light)', fontSize: 'var(--text-sm)' }}>
                        <a href="/login" style={{ color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>
                            ← Retour à la connexion
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
                    Mot de passe oublié ?
                </h1>
                <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-light)', textAlign: 'center' }}>
                    Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
                <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Adresse Email
                        </label>
                        <input
                            type="email"
                            className="input-control"
                            placeholder=" Entrer votre email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {error && (
                        <div style={{ color: 'var(--color-error, #c00)', fontSize: 'var(--text-sm)' }}>
                            {error}
                        </div>
                    )}
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Chargement...' : 'Envoyer le lien'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-light)', fontSize: 'var(--text-sm)' }}>
                    <a href="/login" style={{ color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>
                        ← Retour à la connexion
                    </a>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;