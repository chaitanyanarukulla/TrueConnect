import React, { useState } from 'react';
import { format } from 'date-fns';
import { FaReply, FaEdit, FaTrash } from 'react-icons/fa';
import ReactionButton from './ReactionButton';
import ReportButton from '@/features/moderation/components/ReportButton';
import { Comment } from '../../../services/api/comment';
import Image from 'next/image';

interface CommentItemProps {
  comment: Comment;
  communityId: string;
  postId: string;
  onReply?: (commentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onReactionChange?: (commentId: string, count: number) => void;
  canModerate?: boolean;
  className?: string;
  showReplies?: boolean;
  handleLoadReplies?: (commentId: string) => void;
  replies?: Comment[];
  repliesLoading?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  communityId,
  postId,
  onReply,
  onEdit,
  onDelete,
  onReactionChange,
  canModerate = false,
  className = '',
  showReplies = false,
  handleLoadReplies,
  replies = [],
  repliesLoading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onEdit && editedContent.trim()) {
      onEdit(comment.id, editedContent);
      setIsEditing(false);
    }
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onReply && replyContent.trim()) {
      onReply(comment.id);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment.id);
    }
  };

  const toggleReplies = () => {
    if (!expanded && handleLoadReplies) {
      handleLoadReplies(comment.id);
    }
    setExpanded(!expanded);
  };

  return (
    <div className={`py-3 ${className}`}>
      {/* Comment Header */}
      <div className="flex items-start">
        {/* Author Avatar */}
        {comment.author?.profilePhoto ? (
          <Image
            src={comment.author.profilePhoto}
            alt={`${comment.author.firstName} ${comment.author.lastName}`}
            width={32}
            height={32}
            className="rounded-full mr-3"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300 mr-3 flex items-center justify-center text-gray-600 text-xs">
            {comment.author?.firstName?.charAt(0) || ''}
            {comment.author?.lastName?.charAt(0) || ''}
          </div>
        )}

        {/* Comment Content */}
        <div className="flex-1">
          <div className="bg-gray-100 rounded-lg px-3 py-2">
            {/* Author and Timestamp */}
            <div className="flex items-baseline justify-between mb-1">
              <div className="font-medium text-sm">
                {comment.author?.firstName} {comment.author?.lastName}
              </div>
              <div className="text-xs text-gray-500">
                {format(new Date(comment.createdAt), 'MMM d, yyyy • h:mm a')}
                {comment.isEdited && <span className="ml-1">(edited)</span>}
              </div>
            </div>

            {/* Comment Content */}
            {isEditing ? (
              <form onSubmit={handleEditSubmit}>
                <textarea
                  className="w-full border rounded-md p-2 text-sm"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  autoFocus
                />
                <div className="mt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-3 py-1 text-xs border rounded-md hover:bg-gray-100"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-sm">{comment.content}</div>
            )}
          </div>

          {/* Comment Actions */}
          <div className="flex items-center mt-1 text-xs text-gray-600 space-x-4">
            <ReactionButton
              entityId={comment.id}
              entityType="comment"
              initialCount={comment.reactionCount || 0}
              className="text-xs hover:text-blue-500 flex items-center"
  onReactionChange={(count) => {
    if (onReactionChange) {
      onReactionChange(comment.id, count);
    }
  }}
            />
            <button
              className="hover:text-blue-500 flex items-center"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <FaReply className="mr-1" /> Reply
            </button>
            <div onClick={(e) => e.stopPropagation()}>
              <ReportButton
                contentId={comment.id}
                contentType="comment"
                buttonLabel="Report"
                targetUserId={comment.authorId}
                variant="link"
                className="text-xs"
              />
            </div>
            {(comment.authorId === localStorage.getItem('userId') || canModerate) && (
              <>
                <button
                  className="hover:text-blue-500 flex items-center"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit className="mr-1" /> Edit
                </button>
                <button
                  className="hover:text-red-500 flex items-center"
                  onClick={handleDelete}
                >
                  <FaTrash className="mr-1" /> Delete
                </button>
              </>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="mt-3 ml-5">
              <textarea
                className="w-full border rounded-md p-2 text-sm"
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={2}
              />
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-3 py-1 text-xs border rounded-md hover:bg-gray-100"
                  onClick={() => setShowReplyForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  disabled={!replyContent.trim()}
                >
                  Reply
                </button>
              </div>
            </form>
          )}

          {/* Show replies toggle */}
          {comment.replyCount > 0 && !showReplies && (
            <button
              className="mt-2 text-xs text-blue-500 hover:underline flex items-center"
              onClick={toggleReplies}
            >
              {expanded ? 'Hide' : 'View'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {/* Replies */}
          {expanded && (
            <div className="ml-5 mt-3">
              {repliesLoading ? (
                <div className="text-sm text-gray-500">Loading replies...</div>
              ) : (
                replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    communityId={communityId}
                    postId={postId}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReactionChange={onReactionChange}
                    canModerate={canModerate}
                    className="border-l-2 border-gray-200 pl-3 mb-3"
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
