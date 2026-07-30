import { useEffect, useRef, useState } from 'react';
import { getPin, deletePin } from '../api/pins';
import { getTags } from '../api/tags';

const BACKEND_ORIGIN = 'http://localhost:8888';

function PinDetail({ id, currentUserId, onClose, onEdit, onDeleted }) {
  const [pin, setPin] = useState(null);
  const [pinTagIds, setPinTagIds] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchDetail = async () => {
      const data = await getPin(id);
      setPin(data.pin);
      setPinTagIds(data.tags);
      setBlocks(data.blocks);

      const tagsData = await getTags();
      setTags(tagsData.tags);
    };
    fetchDetail();
  }, [id]);

  if (!pin) return null;

  const handleDelete = async () => {
    const ok = window.confirm('この投稿を削除してもよろしいですか？');
    if (!ok) return;

    try {
      const data = await deletePin(id);
      if (!data.success) {
        alert(data.message);
        return;
      }
      onDeleted();
    } catch (err) {
      console.log(err);
      alert('削除に失敗しました');
    }
  };

  return (
    <div className='detail-panel open'>
      <div className='detail-body'>
        <span className='detail-category' style={{ background: pin.color }}>
          {pin.category_name}
        </span>
        <h2>{pin.name}</h2>
        <div>
          {tags
            .filter((tag) => pinTagIds.includes(tag.id))
            .map((tag) => (
              <span key={tag.id} className='tag-chip'>
                {tag.name}
              </span>
            ))}
        </div>

        {blocks.map((block, index) =>
          block.type === 'text' ? (
            <p key={index} className='detail-text-block'>
              {block.content}
            </p>
          ) : (
            <img key={index} className='detail-image-block' src={`${BACKEND_ORIGIN}${block.url}`} alt='' />
          ),
        )}

        <div className='detail-actions'>
          <button type='button' className='btn-cancel' onClick={onClose}>
            閉じる
          </button>
          {pin.user_id === currentUserId && (
            <>
              <button type='button' className='btn-edit' onClick={() => onEdit({ pin, pinTagIds, blocks })}>
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
  );
}

export default PinDetail;
