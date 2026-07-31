import { useState, useEffect } from 'react';
import { createRoute, updateRoute } from '../api/routes';
import { getPin } from '../api/pins';

const BACKEND_ORIGIN = import.meta.env.VITE_SITE_BASE_URL;

function RouteForm({ pinIds, editingRoute, onSaved, onCancel }) {
  const [name, setName] = useState(editingRoute ? editingRoute.route.name : '');
  const [status, setStatus] = useState(editingRoute ? editingRoute.route.status : 'draft');
  const [error, setError] = useState('');
  const [stopDetails, setStopDetails] = useState([]);

  useEffect(() => {
    const fetchStopDetails = async () => {
      const results = await Promise.all(pinIds.map((id) => getPin(id)));
      setStopDetails(results.map((r) => ({ ...r.pin, blocks: r.blocks })));
    };
    fetchStopDetails();
  }, [pinIds]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = editingRoute ? await updateRoute({ id: editingRoute.route.id, name, status, routeStops: pinIds }) : await createRoute({ name, status, routeStops: pinIds });

      if (!data.success) {
        setError(data.message);
        return;
      }

      onSaved(editingRoute ? editingRoute.route.id : data.id);
    } catch (err) {
      console.error(err);
      setError('保存に失敗しました');
    }
  };

  return (
    <form onSubmit={handleSubmit} id='detail-edit-form' className='detail-panel open'>
      <div className='detail-body'>
        {error && <p className='form-error'>{error}</p>}

        <label htmlFor=''>
          ルート名
          <input type='text' value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label htmlFor=''>
          ステータス
          <select name='' id='' value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value='draft'>下書き</option>
            <option value='published'>公開</option>
          </select>
        </label>

        <p>選択中のピン: {pinIds.length}件</p>

        <ol>
          {stopDetails.map((stop) => {
            const firstImage = stop.blocks?.find((block) => block.type === 'image');
            return (
              <li key={stop.id}>
                {stop.name}
                {firstImage && <img src={`${BACKEND_ORIGIN}${firstImage.url}`} alt='' className='route-stop-thumbnail' />}
              </li>
            );
          })}
        </ol>

        <div className='detail-actions'>
          <button type='button' className='btn-cancel' onClick={onCancel}>
            キャンセル
          </button>
          <button type='submit' className='btn-submit'>
            保存
          </button>
        </div>
      </div>
    </form>
  );
}

export default RouteForm;
