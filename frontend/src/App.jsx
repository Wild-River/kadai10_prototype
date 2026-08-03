import { useEffect, useState } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Welcome from './components/Welcome';
import MapView from './components/MapView';
import { me } from './api/auth';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const data = await me();

        if (data.success) {
          setUser(data.user);
        }
        // data.successがfalse(=まだログインしていない)のときは、
        // エラーではなく普通の状態なので何もしなくてOK
      } catch (e) {
        console.error(e);
      }
    };
    checkLogin();
  }, []); //コンポーネントが最初に描画されたときに1回だけ実行

  return (
    <>
      {user ? (
        <>
          <Welcome user={user} setUser={setUser} />
          <MapView user={user} />
        </>
      ) : showRegister ? (
        <RegisterForm setUser={setUser} setShowRegister={setShowRegister} />
      ) : (
        <LoginForm setUser={setUser} setShowRegister={setShowRegister} />
      )}
    </>
  );
}

export default App;
