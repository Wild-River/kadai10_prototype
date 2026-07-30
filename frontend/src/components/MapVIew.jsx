import { useState, useEffect, useRef } from 'react';
import { loadGoogleMaps } from '../api/googleMaps';
import { getPins } from '../api/pins';
import PinPanel from './PinPanel';
const MAP_IDS = {
  monochro: import.meta.env.VITE_GOOGLE_MAP_ID,
  normal: import.meta.env.VITE_GOOGLE_MAP_ID_NORMAL,
};

function MapVIew() {
  const mapRef = useRef(); // 地図オブジェクトを作成 useRefで保持する
  const mapInstanceRef = useRef(null);
  const [mapId, setMapId] = useState(MAP_IDS.monochro);
  const renderedMapIdRef = useRef(null);
  const [pin, setPin] = useState({ lat: 0, lng: 0 });
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const addMarkerToMap = (pin) => {
    const pinElement = new google.maps.marker.PinElement({
      background: pin.color || '#666',
      borderColor: 'white',
      scale: 1.2,
    });

    new google.maps.marker.AdvancedMarkerElement({
      position: { lat: Number(pin.lat), lng: Number(pin.lng) },
      map: mapInstanceRef.current, // 作ったばかりの地図インスタンス
      content: pinElement.element,
    });
  };

  useEffect(() => {
    const initMap = async () => {
      await loadGoogleMaps();

      // 同じスタイル（monochro or normal）なら早期return
      if (renderedMapIdRef.current === mapId) {
        return;
      }

      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: 35.67, lng: 139.7023 },
        zoom: 15,
        mapId,
        mapTypeControl: false, // 地図/航空写真
        streetViewControl: false, // ストリートビューの人形アイコン
        fullscreenControl: false, // 全画面ボタン
      });
      renderedMapIdRef.current = mapId; //今回mapIdという値で地図を作ったことを保存

      mapInstanceRef.current.addListener('click', (event) => {
        setIsPanelOpen(true); //ここでパネルを開く
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setPin({ lat, lng });
      });

      const data = await getPins();
      data.pins.forEach(addMarkerToMap);
    };
    initMap();

    return () => {
      // ここがクリーンアップ処理
      // この先マーカーにクリックイベントを付けたとき(例えば「地図をクリックして新規ピン作成」のリスナー)。
      // イベントリスナーはコンポーネントが消えても自動では外れない
      // google.maps.event.clearInstanceListeners(mapInstanceRef.current);
    };

    // pinsを取得し、AdvancedMarkerElement+PinElementでマーカーを立てる(backgroundにcategory.colorを使う)
  }, [mapId]); // mapIdが変わったら再実行

  return (
    <>
      <button onClick={() => setMapId((prev) => (prev === MAP_IDS.monochro ? MAP_IDS.normal : MAP_IDS.monochro))}>地図スタイル切替</button>
      <div id='map' style={{ height: 800 }} ref={mapRef}></div>
      {isPanelOpen && (
        <PinPanel
          lat={pin.lat}
          lng={pin.lng}
          onClose={() => setIsPanelOpen(false)}
          onCreated={(newPin) => {
            addMarkerToMap(newPin);
            setIsPanelOpen(false);
          }}
        />
      )}
    </>
  );
}

export default MapVIew;
