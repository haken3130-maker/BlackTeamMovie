import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isMovieDetail = router.pathname.startsWith('/phim/');

  return (
    <>
      {!isMovieDetail && <Header />}
      <main style={isMovieDetail ? { paddingTop: 0 } : undefined}>
        <Component {...pageProps} />
      </main>
      <Footer />
    </>
  );
}
