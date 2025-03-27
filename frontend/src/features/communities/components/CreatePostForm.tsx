import React, { useState } from 'react';
import { FaImage, FaLink, FaPoll, FaRegCalendarAlt, FaTimes } from 'react-icons/fa';
import { CreatePostDto, PostType, PollOption } from '../../../modules/communities/dto/create-post.dto';
import Image from 'next/image';

interface CreatePostFormProps {
  communityId: string;
  onCreatePost: (postData: CreatePostDto) => Promise<void>;
  className?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({
  communityId,
  onCreatePost,
  className = '',
  user,
}) => {
  const [postType, setPostType] = useState<PostType>(PostType.TEXT);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Link type state
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [linkImageUrl, setLinkImageUrl] = useState('');
  
  // Media state
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  
  // Poll state
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { text: '' },
    { text: '' },
  ]);
  
  // Tags state
  const [tagsInput, setTagsInput] = useState('');
  
  // Check if the form is valid for submission
  const isValid = () => {
    if (!content.trim()) return false;
    
    switch (postType) {
      case PostType.LINK:
        return !!linkUrl.trim();
      case PostType.POLL:
        return pollOptions.length >= 2 && pollOptions.every(option => !!option.text.trim());
      default:
        return true;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => !!tag);
      
      const postData: CreatePostDto = {
        communityId,
        content,
        type: postType,
        ...(tags.length > 0 && { tags }),
      };
      
      // Add type-specific data
      switch (postType) {
        case PostType.IMAGE:
          postData.mediaUrls = mediaUrls;
          break;
        case PostType.LINK:
          postData.linkUrl = linkUrl;
          if (linkTitle) postData.linkTitle = linkTitle;
          if (linkDescription) postData.linkDescription = linkDescription;
          if (linkImageUrl) postData.linkImageUrl = linkImageUrl;
          break;
        case PostType.POLL:
          postData.pollOptions = pollOptions.filter(option => !!option.text.trim());
          break;
      }
      
      await onCreatePost(postData);
      
      // Reset form
      setContent('');
      setPostType(PostType.TEXT);
      setLinkUrl('');
      setLinkTitle('');
      setLinkDescription('');
      setLinkImageUrl('');
      setMediaUrls([]);
      setPollOptions([{ text: '' }, { text: '' }]);
      setTagsInput('');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddPollOption = () => {
    setPollOptions([...pollOptions, { text: '' }]);
  };
  
  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length <= 2) return;
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };
  
  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index].text = value;
    setPollOptions(newOptions);
  };
  
  const handleAddMediaUrl = (url: string) => {
    if (url && !mediaUrls.includes(url)) {
      setMediaUrls([...mediaUrls, url]);
    }
  };
  
  const handleRemoveMediaUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };
  
  // Extract and preview link metadata when URL is entered
  const handleLinkUrlBlur = async () => {
    if (!linkUrl) return;
    
    try {
      // In a real app, you would call an API to extract metadata
      // For now, we'll just use placeholder values if the title/desc aren't set
      if (!linkTitle) setLinkTitle(linkUrl);
    } catch (error) {
      console.error('Error fetching link metadata:', error);
    }
  };
  
  return (
    <div className={`border rounded-lg bg-white shadow-sm ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="p-4">
          {/* Post Header */}
          <div className="flex items-center mb-4">
            {user?.profilePhoto ? (
              <Image
                src={user.profilePhoto}
                alt={`${user.firstName} ${user.lastName}`}
                width={40}
                height={40}
                className="rounded-full mr-3"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center text-gray-600">
                {user?.firstName?.charAt(0) || ''}
                {user?.lastName?.charAt(0) || ''}
              </div>
            )}
            <div className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </div>
          </div>
          
          {/* Post Content */}
          <textarea
            className="w-full border rounded-md p-3 mb-3 min-h-[100px] focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          
          {/* Type-specific inputs */}
          {postType === PostType.LINK && (
            <div className="mb-4 space-y-3 border-t pt-3">
              <div>
                <label className="block text-sm font-medium mb-1">Link URL</label>
                <input
                  type="url"
                  className="w-full border rounded-md p-2"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onBlur={handleLinkUrlBlur}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title (optional)</label>
                <input
                  type="text"
                  className="w-full border rounded-md p-2"
                  placeholder="Title"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea
                  className="w-full border rounded-md p-2"
                  placeholder="Description"
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
                <input
                  type="url"
                  className="w-full border rounded-md p-2"
                  placeholder="https://example.com/image.jpg"
                  value={linkImageUrl}
                  onChange={(e) => setLinkImageUrl(e.target.value)}
                />
              </div>
              
              {/* Link Preview */}
              {(linkUrl || linkTitle || linkDescription || linkImageUrl) && (
                <div className="mt-3 border rounded-lg overflow-hidden">
                  <div className="p-3 bg-gray-50 font-medium border-b">Preview</div>
                  <div className="p-3">
                    {linkImageUrl && (
                      <div className="mb-2 max-h-[200px] overflow-hidden rounded">
                        <Image
                          src={linkImageUrl}
                          alt="Link preview"
                          width={400}
                          height={200}
                          className="w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="font-bold text-md">{linkTitle || linkUrl}</div>
                    {linkDescription && (
                      <p className="text-sm text-gray-600 mt-1">{linkDescription}</p>
                    )}
                    <a
                      href={linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline mt-2 block"
                    >
                      {linkUrl}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {postType === PostType.IMAGE && (
            <div className="mb-4 space-y-3 border-t pt-3">
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <div className="flex">
                  <input
                    type="url"
                    className="flex-1 border rounded-l-md p-2"
                    placeholder="https://example.com/image.jpg"
                    value={mediaUrls[mediaUrls.length - 1] || ''}
                    onChange={(e) => {
                      const newUrls = [...mediaUrls];
                      if (newUrls.length > 0) {
                        newUrls[newUrls.length - 1] = e.target.value;
                      } else {
                        newUrls.push(e.target.value);
                      }
                      setMediaUrls(newUrls);
                    }}
                  />
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 rounded-r-md"
                    onClick={() => handleAddMediaUrl(mediaUrls[mediaUrls.length - 1] || '')}
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {/* Media Preview */}
              {mediaUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {mediaUrls.map((url, index) => (
                    <div key={index} className="relative rounded overflow-hidden">
                      <Image
                        src={url}
                        alt={`Image ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-[150px] object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                        onClick={() => handleRemoveMediaUrl(index)}
                      >
                        <FaTimes className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {postType === PostType.POLL && (
            <div className="mb-4 space-y-3 border-t pt-3">
              <div>
                <label className="block text-sm font-medium mb-1">Poll Options</label>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      className="flex-1 border rounded-md p-2"
                      placeholder={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) => handlePollOptionChange(index, e.target.value)}
                      required={index < 2}
                    />
                    {index >= 2 && (
                      <button
                        type="button"
                        className="ml-2 text-red-500"
                        onClick={() => handleRemovePollOption(index)}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-2 text-sm text-blue-500 hover:underline"
                  onClick={handleAddPollOption}
                >
                  + Add Option
                </button>
              </div>
            </div>
          )}
          
          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="news, announcement, question"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
        </div>
        
        {/* Post Types and Submit */}
        <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              type="button"
              className={`flex items-center text-sm ${
                postType === PostType.TEXT ? 'text-blue-500' : 'text-gray-500'
              }`}
              onClick={() => setPostType(PostType.TEXT)}
            >
              Text
            </button>
            <button
              type="button"
              className={`flex items-center text-sm ${
                postType === PostType.IMAGE ? 'text-blue-500' : 'text-gray-500'
              }`}
              onClick={() => setPostType(PostType.IMAGE)}
            >
              <FaImage className="mr-1" /> Photo
            </button>
            <button
              type="button"
              className={`flex items-center text-sm ${
                postType === PostType.LINK ? 'text-blue-500' : 'text-gray-500'
              }`}
              onClick={() => setPostType(PostType.LINK)}
            >
              <FaLink className="mr-1" /> Link
            </button>
            <button
              type="button"
              className={`flex items-center text-sm ${
                postType === PostType.POLL ? 'text-blue-500' : 'text-gray-500'
              }`}
              onClick={() => setPostType(PostType.POLL)}
            >
              <FaPoll className="mr-1" /> Poll
            </button>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            disabled={!isValid() || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm;
