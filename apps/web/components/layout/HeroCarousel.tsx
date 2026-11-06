'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

// Para cambiar o agregar fotos basta editar esta lista (host permitido: images.unsplash.com)
const IMAGENES = [
  {
    src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
    alt: 'Residencia moderna de lujo en Lima',
  },
  {
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
    alt: 'Villa contemporánea con piscina al atardecer',
  },
  {
    src: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80',
    alt: 'Villa frente al mar con terraza',
  },
]

export default function HeroCarousel() {
  // Si alguna foto falla al cargar, se omite para no dejar un hueco en la rotación
  const [fallidas, setFallidas] = useState<string[]>([])
  const visibles = IMAGENES.filter((img) => !fallidas.includes(img.src))
  const rota = visibles.length > 1

  return (
    <>
    {/* Contenedor propio: el CSS de Swiper fuerza position: relative en .swiper */}
    <div className="absolute inset-0">
    <Swiper
      key={visibles.length}
      className="h-full w-full"
      modules={[Autoplay, EffectFade, Navigation, Pagination]}
      effect="fade"
      fadeEffect={{ crossFade: true }}
      speed={1400}
      loop={visibles.length > 2}
      allowTouchMove={rota}
      autoplay={rota ? { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: false } : false}
      navigation={rota ? { prevEl: '.hero-prev', nextEl: '.hero-next' } : false}
      pagination={rota ? { el: '.hero-bullets', clickable: true } : false}
    >
      {visibles.map((img, i) => (
        <SwiperSlide key={img.src} className="hero-slide">
          <Image
            src={img.src}
            alt={img.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
            onError={() => setFallidas((prev) => (prev.includes(img.src) ? prev : [...prev, img.src]))}
          />
        </SwiperSlide>
      ))}
    </Swiper>
    </div>

    {/* Capa oscura: mantiene legible el texto con cualquier foto, en ambos temas */}
    <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

    {rota && (
      <>
        {/* Flechas (solo escritorio) */}
        <button
          type="button"
          aria-label="Anterior"
          className="hero-prev absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur-sm transition-colors hover:border-[#ffe795] hover:text-[#ffe795] lg:left-8 lg:flex"
        >
          <ChevronLeft size={20} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Siguiente"
          className="hero-next absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur-sm transition-colors hover:border-[#ffe795] hover:text-[#ffe795] lg:right-8 lg:flex"
        >
          <ChevronRight size={20} strokeWidth={1.8} aria-hidden="true" />
        </button>

        {/* Puntos con barra de progreso, sobre la franja de estadísticas */}
        <div className="absolute inset-x-0 bottom-36 z-20 mx-auto flex max-w-7xl px-6 lg:bottom-28 lg:px-10">
          <div className="hero-bullets flex" />
        </div>
      </>
    )}
    </>
  )
}
