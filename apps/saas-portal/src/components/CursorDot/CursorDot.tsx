import { useEffect, useRef } from 'react';
import './CursorDot.css';

export const CursorDot = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let rafId: number;
    let isHoveringInteractive = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

      const target = e.target as HTMLElement;
      const interactive = target.closest('a, button, input, textarea, [data-cursor="pointer"]');
      if (interactive && !isHoveringInteractive) {
        isHoveringInteractive = true;
        ring.classList.add('ring--hover');
        dot.classList.add('dot--hover');
      } else if (!interactive && isHoveringInteractive) {
        isHoveringInteractive = false;
        ring.classList.remove('ring--hover');
        dot.classList.remove('dot--hover');
      }

      const btn = target.closest('.btn') as HTMLElement | null;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;
        const dx = (e.clientX - btnCenterX) * 0.18;
        const dy = (e.clientY - btnCenterY) * 0.18;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      const btn = e.target.closest('.btn') as HTMLElement | null;
      if (btn) {
        btn.style.transform = '';
      }
    };

    const animateRing = () => {
      const ease = 0.12;
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(animateRing);
    };

    setTimeout(() => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }, 200);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave, true);
    rafId = requestAnimationFrame(animateRing);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave, true);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
};
