import { useState } from 'react';

const LoginForm = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const url = 'http://localhost:8888/kadai10_prototype/backend/auth/login.php';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new URLSearchParams({
      username: name,
      password: password,
    });

    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include', // セッションCookieを送受信するのに必須
      body: formData,
    });

    const data = await res.json();
    console.log(data);
  };

  return (
    <div className='login-page'>
      <h1>ログイン</h1>
      {/* ここにエラー文が表示される */}
      <form onSubmit={handleSubmit}>
        <label htmlFor='username'>
          ユーザー名: <input type='text' id='username' required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label htmlFor='password'>
          パスワード: <input type='password' id='password' required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type='submit'>ログイン</button>
      </form>
    </div>
  );
};

export default LoginForm;
