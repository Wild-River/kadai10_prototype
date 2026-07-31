import { useEffect, useState } from 'react';
import { getRoute, deleteRoute } from '../api/routes';
import useConfirm from '../hooks/useConfirm';
import useAlert from '../hooks/useAlert';

const BACKEND_ORIGIN = import.meta.env.VITE_SITE_BASE_URL;

function RouteDetail({ id, currentUserId, onClose, onEdit, onDeleted }) {
  const { confirm, ConfirmDialog } = useConfirm();
  const { alert, AlertDialog } = useAlert();
  const [route, setRoute] = useState(null);
  const [routeStops, setRouteStops] = useState([]);

  useEffect(() => {
    const fetchDetail = async () => {
      const data = await getRoute(id);
      setRoute(data.route);
      setRouteStops(data.route_stops);
    };
    fetchDetail();
  }, [id]);

  if (!route) return null;

  const handleDelete = async () => {
    const ok = await confirm('このルートを削除してもよろしいですか？');
    if (!ok) return;

    try {
      const data = await deleteRoute(id);
      if (!data.success) {
        await alert(data.message);
        return;
      }
      onDeleted();
    } catch (err) {
      console.error(err);
      await alert('削除に失敗しました');
    }
  };

  return (
    <>
      {ConfirmDialog}
      {AlertDialog}
      <div className='detail-panel open'>
        <div className='detail-body'>
          <h2>{route.name}</h2>

          <ol>
            {routeStops.map((stop) => (
              <li key={stop.id}>
                {stop.name}
                {stop.thumbnail_url && <img src={`${BACKEND_ORIGIN}${stop.thumbnail_url}`} alt='' className='route-stop-thumbnail' />}
              </li>
            ))}
          </ol>

          <div className='detail-actions'>
            <button type='button' className='btn-cancel' onClick={onClose}>
              閉じる
            </button>
            {route.user_id === currentUserId && (
              <>
                <button type='button' className='btn-edit' onClick={() => onEdit({ route, routeStops })}>
                  編集
                </button>
                <button type='button' className='btn-delete' onClick={handleDelete}>
                  削除
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default RouteDetail;
