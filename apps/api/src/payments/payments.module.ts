import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { WeeklyPdfService } from './weekly-pdf.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, WeeklyPdfService],
})
export class PaymentsModule {}
