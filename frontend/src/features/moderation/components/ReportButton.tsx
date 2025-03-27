/**
 * ReportButton component
 * A reusable button that opens a report modal when clicked
 * This can be added to any component that needs reporting functionality
 */
'use client';

import { useState } from 'react';
import ReportModal from './ReportModal';

interface ReportButtonProps {
  contentId: string;
  contentType: 'post' | 'comment' | 'profile' | 'message' | 'community' | 'event';
  buttonLabel?: string;
  targetUserId?: string;
  variant?: 'button' | 'link' | 'menu-item' | 'icon';
  className?: string;
  onReportSubmitted?: () => void;
}

export default function ReportButton({
  contentId,
  contentType,
  buttonLabel = 'Report',
  targetUserId,
  variant = 'link',
  className = '',
  onReportSubmitted
}: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleReportSuccess = () => {
    if (onReportSubmitted) {
      onReportSubmitted();
    }
  };

  const getButtonStyles = () => {
    switch (variant) {
      case 'button':
        return 'px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded';
      case 'link':
        return 'text-gray-500 hover:text-gray-700 hover:underline text-sm';
      case 'menu-item':
        return 'block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100';
      case 'icon':
        return 'text-gray-400 hover:text-gray-600';
      default:
        return '';
    }
  };

  const baseClass = getButtonStyles();
  const buttonClass = className ? `${baseClass} ${className}` : baseClass;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={buttonClass}
        aria-label={`Report ${contentType}`}
      >
        {variant === 'icon' ? (
          <span className="text-lg">⚠️</span>
        ) : (
          buttonLabel
        )}
      </button>

      {showModal && (
        <ReportModal
          contentId={contentId}
          contentType={contentType}
          targetUserId={targetUserId}
          onClose={closeModal}
          onSuccess={handleReportSuccess}
        />
      )}
    </>
  );
}
