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
      {categories.map((category) => (
        <button
          key={category.id}
          className={`filter-chip ${selectedCategoryId === category.id ? 'active' : ''}`}
          style={{ backgroundColor: category.color, color: '#fff' }}
          onClick={() => {
            setSelectedCategoryId((prev) => (prev === category.id ? null : category.id));
          }}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;
