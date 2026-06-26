import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GamesService } from './games.service';
import { ValidatePlayerDto } from './dto/validate-player.dto';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.gamesService.findOne(code);
  }

  @Post(':code/validate')
  validatePlayer(@Param('code') code: string, @Body() dto: ValidatePlayerDto) {
    return this.gamesService.validatePlayer(code, dto.fields);
  }
}
