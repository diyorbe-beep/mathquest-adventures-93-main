import { ReactNode, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination = ({ 
  totalItems, 
  itemsPerPage, 
  currentPage, 
  onPageChange,
  className = ''
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [inputPage, setInputPage] = useState(currentPage.toString());

  useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(inputPage);
    if (!isNaN(page)) {
      handlePageChange(page);
    }
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    let rangeWithDots = [];
    let left = 1;
    let right = totalPages;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || i === currentPage || i === currentPage - delta || i === currentPage + delta) {
        range.push(i);
      }
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(...range.slice(0, currentPage - delta));
    }

    if (totalPages - currentPage > delta + 2) {
      rangeWithDots.push('...');
    } else {
      rangeWithDots.push(...range.slice(currentPage + delta + 1));
    }

    return [...rangeWithDots, totalPages];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Oldinggi sahifa"
      >
        ‹
      </button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) => (
        <button
          key={index}
          onClick={() => handlePageChange(page)}
          disabled={page === '...'}
          className={`px-3 py-2 rounded-lg border transition-colors ${
            page === currentPage
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card hover:bg-muted text-foreground'
          } ${page === '...' ? 'cursor-not-allowed' : ''}`}
          aria-label={`Sahifa ${page}`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Keyingi sahifa"
      >
        ›
      </button>

      {/* Page Input */}
      <form onSubmit={handleInputSubmit} className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          max={totalPages}
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          className="w-16 px-2 py-2 rounded-lg border border-border bg-card text-center"
          placeholder="Sahifa"
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
        >
          O'tish
        </button>
      </form>
    </div>
  );
};

export default Pagination;
