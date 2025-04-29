import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, memo } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number | undefined;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

// Use memo to prevent unnecessary re-renders
const Pagination = memo(({ 
  currentPage, 
  totalPages, 
  totalItems = 0, 
  itemsPerPage, 
  onPageChange 
}: PaginationProps) => {
  useEffect(() => {
    // Effect for tracking component updates
  }, [currentPage, totalPages, totalItems, itemsPerPage]);

  const startItem = totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    // Always show first page
    pages.push(1);
    
    if (totalPages <= 7) {
      // If total pages is 7 or less, show all pages
      for (let i = 2; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      
      // Add ellipsis if there's a gap
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page if we have more than 1 page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Don't return null, show empty pagination instead
  if (!totalItems || totalItems === 0) {
    return (
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-700">
          No items to display
        </div>
      </div>
    );
  }

  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="text-xs text-gray-700">
        Showing {startItem}-{endItem} of {totalItems}
      </div>
      {totalPages > 1 && (
        <div className="flex gap-2 items-center">
          {/* Previous page button */}
          <button
            onClick={() => currentPage > 1 && handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className="min-w-[32px] p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
              className={`min-w-[32px] px-2 py-1 rounded ${
                page === currentPage
                  ? 'bg-green-500 text-white'
                  : typeof page === 'number'
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-transparent cursor-default'
              }`}
              disabled={typeof page !== 'number'}
            >
              {page}
            </button>
          ))}

          {/* Next page button */}
          <button
            onClick={() => currentPage < totalPages && handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="min-w-[32px] p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>  
  );
});

Pagination.displayName = "Pagination";

export default Pagination; 