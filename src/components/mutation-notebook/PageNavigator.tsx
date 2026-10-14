"use client";

import React from "react";

interface PageNavigatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAddPage: () => void;
}

export default function PageNavigator({
  currentPage,
  totalPages,
  onPageChange,
  onAddPage,
}: PageNavigatorProps) {
  return (
    <div className="page-nav">
      <button
        className="toolbar__btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 0}
        title="Previous page"
      >
        ◀
      </button>

      <span className="page-nav__info">
        Page {currentPage + 1} of {totalPages}
      </span>

      <button
        className="toolbar__btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        title="Next page"
      >
        ▶
      </button>

      <button
        className="toolbar__btn"
        onClick={onAddPage}
        title="Add new page"
      >
        + Add Page
      </button>
    </div>
  );
}
