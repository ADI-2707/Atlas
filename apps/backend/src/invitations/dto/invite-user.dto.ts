import { IsEmail, IsArray, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteUserDto {
  @ApiProperty({ example: 'employee@company.com', description: 'Email address of the employee to invite' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: ['role-uuid-1'], description: 'Optional list of role IDs to assign to the employee' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roleIds?: string[];
}
