import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { SearchModule } from '../search/search.module';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [SearchModule, LedgerModule],
  providers: [EmployeesService],
  controllers: [EmployeesController],
})
export class EmployeesModule {}
