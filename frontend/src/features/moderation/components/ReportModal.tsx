/**
 * ReportModal component for reporting inappropriate content
 * This is a reusable component that can be used throughout the application
 */
'use client';

import { useState } from 'react';
import { createReport } from '@/services/api/moderation';

interface ReportModalProps {
  contentId: string;
  contentType: 'post' | 'comment' | 'profile' | 'message' | 'community' | 'event';
  onClose: () => void;
  onSuccess?: () => void;
  targetUserId?: string;
}

const reportReasons = {
  post: [
    'Inappropriate content',
    'Harassment or bullying',
    'False information',
    'Spam',
    'Hate speech',
    'Violence',
    'Self-harm',
    'Illegal content',
    'Other'
  ],
  comment: [
    'Inappropriate content',
    'Harassment or bullying',
    'False information',
    'Spam',
    'Hate speech',
    'Violence',
    'Other'
  ],
  profile: [
    'Fake profile',
    'Inappropriate photos',
    'Harassment',
    'Impersonation',
    'Under age',
    'Other'
  ],
  message: [
    'Harassment',
    'Spam',
    'Inappropriate content',
    'Scam',
    'Other'
  ],
  community: [
    'Inappropriate content',
    'Violates terms of service',
    'Misleading information',
    'Other'
  ],
  event: [
    'Inappropriate content',
    'False information',
    'Scam',
    'Other'
  ]
};

export default function ReportModal({
  contentId,
  contentType,
  onClose,
  onSuccess,
  targetUserId
}: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReason(e.target.value);
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDetails(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      setError('Please select a reason for reporting');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      await createReport({
        contentId,
        contentType,
        reason,
        details,
        targetUserId
      });
      
      setSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {!submitted ? (
          <>
            <h2 className="text-xl font-bold mb-4">Report {contentType}</h2>
            <p className="text-gray-600 mb-6">
              We take reports seriously and will review this content for violations of our community guidelines.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for reporting
                </label>
                <select
                  id="reason"
                  value={reason}
                  onChange={handleReasonChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a reason</option>
                  {reportReasons[contentType].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional details (optional)
                </label>
                <textarea
                  id="details"
                  value={details}
                  onChange={handleDetailsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                  placeholder="Please provide any additional context that will help us understand your report..."
                />
              </div>

              {error && <p className="text-red-500 mb-4">{error}</p>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h2 className="text-xl font-bold mb-2">Report Submitted</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your report. Our moderation team will review this content and take appropriate action.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
