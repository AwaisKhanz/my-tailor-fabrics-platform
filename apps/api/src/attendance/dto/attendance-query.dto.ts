import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { transformOptionalString } from '../../common/dto/query-transformers';
import { IsCuidString } from '../../common/validators/is-cuid-string';

export class AttendanceListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  @IsCuidString()
  employeeId?: string;
}
