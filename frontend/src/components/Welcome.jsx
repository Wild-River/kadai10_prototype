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
      <div id='header'>
        <span id='user-info'>{user.username}さん</span>
        <h1 id='app-logo'>卒制プロトタイプ</h1>
        <div>
          <button id='logout-btn' onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      </div>
    </>
  );
}

export default Welcome;
