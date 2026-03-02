import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { WeeklyPdfService } from './weekly-pdf.service';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [LedgerModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, WeeklyPdfService],
})
export class PaymentsModule {}
