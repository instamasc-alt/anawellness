import { useState } from 'react'
import { authMessage } from '../account'
import { supabase } from '../supabase'

export default function Account() {
  const [mode, setMode] = useState('criar')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const creating = mode === 'criar'

  async function submit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!supabase) {
      setError('A conta ainda não está ligada.')
      return
    }
    if (creating && name.trim().length < 2) {
      setError('Escreva o nome que aparece no treino.')
      return
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Use um e-mail válido.')
      return
    }
    if (password.length < 6) {
      setError('A senha precisa de pelo menos 6 caracteres.')
      return
    }
    setBusy(true)
    if (creating) {
      const { data, error: signError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() } },
      })
      setBusy(false)
      if (signError) {
        setError(authMessage(signError))
        return
      }
      if (!data.session) {
        setNotice('Conta criada. Abra o e-mail de confirmação e depois entre.')
        setMode('entrar')
        setPassword('')
      }
      return
    }
    const { error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setBusy(false)
    if (signError) setError(authMessage(signError))
  }

  return (
    <section className="screen onboard">
      <img className="logo" src="/logo-ana-light.png" alt="ana. wellness" />
      <p className="tiny">{creating ? 'Conta' : 'Entrada'}</p>
      <h1>{creating ? 'Crie sua conta' : 'Entre na sua conta'}</h1>
      <p className="sub">O plano fica na sua conta, não só neste celular.</p>
      <form className="stack" onSubmit={submit}>
        {creating ? (
          <label className="stack tight-stack">
            <span className="tiny">Nome</span>
            <input
              className="field"
              value={name}
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        ) : null}
        <label className="stack tight-stack">
          <span className="tiny">E-mail</span>
          <input
            className="field"
            type="email"
            value={email}
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="stack tight-stack">
          <span className="spread">
            <span className="tiny">Senha</span>
            <button type="button" className="pill" onClick={() => setShow((current) => !current)}>
              {show ? 'Ocultar' : 'Mostrar'}
            </button>
          </span>
          <input
            className="field"
            type={show ? 'text' : 'password'}
            value={password}
            autoComplete={creating ? 'new-password' : 'current-password'}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="cue">{error}</p> : null}
        {notice ? <p className="fine">{notice}</p> : null}
        <button type="submit" className="btn" disabled={busy}>
          {busy ? 'Aguarde' : creating ? 'Criar minha conta' : 'Entrar'}
        </button>
      </form>
      <p className="fine center">ou</p>
      <button
        type="button"
        className="btn ghost"
        onClick={() => {
          setMode(creating ? 'entrar' : 'criar')
          setError('')
          setNotice('')
        }}
      >
        {creating ? 'Já tenho uma conta' : 'Criar minha conta'}
      </button>
    </section>
  )
}
