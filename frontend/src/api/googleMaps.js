// ============================================
// Google Maps SDK 読み込み
// ============================================
let googleMapsPromise = null;

export function loadGoogleMaps() {
    // すでに読み込み済みならスキップ
    if (window.google && window.google.maps) {
        return Promise.resolve();
    }
    // すでに読み込み中なら、同じPromiseを返す（二重読み込み防止）
    if (googleMapsPromise) {
        return googleMapsPromise;
    }
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    googleMapsPromise = new Promise((resolve) => {
        window.initMapCallback = resolve;
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=marker&callback=initMapCallback`;
        document.head.appendChild(script);
    });

    return googleMapsPromise;
}
