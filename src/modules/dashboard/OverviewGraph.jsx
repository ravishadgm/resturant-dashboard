import { useEffect, useRef, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { filterOverviewData, overviewSampleData, overviewSeries } from '../../services/overviewGraphData';

const formatDate = value => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(value + 'T12:00:00'));

export default function OverviewGraph() {
  const [from, setFrom] = useState(overviewSampleData.at(-7).date);
  const [to, setTo] = useState(overviewSampleData.at(-1).date);
  const [containerWidth, setContainerWidth] = useState(800);
  const chartRef = useRef(null);
  const invalid = !from || !to || from > to;
  const rows = invalid ? [] : filterOverviewData(overviewSampleData, from, to);
  const max = Math.max(1, ...rows.flatMap(row => overviewSeries.map(({ key }) => row.counts[key])));
  const scale = Math.max(4, Math.ceil(max / 4) * 4);
  const width = Math.max(containerWidth, rows.length * 94 + 95);
  const left = 68;
  const right = 24;
  const top = 35;
  const bottom = 295;
  const groupWidth = (width - left - right) / Math.max(1, rows.length);
  const barWidth = Math.min(30, groupWidth * 0.18);
  const barGap = Math.min(7, groupWidth * 0.045);

  useEffect(() => {
    const element = chartRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, [invalid, rows.length === 0]);

  return (
    <section className="overview-graph" aria-labelledby="overview-graph-title">
      <header className="overview-graph-header">
        <div>
          <h2 id="overview-graph-title"><BarChart3 size={20} /> Daily activity</h2>
          <p>Tables, managers and restaurant branches created each day.</p>
          <span className="overview-sample-label">Sample data · Last 30 days</span>
        </div>
        <div className="overview-date-filters">
          <label className="field">From date<input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label>
          <label className="field">To date<input type="date" value={to} onChange={event => setTo(event.target.value)} /></label>
          <button type="button" className="btn secondary" onClick={() => { setFrom(overviewSampleData.at(-7).date); setTo(overviewSampleData.at(-1).date); }}>Reset</button>
        </div>
      </header>
      <div className="overview-chart-meta">
        <div className="overview-chart-legend" aria-label="Graph legend">
          {overviewSeries.map(({ key, label, color }) => <span key={key}><i style={{ background: color }} />{label}</span>)}
        </div>
        {!invalid && <span className="overview-range" aria-live="polite">{formatDate(from)} – {formatDate(to)}</span>}
      </div>
      {invalid ? <p className="overview-graph-message" role="alert">Select both dates. From date must be on or before To date.</p> :
        rows.length === 0 ? <p className="overview-graph-message">No sample data for this date range. Choose dates within the last 30 days.</p> : <>
          <div ref={chartRef} className="overview-chart-scroll" tabIndex={0} role="region" aria-label="Daily counts graph; scroll horizontally for more dates">
            <svg className="overview-chart" width={width} height="370" role="img" aria-labelledby="overview-chart-title overview-chart-description">
              <title id="overview-chart-title">Daily activity: Tables, Managers and Restaurant branches</title>
              <desc id="overview-chart-description">Grouped bars show records created by date. Purple is Tables, blue is Managers, green is Restaurant branches. Each bar displays its exact count. Daily counts are also available in the table below.</desc>
              <text transform="translate(17 165) rotate(-90)" textAnchor="middle" fontSize="12" fill="#77768a">Number created</text>
              {Array.from({ length: 5 }, (_, index) => {
                const y = bottom - index * (bottom - top) / 4;
                return <g key={index}><line x1={left} x2={width - right} y1={y} y2={y} stroke="#e8e7ef" strokeDasharray={index ? '4 5' : undefined} /><text x={left - 14} y={y + 4} textAnchor="end" fontSize="12" fill="#77768a">{scale * index / 4}</text></g>;
              })}
              {rows.map((row, index) => {
                const center = left + (index + 0.5) * groupWidth;
                return <g key={row.date}>
                  {overviewSeries.map(({ key, label, color }, seriesIndex) => {
                    const value = row.counts[key];
                    const height = value / scale * (bottom - top);
                    const x = center - (3 * barWidth + 2 * barGap) / 2 + seriesIndex * (barWidth + barGap);
                    return <g className="overview-bar" key={key}>
                      <rect x={x} y={bottom - height} width={barWidth} height={Math.max(height, 2)} rx="4" fill={color} opacity={value ? '0.9' : '0.35'}><title>{formatDate(row.date)}: {label}, {value}</title></rect>
                      <text x={x + barWidth / 2} y={bottom - height - 9} textAnchor="middle" fontSize="12" fontWeight="600" fill={color}>{value}</text>
                    </g>;
                  })}
                  <text x={center} y={bottom + 25} textAnchor="middle" fontSize="12" fill="#77768a">{formatDate(row.date)}</text>
                </g>;
              })}
              <text x={left + (width - left - right) / 2} y="355" textAnchor="middle" fontSize="12" fill="#77768a">Date</text>
            </svg>
          </div>
          <details className="overview-data-details"><summary>View daily counts</summary><div className="overview-data-scroll"><table><caption>Sample counts by date</caption><thead><tr><th scope="col">Date</th>{overviewSeries.map(series => <th scope="col" key={series.key}>{series.label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.date}><th scope="row">{row.date}</th>{overviewSeries.map(series => <td key={series.key}>{row.counts[series.key]}</td>)}</tr>)}</tbody></table></div></details>
        </>}
    </section>
  );
}
