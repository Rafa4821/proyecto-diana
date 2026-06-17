import './Grid.css';

export default function Grid({ children, columns = 'auto', gap, className = '' }) {
  const style = {};
  if (gap) style['--grid-gap'] = gap;
  if (columns !== 'auto') style['--grid-columns'] = columns;

  return (
    <div
      className={`grid ${columns === 'auto' ? 'grid--auto' : 'grid--fixed'} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
