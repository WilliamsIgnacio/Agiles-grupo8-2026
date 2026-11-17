import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { sileo } from 'sileo';
import { googleLoginURLFor } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { from?: string } | null)?.from;
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setError('');

    if (isRegister && password !== passwordConfirmation) {
      const validationError = 'Las contraseñas no coinciden.';
      setError(validationError);
      sileo.error({ title: validationError });
      return;
    }

    setIsSubmitting(true);
    try {
      const operation = isRegister
        ? register({ email, password, name })
        : login({ email, password });

      await sileo.promise(operation, {
        loading: {
          title: isRegister ? 'Creando cuenta...' : 'Iniciando sesión...',
        },
        success: {
          title: isRegister ? '¡Cuenta creada!' : '¡Sesión iniciada!',
        },
        error: {
          title: isRegister
            ? 'No se pudo crear la cuenta.'
            : 'No se pudo iniciar sesión.',
        },
      });
      navigate(returnTo || '/jugar', { replace: true });
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'No se pudo autenticar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return <section className="auth-page">
    <div className="auth-card">
      <div className="auth-heading">
        <span className="auth-kicker">HISTODLE</span>
        <h1>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
        <p>{isRegister ? 'Guardá tu progreso y empezá a jugar.' : 'Volvé a tu partida y seguí jugando.'}</p>
      </div>
    <form onSubmit={submit}>
      {isRegister && <label>Nombre<input type="text" aria-label="Nombre" placeholder="Tu nombre" value={name} onChange={(event) => setName(event.target.value)} required /></label>}
      <label>Email<input type="email" aria-label="Email" placeholder="tu@email.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label>
        Contraseña
        <span className="auth-password-field">
          <input type={showPasswords ? 'text' : 'password'} aria-label="Contraseña" placeholder="Mínimo 8 caracteres" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
        </span>
      </label>
      {isRegister && <label>
        Repetir contraseña
        <span className="auth-password-field">
          <input type={showPasswords ? 'text' : 'password'} aria-label="Repetir contraseña" placeholder="Repetí tu contraseña" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} minLength={8} required />
        </span>
      </label>}
      <label className="auth-show-password">
        <input type="checkbox" checked={showPasswords} onChange={(event) => setShowPasswords(event.target.checked)} />
        Mostrar contraseñas
      </label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? 'Procesando...'
          : isRegister
            ? 'Crear cuenta'
            : 'Ingresar'}
      </button>
    </form>
    <div className="auth-divider"><span>o continuar con</span></div>
    <a className="auth-google" href={googleLoginURLFor(returnTo)}>Continuar con Google</a>
    <button
      className="auth-toggle"
      type="button"
      onClick={() => setIsRegister(!isRegister)}
      disabled={isSubmitting}
    >
      {isRegister ? 'Ya tengo una cuenta' : 'Crear una cuenta'}
    </button>
    <Link className="auth-guest" to="/jugar">Continuar sin iniciar sesión</Link>
    </div>
  </section>;
}
