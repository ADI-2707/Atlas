import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@atlas.com', description: 'Email address of the user' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'admin123', description: 'Password of the user' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
