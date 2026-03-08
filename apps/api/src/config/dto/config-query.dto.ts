import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { transformOptionalBoolean } from '../../common/dto/query-transformers';

export class ConfigListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(transformOptionalBoolean)
  @IsBoolean()
  includeArchived?: boolean;
}

export class ConfigIncludeArchivedQueryDto {
  @IsOptional()
  @Transform(transformOptionalBoolean)
  @IsBoolean()
  includeArchived?: boolean;
}

export class ConfigPreviewQueryDto {
  @IsOptional()
  @Transform(transformOptionalBoolean)
  @IsBoolean()
  preview?: boolean;
}
