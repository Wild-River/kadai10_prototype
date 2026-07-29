const BASE_URL = 'http://localhost:8888/kadai10_prototype/backend/pins';

export async function getPins() {
    const res = await fetch(`${BASE_URL}/index.php`, {
        credentials: 'include',
    });
    return res.json();
}

export async function getCategories() {

}
