import React, { useState } from 'react';
import { format } from 'date-fns';
import { FaComment, FaShare, FaEllipsisH, FaPoll, FaLink, FaRegCalendarAlt, FaImage } from 'react-icons/fa';
import ReactionButton from './ReactionButton';
import ReportButton from '@/features/moderation/components/ReportButton';
import { Post } from '../../../services/api/post';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PostType } from '../../../modules/communities/dto/create-post.dto';

interface PostItemProps {
  post: Post;
  communityId: string;
  onDelete?: (postId: string) => void;
  onPin?: (postId: string, isPinned: boolean) => void;
  onMarkAnnouncement?: (postId: string, isAnnouncement: boolean) => void;
  canModerate?: boolean;
  className?: string;
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  communityId,
  onDelete,
  onPin,
  onMarkAnnouncement,
  canModerate = false,
  className = '',
}) => {
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);

  const navigateToPost = () => {
    router.push(`/dashboard/communities/${communityId}/posts/${post.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post.id);
    }
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPin) {
      onPin(post.id, !post.isPinned);
    }
  };

  const handleMarkAnnouncement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAnnouncement) {
      onMarkAnnouncement(post.id, !post.isAnnouncement);
    }
  };

  const toggleActions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(!showActions);
  };

  const renderPostTypeIcon = () => {
    switch (post.type) {
      case PostType.IMAGE:
        return <FaImage className="text-blue-500 mr-2" />;
      case PostType.LINK:
        return <FaLink className="text-green-500 mr-2" />;
      case PostType.POLL:
        return <FaPoll className="text-purple-500 mr-2" />;
      case PostType.EVENT:
        return <FaRegCalendarAlt className="text-red-500 mr-2" />;
      default:
        return null;
    }
  };

  const renderPostContent = () => {
    switch (post.type) {
      case PostType.IMAGE:
        return (
          <div className="mt-3">
            <div className="post-content">{post.content}</div>
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className="mt-2 overflow-hidden rounded-lg">
                <Image
                  src={post.mediaUrls[0]}
                  alt="Post image"
                  width={400}
                  height={300}
                  className="w-full object-cover"
                />
                {post.mediaUrls.length > 1 && (
                  <div className="text-sm text-gray-500 mt-1">
                    +{post.mediaUrls.length - 1} more images
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case PostType.LINK:
        return (
          <div className="mt-3">
            <div className="post-content">{post.content}</div>
            {post.linkUrl && (
              <div className="mt-2 border rounded-lg overflow-hidden">
                {post.linkImageUrl && (
                  <div className="h-40 overflow-hidden">
                    <Image
                      src={post.linkImageUrl}
                      alt="Link preview"
                      width={400}
                      height={200}
                      className="w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3">
                  <h3 className="font-bold text-md">{post.linkTitle || post.linkUrl}</h3>
                  {post.linkDescription && (
                    <p className="text-sm text-gray-600 mt-1">{post.linkDescription}</p>
                  )}
                  <a
                    href={post.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline mt-2 block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {post.linkUrl}
                  </a>
                </div>
              </div>
            )}
          </div>
        );

      case PostType.POLL:
        return (
          <div className="mt-3">
            <div className="post-content">{post.content}</div>
            {post.pollOptions && post.pollOptions.length > 0 && (
              <div className="mt-3">
                {post.pollOptions.map((option: { text: string }, index: number) => (
                  <div
                    key={index}
                    className="p-3 my-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    {option.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case PostType.EVENT:
        return (
          <div className="mt-3">
            <div className="post-content">{post.content}</div>
            {/* Event-specific rendering would go here */}
          </div>
        );

      default:
        return (
          <div className="mt-3">
            <div className="post-content">{post.content}</div>
          </div>
        );
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow duration-200 cursor-pointer ${
        post.isPinned ? 'border-blue-300 bg-blue-50' : ''
      } ${post.isAnnouncement ? 'border-red-300 bg-red-50' : ''} ${className}`}
      onClick={navigateToPost}
    >
      {/* Post Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          {post.author?.profilePhoto ? (
            <Image
              src={post.author.profilePhoto}
              alt={`${post.author.firstName} ${post.author.lastName}`}
              width={40}
              height={40}
              className="rounded-full mr-3"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center text-gray-600">
              {post.author?.firstName?.charAt(0) || ''}
              {post.author?.lastName?.charAt(0) || ''}
            </div>
          )}
          <div>
            <div className="font-semibold">
              {post.author?.firstName} {post.author?.lastName}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              {renderPostTypeIcon()}
              <span>{format(new Date(post.createdAt), 'MMM d, yyyy • h:mm a')}</span>
              {post.isPinned && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Pinned
                </span>
              )}
              {post.isAnnouncement && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                  Announcement
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Post Actions Menu */}
        <div className="relative">
          <button
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={toggleActions}
            aria-label="Post actions"
          >
            <FaEllipsisH className="text-gray-500" />
          </button>

          {showActions && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1">
              {(post.authorId === localStorage.getItem('userId') || canModerate) && (
                <>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleDelete}
                  >
                    Delete post
                  </button>
                  {canModerate && (
                    <>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handlePin}
                      >
                        {post.isPinned ? 'Unpin post' : 'Pin post'}
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleMarkAnnouncement}
                      >
                        {post.isAnnouncement ? 'Remove announcement' : 'Mark as announcement'}
                      </button>
                    </>
                  )}
                </>
              )}
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(
                    `${window.location.origin}/dashboard/communities/${communityId}/posts/${post.id}`
                  );
                  alert('Link copied to clipboard');
                }}
              >
                Copy link
              </button>
              
              {/* Report post option */}
              <div 
                onClick={(e) => e.stopPropagation()}
                className="w-full"
              >
                <ReportButton
                  contentId={post.id}
                  contentType="post"
                  buttonLabel="Report post"
                  targetUserId={post.authorId}
                  variant="menu-item"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      {renderPostContent()}

      {/* Post Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {post.tags.map((tag, index) => (
            <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Post Stats */}
      <div className="mt-3 pt-3 border-t flex text-sm text-gray-500">
        <div className="mr-4 flex items-center">
          <FaComment className="mr-1" /> {post.commentCount || 0}
        </div>
        <div className="flex items-center">
          <FaShare className="mr-1" /> {post.shareCount || 0}
        </div>
      </div>

      {/* Post Actions */}
      <div className="mt-2 pt-2 border-t flex justify-between">
        <ReactionButton 
          entityId={post.id} 
          entityType="post" 
          initialCount={post.reactionCount || 0}
          className="flex-1"
          onReactionChange={(count) => {
            if (post.reactionCount !== count) {
              // This would typically update the post in state in a parent component
              console.log(`Reaction count changed to ${count}`);
            }
          }}
        />
        <button
          className="flex-1 flex items-center justify-center py-1 rounded-md hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            // Focus comment input action would go here
          }}
        >
          <FaComment className="mr-2" /> Comment
        </button>
        <button
          className="flex-1 flex items-center justify-center py-1 rounded-md hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            // Share action would go here
          }}
        >
          <FaShare className="mr-2" /> Share
        </button>
      </div>
    </div>
  );
};

export default PostItem;
