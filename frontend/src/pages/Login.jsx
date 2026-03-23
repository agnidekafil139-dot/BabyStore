import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../slices/authSlice';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '../constants';

const Login = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || t('login_error') || 'Login failed');
                setLoading(false);
                return;
            }
            dispatch(setCredentials(data));
            navigate(data.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            setError(err.message || t('network_error') || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container main-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass animate-fade-in" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-primary-dark)' }}>{t('login')}</h1>
                <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('email_address')}</label>
                        <input
                            type="email"
                            className="input-control"
                            placeholder={t('enter_email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t('password')}</label>
                        <input
                            type="password"
                            className="input-control"
                            placeholder={t('enter_password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && (
                        <div style={{ color: 'var(--color-error, #c00)', fontSize: 'var(--text-sm)' }}>
                            {error}
                        </div>
                    )}
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                        {loading ? (t('loading') || 'Chargement...') : t('btn_login')}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-light)', fontSize: 'var(--text-sm)' }}>
                    {t('new_user')} <a href="/register" style={{ color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>{t('create_account')}</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
