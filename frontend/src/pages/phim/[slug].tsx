import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, ChevronLeft, Film, Eye, Clock, Globe,
  Settings, List, StepForward, MessageCircle, ChevronDown,
} from 'lucide-react';
import { moviesApi } from '@/services/api';
import { MovieDetail, ViewHistoryItem } from '@/types/movie';
import MovieSlider from '@/components/MovieSlider';
import Hls from 'hls.js';
import { decryptLink } from '@/utils/crypto';

function formatTime(s: number) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const MENU_SPEED = 'speed';
const MENU_QUALITY = 'quality';
const MENU_EPISODES = 'episodes';
const MENU_AUDIO_SUB = 'audio-sub';

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function MovieDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeServer, setActiveServer] = useState(0);
  const [activeEpisode, setActiveEpisode] = useState<string>('');
  const [relatedMovies, setRelatedMovies] = useState<any[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout>();
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [qualities, setQualities] = useState<{ label: string; level: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [showBigPlay, setShowBigPlay] = useState(true);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const EPISODE_LIMIT = 30;

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    moviesApi.getDetail(slug as string)
      .then((data) => {
        setMovie(data);
        if (data.episodes?.length > 0) {
          setActiveServer(0);
          const first = data.episodes[0].server_data?.[0];
          if (first) setActiveEpisode(first.slug || first.name);
        }
        saveToHistory(data);
        loadRelated(data);
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [slug]);

  const saveToHistory = useCallback((data: MovieDetail) => {
    try {
      const stored = JSON.parse(localStorage.getItem('blackteam_history') || '[]');
      const filtered = stored.filter((item: ViewHistoryItem) => item.slug !== data.slug);
      filtered.unshift({
        slug: data.slug, name: data.name, thumb_url: data.thumb_url,
        episode: data.episode_current || 'Full', timestamp: Date.now(),
      });
      localStorage.setItem('blackteam_history', JSON.stringify(filtered.slice(0, 20)));
    } catch {}
  }, []);

  const loadRelated = async (data: MovieDetail) => {
    try {
      const cat = data.category?.[0]?.slug;
      const result = await moviesApi.getByType(data.type, cat, 1);
      setRelatedMovies((result.items || []).filter((m) => m.slug !== data.slug).slice(0, 12));
    } catch {}
  };

  const episodes = movie?.episodes?.[activeServer]?.server_data || [];
  const currentEp = episodes.find(e => e.slug === activeEpisode || e.name === activeEpisode);

  // HLS initialization
  useEffect(() => {
    let cancelled = false;
    const video = videoRef.current;
    if (!video || !currentEp) return;

    (async () => {
      const rawUrl = currentEp.link_m3u8 || currentEp.link_embed;
      const url = await decryptLink(rawUrl);
      if (!url || cancelled) return;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      setShowBigPlay(true);
      setIsPlaying(false);

      if (Hls.isSupported() && url.includes('.m3u8')) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hlsRef.current = hls;

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const levels = hls.levels.map((l, i) => ({
              label: l.height >= 1080 ? 'Full HD' : l.height >= 720 ? 'HD' : l.height >= 480 ? 'SD' : `${l.height}p`,
              level: i,
            }));
            setQualities([{ label: 'Auto', level: -1 }, ...levels]);
            setCurrentQuality(-1);
            video.play().catch(() => {});
          });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
          setCurrentQuality(data.level);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => video.play().catch(() => {}), { once: true });
      } else {
        video.src = url;
      }
    })();

    return () => { cancelled = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentEp?.slug || currentEp?.name]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration || 0);
    const onPlay = () => { setIsPlaying(true); setShowBigPlay(false); };
    const onPause = () => { setIsPlaying(false); setShowControls(true); };
    const onEnded = () => { setIsPlaying(false); setShowBigPlay(true); };
    const onSeeked = () => { setShowBigPlay(false); };
    const onWaiting = () => {};
    const onCanPlay = () => {};

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
    };
  }, [currentEp?.slug || currentEp?.name]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (isPlaying && !activeMenu) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying, activeMenu]);

  useEffect(() => {
    resetControlsTimer();
    return () => { if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current); };
  }, [isPlaying, activeMenu, resetControlsTimer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      switch (e.code) {
        case 'Space': e.preventDefault(); video.paused ? video.play() : video.pause(); break;
        case 'ArrowLeft': video.currentTime = Math.max(0, video.currentTime - 10); break;
        case 'ArrowRight': video.currentTime = Math.min(video.duration, video.currentTime + 10); break;
        case 'ArrowUp': video.volume = Math.min(1, video.volume + 0.1); break;
        case 'ArrowDown': video.volume = Math.max(0, video.volume - 0.1); break;
        case 'KeyF': toggleFullscreen(); break;
        case 'KeyM': toggleMute(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  };

  const seek = (sec: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + sec));
  };

  const handleVolumeChange = (v: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = v;
    setVolume(v);
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setActiveMenu(null);
  };

  const handleQualityChange = (level: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    if (level === -1) {
      hls.currentLevel = -1;
    } else {
      hls.currentLevel = level;
    }
    setCurrentQuality(level);
    setActiveMenu(null);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      await el.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current?.getBoundingClientRect();
    const video = videoRef.current;
    if (!rect || !video || !duration) return;
    const x = (e.clientX - rect.left) / rect.width;
    video.currentTime = x * duration;
  };

  const handleMenuToggle = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const changeEpisode = (ep: any) => {
    setActiveEpisode(ep.slug || ep.name);
    setActiveMenu(null);
    setShowBigPlay(true);
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 24 }}>
        <div className="skeleton" style={{ width: '100%', height: 400, borderRadius: 12, marginBottom: 24 }} />
        <div className="skeleton" style={{ width: '60%', height: 32, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: '40%', height: 20, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '100%', height: 200, borderRadius: 12 }} />
      </div>
    );
  }

  if (!movie) return null;

  const nextEp = episodes[episodes.findIndex(e => (e.slug || e.name) === activeEpisode) + 1];

  const buf = videoRef.current?.buffered;
  const bufferedEnd = buf && buf.length > 0 ? buf.end(buf.length - 1) : 0;
  const progressPct = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration ? (bufferedEnd / duration) * 100 : 0;

  const isVertical = activeMenu === MENU_EPISODES;

  return (
    <>
      <div className="video-wrapper" style={{
        width: '100%', background: '#000',
        display: 'flex', justifyContent: 'center',
      }}>
      <div ref={containerRef} style={{
        position: 'relative', width: '100%', background: '#000', overflow: 'hidden',
        aspectRatio: '16/9', maxWidth: 1200,
      }}
        onMouseMove={resetControlsTimer}
        onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
      >
        <video ref={videoRef} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
          playsInline onClick={togglePlay} />

        {/* Big play button */}
        {showBigPlay && !isPlaying && (
          <div onClick={togglePlay} style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 5,
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: 'rgba(229,9,20,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.2s',
            }}>
              <Play size= {36} fill="white" color="white" />
            </div>
          </div>
        )}

        {/* Gradient overlays */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 6,
          opacity: showControls ? 1 : 0, transition: 'opacity 0.3s',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 80,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
          }} />
        </div>

        {/* Top bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '12px 16px',
          opacity: showControls ? 1 : 0, transition: 'opacity 0.3s',
          pointerEvents: showControls ? 'auto' : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => router.back()} style={{
              background: 'none', border: 'none', color: 'white', cursor: 'pointer',
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', fontSize: 22,
            }}>
              <ChevronLeft size={24} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {movie.name}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                {currentEp ? `Tập ${currentEp.name}` : movie.episode_current}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          position: 'absolute', bottom: 64, left: 0, right: 0, zIndex: 10, padding: '0 16px',
          opacity: showControls ? 1 : 0, transition: 'opacity 0.3s',
          pointerEvents: showControls ? 'auto' : 'none',
        }}>
          <div ref={progressRef} onClick={handleProgressClick} style={{
            width: '100%', height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3,
            cursor: 'pointer', position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'rgba(255,255,255,0.4)', borderRadius: 3, width: `${bufferedPct}%` }} />
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: '#e50914', borderRadius: 3, width: `${progressPct}%` }} />
            <div style={{
              position: 'absolute', top: '50%', left: `${progressPct}%`, width: 14, height: 14,
              borderRadius: '50%', background: '#e50914', transform: 'translate(-50%, -50%)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }} />
          </div>
        </div>

        {/* Bottom controls bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '8px 12px',
          opacity: showControls ? 1 : 0, transition: 'opacity 0.3s',
          pointerEvents: showControls ? 'auto' : 'none',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {/* Play/Pause */}
          <button onClick={togglePlay} style={ctrlBtnStyle}>
            {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
          </button>

          {/* Rewind 10s */}
          <button onClick={() => seek(-10)} style={ctrlBtnStyle} title="Tua lại 10s">
            <SkipBack size={18} />
            <span style={{ fontSize: 9, position: 'absolute', fontWeight: 700 }}>10</span>
          </button>

          {/* Forward 10s */}
          <button onClick={() => seek(10)} style={ctrlBtnStyle} title="Tua tới 10s">
            <SkipForward size={18} />
            <span style={{ fontSize: 9, position: 'absolute', fontWeight: 700 }}>10</span>
          </button>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}
            onMouseEnter={(e) => { const s = e.currentTarget.querySelector('.vol-slider') as HTMLElement; if (s) s.style.display = 'flex'; }}
            onMouseLeave={(e) => { const s = e.currentTarget.querySelector('.vol-slider') as HTMLElement; if (s) s.style.display = 'none'; }}
          >
            <button onClick={toggleMute} style={ctrlBtnStyle} title="Âm lượng">
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="vol-slider" style={{
              display: 'none', alignItems: 'center', gap: 4, position: 'absolute', bottom: '100%', left: '50%',
              transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', padding: '8px 12px',
              borderRadius: 6, height: 32,
            }}>
              <input type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                style={{ width: 80, accentColor: '#e50914' }} />
            </div>
          </div>

          {/* Time */}
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, whiteSpace: 'nowrap', marginLeft: 4 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div style={{ flex: 1 }} />

          {/* Speed */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => handleMenuToggle(MENU_SPEED)} style={ctrlBtnStyle} title="Tốc độ phát">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M29 16.5C29 19.1228 28.2469 21.6662 26.8222 23.8552C26.6167 24.1708 26.1944 24.2601 25.8788 24.0547C25.5632 23.8492 25.4739 23.4269 25.6793 23.1113C26.9596 21.1443 27.6364 18.8581 27.6364 16.5C27.6364 9.80798 22.192 4.36364 15.5 4.36364C8.80798 4.36364 3.36364 9.80798 3.36364 16.5C3.36364 23.192 8.80798 28.6364 15.5 28.6364C17.8581 28.6364 20.1443 27.9596 22.1113 26.6793C22.4268 26.4739 22.8492 26.5632 23.0547 26.8788C23.2601 27.1944 23.1708 27.6167 22.8552 27.8222C20.6663 29.2469 18.1229 30 15.5 30C11.894 30 8.50389 28.5957 5.95405 26.0459C3.40422 23.4962 2 20.106 2 16.5C2 12.894 3.40427 9.50389 5.95405 6.95405C8.50384 4.40422 11.894 3 15.5 3C19.106 3 22.4961 4.40427 25.0459 6.95405C27.5958 9.50384 29 12.894 29 16.5ZM24.0955 25.0679L24.0679 25.0955C23.8013 25.3614 23.8007 25.7931 24.0666 26.0597C24.1298 26.1234 24.2051 26.1738 24.2879 26.2082C24.3708 26.2426 24.4597 26.2602 24.5494 26.2601C24.7235 26.2601 24.8977 26.1938 25.0308 26.0611L25.0611 26.0308C25.327 25.7642 25.3264 25.3324 25.0598 25.0665C24.7931 24.8006 24.3614 24.8013 24.0955 25.0679ZM21.6118 15.491C21.9588 15.7178 22.1578 16.0855 22.1578 16.5C22.1578 16.9145 21.9588 17.2823 21.6118 17.509L13.4969 22.8129C13.2942 22.9454 13.0671 23.0121 12.8389 23.0121C12.6431 23.0121 12.4465 22.963 12.2638 22.8641C11.8681 22.6501 11.632 22.2537 11.632 21.8039V11.1961C11.632 10.7463 11.8681 10.3499 12.2638 10.1359C12.6594 9.92176 13.1204 9.94091 13.4969 10.1871L21.6118 15.491ZM20.6632 16.5L12.9955 11.4885V21.5115L20.6632 16.5Z"/></svg>
            </button>
            {activeMenu === MENU_SPEED && (
              <MenuPanel onClose={() => setActiveMenu(null)}>
                <MenuTitle>Tốc độ phát</MenuTitle>
                {SPEEDS.map((s) => (
                  <MenuItem key={s} active={playbackRate === s} onClick={() => handleRateChange(s)}>
                    {s === 1 ? '1x (Bình thường)' : `${s}x`}
                  </MenuItem>
                ))}
              </MenuPanel>
            )}
          </div>

          {/* Quality */}
          {qualities.length > 0 && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => handleMenuToggle(MENU_QUALITY)} style={ctrlBtnStyle} title="Chất lượng">
                <Settings size={18} />
                <span style={{ fontSize: 9, marginLeft: 2, background: 'rgba(255,255,255,0.2)', padding: '1px 4px', borderRadius: 3 }}>
                  {currentQuality === -1 ? 'Auto' : qualities.find(q => q.level === currentQuality)?.label || 'Auto'}
                </span>
              </button>
              {activeMenu === MENU_QUALITY && (
                <MenuPanel onClose={() => setActiveMenu(null)}>
                  {qualities.map((q) => (
                    <MenuItem key={q.level} active={currentQuality === q.level} onClick={() => handleQualityChange(q.level)}>
                      {q.label}
                    </MenuItem>
                  ))}
                </MenuPanel>
              )}
            </div>
          )}

          {/* Next Episode */}
          {nextEp && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => changeEpisode(nextEp)} style={ctrlBtnStyle} title="Tập tiếp theo">
                <StepForward size={18} />
              </button>
            </div>
          )}

          {/* Episode List */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => handleMenuToggle(MENU_EPISODES)} style={ctrlBtnStyle} title="Danh sách tập">
              <List size={18} />
            </button>
            {activeMenu === MENU_EPISODES && (
              <div style={{
                position: 'absolute', bottom: '100%', right: 0, marginBottom: 8,
                background: '#1a1a1a', borderRadius: 8, minWidth: 320, maxHeight: 400,
                display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: 14, fontWeight: 700 }}>
                  Danh sách tập
                </div>
                <div style={{ overflow: 'auto', flex: 1 }}>
                  {episodes.map((ep, i) => {
                    const isActive = (ep.slug || ep.name) === activeEpisode;
                    return (
                      <div key={ep.slug || ep.name || i} onClick={() => changeEpisode(ep)} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer',
                        background: isActive ? 'rgba(229,9,20,0.2)' : 'transparent',
                        borderLeft: isActive ? '3px solid #e50914' : '3px solid transparent',
                      }}>
                        <div style={{ flex: 1, fontSize: 13 }}>
                          <div style={{ fontWeight: isActive ? 700 : 400 }}>Tập {ep.name}</div>
                        </div>
                        {isActive && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e50914' }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Audio & Subtitle */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => handleMenuToggle(MENU_AUDIO_SUB)} style={ctrlBtnStyle} title="Âm thanh & Phụ đề">
              <MessageCircle size={18} />
            </button>
            {activeMenu === MENU_AUDIO_SUB && (
              <MenuPanel onClose={() => setActiveMenu(null)} side="right">
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <MenuTitle>Phụ đề</MenuTitle>
                    <MenuItem active>Tiếng Việt</MenuItem>
                    <MenuItem onClick={() => setActiveMenu(null)}>Tắt</MenuItem>
                  </div>
                  <div>
                    <MenuTitle>Âm thanh</MenuTitle>
                    <MenuItem active>Lồng Tiếng</MenuItem>
                    <MenuItem onClick={() => setActiveMenu(null)}>Tiếng Gốc</MenuItem>
                  </div>
                </div>
              </MenuPanel>
            )}
          </div>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} style={ctrlBtnStyle} title="Toàn màn hình">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
      </div>

      <div className="container" style={{ paddingTop: 24 }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16,
        }}>
          <ChevronLeft size={18} /> Trang chủ
        </Link>

        <div className="movie-detail-info">
          <div className="movie-detail-info-main">
            <h1 className="movie-detail-title" style={{ fontWeight: 900, marginBottom: 8 }}>{movie.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
              {movie.origin_name} ({movie.year})
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              {movie.quality && <InfoBadge icon={<Film size={14} />} text={movie.quality} />}
              {movie.time && <InfoBadge icon={<Clock size={14} />} text={movie.time} />}
              {movie.lang && <InfoBadge icon={<Globe size={14} />} text={movie.lang} />}
              {movie.episode_current && <InfoBadge icon={<Play size={14} />} text={`Tập ${movie.episode_current}`} />}
              {movie.view > 0 && <InfoBadge icon={<Eye size={14} />} text={`${movie.view.toLocaleString()} lượt xem`} />}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {movie.category?.map((cat) => (
                <Link key={cat.id} href={`/danh-sach?category=${cat.slug}`} style={{
                  padding: '4px 12px', borderRadius: 16, fontSize: 12,
                  background: 'rgba(229,9,20,0.15)', color: 'var(--accent)',
                  textDecoration: 'none', fontWeight: 600,
                }}>{cat.name}</Link>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Nội dung phim</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                {movie.content || 'Đang cập nhật...'}
              </p>
            </div>

            {movie.episodes?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Danh sách tập</h3>

                {movie.episodes.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {movie.episodes.map((server, idx) => (
                      <button key={idx} onClick={() => { setActiveServer(idx); setActiveEpisode(''); }}
                        style={{
                          padding: '8px 16px', borderRadius: 8, border: 'none',
                          fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          background: idx === activeServer ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                          color: idx === activeServer ? 'white' : 'var(--text-secondary)',
                        }}
                      >{server.server_name}</button>
                    ))}
                  </div>
                )}

                <div className="episode-grid" style={{
                  display: 'grid', gap: 6,
                  gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
                  maxHeight: showAllEpisodes ? 'none' : 240,
                  overflowY: 'auto',
                }}>
                  {(showAllEpisodes ? episodes : episodes.slice(0, EPISODE_LIMIT)).map((ep, i) => (
                    <button key={ep.slug || ep.name || i} onClick={() => setActiveEpisode(ep.slug || ep.name)}
                      style={{
                        padding: '8px 4px', borderRadius: 6, border: 'none',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'center',
                        background: (activeEpisode === ep.slug || activeEpisode === ep.name)
                          ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                        color: (activeEpisode === ep.slug || activeEpisode === ep.name)
                          ? 'white' : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                      }}
                    >{ep.name}</button>
                  ))}
                </div>
                {episodes.length > EPISODE_LIMIT && (
                  <button onClick={() => setShowAllEpisodes(v => !v)}
                    style={{
                      width: '100%', marginTop: 8, padding: '8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
                      background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
                    }}
                  >{showAllEpisodes ? 'Thu gọn' : `Xem thêm (${episodes.length - EPISODE_LIMIT} tập)`}</button>
                )}
              </div>
            )}
          </div>

          <div className="movie-detail-info-side">
            <img src={movie.thumb_url} alt={movie.name}
              style={{ width: '100%', borderRadius: 12, marginBottom: 16 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />

            <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Thông tin phim</h4>
              {[
                { label: 'Trạng thái', value: movie.episode_current ? `Tập ${movie.episode_current}` : 'Đang cập nhật' },
                { label: 'Số tập', value: movie.episode_total || 'Đang cập nhật' },
                { label: 'Chất lượng', value: movie.quality || 'Đang cập nhật' },
                { label: 'Thời lượng', value: movie.time || 'Đang cập nhật' },
                { label: 'Ngôn ngữ', value: movie.lang || 'Đang cập nhật' },
                { label: 'Năm', value: movie.year?.toString() || 'Đang cập nhật' },
                { label: 'Thể loại', value: movie.category?.map(c => c.name).join(', ') || 'Đang cập nhật' },
                { label: 'Quốc gia', value: movie.country?.map(c => c.name).join(', ') || 'Đang cập nhật' },
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: 13,
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {relatedMovies.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <MovieSlider
              title="Phim liên quan"
              movies={relatedMovies}
              link={`/danh-sach?type=${movie.type}`}
            />
          </div>
        )}
      </div>
    </>
  );
}

function InfoBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: 'rgba(255,255,255,0.06)', padding: '6px 12px',
      borderRadius: 8, fontSize: 13,
    }}>
      <span style={{ color: 'var(--accent)' }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

const ctrlBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'white', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '6px', borderRadius: 4, position: 'relative',
  fontSize: 11, minWidth: 32, minHeight: 32,
};

function MenuPanel({ children, onClose, side = 'left' }: { children: React.ReactNode; onClose: () => void; side?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
  return (
    <div ref={ref} style={{
      position: 'absolute', bottom: '100%', right: side === 'right' ? 0 : undefined,
      left: side === 'left' ? 0 : undefined, marginBottom: 8,
      background: '#1a1a1a', borderRadius: 8, minWidth: 160,
      padding: '8px 0', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 20,
    }}>
      {children}
    </div>
  );
}

function MenuTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{children}</div>;
}

function MenuItem({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{
      padding: '8px 16px', fontSize: 13, cursor: onClick ? 'pointer' : 'default',
      display: 'flex', alignItems: 'center', gap: 8,
      background: active ? 'rgba(229,9,20,0.15)' : 'transparent',
      color: active ? '#e50914' : 'white', fontWeight: active ? 700 : 400,
    }}>
      {active && <span style={{ color: '#e50914', fontSize: 16 }}>✓</span>}
      {!active && <span style={{ width: 20 }} />}
      {children}
    </div>
  );
}

function Minimize(props: { size?: number }) {
  return (
    <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}
