import { Group } from 'src/group/entities/group.entity';
import { User } from 'src/user/entities/user.entity';
import { RelationshipStatusEnum } from '../enum/relationship-status.enum';
import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateUserGroupDto {
  @IsNotEmpty()
  @IsBoolean()
  is_leader: boolean;

  @IsNotEmpty()
  @IsEnum(RelationshipStatusEnum)
  relationship_status: RelationshipStatusEnum;

  @IsNotEmpty()
  group: Group;

  @IsNotEmpty()
  user: User;

  constructor(data: {
    is_leader: boolean;
    relationship_status: RelationshipStatusEnum;
    group: Group;
    user: User;
  }) {
    this.is_leader = data.is_leader;
    this.relationship_status = data.relationship_status;
    this.group = data.group;
    this.user = data.user;
  }
}
