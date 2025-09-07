import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Edit3, 
  Trash2,
  MoreVertical
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const DataTable = ({ 
  data = [], 
  columns = [], 
  loading = false,
  pagination = null,
  onPageChange = null,
  onSearch = null,
  onFilter = null,
  searchPlaceholder = "Search...",
  filters = [],
  actions = [],
  emptyMessage = "No data available"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showActionsFor, setShowActionsFor] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...activeFilters, [filterKey]: value };
    if (!value) {
      delete newFilters[filterKey];
    }
    setActiveFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  const clearFilters = () => {
    setActiveFilters({});
    if (onFilter) {
      onFilter({});
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {(onSearch || filters.length > 0) && (
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            {onSearch && (
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="form-input w-full pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                </div>
              </form>
            )}

            {/* Filters */}
            {filters.length > 0 && (
              <div className="flex gap-2 items-center">
                <Filter className="w-4 h-4 text-text-muted" />
                {filters.map((filter) => (
                  <select
                    key={filter.key}
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="form-input min-w-32"
                  >
                    <option value="">{filter.placeholder}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            )}

            {/* Clear buttons */}
            {(searchTerm || Object.keys(activeFilters).length > 0) && (
              <div className="flex gap-2">
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="btn btn-secondary text-sm"
                  >
                    Clear Search
                  </button>
                )}
                {Object.keys(activeFilters).length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="btn btn-secondary text-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-muted mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {emptyMessage}
            </h3>
            <p className="text-text-secondary">
              {searchTerm || Object.keys(activeFilters).length > 0
                ? 'Try adjusting your search or filters'
                : 'Data will appear here when available'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Header */}
              <thead className="bg-bg-glass border-b border-border-glass">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={column.key}
                      className={`px-4 py-3 text-left text-sm font-medium text-text-secondary ${
                        column.width || ''
                      }`}
                    >
                      {column.label}
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary w-20">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-border-glass">
                {data.map((row, rowIndex) => (
                  <motion.tr
                    key={row._id || rowIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rowIndex * 0.05, duration: 0.3 }}
                    className="hover:bg-bg-glass-hover transition-colors"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-sm ${
                          column.className || 'text-text-primary'
                        }`}
                      >
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}

                    {/* Actions */}
                    {actions.length > 0 && (
                      <td className="px-4 py-3 text-right relative">
                        <button
                          onClick={() => setShowActionsFor(
                            showActionsFor === row._id ? null : row._id
                          )}
                          className="p-1 rounded hover:bg-bg-glass transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-text-muted" />
                        </button>

                        {/* Actions dropdown */}
                        {showActionsFor === row._id && (
                          <div className="absolute right-0 top-full mt-1 w-48 glass border border-border-glass rounded-lg shadow-lg py-1 z-10">
                            {actions.map((action, actionIndex) => (
                              <button
                                key={actionIndex}
                                onClick={() => {
                                  action.onClick(row);
                                  setShowActionsFor(null);
                                }}
                                className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                                  action.className || 'text-text-secondary hover:bg-bg-glass-hover hover:text-text-primary'
                                }`}
                              >
                                {action.icon && <action.icon className="w-4 h-4" />}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-glass">
            <div className="text-sm text-text-muted">
              Showing {((pagination.currentPage - 1) * 10) + 1} to{' '}
              {Math.min(pagination.currentPage * 10, pagination.totalCount)} of{' '}
              {pagination.totalCount} results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange?.(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="btn btn-secondary p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNumber;
                  if (pagination.totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNumber = pagination.totalPages - 4 + i;
                  } else {
                    pageNumber = pagination.currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => onPageChange?.(pageNumber)}
                      className={`btn px-3 py-1 text-sm ${
                        pagination.currentPage === pageNumber
                          ? 'btn-primary'
                          : 'btn-secondary'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange?.(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="btn btn-secondary p-2"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close actions dropdown */}
      {showActionsFor && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActionsFor(null)}
        />
      )}
    </div>
  );
};

export default DataTable;
