import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { G2bulkModule } from '../g2bulk/g2bulk.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [G2bulkModule, SettingsModule],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
