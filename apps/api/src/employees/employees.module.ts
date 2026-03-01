import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [SearchModule],
  providers: [EmployeesService],
  controllers: [EmployeesController]
})
export class EmployeesModule {}
