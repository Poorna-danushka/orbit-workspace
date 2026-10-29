export function StarField() {
  const stars = [
    { top: '8%', left: '12%', size: 2, dur: '2.8s', delay: '0s' },
    { top: '15%', left: '78%', size: 1.5, dur: '3.5s', delay: '0.5s' },
    { top: '22%', left: '45%', size: 1, dur: '4s', delay: '1s' },
    { top: '35%', left: '88%', size: 2, dur: '2.5s', delay: '1.5s' },
    { top: '42%', left: '5%', size: 1.5, dur: '3.8s', delay: '0.3s' },
    { top: '55%', left: '65%', size: 1, dur: '3.2s', delay: '0.8s' },
    { top: '68%', left: '28%', size: 2, dur: '4.2s', delay: '0.2s' },
    { top: '72%', left: '92%', size: 1.5, dur: '2.9s', delay: '1.2s' },
    { top: '85%', left: '52%', size: 1, dur: '3.6s', delay: '0.7s' },
    { top: '90%', left: '18%', size: 2, dur: '3s', delay: '0.4s' },
    { top: '5%', left: '55%', size: 1.5, dur: '4.5s', delay: '1.8s' },
    { top: '30%', left: '72%', size: 1, dur: '2.6s', delay: '0.6s' },
  ];
  return (
    <div className="ob-stars" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="ob-star"
          style={
            {
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              '--twinkle-dur': s.dur,
              '--twinkle-delay': s.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
