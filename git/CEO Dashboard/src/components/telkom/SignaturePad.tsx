import React, { useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';

export interface SigHandle {
  clear(): void;
  toDataURL(): string;
  isEmpty(): boolean;
  adopt(name: string, date: string): void;
}

interface Props {
  label?: string;
  value?: string;
  onChange?: (hasDrawn: boolean) => void;
  onValueChange?: (value: string) => void;
}

const SignaturePad = forwardRef<SigHandle, Props>(({ label = 'Draw your signature', value = '', onChange, onValueChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const last = useRef<[number, number] | null>(null);
  const hasDrawn = useRef(false);

  const drawStoredValue = useCallback((storedValue: string) => {
    const canvas = canvasRef.current;
    if (!canvas || !storedValue) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    image.onload = () => {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      hasDrawn.current = true;
      onChange?.(true);
    };
    image.src = storedValue;
  }, [onChange]);

  const setup = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = 150;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#1a2c18';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawStoredValue(value);
  };

  useEffect(() => {
    setup();
    window.addEventListener('resize', setup);
    return () => window.removeEventListener('resize', setup);
  }, [drawStoredValue, value]);

  const getPos = (e: React.MouseEvent | React.TouchEvent): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    if ('touches' in e) {
      return [e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top];
    }
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const drawLine = (from: [number, number], to: [number, number]) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(to[0], to[1]);
    ctx.stroke();
  };

  useImperativeHandle(ref, () => ({
    clear() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dpr = window.devicePixelRatio || 1;
      ctx.scale(dpr, dpr);
      hasDrawn.current = false;
      onChange?.(false);
      onValueChange?.('');
    },
    toDataURL() {
      return canvasRef.current?.toDataURL('image/png') || '';
    },
    isEmpty() {
      return !hasDrawn.current;
    },
    adopt(name: string, date: string) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#1a2c18';
      ctx.font = 'italic 28px Georgia, serif';
      ctx.fillText(name || 'Customer signature', 22, 82);
      ctx.font = '12px Inter, Arial, sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(date || new Date().toLocaleDateString('en-ZA'), 24, 106);
      ctx.restore();
      hasDrawn.current = true;
      onChange?.(true);
      onValueChange?.(canvas.toDataURL('image/png'));
    },
  }));

  const onStart = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true;
    last.current = getPos(e);
    hasDrawn.current = true;
    onChange?.(true);
  };

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current || !last.current) return;
    e.preventDefault();
    const next = getPos(e);
    drawLine(last.current, next);
    last.current = next;
  };

  const onEnd = () => {
    if (drawing.current && hasDrawn.current) {
      const value = canvasRef.current?.toDataURL('image/png') || '';
      if (value) onValueChange?.(value);
    }
    drawing.current = false;
    last.current = null;
  };

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden relative bg-white"
        style={{ cursor: 'crosshair' }}
      >
        <canvas
          ref={canvasRef}
          className="touch-none block w-full h-[150px]"
          onMouseDown={onStart}
          onMouseMove={onMove}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
          onTouchStart={onStart}
          onTouchMove={onMove}
          onTouchEnd={onEnd}
        />
        <div className="absolute bottom-8 left-6 right-6 border-b border-gray-300 pointer-events-none" />
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-gray-400 pointer-events-none select-none whitespace-nowrap">
          {label}
        </p>
      </div>
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';
export default SignaturePad;
