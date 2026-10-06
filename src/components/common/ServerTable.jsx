import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown, Search } from 'lucide-react';

export default function ServerTable({ columns, data, loading, total = 0, onQueryChange, searchPlaceholder = 'Search records…', minWidth, showSearch = true }) {
  const [query, setQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const rows = useMemo(() => [...data].sort((a, b) => (
    String(a[sort.key] || '').localeCompare(String(b[sort.key] || '')) * (sort.dir === 'asc' ? 1 : -1)
  )), [data, sort]);
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = rows.length ? ((page - 1) * limit) + 1 : 0;
  const end = rows.length ? Math.min(start + rows.length - 1, total) : 0;

  const submitSearch = (event) => {
    event.preventDefault();
    const search = query.trim();
    setActiveSearch(search);
    setPage(1);
    onQueryChange({ page: 1, limit, search });
  };

  const changePage = (nextPage) => {
    setPage(nextPage);
    onQueryChange({ page: nextPage, limit, search: activeSearch });
  };

  const changeLimit = (event) => {
    const nextLimit = Number(event.target.value);
    setLimit(nextLimit);
    setPage(1);
    onQueryChange({ page: 1, limit: nextLimit, search: activeSearch });
  };

  const toggleSort = (key) => setSort(current => ({
    key,
    dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc',
  }));

  return (
    <div className="table-card">
      {showSearch && <div className="table-tools server-table-tools">
        <form className="table-search-form" onSubmit={submitSearch}>
          <label className="search-box">
            <Search size={18} />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder={searchPlaceholder} />
          </label>
          <button className="btn primary table-search-button" disabled={loading}>Search</button>
        </form>
      </div>}
      <div className="table-scroll">
        <table className="server-data-table" style={minWidth ? { minWidth } : undefined}>
          <thead>
            <tr>{columns.map(column => <th key={column.key} className={column.className || ''}>{column.sortable === false ? column.label : <button onClick={() => toggleSort(column.key)}>{column.label}<ChevronsUpDown size={14} /></button>}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 4 }).map((_, rowIndex) => <tr key={rowIndex}>{columns.map((column, columnIndex) => <td key={column.key}><span className="skeleton" style={{ width: `${55 + (rowIndex + columnIndex) % 3 * 15}%` }} /></td>)}</tr>) : rows.length ? rows.map(row => <tr key={row.id}>{columns.map(column => <td key={column.key} data-label={column.label}>{column.render ? column.render(row[column.key], row) : row[column.key]}</td>)}</tr>) : <tr><td colSpan={columns.length}><div className="empty-state"><Search size={28} /><h3>No records found</h3><p>Try a different search.</p></div></td></tr>}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Showing {start}–{end} of {total}</span>
        <div className="rows-select"><span>Rows per page</span><select value={limit} onChange={changeLimit} disabled={loading}><option>5</option><option>10</option><option>20</option></select></div>
        <div className="pager"><button disabled={loading || page === 1} onClick={() => changePage(page - 1)}><ChevronLeft size={18} /></button><span>{page} / {pages}</span><button disabled={loading || page >= pages} onClick={() => changePage(page + 1)}><ChevronRight size={18} /></button></div>
      </div>
    </div>
  );
}
