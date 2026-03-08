import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { transformOptionalString } from '../../common/dto/query-transformers';
import { IsCuidString } from '../../common/validators/is-cuid-string';

export class ReconcileTaskEarningsQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  @IsCuidString()
  branchId?: string;
}
