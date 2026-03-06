import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PaymentsModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
