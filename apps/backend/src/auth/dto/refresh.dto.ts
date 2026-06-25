import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ example: 'refresh-token-uuid-or-jwt', description: 'The active refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
