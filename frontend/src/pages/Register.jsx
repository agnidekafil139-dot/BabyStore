import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

const Register = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
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
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                    }
                }
            });

            if (signUpError) throw signUpError;

            // Profile is created automatically by trigger on_auth_user_created
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            console.error('Register error:', err);
            setError(err.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container main-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="glass animate-fade-in" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>
                        Vérifiez votre email
                    </h2>
                    <p style={{ color: 'var(--color-text-light)' }}>
                        Un lien de confirmation a été envoyé à votre adresse email.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container main-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass animate-fade-in" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-primary-dark)' }}>
                    Créer un compte
                </h1>
                <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Nom complet
                        </label>
                        <input
                            type="text"
                            className="input-control"
                            placeholder="Entrer votre nom"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Adresse Email
                        </label>
                        <input
                            type="email"
                            className="input-control"
                            placeholder="Entrer votre email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Mot de Passe
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
                        {loading ? 'Chargement...' : "S'inscrire"}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-light)', fontSize: 'var(--text-sm)' }}>
                    Déjà un compte ?{' '}
                    <a href="/login" style={{ color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>
                        Se connecter
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Register;