import { useState, useEffect, useRef } from 'react';
import { loadGoogleMaps } from '../api/googleMaps';
import { getPins } from '../api/pins';
import PinPanel from './PinPanel';
import PinDetail from './PinDetail';
import RouteForm from './RouteForm';
import { getRoutes, getRoute } from '../api/routes';
import RouteDetail from './RouteDetail';
import useConfirm from '../hooks/useConfirm';

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
  const [isRouteMode, setIsRouteMode] = useState(false);
  const isRouteModeRef = useRef(false);
  const [selectedPinIds, setSelectedPinIds] = useState([]);
  const polylinesRef = useRef({}); // {[route.id]: polylineインスタンス}
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [editingRoute, setEditingRoute] = useState(null);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    isRouteModeRef.current = isRouteMode;
  }, [isRouteMode]);

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

    // ルート作成モード中は「選択済みピンのトグル」そうでなければ「詳細表示」
    marker.addListener('gmp-click', () => {
      if (isRouteModeRef.current) {
        setSelectedPinIds((prev) => (prev.includes(pin.id) ? prev.filter((id) => id !== pin.id) : [...prev, pin.id]));
      } else {
        setSelectedPinId(pin.id);
      }
    });
  };

  const addRouteToMap = async (routeSummary) => {
    const data = await getRoute(routeSummary.id);
    const path = data.route_stops.map((stop) => ({ lat: Number(stop.lat), lng: Number(stop.lng) }));

    const line = new google.maps.Polyline({
      path,
      map: mapInstanceRef.current,
      strokeColor: '#00A5FF',
      strokeWeight: 3,
    });

    // 見た目には出さず、クリック判定だけ広げるための太い線
    const hitArea = new google.maps.Polyline({
      path,
      map: mapInstanceRef.current,
      strokeOpacity: 0,
      strokeWeight: 20,
    });

    polylinesRef.current[routeSummary.id] = { line, hitArea };

    hitArea.addListener('click', () => {
      setSelectedRouteId(routeSummary.id);
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
        center: { lat: 35.6852, lng: 139.7528 },
        zoom: 13,
        mapId,
        mapTypeControl: false, // 地図/航空写真
        streetViewControl: false, // ストリートビューの人形アイコン
        fullscreenControl: false, // 全画面ボタン
      });
      renderedMapIdRef.current = mapId; //今回mapIdという値で地図を作ったことを保存

      mapInstanceRef.current.addListener('click', async (event) => {
        const ok = await confirm('この場所にピンを作成しますか？');
        if (!ok) return;

        setIsPanelOpen(true); //ここでパネルを開く
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setPin({ lat, lng });
      });

      const data = await getPins();
      data.pins.forEach(addMarkerToMap);

      const routesData = await getRoutes();
      routesData.routes.forEach(addRouteToMap);
    };
    initMap();
  }, [mapId]); // mapIdが変わったら再実行

  return (
    <div id='map-container'>
      {ConfirmDialog}
      <button className='map-style-toggle' onClick={() => setMapId((prev) => (prev === MAP_IDS.monochro ? MAP_IDS.normal : MAP_IDS.monochro))}>
        地図スタイル切替
      </button>
      <button
        className='route-mode-toggle'
        onClick={async () => {
          const next = !isRouteMode;
          if (next) {
            const ok = await confirm('ピンを選択してください');
            if (!ok) return;
          }
          setIsRouteMode(next);
        }}
      >
        {isRouteMode ? 'ルート作成をやめる' : 'ルート作成'}
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
      {selectedRouteId && (
        <RouteDetail
          id={selectedRouteId}
          currentUserId={user.id}
          onClose={() => setSelectedRouteId('')}
          onEdit={(data) => {
            setEditingRoute(data);
            setSelectedRouteId('');
          }}
          onDeleted={() => {
            polylinesRef.current[selectedRouteId].line.setMap(null); //Polylineを消す
            polylinesRef.current[selectedRouteId].hitArea.setMap(null);
            delete polylinesRef.current[selectedRouteId];
            setSelectedRouteId('');
          }}
        />
      )}
      {((isRouteMode && selectedPinIds.length > 0) || editingRoute) && (
        <RouteForm
          pinIds={editingRoute ? editingRoute.routeStops.map((stop) => stop.pin_id) : selectedPinIds}
          editingRoute={editingRoute}
          onSaved={(routeId) => {
            if (editingRoute) {
              polylinesRef.current[editingRoute.route.id].line.setMap(null);
              polylinesRef.current[editingRoute.route.id].hitArea.setMap(null);
              delete polylinesRef.current[editingRoute.route.id];
            }
            addRouteToMap({ id: routeId });
            setIsRouteMode(false);
            setSelectedPinIds([]);
            setEditingRoute(null);
          }}
          onCancel={() => {
            setIsRouteMode(false);
            setSelectedPinIds([]);
            setEditingRoute(null);
          }}
        />
      )}
    </div>
  );
}

export default MapVIew;
