'use client';

import React, { useState, useEffect } from 'react';
import { 
  getContentModerations, 
  updateContentModeration, 
  getReport, 
  updateReport 
} from '@/services/api/moderation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Report {
  id: string;
  contentId: string;
  contentType: string;
  targetUserId?: string;
  reporterId: string;
  reporter?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  reason: string;
  details?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: string;
}

interface ModerationItem {
  id: string;
  contentId: string;
  contentType: string;
  reports?: Report[];
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  isAutomated: boolean;
  action?: string;
  moderationNotes?: string;
  detectedIssues?: string[];
  confidenceScore?: number;
  createdAt: string;
  updatedAt: string;
}

export default function ModerationDashboard() {
  const router = useRouter();
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [detailView, setDetailView] = useState(false);

  useEffect(() => {
    fetchModerationItems();
  }, [currentPage, statusFilter, contentTypeFilter]);

  const fetchModerationItems = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters: {
        status?: string;
        contentType?: string;
        page: number;
        limit: number;
      } = {
        page: currentPage,
        limit: 10
      };
      
      if (statusFilter) {
        filters.status = statusFilter;
      }
      
      if (contentTypeFilter) {
        filters.contentType = contentTypeFilter;
      }
      
      const response = await getContentModerations(filters);
      setModerationItems(response.items);
      setTotalPages(Math.ceil(response.total / response.limit));
    } catch (err) {
      console.error('Error fetching moderation items:', err);
      setError('Failed to load moderation items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleContentTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setContentTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleViewDetails = (item: ModerationItem) => {
    setSelectedItem(item);
    setDetailView(true);
  };

  const handleResolve = async (id: string, action: string) => {
    try {
      await updateContentModeration(id, {
        status: 'resolved',
        action,
        moderationNotes: actionNote
      });
      
      // Update the item in the list
      setModerationItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, status: 'resolved', action, moderationNotes: actionNote } 
            : item
        )
      );
      
      if (selectedItem?.id === id) {
        setSelectedItem(prev => prev ? { 
          ...prev, 
          status: 'resolved', 
          action, 
          moderationNotes: actionNote 
        } : null);
      }
      
      // Clear the action note
      setActionNote('');
    } catch (err) {
      console.error('Error resolving moderation item:', err);
      setError('Failed to resolve the moderation item. Please try again.');
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await updateContentModeration(id, {
        status: 'dismissed',
        moderationNotes: actionNote
      });
      
      // Update the item in the list
      setModerationItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, status: 'dismissed', moderationNotes: actionNote } 
            : item
        )
      );
      
      if (selectedItem?.id === id) {
        setSelectedItem(prev => prev ? {
          ...prev,
          status: 'dismissed',
          moderationNotes: actionNote
        } : null);
      }
      
      // Clear the action note
      setActionNote('');
    } catch (err) {
      console.error('Error dismissing moderation item:', err);
      setError('Failed to dismiss the moderation item. Please try again.');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatContentType = (type: string) => {
    // Convert contentType to a readable format
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const renderContentPreview = (item: ModerationItem) => {
    // Render a preview based on content type
    switch (item.contentType) {
      case 'post':
        return (
          <Link href={`/dashboard/communities/unknown/posts/${item.contentId}`} className="text-blue-500 hover:underline">
            View Post
          </Link>
        );
      case 'comment':
        return (
          <Link href={`/dashboard/communities/unknown/posts/unknown?commentId=${item.contentId}`} className="text-blue-500 hover:underline">
            View Comment
          </Link>
        );
      case 'profile':
        return (
          <Link href={`/dashboard/profile/${item.contentId}`} className="text-blue-500 hover:underline">
            View Profile
          </Link>
        );
      default:
        return <span>View {item.contentType}</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Content Moderation Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">Filter Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
          <div>
            <label htmlFor="contentTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Content Type
            </label>
            <select
              id="contentTypeFilter"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={contentTypeFilter}
              onChange={handleContentTypeFilterChange}
            >
              <option value="">All Types</option>
              <option value="post">Posts</option>
              <option value="comment">Comments</option>
              <option value="profile">Profiles</option>
              <option value="message">Messages</option>
              <option value="community">Communities</option>
            </select>
          </div>
        </div>
      </div>
      
      {detailView && selectedItem ? (
        <div className="mb-6 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Moderation Details</h2>
            <button 
              onClick={() => setDetailView(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Back to List
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Content Information</h3>
              <p><span className="font-semibold">Type:</span> {formatContentType(selectedItem.contentType)}</p>
              <p><span className="font-semibold">ID:</span> {selectedItem.contentId}</p>
              <p>
                <span className="font-semibold">Content:</span>{' '}
                {renderContentPreview(selectedItem)}
              </p>
              <p><span className="font-semibold">Reported:</span> {formatDate(selectedItem.createdAt)}</p>
              <p>
                <span className="font-semibold">Status:</span>{' '}
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(selectedItem.status)}`}>
                  {selectedItem.status.toUpperCase()}
                </span>
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Moderation Information</h3>
              {selectedItem.isAutomated && (
                <div className="mb-2">
                  <p><span className="font-semibold">AI Detection:</span> Yes</p>
                  {selectedItem.detectedIssues && (
                    <p>
                      <span className="font-semibold">Detected Issues:</span>{' '}
                      {selectedItem.detectedIssues.join(', ')}
                    </p>
                  )}
                  {selectedItem.confidenceScore !== undefined && (
                    <p>
                      <span className="font-semibold">Confidence Score:</span>{' '}
                      {(selectedItem.confidenceScore * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              )}
              
              {selectedItem.action && (
                <p><span className="font-semibold">Action Taken:</span> {selectedItem.action}</p>
              )}
              
              {selectedItem.moderationNotes && (
                <div className="mt-2">
                  <p className="font-semibold">Moderation Notes:</p>
                  <p className="p-2 bg-gray-50 rounded mt-1">{selectedItem.moderationNotes}</p>
                </div>
              )}
            </div>
          </div>
          
          {selectedItem.reports && selectedItem.reports.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">User Reports ({selectedItem.reports.length})</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reporter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedItem.reports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {report.reporter ? `${report.reporter.firstName} ${report.reporter.lastName}` : report.reporterId}
                        </td>
                        <td className="px-6 py-4">
                          <div>{report.reason}</div>
                          {report.details && (
                            <div className="text-sm text-gray-500 mt-1">{report.details}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(report.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(report.status)}`}>
                            {report.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {selectedItem.status === 'pending' || selectedItem.status === 'reviewing' ? (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Take Action</h3>
              <div className="mb-4">
                <label htmlFor="actionNote" className="block text-sm font-medium text-gray-700 mb-1">
                  Moderation Notes
                </label>
                <textarea
                  id="actionNote"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Add notes about your moderation decision..."
                ></textarea>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleResolve(selectedItem.id, 'content_removed')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Remove Content
                </button>
                <button
                  onClick={() => handleResolve(selectedItem.id, 'user_warned')}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  Warn User
                </button>
                <button
                  onClick={() => handleResolve(selectedItem.id, 'content_approved')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve Content
                </button>
                <button
                  onClick={() => handleDismiss(selectedItem.id)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Dismiss Report
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                This moderation case has been {selectedItem.status} and requires no further action.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">
              <p className="text-gray-500">Loading moderation items...</p>
            </div>
          ) : moderationItems.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500">No moderation items found with the current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reports
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Reported
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {moderationItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{formatContentType(item.contentType)}</div>
                        <div className="text-sm text-blue-500 hover:underline cursor-pointer">
                          {renderContentPreview(item)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.reports ? item.reports.length : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(item.status)}`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="px-6 py-4 flex justify-between items-center border-t">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Moderation Guidelines</h2>
        <ul className="list-disc pl-5 text-blue-800">
          <li>Review all reports thoroughly before taking action</li>
          <li>Be consistent in applying community guidelines</li>
          <li>When in doubt, consult with other moderators</li>
          <li>Always provide clear notes on your moderation decisions</li>
          <li>If content breaks laws, escalate to a senior moderator immediately</li>
        </ul>
      </div>
    </div>
  );
}
