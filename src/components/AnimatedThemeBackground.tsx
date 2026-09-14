import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { WorldInfo } from '../types';

interface Props {
  world: WorldInfo;
  levelNumber: number;
  variant?: 'gameplay' | 'home';
}

interface Particle {
  id: number;
  item: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  size: number; // px
  duration: number; // seconds
  delay: number; // seconds
  rotation: number;
  opacity: number;
}

interface LetterTile {
  id: number;
  letter: string;
  x: number;
  y: number;
  duration: number;
  delay: number;
  size: number;
}

export const AnimatedThemeBackground: React.FC<Props> = React.memo(({ 
  world, 
  levelNumber,
  variant = 'gameplay' 
}) => {
  const themeType = world.themeType || 'nature';

  // Seeded themed particles
  const particles = useMemo(() => {
    const decorations = world.bgDecorations && world.bgDecorations.length > 0 
      ? world.bgDecorations 
      : ['✨', '🌟', '💫'];

    const count = variant === 'home' ? 16 : 6;
    const list: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const pseudoRand = Math.sin(levelNumber * 100 + i * 37) * 10000;
      const r1 = Math.abs(pseudoRand - Math.floor(pseudoRand));
      const pseudoRand2 = Math.sin(levelNumber * 200 + i * 59) * 10000;
      const r2 = Math.abs(pseudoRand2 - Math.floor(pseudoRand2));
      const pseudoRand3 = Math.sin(levelNumber * 300 + i * 83) * 10000;
      const r3 = Math.abs(pseudoRand3 - Math.floor(pseudoRand3));

      list.push({
        id: i,
        item: decorations[i % decorations.length],
        x: Math.floor(r1 * 84) + 8,
        y: Math.floor(r2 * 84) + 8,
        size: 16 + Math.floor(r3 * 16),
        duration: 9 + Math.floor(r1 * 9),
        delay: Math.floor(r2 * 4),
        rotation: Math.floor(r3 * 360),
        opacity: 0.35 + r3 * 0.35
      });
    }

    return list;
  }, [world.bgDecorations, levelNumber, variant]);

  // Floating Alphabet Letter Tiles (W, O, R, D, H, U, N, T...)
  const letterTiles = useMemo(() => {
    const letters = ['W', 'O', 'R', 'D', 'H', 'U', 'N', 'T', 'S', 'E', 'A', 'R', 'C', 'H'];
    const count = variant === 'home' ? 8 : 6;
    const list: LetterTile[] = [];

    for (let i = 0; i < count; i++) {
      const pseudoRand = Math.sin(levelNumber * 150 + i * 43) * 10000;
      const r1 = Math.abs(pseudoRand - Math.floor(pseudoRand));
      const pseudoRand2 = Math.sin(levelNumber * 250 + i * 67) * 10000;
      const r2 = Math.abs(pseudoRand2 - Math.floor(pseudoRand2));
      const pseudoRand3 = Math.sin(levelNumber * 350 + i * 89) * 10000;
      const r3 = Math.abs(pseudoRand3 - Math.floor(pseudoRand3));

      let x = Math.floor(r1 * 82) + 9;
      let y = Math.floor(r2 * 82) + 9;
      if (variant === 'gameplay') {
        if (i % 4 === 0) y = 4 + Math.floor(r2 * 10);
        else if (i % 4 === 1) y = 86 + Math.floor(r2 * 8);
        else if (i % 4 === 2) x = 3 + Math.floor(r1 * 6);
        else x = 91 + Math.floor(r1 * 6);
      }

      list.push({
        id: i,
        letter: letters[(i + levelNumber) % letters.length],
        x,
        y,
        size: 26 + Math.floor(r3 * 10),
        duration: 8 + Math.floor(r1 * 6),
        delay: Math.floor(r2 * 4)
      });
    }

    return list;
  }, [levelNumber, variant]);

  // Theme palettes and subtle lighting effects for pure white background
  const themeStyles = useMemo(() => {
    switch (themeType) {
      case 'ocean':
        return {
          baseGradient: '#ffffff',
          blob1: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(14,165,233,0.04) 50%, transparent 70%)',
          blob2: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(20,184,166,0.03) 50%, transparent 70%)',
          blob3: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 60%)',
          tileBg: '#ffffff',
          tileBorder: 'rgba(226, 232, 240, 0.9)',
          tileText: 'rgba(14, 116, 144, 0.65)'
        };
      case 'space':
        return {
          baseGradient: '#ffffff',
          blob1: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, rgba(139,92,246,0.04) 50%, transparent 70%)',
          blob2: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(236,72,153,0.03) 50%, transparent 70%)',
          blob3: 'radial-gradient(circle, rgba(192,132,252,0.08) 0%, transparent 60%)',
          tileBg: '#ffffff',
          tileBorder: 'rgba(226, 232, 240, 0.9)',
          tileText: 'rgba(126, 34, 206, 0.65)'
        };
      case 'snow':
        return {
          baseGradient: '#ffffff',
          blob1: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, rgba(147,197,253,0.04) 50%, transparent 70%)',
          blob2: 'radial-gradient(circle, rgba(186,230,253,0.15) 0%, rgba(224,242,254,0.05) 50%, transparent 70%)',
          blob3: 'radial-gradient(circle, rgba(125,211,252,0.08) 0%, transparent 60%)',
          tileBg: '#ffffff',
          tileBorder: 'rgba(226, 232, 240, 0.9)',
          tileText: 'rgba(3, 105, 161, 0.65)'
        };
      case 'desert':
        return {
          baseGradient: '#ffffff',
          blob1: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, rgba(251,146,60,0.04) 50%, transparent 70%)',
          blob2: 'radial-gradient(circle, rgba(234,88,12,0.09) 0%, rgba(252,211,77,0.03) 50%, transparent 70%)',
          blob3: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 60%)',
          tileBg: '#ffffff',
          tileBorder: 'rgba(226, 232, 240, 0.9)',
          tileText: 'rgba(180, 83, 9, 0.65)'
        };
      case 'ancient':
        return {
          baseGradient: '#ffffff',
          blob1: 'radial-gradient(circle, rgba(217,119,6,0.11) 0%, rgba(180,83,9,0.03) 50%, transparent 70%)',
          blob2: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.03) 50%, transparent 70%)',
          blob3: 'radial-gradient(circle, rgba(234,179,8,0.06) 0%, transparent 60%)',
          tileBg: '#ffffff',
          tileBorder: 'rgba(226, 232, 240, 0.9)',
          tileText: 'rgba(161, 98, 7, 0.65)'
        };
      case 'nature':
      default:
        return {
          baseGradient: '#ffffff',
          blob1: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(20,184,166,0.04) 50%, transparent 70%)',
          blob2: 'radial-gradient(circle, rgba(52,211,153,0.1) 0%, rgba(132,204,22,0.03) 50%, transparent 70%)',
          blob3: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 60%)',
          tileBg: '#ffffff',
          tileBorder: 'rgba(226, 232, 240, 0.9)',
          tileText: 'rgba(4, 120, 87, 0.65)'
        };
    }
  }, [themeType]);

  return (
    <div 
      id="animated-theme-background" 
      className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none bg-white"
    >
      {/* 1. Hardware-Accelerated Ambient Gradient Background (Zero GPU Blur Penalty) */}
      <div
        className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full pointer-events-none opacity-80 anim-bg-pulse"
        style={{ background: themeStyles.blob1 }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full pointer-events-none opacity-80 anim-bg-pulse"
        style={{ background: themeStyles.blob2, animationDelay: '4s' }}
      />
      {variant === 'home' && (
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none opacity-60 anim-bg-pulse"
          style={{ background: themeStyles.blob3, animationDelay: '2s' }}
        />
      )}

      {/* 2. Floating Letter Tile Runes (Pure GPU Compositor CSS Animations) */}
      {letterTiles.map((tile, idx) => (
        <div
          key={`tile-${tile.id}`}
          className={`absolute flex items-center justify-center font-black rounded-xl pointer-events-none shadow-xs select-none ${
            idx % 2 === 0 ? 'anim-bg-float-1' : 'anim-bg-float-2'
          }`}
          style={{
            left: `${tile.x}%`,
            top: `${tile.y}%`,
            width: `${tile.size}px`,
            height: `${tile.size}px`,
            fontSize: `${Math.round(tile.size * 0.55)}px`,
            backgroundColor: themeStyles.tileBg,
            border: `1.5px solid ${themeStyles.tileBorder}`,
            color: themeStyles.tileText,
            opacity: variant === 'home' ? 0.45 : 0.22,
            animationDuration: `${tile.duration}s`,
            animationDelay: `${tile.delay}s`
          }}
        >
          {tile.letter}
        </div>
      ))}

      {/* 3. Subtle Floating Theme Particles (Lively 60-120fps GPU Float) */}
      {particles.map((p, idx) => {
        return (
          <div
            key={`p-${p.id}`}
            className={`absolute select-none pointer-events-none opacity-50 ${
              idx % 2 === 0 ? 'anim-bg-float-1' : 'anim-bg-float-2'
            }`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`
            }}
          >
            {p.item}
          </div>
        );
      })}

      {/* 4. Pure White Bottom Fade */}
      <div className="absolute bottom-0 inset-x-0 h-16 pointer-events-none bg-gradient-to-t from-white via-white/80 to-transparent" />
    </div>
  );
});

AnimatedThemeBackground.displayName = 'AnimatedThemeBackground';
