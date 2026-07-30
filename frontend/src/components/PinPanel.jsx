import { useEffect, useState } from 'react';
import { getCategories } from '../api/categories';
import { getTags } from '../api/tags';
import { createPin, uploadImage } from '../api/pins';

function PinPanel({ lat, lng, onClose, onCreated }) {
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('draft');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [blocks, setBlocks] = useState([]);
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

      const data = await createPin({
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
      onCreated({
        lat,
        lng,
        color: selectedCategory?.color,
      });
    } catch (err) {
      console.error(err);
      setError('保存に失敗しました');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='detail-panel open'>
      {error && <p className='form-error'>{error}</p>}
      {/* 保存/キャンセルボタン。.detail-panelのCSSクラスを使う 並び替えは後日実装*/}

      {/* カテゴリ */}
      <select name='' id='' value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
        <option value=''>選択してください</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {/* 名前 */}
      <input type='text' value={name} onChange={(e) => setName(e.target.value)} />

      {/* ステータス */}
      <select name='' id='' value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value='draft'>下書き</option>
        <option value='published'>公開</option>
      </select>

      {/* タグ */}
      {tags.map((tag) => (
        <label key={tag.id}>
          <input type='checkbox' checked={selectedTagIds.includes(tag.id)} onChange={() => toggleTag(tag.id)} />
          {tag.name}
        </label>
      ))}

      {/* ブロック */}
      {blocks.map((block, index) => (
        <div key={block.id}>
          {block.type === 'text' ? <textarea value={block.content} onChange={(e) => updateBlockContent(index, e.target.value)} /> : <span>{block.file ? block.file.name : '画像未選択'}</span>}
          <button type='button' onClick={() => removeBlock(index)}>
            削除
          </button>
        </div>
      ))}

      {/* 追加ボタン */}
      <button type='button' onClick={addTextBlock}>
        {' '}
        + テキスト
      </button>
      <button type='button' onClick={() => document.getElementById('image-input').click()}>
        {' '}
        + 画像
      </button>
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
