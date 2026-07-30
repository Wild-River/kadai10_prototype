const BASE_URL = 'http://localhost:8888/kadai10_prototype/backend/tags';

export async function getTags() {
    const res = await fetch(`${BASE_URL}/index.php`, {
        credentials: 'include',
    });
    return res.json();
}