import { IsEnum } from 'class-validator';
import { CustomizationStatus } from '@prisma/client';

export class UpdateCustomizationStatusDto {
  @IsEnum(CustomizationStatus)
  status: CustomizationStatus;
}
