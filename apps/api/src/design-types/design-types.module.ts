import { Module } from '@nestjs/common';
import { DesignTypesService } from './design-types.service';
import { DesignTypesController } from './design-types.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DesignTypesController],
  providers: [DesignTypesService],
  exports: [DesignTypesService],
})
export class DesignTypesModule {}
