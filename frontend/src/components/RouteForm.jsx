import { useState, useEffect } from 'react';
import { createRoute, updateRoute } from '../api/routes';
import { getPin } from '../api/pins';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';

const BACKEND_ORIGIN = import.meta.env.VITE_SITE_BASE_URL;

function RouteForm({ pinIds, setPinIds, editingRoute, onSaved, onCancel }) {
  const [name, setName] = useState(editingRoute ? editingRoute.route.name : '');
  const [status, setStatus] = useState(editingRoute ? editingRoute.route.status : 'draft');
  const [error, setError] = useState('');
  const [stopDetails, setStopDetails] = useState([]);
  const [travelMode, setTravelMode] = useState(editingRoute ? editingRoute.route.travel_mode : 'WALKING');
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px以上動かして初めてドラッグとみなす
      },
    }),
  );

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
      const orderedPinIds = stopDetails.map((s) => s.id);

      const data = editingRoute ? await updateRoute({ id: editingRoute.route.id, name, status, travelMode, routeStops: orderedPinIds }) : await createRoute({ name, status, travelMode, routeStops: orderedPinIds });

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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setStopDetails((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const removeStop = (id) => {
    setStopDetails((prev) => prev.filter((s) => s.id !== id));
    setPinIds((prev) => prev.filter((pinId) => pinId !== id));
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

        <label htmlFor=''>
          交通手段
          <select value={travelMode} onChange={(e) => setTravelMode(e.target.value)}>
            <option value='WALKING'>徒歩</option>
            <option value='DRIVING'>車</option>
            <option value='BICYCLING'>自転車</option>
            <option value='TRANSIT'>公共交通機関</option>
          </select>
        </label>

        <p>選択中のピン: {pinIds.length}件</p>
        <p className='route-hint'>地図上のピンをクリックすると追加・解除できます</p>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={stopDetails.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {stopDetails.map((stop) => {
              const firstImage = stop.blocks?.find((block) => block.type === 'image');
              return (
                <SortableItem key={stop.id} id={stop.id}>
                  {stop.name}
                  <div className='route-stop-media'>
                    {firstImage && <img src={`${BACKEND_ORIGIN}${firstImage.url}`} alt='' className='route-stop-thumbnail' />}
                    <button type='button' onClick={() => removeStop(stop.id)} className='route-stop-remove'>
                      ×
                    </button>
                  </div>
                </SortableItem>
              );
            })}
          </SortableContext>
        </DndContext>

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
