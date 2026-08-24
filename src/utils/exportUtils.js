/**
 * Utility function to export JSON data to an Excel-compatible CSV file.
 * Handles quoting, nested properties, commas, and prepends the UTF-8 BOM
 * so Excel opens it with correct encoding and formatting.
 * 
 * @param {Array<Object>} data - The raw data array (e.g. students, teachers, parents)
 * @param {Array<Object>} headers - Array of objects with label and key fields (key can be string or function)
 * @param {string} fileName - Name of the downloaded file (without extension)
 */
export const exportToExcelCSV = (data, headers, fileName) => {
  if (!data || !data.length) {
    alert("No data available to export");
    return;
  }

  // Generate header row
  const headerRow = headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(',');

  // Generate data rows
  const rows = data.map(item => {
    return headers.map(h => {
      let value = '';
      if (typeof h.key === 'function') {
        value = h.key(item);
      } else {
        // Safe access for nested keys like 'wallet.totalPoints'
        value = h.key.split('.').reduce((acc, part) => acc && acc[part], item);
      }

      if (value === undefined || value === null) {
        value = '';
      } else {
        value = String(value);
      }

      // Escape quotes and wrap in quotes to handle commas, newlines, etc.
      return `"${value.replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = [headerRow, ...rows].join('\n');
  
  // Create Blob with UTF-8 BOM so Excel displays unicode characters properly
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Returns an array of page numbers and ellipses to display in pagination.
 * 
 * @param {number} currentPage - The currently active page index (1-indexed)
 * @param {number} totalPages - The total number of pages
 * @returns {Array<number|string>} e.g. [1, 2, "...", 15, 16, 17, "...", 100]
 */
export const getPaginationRange = (currentPage, totalPages) => {
  const range = [];
  const showMax = 1; // Number of pages to show around current page

  // Always show first page
  range.push(1);

  if (currentPage - showMax > 2) {
    range.push('...');
  }

  // Show pages around current page
  const start = Math.max(2, currentPage - showMax);
  const end = Math.min(totalPages - 1, currentPage + showMax);

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  if (currentPage + showMax < totalPages - 1) {
    range.push('...');
  }

  // Always show last page if it's more than 1
  if (totalPages > 1) {
    range.push(totalPages);
  }

  return range;
};
