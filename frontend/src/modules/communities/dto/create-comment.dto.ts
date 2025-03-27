export interface CreateCommentDto {
  content: string;
  postId: string;
  parentId?: string;
  mediaUrls?: string[];
}
