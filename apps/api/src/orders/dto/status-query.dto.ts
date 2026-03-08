import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';
import { transformOptionalString } from '../../common/dto/query-transformers';

export class PublicStatusQueryDto {
  @Transform(transformOptionalString)
  @IsString()
  @Matches(/^\d{4}$/)
  pin!: string;
}
