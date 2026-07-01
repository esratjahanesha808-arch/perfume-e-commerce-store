"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2.5 mt-36 pt-12 border-t border-[rgba(200,169,107,0.1)]">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-11 h-10 rounded-full border border-[rgba(200,169,107,0.15)] flex items-center justify-center text-[#A1A1A1] hover:text-[#C8A96B] hover:border-[#C8A96B] disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      
      {Array.from({ length: totalPages }).map((_, i) => {
        const pageNum = i + 1;
        const isActive = currentPage === pageNum;
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-10 h-10 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 flex items-center justify-center ${
              isActive
                ? "bg-[#C8A96B] text-[#090909] shadow-lg shadow-[rgba(200,169,107,0.2)] font-bold"
                : "border border-[rgba(200,169,107,0.15)] text-[#A1A1A1] hover:text-[#C8A96B] hover:border-[#C8A96B]"
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-11 h-10 rounded-full border border-[rgba(200,169,107,0.15)] flex items-center justify-center text-[#A1A1A1] hover:text-[#C8A96B] hover:border-[#C8A96B] disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
