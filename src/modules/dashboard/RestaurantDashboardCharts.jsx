import { useState } from 'react';

export function RestaurantDistribution({ segments, total }) {
  const [hover, setHover] = useState(null);
  let offset = 0;
  return <div className="rd-distribution"><div className="rd-ring-wrap">
    <svg viewBox="0 0 240 240" role="group" aria-label="Customer distribution">
      <circle cx="120" cy="120" r="83" fill="none" stroke="#f0f1f7" strokeWidth="34" />
      {segments.map(segment => {
        const share = total ? segment.value / total : 0;
        const start = offset; offset += share;
        if (!share) return null;
        const angle = (start + share / 2) * Math.PI * 2 - Math.PI / 2;
        return <g key={segment.key} tabIndex={0} role="img" aria-label={segment.label + ': ' + segment.value}
          onPointerEnter={() => setHover(segment)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(segment)} onBlur={() => setHover(null)}
          onKeyDown={event => { if (event.key === 'Escape') setHover(null); }}>
          <circle cx="120" cy="120" r="83" fill="none" stroke={segment.color} strokeWidth="34" pathLength="100" strokeDasharray={share * 100 + ' ' + (100 - share * 100)} strokeDashoffset={-start * 100} transform="rotate(-90 120 120)" />
          {share > 0.09 && <text x={120 + Math.cos(angle) * 83} y={124 + Math.sin(angle) * 83} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" pointerEvents="none">{Math.round(share * 100)}%</text>}
        </g>;
      })}
      <text x="120" y="116" textAnchor="middle" className="rd-ring-total">{total.toLocaleString('en-IN')}</text>
      <text x="120" y="138" textAnchor="middle" fontSize="12" fill="#77768a">Total</text>
    </svg>
    {hover && <div role="tooltip" className="rd-tooltip"><strong>{hover.label}</strong><span>{hover.value} customers · {(hover.value / total * 100).toFixed(1)}%</span></div>}
    </div><ul className="rd-ring-legend">{segments.map(segment => <li key={segment.key}><span><i style={{ background: segment.color }} />{segment.label}</span><strong>{segment.value} <small>({total ? (segment.value / total * 100).toFixed(1) : 0}%)</small></strong></li>)}</ul>
  </div>;
}

export function RestaurantDailyChart({ rows, series }) {
  const [hover, setHover] = useState(null);
  const width = Math.max(640, rows.length * 50 + 80);
  const step = Math.max(1, Math.ceil(Math.max(1, ...rows.flatMap(row => series.map(item => row[item.key]))) / 4));
  const group = (width - 80) / Math.max(rows.length, 1);
  const format = value => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(value + 'T12:00:00'));
  return <div><div className="rd-series-legend">{series.map(item => <span key={item.key}><i style={{ background: item.color }} />{item.label}</span>)}</div>
    {rows.length === 0 ? <p className="rd-empty">No customer data for these dates.</p> : <>
    <div className="rd-daily-wrap">
      {hover && <div role="tooltip" className="rd-tooltip"><strong>{format(hover.date)} · {hover.label}</strong><span>{hover.value} customers</span></div>}
      <div className="rd-scroll" role="region" tabIndex={0} aria-label="Daily customer chart; scroll for more dates">
        <svg viewBox={'0 0 ' + width + ' 310'} style={{ minWidth: width }} role="group" aria-label="Daily customer counts by date">
          <text x="12" y="15" fontSize="11" fill="#77768a">Customers</text>
          {Array.from({ length: 5 }, (_, i) => <g key={i}><line x1="45" x2={width - 15} y1={245 - i * 50} y2={245 - i * 50} stroke="#e8e7ef" strokeDasharray={i ? '4 4' : undefined} /><text x="34" y={249 - i * 50} fontSize="11" fill="#77768a" textAnchor="end">{step * i}</text></g>)}
          {rows.map((row, i) => <g key={row.date}>
            {series.map((item, s) => {
              const height = row[item.key] / (step * 4) * 200;
              const show = () => setHover({ date: row.date, label: item.label, value: row[item.key] });
              return <g key={item.key} tabIndex={0} role="img" aria-label={row.date + ', ' + item.label + ': ' + row[item.key]}
                onPointerEnter={show} onPointerLeave={() => setHover(null)} onFocus={show} onBlur={() => setHover(null)}
                onKeyDown={event => { if (event.key === 'Escape') setHover(null); }}>
                <rect x={52 + i * group + s * 12} y={245 - height} width="9" height={height} rx="2" fill={item.color} />
              </g>;
            })}
            <text x={66 + i * group} y="268" textAnchor="middle" fontSize="10" fill="#77768a">{format(row.date)}</text>
          </g>)}
          <text x={width / 2} y="300" textAnchor="middle" fontSize="11" fill="#77768a">Date</text>
        </svg>
      </div>
    </div>
    <details className="rd-details"><summary>View daily customer data</summary><div className="rd-scroll"><table><thead><tr><th scope="col">Date</th>{series.map(item => <th scope="col" key={item.key}>{item.label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.date}><th scope="row">{row.date}</th>{series.map(item => <td key={item.key}>{row[item.key]}</td>)}</tr>)}</tbody></table></div></details>
    </>}
  </div>;
}
