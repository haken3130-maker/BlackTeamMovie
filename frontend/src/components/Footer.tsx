import Link from 'next/link';

const CATEGORIES = [
  { name: 'Hành Động', slug: 'hanh-dong' },
  { name: 'Tình Cảm', slug: 'tinh-cam' },
  { name: 'Cổ Trang', slug: 'co-trang' },
  { name: 'Hài Hước', slug: 'hai-huoc' },
  { name: 'Kinh Dị', slug: 'kinh-di' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong' },
];

const NAV_LINKS = [
  { name: 'Trang chủ', href: '/' },
  { name: 'Phim Bộ', href: '/danh-sach?type=series' },
  { name: 'Phim Lẻ', href: '/danh-sach?type=single' },
  { name: 'Phim Hot', href: '/danh-sach?sort_field=view' },
];

export default function Footer() {
  return (
    <footer style={{
      background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.06)',
      marginTop: 60,
    }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 32 }}>
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 40,
        }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
                <span style={{ color: 'white' }}>Black</span>
                <span style={{ color: '#e50914' }}>Team</span>
              </span>
            </Link>
            <p style={{ color: '#777', fontSize: 13, lineHeight: 1.7, marginTop: 12, maxWidth: 320 }}>
              BlackTeam - Nền tảng xem phim online miễn phí chất lượng cao.
              Kho phim Việt Nam, Châu Á, Hollywood với phụ đề tiếng Việt.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'white' }}>Điều hướng</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {NAV_LINKS.map((link) => (
                <li key={link.name} style={{ marginBottom: 10 }}>
                  <Link href={link.href} style={{
                    color: '#777', fontSize: 13, textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#e50914'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#777'}
                  >{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'white' }}>Thể loại</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {CATEGORIES.map((cat) => (
                <li key={cat.slug} style={{ marginBottom: 10 }}>
                  <Link href={`/danh-sach?category=${cat.slug}`} style={{
                    color: '#777', fontSize: 13, textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#e50914'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#777'}
                  >{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'white' }}>Liên hệ</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ color: '#777', fontSize: 13, marginBottom: 10 }}>Email: contact@blackteam.vn</li>
              <li style={{ color: '#777', fontSize: 13, marginBottom: 10 }}>Hotline: 1900 xxx xxx</li>
              <li style={{ color: '#777', fontSize: 13 }}>
                DMCA: dmca@blackteam.vn
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: 1, background: 'rgba(255,255,255,0.06)', margin: '32px 0 20px',
        }} />

        {/* Bottom bar */}
        <div className="footer-bottom" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          color: '#555', fontSize: 12,
        }}>
          <p>© 2024 BlackTeam. All rights reserved.</p>
          <p>Dữ liệu được cung cấp bởi OPhim</p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            gap: 8px !important;
            text-align: center !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </footer>
  );
}
