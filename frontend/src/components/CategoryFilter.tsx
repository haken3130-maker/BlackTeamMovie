import { useEffect, useState } from 'react';
import { categoriesApi } from '@/services/api';
import { Category } from '@/types/movie';

interface CategoryFilterProps {
  selected: string;
  onChange: (slug: string) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => {});
  }, []);

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20,
    }}>
      <button
        onClick={() => onChange('')}
        style={{
          padding: '6px 16px', borderRadius: 20, border: 'none',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s',
          background: !selected ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
          color: !selected ? 'white' : 'var(--text-secondary)',
        }}
      >Tất cả</button>
      {categories.map((cat) => (
        <button
          key={cat._id}
          onClick={() => onChange(cat.slug)}
          style={{
            padding: '6px 16px', borderRadius: 20, border: 'none',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
            background: selected === cat.slug ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
            color: selected === cat.slug ? 'white' : 'var(--text-secondary)',
          }}
        >{cat.name}</button>
      ))}
    </div>
  );
}
