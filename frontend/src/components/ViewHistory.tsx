import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Trash2, Play } from 'lucide-react';
import { ViewHistoryItem } from '@/types/movie';

export default function ViewHistory() {
  const [history, setHistory] = useState<ViewHistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('blackteam_history');
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('blackteam_history');
    setHistory([]);
  };

  if (!history.length) return null;

  return (
    <section className="container">
      <div className="section-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          <Clock size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Tiếp tục xem
        </h2>
        <button onClick={clearHistory} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Trash2 size={14} /> Xóa lịch sử
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, overflow: 'auto', paddingBottom: 8 }}>
        {history.map((item) => (
          <Link key={item.slug} href={`/phim/${item.slug}`} style={{
            display: 'flex', gap: 12, minWidth: 300, flexShrink: 0,
            background: 'var(--bg-card)', borderRadius: 10, overflow: 'hidden',
            textDecoration: 'none', color: 'inherit',
            transition: 'transform 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <img src={item.thumb_url} alt={item.name}
              style={{ width: 80, height: 110, objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ padding: '10px 12px 10px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                {item.episode}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>
                <Play size={14} /> Xem tiếp
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
