const BASE_URL = `${import.meta.env.VITE_SITE_BASE_URL}/backend/auth`;

export async function login(username, password) {
    const res = await fetch(`${BASE_URL}/login.php`, {
        method: 'POST',
        credentials: 'include',
        body: new URLSearchParams({ username, password }),
    });
    return res.json();
}

export async function register(username, email, password) {
    const res = await fetch(`${BASE_URL}/register.php`, {
        method: 'POST',
        credentials: 'include',
        body: new URLSearchParams({ username, email, password }),
    });
    return res.json();
}

export async function logout() {
    const res = await fetch(`${BASE_URL}/logout.php`, {
        method: 'POST',
        credentials: 'include',
    });
    return res.json();
}

export async function me() {
    const res = await fetch(`${BASE_URL}/me.php`, {
        credentials: 'include',
    });
    return res.json();
}
