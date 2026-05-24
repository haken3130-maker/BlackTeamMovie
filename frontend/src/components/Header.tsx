import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, X, User, Download, Menu } from 'lucide-react';
import { moviesApi } from '@/services/api';
import { Movie } from '@/types/movie';

const NAV_ITEMS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Phim Bộ', href: '/danh-sach?type=series' },
  { label: 'Phim Lẻ', href: '/danh-sach?type=single' },
  { label: 'Phim Hot', href: '/danh-sach?sort_field=view' },
];

const TOPBAR_HEIGHT = 56;

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const isActive = (href: string) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href.split('?')[0]);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    try {
      const data = await moviesApi.search(q);
      setResults(data.items?.slice(0, 6) || []);
    } catch { setResults([]); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    }}>
      <style>{`
        @media (min-width: 769px) { .mobile-only { display: none !important; } }
        @media (max-width: 768px) { .desktop-only { display: none !important; } }
      `}</style>

      <div style={{
        height: TOPBAR_HEIGHT,
        background: scrolled ? '#111' : 'rgba(0,0,0,0.35)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'background 0.3s ease, border-color 0.3s ease',
        display: 'flex', alignItems: 'center',
        paddingRight: 12, paddingLeft: 12,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginRight: 24, textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
            <span style={{ color: 'white' }}>Black</span>
            <span style={{ color: '#e50914' }}>Team</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', height: '100%', flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <div key={item.label} style={{ height: '100%', position: 'relative' }}>
                <Link href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: 6, height: '100%',
                  padding: '0 16px', fontSize: 14, fontWeight: 500,
                  color: active ? '#fff' : (scrolled ? '#999' : '#ccc'),
                  textShadow: scrolled ? 'none' : '0 1px 8px rgba(0,0,0,0.8)',
                  borderBottom: active ? '2px solid #e50914' : '2px solid transparent',
                  transition: 'all 0.15s', textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}>{item.label}</Link>
              </div>
            );
          })}
        </nav>

        {/* Spacer on mobile */}
        <div className="mobile-only" style={{ flex: 1 }} />

        {/* Right Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {/* Search */}
          <div ref={searchRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => setShowSearch(!showSearch)}
              style={{
                background: 'none', border: 'none', color: scrolled ? '#999' : '#ccc', cursor: 'pointer',
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', transition: 'all 0.2s',
                textShadow: scrolled ? 'none' : '0 1px 8px rgba(0,0,0,0.8)',
              }}
            >
              <Search size={18} />
            </button>

            {showSearch && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8,
                background: '#1a1a2e', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                padding: 8, width: 300, zIndex: 50, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '8px 12px' }}>
                  <Search size={16} style={{ color: '#666', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    style={{
                      flex: 1, background: 'transparent', border: 'none',
                      outline: 'none', color: '#fff', fontSize: 14,
                    }}
                    autoFocus
                  />
                  {query && (
                    <X size={16} style={{ cursor: 'pointer', color: '#666', flexShrink: 0 }}
                      onClick={() => { setQuery(''); setResults([]); }} />
                  )}
                </div>

                {showSuggestions && results.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {results.map((movie) => (
                      <Link key={movie._id} href={`/phim/${movie.slug}`}
                        onClick={() => { setShowSuggestions(false); setShowSearch(false); }}
                        style={{
                          display: 'flex', gap: 10, padding: '8px', borderRadius: 6,
                          textDecoration: 'none', color: 'inherit', transition: 'background 0.2s',
                        }}
                      >
                        <img src={movie.thumb_url} alt={movie.name}
                          style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {movie.name}
                          </div>
                          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                            {movie.origin_name} ({movie.year})
                          </div>
                          <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                            {movie.quality} · {movie.time}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Download - desktop only */}
          <button className="desktop-only" style={{
            background: 'none', border: 'none', color: scrolled ? '#999' : '#ccc', cursor: 'pointer',
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', transition: 'all 0.2s',
            textShadow: scrolled ? 'none' : '0 1px 8px rgba(0,0,0,0.8)',
          }}>
            <Download size={18} />
          </button>

          {/* User - desktop only */}
          <button className="desktop-only" style={{
            background: 'none', border: 'none', color: scrolled ? '#999' : '#ccc', cursor: 'pointer',
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', transition: 'all 0.2s',
            textShadow: scrolled ? 'none' : '0 1px 8px rgba(0,0,0,0.8)',
          }}>
            <User size={20} />
          </button>

          {/* Hamburger - mobile only */}
          <button className="mobile-only" onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{
              background: 'none', border: 'none', color: scrolled ? '#999' : '#ccc', cursor: 'pointer',
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', transition: 'all 0.2s',
            }}
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div ref={menuRef} style={{
          position: 'fixed', top: TOPBAR_HEIGHT, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.95)', zIndex: 999,
          display: 'flex', flexDirection: 'column', padding: '16px 20px',
          animation: 'fadeIn 0.2s ease',
        }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.label} href={item.href} onClick={() => setShowMobileMenu(false)}
                style={{
                  padding: '14px 12px', fontSize: 16, fontWeight: active ? 700 : 500,
                  color: active ? '#fff' : '#999',
                  borderLeft: active ? '3px solid #e50914' : '3px solid transparent',
                  textDecoration: 'none',
                }}
              >{item.label}</Link>
            );
          })}
          <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 16 }}>
            <button style={{ color: '#999', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <Download size={18} /> Tải xuống
            </button>
            <button style={{ color: '#999', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <User size={18} /> Đăng nhập
            </button>
          </div>
        </div>
      )}

      <div style={{
        height: '0.5px',
        background: 'rgba(255,255,255,0.25)',
      }} />
    </header>
  );
}
