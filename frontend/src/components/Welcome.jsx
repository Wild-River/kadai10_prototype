import { logout } from '../api/auth';

function Welcome({ user, setUser }) {
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <p>ようこそ！{user.username}さん！</p>
      <button onClick={handleLogout}>ログアウト</button>
    </>
  );
}

export default Welcome;
