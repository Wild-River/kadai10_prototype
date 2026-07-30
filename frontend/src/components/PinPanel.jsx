import { useEffect, useState } from 'react';
import { getCategories } from '../api/categories';
import { getTags } from '../api/tags';
import { createPin, uploadImage, updatePin } from '../api/pins';

const BACKEND_ORIGIN = import.meta.env.VITE_SITE_BASE_URL;

function PinPanel({ lat, lng, editingPin, onClose, onCreated, onUpdated }) {
  const [categoryId, setCategoryId] = useState(editingPin ? editingPin.pin.category_id : '');
  const [name, setName] = useState(editingPin ? editingPin.pin.name : '');
  const [status, setStatus] = useState(editingPin ? editingPin.pin.status : 'draft');
  const [selectedTagIds, setSelectedTagIds] = useState(editingPin ? editingPin.pinTagIds : []);

  const [blocks, setBlocks] = useState(
    editingPin
      ? editingPin.blocks.map((b) => ({
          id: crypto.randomUUID(),
          type: b.type,
          content: b.content,
          url: b.url,
        }))
      : [],
  );
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      const categoriesData = await getCategories();
      setCategories(categoriesData.categories);
      const tagsData = await getTags();
      setTags(tagsData.tags);
    };
    fetchOptions();
  }, []);

  const toggleTag = (tagId) => {
    setSelectedTagIds(
      (prev) =>
        prev.includes(tagId)
          ? prev.filter((id) => id !== tagId) // 既に読み込み済みなら外す
          : [...prev, tagId], // 未選択なら追加する
    );
  };

  const addTextBlock = () => {
    setBlocks((prev) => [...prev, { id: crypto.randomUUID(), type: 'text', content: '' }]);
  };

  const addImageBlock = (file) => {
    setBlocks((prev) => [...prev, { id: crypto.randomUUID(), type: 'image', file }]);
  };

  const removeBlock = (index) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index)); // 削除したいindex番目以外を残す。_は「この引数は使わないけど位置が必要だから受け取っている」という意味
  };

  const updateBlockContent = (index, content) => {
    setBlocks((prev) => prev.map((block, i) => (i === index ? { ...block, content } : block)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const uploadBlocks = await Promise.all(
        //Promise.allで並行処理
        // 各ブロックに対して「画像なら先にアップロードしてurlに差し替える、テキストならそのまま」
        blocks.map(async (block) => {
          if (block.type === 'image' && block.file) {
            const uploadResult = await uploadImage(block.file);
            return { type: 'image', url: uploadResult.url };
          }
          return block;
        }),
      );

      const data = editingPin
        ? await updatePin({
            id: editingPin.pin.id,
            categoryId,
            name,
            lat,
            lng,
            status,
            tags: selectedTagIds,
            blocks: uploadBlocks,
          })
        : await createPin({
            categoryId,
            name,
            lat,
            lng,
            status,
            tags: selectedTagIds,
            blocks: uploadBlocks,
          });

      if (!data.success) {
        setError(data.message);
        return;
      }

      const selectedCategory = categories.find((c) => String(c.id) === String(categoryId));
      const resultPin = { id: editingPin ? editingPin.pin.id : data.id, lat, lng, color: selectedCategory?.color };

      if (editingPin) {
        onUpdated(resultPin);
      } else {
        onCreated(resultPin);
      }
    } catch (err) {
      console.error(err);
      setError('保存に失敗しました');
    }
  };

  return (
    <form onSubmit={handleSubmit} id='detail-edit-form' className='detail-panel open'>
      {error && <p className='form-error'>{error}</p>}
      {/* 保存/キャンセルボタン。.detail-panelのCSSクラスを使う 並び替えは後日実装*/}

      <label>
        ジャンル
        <select name='' id='' value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value=''>選択してください</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        名前
        <input type='text' value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label>
        ステータス
        <select name='' id='' value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value='draft'>下書き</option>
          <option value='published'>公開</option>
        </select>
      </label>

      <fieldset>
        <legend>タグ</legend>
        {tags.map((tag) => (
          <label key={tag.id}>
            <input type='checkbox' checked={selectedTagIds.includes(tag.id)} onChange={() => toggleTag(tag.id)} />
            {tag.name}
          </label>
        ))}
      </fieldset>

      {blocks.map((block, index) => (
        <div key={block.id} className='block-item'>
          <div className='block-header'>
            <div className='block-controls'>
              <button type='button' className='block-delete' onClick={() => removeBlock(index)}>
                ×
              </button>
            </div>
          </div>
          {block.type === 'text' ? <textarea className='block-text' value={block.content} onChange={(e) => updateBlockContent(index, e.target.value)} /> : <img className='block-image-preview' src={block.url ? `${BACKEND_ORIGIN}${block.url}` : block.file ? URL.createObjectURL(block.file) : ''} alt='' />}
        </div>
      ))}

      <div className='block-add-buttons'>
        <button type='button' onClick={addTextBlock}>
          {' '}
          + テキスト
        </button>
        <button type='button' onClick={() => document.getElementById('image-input').click()}>
          {' '}
          + 画像
        </button>
      </div>

      <input
        type='file'
        id='image-input'
        accept='image/*'
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0]; // ユーザーが選んだファイル(1つ目)を取り出す
          if (file) addImageBlock(file);
          e.target.value = ''; // 同じファイルを選び直せるようにリセット
        }}
      />

      <div className='detail-actions'>
        <button type='button' className='btn-cancel' onClick={onClose}>
          キャンセル
        </button>
        <button type='submit' className='btn-submit'>
          保存
        </button>
      </div>
    </form>
  );
}

export default PinPanel;
