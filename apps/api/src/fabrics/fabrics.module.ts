import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FabricsController } from './fabrics.controller';
import { FabricsService } from './fabrics.service';

@Module({
  imports: [PrismaModule],
  controllers: [FabricsController],
  providers: [FabricsService],
  exports: [FabricsService],
})
export class FabricsModule {}
