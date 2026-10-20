import { useState, useMemo } from 'react';

/**
 * useSortableData: Reusable hook for sorting tabular data on column header click.
 */
export default function useSortableData(items = [], defaultSortKey = null, defaultDirection = 'asc') {
  const [sortConfig, setSortConfig] = useState({
    key: defaultSortKey,
    direction: defaultDirection,
  });

  const sortedItems = useMemo(() => {
    const sortableItems = [...items];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle null/undefined
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        // Numeric check
        const isNum = !isNaN(aVal) && !isNaN(bVal) && typeof aVal !== 'boolean';
        if (isNum) {
          aVal = Number(aVal);
          bVal = Number(bVal);
        } else {
          aVal = String(aVal).toLowerCase();
          bVal = String(bVal).toLowerCase();
        }

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return { items: sortedItems, requestSort, sortConfig, getSortIndicator };
}
