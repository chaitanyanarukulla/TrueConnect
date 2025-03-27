import React, { useState, useEffect } from 'react';
import { 
  FaThumbsUp, 
  FaHeart, 
  FaLaugh, 
  FaSurprise, 
  FaSadTear, 
  FaAngry 
} from 'react-icons/fa';
import { ReactionType } from '../../../types/reaction';
import reactionService from '../../../services/api/reaction';

interface ReactionButtonProps {
  entityId: string;
  entityType: 'post' | 'comment';
  initialCount?: number;
  className?: string;
  onReactionChange?: (count: number) => void;
}

const ReactionButton: React.FC<ReactionButtonProps> = ({
  entityId,
  entityType,
  initialCount = 0,
  className = '',
  onReactionChange,
}) => {
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactionCount, setReactionCount] = useState(initialCount);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserReaction = async () => {
      try {
        const reaction = await reactionService.getUserReaction(entityId, entityType);
        if (reaction) {
          setUserReaction(reaction.type);
        }
      } catch (error) {
        console.error('Failed to fetch user reaction:', error);
      }
    };

    fetchUserReaction();
  }, [entityId, entityType]);

  const handleReaction = async (type: ReactionType) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await reactionService.createReaction(entityId, entityType, type);
      
      // If reaction was removed
      if (!result.reaction) {
        setUserReaction(null);
        setReactionCount(prev => Math.max(0, prev - 1));
        if (onReactionChange) onReactionChange(Math.max(0, reactionCount - 1));
      } 
      // If reaction was created or updated
      else {
        // If it was a new reaction (not just updated type)
        if (!userReaction) {
          setReactionCount(prev => prev + 1);
          if (onReactionChange) onReactionChange(reactionCount + 1);
        }
        setUserReaction(result.reaction.type);
      }
      
      setShowReactionPicker(false);
    } catch (error) {
      console.error('Failed to update reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReactionIcon = (type: ReactionType | null) => {
    switch (type) {
      case ReactionType.LIKE:
        return <FaThumbsUp className="mr-2 text-blue-500" />;
      case ReactionType.LOVE:
        return <FaHeart className="mr-2 text-red-500" />;
      case ReactionType.LAUGH:
        return <FaLaugh className="mr-2 text-yellow-500" />;
      case ReactionType.SURPRISED:
        return <FaSurprise className="mr-2 text-yellow-500" />;
      case ReactionType.SAD:
        return <FaSadTear className="mr-2 text-blue-500" />;
      case ReactionType.ANGRY:
        return <FaAngry className="mr-2 text-red-500" />;
      default:
        return <FaThumbsUp className="mr-2" />;
    }
  };

  const getReactionText = (type: ReactionType | null) => {
    switch (type) {
      case ReactionType.LIKE:
        return 'Liked';
      case ReactionType.LOVE:
        return 'Loved';
      case ReactionType.LAUGH:
        return 'Laughed';
      case ReactionType.SURPRISED:
        return 'Surprised';
      case ReactionType.SAD:
        return 'Sad';
      case ReactionType.ANGRY:
        return 'Angry';
      default:
        return 'Like';
    }
  };

  return (
    <div className="relative">
      <button
        className={`flex items-center justify-center py-1 rounded-md hover:bg-gray-100 ${className} ${
          userReaction ? 'font-semibold' : ''
        }`}
        onClick={(e) => {
          e.stopPropagation();
          
          if (userReaction) {
            // If already reacted, clicking again removes the reaction
            handleReaction(userReaction);
          } else {
            // Show reaction picker or default to like
            if (showReactionPicker) {
              handleReaction(ReactionType.LIKE);
            } else {
              setShowReactionPicker(true);
            }
          }
        }}
        onMouseEnter={() => setShowReactionPicker(true)}
        onMouseLeave={() => setShowReactionPicker(false)}
        disabled={isLoading}
      >
        {getReactionIcon(userReaction)}
        {getReactionText(userReaction)} {reactionCount > 0 && `(${reactionCount})`}
      </button>

      {/* Reaction Picker */}
      {showReactionPicker && !userReaction && (
        <div 
          className="absolute bottom-full mb-2 bg-white rounded-full shadow-lg border p-1 flex space-x-1"
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReaction(ReactionType.LIKE);
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Like"
          >
            <FaThumbsUp className="text-blue-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReaction(ReactionType.LOVE);
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Love"
          >
            <FaHeart className="text-red-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReaction(ReactionType.LAUGH);
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Laugh"
          >
            <FaLaugh className="text-yellow-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReaction(ReactionType.SURPRISED);
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Surprised"
          >
            <FaSurprise className="text-yellow-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReaction(ReactionType.SAD);
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Sad"
          >
            <FaSadTear className="text-blue-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReaction(ReactionType.ANGRY);
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Angry"
          >
            <FaAngry className="text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReactionButton;
