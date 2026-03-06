import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { WeeklyPdfService } from './weekly-pdf.service';
import { LedgerModule } from '../ledger/ledger.module';
import { SalaryAccrualService } from './salary-accrual.service';

@Module({
  imports: [LedgerModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, WeeklyPdfService, SalaryAccrualService],
  exports: [SalaryAccrualService],
})
export class PaymentsModule {}
