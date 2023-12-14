import { Group } from 'src/group/entities/group.entity';
import { User } from 'src/user/entities/user.entity';
import { RelationshipStatusEnum } from '../enum/relationship-status.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { RoleInGroupEnum } from '../enum/role-in-group.enum';

export class CreateUserGroupDto {
  @IsNotEmpty()
  @IsEnum(RoleInGroupEnum)
  role_in_group: RoleInGroupEnum;

  @IsNotEmpty()
  @IsEnum(RelationshipStatusEnum)
  relationship_status: RelationshipStatusEnum;

  @IsNotEmpty()
  group: Group;

  @IsNotEmpty()
  user: User;

  constructor(data: {
    role_in_group: RoleInGroupEnum;
    relationship_status: RelationshipStatusEnum;
    group: Group;
    user: User;
  }) {
    this.role_in_group = data.role_in_group;
    this.relationship_status = data.relationship_status;
    this.group = data.group;
    this.user = data.user;
  }
}
