import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import bannerImg1 from '@/assets/banner-koperasi-1.jpg';
import bannerImg2 from '@/assets/banner-koperasi-2.jpg';
import bannerImg3 from '@/assets/banner-koperasi-3.jpg';
import logoKopdes from '@/assets/logo-kopdes.png';

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

const slides: Slide[] = [
  {
    image: bannerImg1,
    title: 'Koperasi Desa Merah Putih',
    subtitle: 'Desa Mesuji Jaya',
    description: 'Membangun kesejahteraan bersama melalui gotong royong dan semangat kebersamaan.',
  },
  {
    image: bannerImg2,
    title: 'Bersatu Untuk Maju',
    subtitle: 'Layanan Pinjaman Terpercaya',
    description: 'Pinjaman uang, sembako, alat pertanian, dan obat-obatan untuk kebutuhan anggota.',
  },
  {
    image: bannerImg3,
    title: 'Sejahtera Bersama',
    subtitle: 'Pertanian & Ekonomi Desa',
    description: 'Mendukung kemajuan pertanian dan perekonomian desa melalui koperasi modern.',
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [textVisible, setTextVisible] = useState(true);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setTextVisible(false);

      setTimeout(() => {
        setCurrent(index);
        setTimeout(() => {
          setTextVisible(true);
          setIsTransitioning(false);
        }, 100);
      }, 400);
    },
    [isTransitioning]
  );

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <div className="relative w-full h-[220px] sm:h-[280px] lg:h-[320px] rounded-2xl overflow-hidden mb-8 group">
      {/* Background images with zoom animation */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={cn(
            'absolute inset-0 transition-opacity duration-700 ease-in-out',
            i === current ? 'opacity-100' : 'opacity-0'
          )}
        >
          <img
            src={s.image}
            alt={s.title}
            className="w-full h-full object-cover animate-[slow-zoom_20s_ease-in-out_infinite_alternate]"
          />
        </div>
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Red accent stripe */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center px-6 sm:px-10 lg:px-14">
        <div className="flex items-center gap-5 sm:gap-8 max-w-2xl">
          {/* Logo */}
          <div
            className={cn(
              'hidden sm:flex shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-full border-2 border-white/30 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm transition-all duration-700',
              textVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            )}
          >
            <img src={logoKopdes} alt="Logo Koperasi" className="w-full h-full object-cover" />
          </div>

          {/* Text content with staggered animations */}
          <div className="flex flex-col gap-1.5">
            <p
              className={cn(
                'text-xs sm:text-sm font-semibold tracking-widest uppercase text-primary-foreground/80 transition-all duration-500',
                textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{ transitionDelay: textVisible ? '100ms' : '0ms' }}
            >
              {slide.subtitle}
            </p>
            <h2
              className={cn(
                'text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight transition-all duration-500',
                textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{ transitionDelay: textVisible ? '200ms' : '0ms' }}
            >
              {slide.title}
            </h2>
            <p
              className={cn(
                'text-xs sm:text-sm text-white/75 max-w-md leading-relaxed transition-all duration-500',
                textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{ transitionDelay: textVisible ? '350ms' : '0ms' }}
            >
              {slide.description}
            </p>
          </div>
        </div>
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-500',
              i === current ? 'w-8 bg-primary' : 'w-3 bg-white/40 hover:bg-white/60'
            )}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/50"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/50"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/10">
        <div
          className="h-full bg-primary transition-none"
          style={{
            animation: 'progress-bar 6s linear infinite',
          }}
        />
      </div>
    </div>
  );
}
