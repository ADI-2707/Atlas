import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Inventory Manager', description: 'Name of the role' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Manages products and warehouses', description: 'Description of the role', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: ['permission-uuid-1'], description: 'List of permission IDs to link to this role' })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  permissionIds!: string[];
}
