import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptInviteDto {
  @ApiProperty({ example: '3be22b54-1b1e-450f-bcbe-bf1d1f1f1d1f', description: 'Invitation token' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: 'password123', description: 'New password (minimum 8 characters)' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;
}
