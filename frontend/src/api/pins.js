const BASE_URL = 'http://localhost:8888/kadai10_prototype/backend/pins';

export async function getPins() {
    const res = await fetch(`${BASE_URL}/index.php`, {
        credentials: 'include',
    });
    return res.json();
}

export async function createPin({ id, categoryId, name, lat, lng, status, tags = [], blocks = [] }) {
    const params = new URLSearchParams();
    params.append('id', id);
    params.append('category_id', categoryId);
    params.append('name', name);
    params.append('lat', lat);
    params.append('lng', lng);
    params.append('status', status);

    tags.forEach((tagId) => {
        params.append('tags[]', tagId);
    });

    blocks.forEach((block, index) => {
        params.append(`blocks[${index}][type]`, block.type);
        if (block.type === 'text') {
            params.append(`blocks[${index}][content]`, block.content)
        } else if (block.type === 'image') {
            params.append(`blocks[${index}][url]`, block.url)
        }
    });

    const res = await fetch(`${BASE_URL}/create.php`, {
        method: 'POST',
        credentials: 'include',
        body: params,
    });
    return res.json();
}

export async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${BASE_URL}/upload.php`, {
        method: 'POST',
        credentials: 'include',
        // headers: { 'Content-Type': 'multipart/form-data' },← 自分でContent-Typeを指定してしまうと、boundary情報が抜け落ちてしまい、サーバー側($_FILES)がリクエストを正しく解析できなくなる
        body: formData
    })
    return res.json();
}

export async function getPin(id) {
    const res = await fetch(`${BASE_URL}/show.php?id=${id}`, {
        credentials: 'include',
    });
    return res.json();
}

export async function updatePin({ id, categoryId, name, lat, lng, status, tags = [], blocks = [] }) {
    const params = new URLSearchParams();
    params.append('id', id);
    params.append('category_id', categoryId);
    params.append('name', name);
    params.append('lat', lat);
    params.append('lng', lng);
    params.append('status', status);

    tags.forEach((tagId) => {
        params.append('tags[]', tagId);
    });

    blocks.forEach((block, index) => {
        params.append(`blocks[${index}][type]`, block.type);
        if (block.type === 'text') {
            params.append(`blocks[${index}][content]`, block.content)
        } else if (block.type === 'image') {
            params.append(`blocks[${index}][url]`, block.url)
        }
    });

    const res = await fetch(`${BASE_URL}/edit.php`, {
        method: 'POST',
        credentials: 'include',
        body: params,
    });
    return res.json();
}

export async function deletePin(id) {
    const params = new URLSearchParams();
    params.append('id', id);

    const res = await fetch(`${BASE_URL}/delete.php`, {
        method: 'POST',
        credentials: 'include',
        body: params
    });
    return res.json();
}
