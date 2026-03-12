import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyLoginOtpDto {
  @IsString()
  @IsNotEmpty()
  challengeId!: string;

  @IsString()
  @Matches(/^\d{6}$/)
  otpCode!: string;
}
