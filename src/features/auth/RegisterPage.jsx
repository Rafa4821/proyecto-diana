import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './LoginPage.css';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.displayName.trim() || !form.email || !form.password) {
      setError('Completa todos los campos.');
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      await register(form.email, form.password, form.displayName.trim());
      navigate('/admin');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email ya está registrado.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El email no es válido.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil.');
      } else {
        setError('Error al crear la cuenta.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <Link to="/" className="login-page__back" aria-label="Volver al sitio">
        ← Volver al sitio
      </Link>

      <div className="login-card">
        <div className="login-card__brand">
          <span className="login-card__icon">✦</span>
          <h1 className="login-card__title">Crear cuenta</h1>
          <p className="login-card__subtitle">Configura tu acceso al estudio creativo</p>
        </div>

        {error && <div className="login-card__error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-card__form">
          <div className="login-card__field">
            <label htmlFor="reg-name">Nombre</label>
            <input
              id="reg-name"
              type="text"
              value={form.displayName}
              onChange={(e) => updateField('displayName', e.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </div>
          <div className="login-card__field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>
          <div className="login-card__field">
            <label htmlFor="reg-password">Contraseña</label>
            <input
              id="reg-password"
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </div>
          <div className="login-card__field">
            <label htmlFor="reg-confirm">Confirmar contraseña</label>
            <input
              id="reg-confirm"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="login-card__btn" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="login-card__footer">
          <p>¿Ya tienes cuenta? <Link to="/admin/login" className="login-card__link">Iniciar sesión</Link></p>
        </div>
      </div>
    </div>
  );
}
