import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface SigHandle {
  clear(): void;
  toDataURL(): string;
  isEmpty(): boolean;
}

interface Props { label?: string }

const SignaturePad = forwardRef<SigHandle, Props>(({ label = 'Draw your signature' }, ref) => {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawing  = useRef(false);
  const last     = useRef<[number, number] | null>(null);
  const hasDrawn = useRef(false);

  const setup = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = 150;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#1a2c18';
    ctx.lineWidth   = 2.2;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
  };

  useEffect(() => { setup(); }, []);

  useImperativeHandle(ref, () => ({
    clear() {
      const c = canvasRef.current;
      if (!c) return;
      c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
      hasDrawn.current = false;
    },
    toDataURL() { return canvasRef.current?.toDataURL('image/png') ?? ''; },
    isEmpty()   { return !hasDrawn.current; },
  }));

  const pos = (e: React.MouseEvent | React.TouchEvent): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    if ('touches' in e) return [e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top];
    const me = e as React.MouseEvent;
    return [me.clientX - rect.left, me.clientY - rect.top];
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true; last.current = pos(e); hasDrawn.current = true;
  };
  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current || !last.current) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = pos(e);
    ctx.beginPath(); ctx.moveTo(last.current[0], last.current[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
    last.current = p;
  };
  const end = () => { drawing.current = false; last.current = null; };

  return (
    <div ref={containerRef} className="w-full">
      <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden relative bg-white" style={{ cursor: 'crosshair' }}>
        <canvas
          ref={canvasRef}
          className="touch-none block"
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        />
        <div className="absolute bottom-8 left-6 right-6 border-b border-gray-300 pointer-events-none" />
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-gray-400 pointer-events-none select-none whitespace-nowrap">{label}</p>
      </div>
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';
export default SignaturePad;
