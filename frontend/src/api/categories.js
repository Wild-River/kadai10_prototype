const BASE_URL = 'http://localhost:8888/kadai10_prototype/backend/categories';

export async function getCategories() {
    const res = await fetch(`${BASE_URL}/index.php`, {
        credentials: 'include',
    });
    return res.json();
}