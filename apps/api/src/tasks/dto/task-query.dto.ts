import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { transformOptionalString } from '../../common/dto/query-transformers';

export class ReconcileTaskEarningsQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  branchId?: string;
}
