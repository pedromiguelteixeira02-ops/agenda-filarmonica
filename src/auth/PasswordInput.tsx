import { useState } from 'react';
import styles from './Login.module.css';

interface Props {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

/** Campo de password com botão 👁️ para mostrar/esconder. */
export function PasswordInput({ id, value, onChange, placeholder, autoComplete, autoFocus }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.pwWrap}>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        required
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.pwInput}
      />
      <button
        type="button"
        className={styles.pwToggle}
        onClick={() => setShow((s) => !s)}
        title={show ? 'Esconder' : 'Mostrar'}
        tabIndex={-1}
      >
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  );
}
