import { useState, useEffect, useRef } from 'react';
import { loadGoogleMaps } from '../api/googleMaps';
import { getPins } from '../api/pins';
import PinPanel from './PinPanel';
import PinDetail from './PinDetail';
const MAP_IDS = {
  monochro: import.meta.env.VITE_GOOGLE_MAP_ID,
  normal: import.meta.env.VITE_GOOGLE_MAP_ID_NORMAL,
};

function MapVIew({ user }) {
  const mapRef = useRef(); // 地図オブジェクトを作成 useRefで保持する
  const mapInstanceRef = useRef(null);
  const [mapId, setMapId] = useState(MAP_IDS.monochro);
  const renderedMapIdRef = useRef(null);
  const [pin, setPin] = useState({ lat: 0, lng: 0 });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState('');
  const markersRef = useRef({}); // {[pin.id] : markerインスタンス}
  const [editingPin, setEditingPin] = useState(null);

  const addMarkerToMap = (pin) => {
    const pinElementOptions = {
      background: pin.color || '#666',
      borderColor: 'white',
      scale: 1.2,
    };

    if (pin.icon) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 -1050 960 960" fill="white"><path d="${pin.icon}"></path></svg>`;
      pinElementOptions.glyphSrc = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }

    const pinElement = new google.maps.marker.PinElement(pinElementOptions);

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat: Number(pin.lat), lng: Number(pin.lng) },
      map: mapInstanceRef.current, // 作ったばかりの地図インスタンス
      content: pinElement.element,
    });

    markersRef.current[pin.id] = marker;

    // マーカーにgmp-clickイベントを追加し、クリックされたらstateで保持する
    marker.addListener('gmp-click', () => {
      setSelectedPinId(pin.id);
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
  }, [mapId]); // mapIdが変わったら再実行

  return (
    <div id='map-container'>
      <button className='map-style-toggle' onClick={() => setMapId((prev) => (prev === MAP_IDS.monochro ? MAP_IDS.normal : MAP_IDS.monochro))}>
        地図スタイル切替
      </button>
      <div id='map' ref={mapRef}></div>
      {(isPanelOpen || editingPin) && (
        <PinPanel
          lat={editingPin ? editingPin.pin.lat : pin.lat}
          lng={editingPin ? editingPin.pin.lng : pin.lng}
          editingPin={editingPin}
          onClose={() => {
            setIsPanelOpen(false);
            setEditingPin(null);
          }}
          onCreated={(newPin) => {
            addMarkerToMap(newPin);
            setIsPanelOpen(false);
          }}
          onUpdated={(updatedPin) => {
            markersRef.current[updatedPin.id].map = null; // 古いマーカーを消す
            delete markersRef.current[updatedPin.id];
            addMarkerToMap(updatedPin); // 新しい内容でマーカーを立て直す
            setEditingPin(null);
          }}
        />
      )}
      {selectedPinId && (
        <PinDetail
          id={selectedPinId}
          currentUserId={user.id}
          onClose={() => setSelectedPinId('')}
          onEdit={(data) => {
            setEditingPin(data);
            setSelectedPinId('');
          }}
          onDeleted={() => {
            markersRef.current[selectedPinId].map = null; // 地図からマーカーを消す
            delete markersRef.current[selectedPinId];
            setSelectedPinId('');
          }}
        />
      )}
    </div>
  );
}

export default MapVIew;
