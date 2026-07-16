import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Atlas Corp', description: 'Name of the organization' })
  @IsString()
  @IsNotEmpty()
  orgName!: string;

  @ApiProperty({ example: 'starter', description: 'Subscription tier of the organization', required: false })
  @IsString()
  @IsOptional()
  tier?: string;

  @ApiProperty({ example: 'atlas-corp', description: 'Unique URL friendly slug for the organization' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Organization slug must contain only lowercase letters, numbers, and hyphens' })
  orgSlug!: string;

  @ApiProperty({ example: 'admin@atlascorp.com', description: 'Email address of the administrator' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', description: 'Password (minimum 8 characters)' })
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
