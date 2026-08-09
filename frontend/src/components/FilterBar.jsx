import { useState, useEffect } from 'react';
import { getCategories } from '../api/categories';

function FilterBar({ selectedCategoryId, setSelectedCategoryId }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const categoriesData = await getCategories();
      setCategories(categoriesData.categories);
    };
    fetchOptions();
  }, []);

  return (
    <div id='filter-bar'>
      <button className={`filter-chip ${selectedCategoryId === null ? 'active' : ''}`} style={selectedCategoryId === null ? { backgroundColor: 'var(--color-primary)' } : undefined} onClick={() => setSelectedCategoryId(null)}>
        すべて
      </button>
      {categories.map((category) => {
        const isVisible = selectedCategoryId === null || selectedCategoryId === category.id;
        return (
          <button
            key={category.id}
            className={`filter-chip ${isVisible ? 'active' : ''}`}
            style={isVisible ? { backgroundColor: category.color } : undefined}
            onClick={() => {
              setSelectedCategoryId((prev) => (prev === category.id ? null : category.id));
            }}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}

export default FilterBar;
