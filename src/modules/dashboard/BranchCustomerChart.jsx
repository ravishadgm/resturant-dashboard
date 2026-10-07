import { useId, useState } from 'react';
import { PieChart } from 'lucide-react';
import sampleResponse from '../../services/branchCustomerResponse.json';
import { filterBranchCustomers } from '../../utils/branchCustomerChart';

const colors = ['#6d45d8', '#3478d4', '#268b60', '#df921d', '#d34f81', '#2999a8'];
const point = (angle, radius = 114) => ({
  x: 160 + Math.cos(angle) * radius,
  y: 150 + Math.sin(angle) * radius,
});

export default function BranchCustomerChart({ response = sampleResponse, isSample = true }) {
  const id = useId();
  const dates = response.data?.daily_counts ?? [];
  const defaultFrom = dates.at(-7)?.date ?? response.from ?? '';
  const defaultTo = dates.at(-1)?.date ?? response.to ?? '';
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [tooltip, setTooltip] = useState(null);
  const invalid = !from || !to || from > to;
  const branches = invalid ? [] : filterBranchCustomers(response, from, to);
  const total = branches.reduce((sum, branch) => sum + branch.customer_count, 0);
  const updateDate = (setter, value) => { setter(value); setTooltip(null); };
  const showTooltip = (event, slice) => {
    const box = event.currentTarget.ownerSVGElement.parentElement.getBoundingClientRect();
    const x = event.type === 'focus' ? box.width / 2 : event.clientX - box.left;
    const y = event.type === 'focus' ? 20 : event.clientY - box.top;
    setTooltip({ slice, x: Math.max(4, Math.min(x + 12, box.width - 190)), y: Math.max(4, Math.min(y + 12, box.height - 100)) });
  };
  let angle = -Math.PI / 2;
  const slices = branches.map((branch, index) => {
    const start = angle;
    const share = total ? branch.customer_count / total : 0;
    angle += share * Math.PI * 2;
    const a = point(start);
    const b = point(angle);
    const label = point((start + angle) / 2, 76);
    return { ...branch, share, label, color: colors[index % colors.length],
      path: 'M 160 150 L ' + a.x + ' ' + a.y + ' A 114 114 0 ' + (share > 0.5 ? 1 : 0) + ' 1 ' + b.x + ' ' + b.y + ' Z' };
  });

  return (
    <section className="branch-customer-chart" aria-labelledby={id + '-heading'}>
      <header>
        <div><h2 id={id + '-heading'}><PieChart size={20} /> Customers by branch</h2><p>New customers registered in each branch during the selected dates.</p></div>
        <div className="overview-date-filters">
          <label className="field">From date<input type="date" value={from} onChange={event => updateDate(setFrom, event.target.value)} /></label>
          <label className="field">To date<input type="date" value={to} onChange={event => updateDate(setTo, event.target.value)} /></label>
          <button type="button" className="btn secondary" onClick={() => { setFrom(defaultFrom); setTo(defaultTo); setTooltip(null); }}>Reset</button>
        </div>
      </header>
      {invalid ? <p className="branch-customer-empty" role="alert">Select both dates. From date must be on or before To date.</p> :
      total === 0 ? <p className="branch-customer-empty" role="status">No customers for the selected dates.{isSample && <> Sample dates: {response.from} to {response.to}.</>}</p> : <div className="branch-customer-content">
        <div className="branch-customer-pie-wrap">
          <svg viewBox="0 0 320 300" className="branch-customer-pie" role="group" aria-labelledby={id + '-title ' + id + '-description'}>
            <title id={id + '-title'}>Customer distribution by branch</title>
            <desc id={id + '-description'}>Hover or focus a slice for details. {branches.map(branch => branch.branch_name + ': ' + branch.customer_count + ' customers').join('. ')}</desc>
            {slices.filter(slice => slice.customer_count > 0).map(slice => <g key={slice.branch_id}
              tabIndex={0} role="img" aria-label={slice.branch_name + ': ' + slice.customer_count + ' customers, ' + (slice.share * 100).toFixed(1) + '%'}
              aria-describedby={tooltip?.slice.branch_id === slice.branch_id ? id + '-tooltip' : undefined}
              onPointerEnter={event => showTooltip(event, slice)} onPointerMove={event => showTooltip(event, slice)} onPointerLeave={() => setTooltip(null)}
              onFocus={event => showTooltip(event, slice)} onBlur={() => setTooltip(null)} onKeyDown={event => { if (event.key === 'Escape') setTooltip(null); }}>
              {slice.share === 1 ? <circle cx="160" cy="150" r="114" fill={slice.color} /> :
                <path d={slice.path} fill={slice.color} stroke="#fff" strokeWidth="3" />}
              {slice.share >= 0.07 && <text pointerEvents="none" x={slice.share === 1 ? 160 : slice.label.x} y={slice.share === 1 ? 150 : slice.label.y} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="16" fontWeight="700">{slice.customer_count}</text>}
            </g>)}
          </svg>
          {tooltip && <div id={id + '-tooltip'} role="tooltip" className="branch-customer-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            <strong><i style={{ background: tooltip.slice.color }} />{tooltip.slice.branch_name}</strong>
            <span>{tooltip.slice.customer_count.toLocaleString('en-IN')} customers</span>
            <small>{(tooltip.slice.share * 100).toFixed(1)}% of selected range</small>
          </div>}
        </div>
        <div className="branch-customer-legend" aria-live="polite">
          <div className="branch-customer-legend-head"><span>Branch</span><span>Customers</span><span>Share</span></div>
          <ul>{slices.map(slice => <li key={slice.branch_id}>
            <span className="branch-customer-name"><i style={{ background: slice.color }} />{slice.branch_name}</span>
            <strong>{slice.customer_count.toLocaleString('en-IN')}</strong>
            <span className="branch-customer-share">{(slice.share * 100).toFixed(1)}%</span>
          </li>)}</ul>
          <p>{from} to {to}. Hover over a slice to see branch details.</p>
        </div>
      </div>}
    </section>
  );
}
