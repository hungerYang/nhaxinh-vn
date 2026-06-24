'use client';

import Link from 'next/link';

interface HoverRevealLink {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
}

interface HoverRevealCardProps {
  image: string;
  bgGradient?: string;
  title: string;
  description: string;
  links: HoverRevealLink[];
  overlayOpacity?: number;
}

export default function HoverRevealCard({
  image,
  bgGradient = 'from-[#2D5A3D] to-[#1a3d2a]',
  title,
  description,
  links,
  overlayOpacity = 0.4,
}: HoverRevealCardProps) {
  return (
    <div className="group relative w-full h-full overflow-hidden rounded-2xl cursor-pointer">
      {/* Background Image using img tag for fetchpriority support */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        role="presentation"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        fetchPriority="high"
      />

      {/* Fallback Gradient (shown while image loads) */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${bgGradient}`}
        style={{ zIndex: -1 }}
      />

      {/* Default Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Default Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8 group-hover:opacity-0 transition-opacity duration-300 z-10">
        <h2 className="text-white text-2xl lg:text-4xl font-bold mb-2 drop-shadow-lg">
          {title}
        </h2>
      </div>

      {/* Hover Reveal Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
        <h2 className="text-white text-2xl lg:text-3xl font-bold mb-3 text-center drop-shadow-lg">
          {title}
        </h2>
        <p className="text-white/90 text-sm lg:text-base text-center mb-6 max-w-md drop-shadow-md">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105 shadow-lg ${
                link.variant === 'secondary'
                  ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                  : 'bg-white text-foreground hover:bg-white/90'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
