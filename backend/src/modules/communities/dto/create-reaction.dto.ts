import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ReactionType } from '../../../types/enums';

export class CreateReactionDto {
  @IsEnum(ReactionType)
  type: ReactionType;

  @IsUUID()
  @IsNotEmpty()
  entityId: string; // postId or commentId

  @IsEnum(['post', 'comment'])
  @IsNotEmpty()
  entityType: 'post' | 'comment';
}
