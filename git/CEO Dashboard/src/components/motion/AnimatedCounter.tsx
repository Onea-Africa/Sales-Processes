import { useRef, useEffect, useState } from 'react';
import { useInView, animate } from 'framer-motion';

interface Props { raw: string }

export default function AnimatedCounter({ raw }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState('0');

  // Extract numeric portion and suffix (e.g. "1,284+" → num=1284, suffix="+")
  const match = raw.match(/^([0-9,]+)(.*)/);
  const num = match ? parseInt(match[1].replace(/,/g, '')) : 0;
  const suffix = match ? match[2] : raw;
  const comma = match ? match[1].includes(',') : false;

  useEffect(() => {
    if (!inView || !num) { setDisplay(raw); return; }
    const controls = animate(0, num, {
      duration: 2,
      ease: 'easeOut',
      onUpdate(v) {
        const n = Math.floor(v);
        setDisplay(comma ? n.toLocaleString() + suffix : n + suffix);
      },
    });
    return controls.stop;
  }, [inView]);

  return <span ref={ref}>{display}</span>;
}
