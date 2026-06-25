import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'Jane', description: 'Updated first name', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Smith', description: 'Updated last name', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: 'INACTIVE', description: 'Deactivate or activate user account', enum: ['ACTIVE', 'INACTIVE'], required: false })
  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';

  @ApiProperty({ example: ['role-uuid-1'], description: 'Updated list of role IDs assigned to the user', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roleIds?: string[];
}
