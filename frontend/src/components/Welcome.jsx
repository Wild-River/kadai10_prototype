function Welcome({ user, setUser }) {
  const url = 'http://localhost:8888/kadai10_prototype/backend/auth/logout.php';
  const handleLogout = async () => {
    try {
      await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });
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
