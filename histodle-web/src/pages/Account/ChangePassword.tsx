import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../services/auth';
import './ChangePassword.css';

export default function ChangePassword() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      await authService.changePassword(password);
      setPassword('');
      setConfirmation('');
      await logout();
      navigate('/auth', { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo actualizar la contraseña.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="change-password-page">
      <div className="change-password-card">
        <div className="change-password-heading">
          <span className="change-password-kicker">MI CUENTA</span>
          <h1>Cambiar contraseña</h1>
          <p>Elegí una contraseña nueva para proteger tu cuenta.</p>
        </div>
        <form onSubmit={submit}>
          <label>
            Nueva contraseña
            <input
              type={showPasswords ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
          </label>
          <label>
            Repetir contraseña
            <input
              type={showPasswords ? 'text' : 'password'}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
          </label>
          <label className="change-password-show">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(event) => setShowPasswords(event.target.checked)}
            />
            Mostrar contraseñas
          </label>
          {error && <p className="change-password-error" role="alert">{error}</p>}
          <button className="change-password-submit" type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar contraseña'}
          </button>
          <button className="change-password-cancel" type="button" onClick={() => navigate('/jugar')}>
            Cancelar
          </button>
        </form>
      </div>
    </section>
  );
}
