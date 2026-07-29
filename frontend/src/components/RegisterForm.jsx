import { useState } from 'react';

function RegisterForm({ setUser, setShowRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const url = 'http://localhost:8888/kadai10_prototype/backend/auth/register.php';

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new URLSearchParams({
        username: name,
        email,
        password,
      });

      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include', // セッションCookieを送受信するのに必須
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      // ログイン後の画面に切り替える
      setUser(data.user);
    } catch (e) {
      console.error(e); // ブラウザの開発者コンソールに詳細が出る
      setError('通信エラーが発生しました');
    }
  };

  return (
    <div className='login-page'>
      <h1>ユーザー登録</h1>
      {error && <p>エラー: {error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor='username'>
          ユーザー名: <input type='text' id='username' required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label htmlFor='email'>
          メールアドレス: <input type='email' id='email' required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label htmlFor='password'>
          パスワード: <input type='password' id='password' required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type='submit'>登録</button>
      </form>
      <p>
        アカウントをお持ちの方はこちらからログインしてください。
        <button type='button' onClick={() => setShowRegister(false)}>
          ログイン
        </button>
      </p>
    </div>
  );
}

export default RegisterForm;
