import { IsString, IsOptional, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ example: 'Inventory Manager', description: 'Name of the role', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Manages products and warehouses', description: 'Description of the role', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: ['permission-uuid-1'], description: 'List of permission IDs linked to this role', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissionIds?: string[];
}
