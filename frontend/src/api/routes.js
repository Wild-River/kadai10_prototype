const BASE_URL = `${import.meta.env.VITE_SITE_BASE_URL}/backend/routes`;

export async function getRoutes() {
    const res = await fetch(`${BASE_URL}/index.php`, {
        credentials: 'include',
    });
    return res.json();
}

export async function getRoute(id) {
    const res = await fetch(`${BASE_URL}/show.php?id=${id}`, {
        credentials: 'include',
    });
    return res.json();
}

export async function createRoute({ name, status, routeStops = [] }) {
    const params = new URLSearchParams();
    params.append('name', name);
    params.append('status', status);

    routeStops.forEach((pinId) => {
        params.append('route_stops[]', pinId);
    });

    const res = await fetch(`${BASE_URL}/create.php`, {
        method: 'POST',
        credentials: 'include',
        body: params,
    });
    return res.json();
}

export async function updateRoute({ id, name, status, routeStops = [] }) {
    const params = new URLSearchParams();
    params.append('id', id);
    params.append('name', name);
    params.append('status', status);

    routeStops.forEach((pinId) => {
        params.append('route_stops[]', pinId);
    });

    const res = await fetch(`${BASE_URL}/edit.php`, {
        method: 'POST',
        credentials: 'include',
        body: params,
    });
    return res.json();
}

export async function deleteRoute(id) {
    const params = new URLSearchParams();
    params.append('id', id);

    const res = await fetch(`${BASE_URL}/delete.php`, {
        method: 'POST',
        credentials: 'include',
        body: params
    });
    return res.json();
}
