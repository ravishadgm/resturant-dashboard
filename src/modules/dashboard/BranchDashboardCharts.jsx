import { useId, useState } from 'react';

export function DistributionChart({ segments, centerLabel, total }) {
  const id = useId();
  const [hover, setHover] = useState(null);
  let offset = 0;
  return <div className="reference-distribution">
    <div className="reference-ring-wrap">
      <svg viewBox="0 0 240 240" className="reference-ring" role="group" aria-labelledby={id + '-title'}>
        <title id={id + '-title'}>{centerLabel} distribution</title>
        <circle cx="120" cy="120" r="83" fill="none" stroke="#f0f1f7" strokeWidth="34" />
        {segments.map(segment => {
          const fraction = total ? segment.value / total : 0;
          const start = offset;
          offset += fraction;
          if (!fraction) return null;
          const angle = (start + fraction / 2) * Math.PI * 2 - Math.PI / 2;
          return <g key={segment.key} tabIndex={0} role="img"
            aria-label={segment.label + ': ' + segment.value + ', ' + (fraction * 100).toFixed(1) + '%'}
            onPointerEnter={() => setHover(segment.key)} onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(segment.key)} onBlur={() => setHover(null)}
            onKeyDown={event => { if (event.key === 'Escape') setHover(null); }}>
            <circle cx="120" cy="120" r="83" fill="none" stroke={segment.color} strokeWidth="34"
              pathLength="100" strokeDasharray={(fraction * 100) + ' ' + (100 - fraction * 100)}
              strokeDashoffset={-start * 100} transform="rotate(-90 120 120)" />
            {fraction > 0.09 && <text x={120 + Math.cos(angle) * 83} y={124 + Math.sin(angle) * 83}
              textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" pointerEvents="none">{Math.round(fraction * 100)}%</text>}
          </g>;
        })}
        <text x="120" y="116" textAnchor="middle" className="reference-ring-total">{total}</text>
        <text x="120" y="137" textAnchor="middle" fontSize="12" fill="#77768a">{centerLabel}</text>
      </svg>
      {hover && segments.filter(segment => segment.key === hover).map(segment =>
        <div key={segment.key} role="tooltip" className="reference-chart-tooltip"><strong>{segment.label}</strong><span>{segment.value} {centerLabel.toLowerCase()} · {total ? (segment.value / total * 100).toFixed(1) : 0}%</span></div>)}
    </div>
    <ul className="reference-ring-legend">{segments.map(segment => <li key={segment.key}><span><i style={{ background: segment.color }} />{segment.label}</span><strong>{segment.value} <small>({total ? (segment.value / total * 100).toFixed(1) : 0}%)</small></strong></li>)}</ul>
  </div>;
}

export function DailyCustomerChart({ rows, series }) {
  const [hover, setHover] = useState(null);
  const id = useId();
  const width = Math.max(620, rows.length * 56 + 80);
  const max = Math.max(1, ...rows.flatMap(row => series.map(item => row[item.key])));
  const scale = Math.max(4, Math.ceil(max / 4) * 4);
  const group = (width - 80) / Math.max(rows.length, 1);
  const format = value => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(value + 'T12:00:00'));
  return <div>
    <div className="reference-series-legend">{series.map(item => <span key={item.key}><i style={{ background: item.color }} />{item.label}</span>)}</div>
    {rows.length === 0 ? <p className="reference-empty">No customer records in this date range.</p> : <>
      <div className="reference-daily-wrap">
        {hover && <div role="tooltip" className="reference-chart-tooltip"><strong>{format(hover.date)} · {hover.label}</strong><span>{hover.value} customers</span></div>}
        <div className="reference-daily-scroll" role="region" tabIndex={0} aria-label="Daily customer count; scroll to see all dates">
          <svg viewBox={'0 0 ' + width + ' 310'} style={{ minWidth: width }} role="group" aria-labelledby={id + '-title'}>
            <title id={id + '-title'}>Daily customer counts by date and type</title>
            <text x="12" y="15" fontSize="11" fill="#77768a">Customers</text>
            {Array.from({ length: 5 }, (_, i) => {
              const y = 245 - i * 50;
              return <g key={i}><line x1="45" x2={width - 15} y1={y} y2={y} stroke="#e8e7ef" strokeDasharray={i ? '4 4' : undefined} /><text x="34" y={y + 4} fontSize="11" fill="#77768a" textAnchor="end">{scale * i / 4}</text></g>;
            })}
            {rows.map((row, i) => <g key={row.date}>
              {series.map((item, s) => {
                const height = row[item.key] / scale * 200;
                const x = 52 + i * group + s * 12;
                return <g key={item.key} tabIndex={0} role="img" aria-label={row.date + ', ' + item.label + ': ' + row[item.key]}
                  onPointerEnter={() => setHover({ date: row.date, label: item.label, value: row[item.key] })}
                  onPointerLeave={() => setHover(null)} onFocus={() => setHover({ date: row.date, label: item.label, value: row[item.key] })}
                  onBlur={() => setHover(null)} onKeyDown={event => { if (event.key === 'Escape') setHover(null); }}>
                  <rect x={x} y={245 - height} width="9" height={height} rx="2" fill={item.color} />
                </g>;
              })}
              <text x={66 + i * group} y="267" textAnchor="middle" fontSize="10" fill="#77768a">{format(row.date)}</text>
            </g>)}
            <text x={width / 2} y="300" textAnchor="middle" fontSize="11" fill="#77768a">Date</text>
          </svg>
        </div>
      </div>
      <details className="reference-daily-details"><summary>View daily customer data</summary><div className="reference-daily-scroll"><table><thead><tr><th scope="col">Date</th>{series.map(item => <th scope="col" key={item.key}>{item.label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.date}><th scope="row">{row.date}</th>{series.map(item => <td key={item.key}>{row[item.key]}</td>)}</tr>)}</tbody></table></div></details>
    </>}
  </div>;
}
