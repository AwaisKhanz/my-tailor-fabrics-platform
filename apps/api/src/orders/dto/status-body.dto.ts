import { IsString, Matches } from 'class-validator';

export class PublicStatusBodyDto {
  @IsString()
  @Matches(/^\d{4}$/)
  pin!: string;
}
