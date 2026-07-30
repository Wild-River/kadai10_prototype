const BASE_URL = `${import.meta.env.VITE_SITE_BASE_URL}/backend/categories`;

export async function getCategories() {
    const res = await fetch(`${BASE_URL}/index.php`, {
        credentials: 'include',
    });
    return res.json();
}