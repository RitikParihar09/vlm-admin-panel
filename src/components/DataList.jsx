import React, { useState } from 'react';

const DataList = ({ 
  data = [], 
  columns = [], 
  searchPlaceholder = 'Search...', 
  searchKey = 'name',
  filterKey, 
  filterOptions = [],
  filterPlaceholder = 'All',
  actionButton,
  pageSize = 5
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Apply filters and searches
  const filteredData = data.filter((item) => {
    // Search match
    const searchValue = item[searchKey]?.toString().toLowerCase() || '';
    const matchesSearch = searchValue.includes(searchQuery.toLowerCase());

    // Filter match
    let matchesFilter = true;
    if (filterKey && filterValue) {
      matchesFilter = item[filterKey]?.toString() === filterValue;
    }

    return matchesSearch && matchesFilter;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset page to 1
  };

  const handleFilterChange = (e) => {
    setFilterValue(e.target.value);
    setCurrentPage(1); // Reset page to 1
  };

  return (
    <div className="datalist-wrapper glass-panel">
      <div className="datalist-header">
        <div className="datalist-controls">
          <div className="search-box">
            <label htmlFor="datalistSearch" className="sr-only">{searchPlaceholder}</label>
            <input
              type="text"
              id="datalistSearch"
              name="datalistSearch"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="glass-input"
              aria-label={searchPlaceholder}
            />
          </div>

          {filterKey && filterOptions.length > 0 && (
            <>
              <label htmlFor="datalistFilter" className="sr-only">{filterPlaceholder}</label>
              <select
                id="datalistFilter"
                name="datalistFilter"
                value={filterValue}
                onChange={handleFilterChange}
                className="glass-select"
                aria-label={filterPlaceholder}
              >
              <option value="">{filterPlaceholder}</option>
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
              </select>
            </>
          )}
        </div>

        {actionButton}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr key={row.id || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="no-data">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="datalist-pagination">
          <span className="pagination-info">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="pagination-buttons">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="glass-button secondary size-sm"
            >
              Previous
            </button>
            <span className="page-indicator">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="glass-button secondary size-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <style>{`
        .datalist-wrapper {
          padding: 24px;
          border-radius: 16px;
          border: 1px solid var(--panel-border);
        }

        .datalist-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .datalist-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
        }

        .search-box input {
          padding-left: 40px;
          width: 260px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .no-data {
          text-align: center;
          padding: 40px !important;
          color: var(--text-muted);
          font-style: italic;
        }

        .datalist-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid var(--panel-border);
          flex-wrap: wrap;
          gap: 15px;
        }

        .pagination-info {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .pagination-buttons {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .page-indicator {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .glass-button.size-sm {
          padding: 8px 16px;
          font-size: 13px;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default DataList;
