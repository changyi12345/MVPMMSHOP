import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { G2bulkService } from '../g2bulk/g2bulk.service';
import { buildValidatePayload, getFieldLabel } from '../g2bulk/g2bulk-fields.util';
import { GameFieldDefinition } from '../g2bulk/g2bulk-fields.util';
import { SettingsService } from '../settings/settings.service';

export interface GameListItem {
  id: number;
  code: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  type: 'direct_topup';
  minPriceMmk: number | null;
  currency: 'MMK';
}

export interface GamePackageDto {
  id: number;
  name: string;
  amount: number;
  unitPrice: number;
  sourcePriceUsd: number;
  currency: 'MMK';
}

export interface GameDetail extends GameListItem {
  packages: GamePackageDto[];
  playerFields: GameFieldDefinition[];
  fieldNotes: string | null;
}

@Injectable()
export class GamesService {
  constructor(
    private g2bulk: G2bulkService,
    private settings: SettingsService,
  ) {}

  private toMmk(usd: number, exchange: Awaited<ReturnType<SettingsService['getExchangeSettings']>>): number {
    return this.settings.convertUsdToMmk(usd, exchange);
  }

  async findAll(): Promise<GameListItem[]> {
    await this.settings.assertFeatureEnabled('gamesTopupEnabled');
    const [games, exchange] = await Promise.all([
      this.g2bulk.fetchGames(),
      this.settings.getExchangeSettings(),
    ]);

    const withPrices = await Promise.all(
      games.map(async (game) => {
        const catalogue = await this.g2bulk.fetchCatalogue(game.code);
        const minUsd = catalogue?.catalogues?.length
          ? Math.min(...catalogue.catalogues.map((c) => c.amount))
          : null;

        return {
          id: game.id,
          code: game.code,
          slug: game.code,
          name: game.name,
          imageUrl: this.g2bulk.resolveImageUrl(game.image_url),
          type: 'direct_topup' as const,
          minPriceMmk: minUsd != null ? this.toMmk(minUsd, exchange) : null,
          currency: 'MMK' as const,
        };
      }),
    );

    return withPrices;
  }

  async findOne(code: string): Promise<GameDetail> {
    await this.settings.assertFeatureEnabled('gamesTopupEnabled');
    const games = await this.g2bulk.fetchGames();
    const game = games.find((g) => g.code === code);
    if (!game) {
      throw new NotFoundException(`Game "${code}" not found`);
    }

    const [catalogue, { fields: playerFields, notes: fieldNotes }, exchange] = await Promise.all([
      this.g2bulk.fetchCatalogue(code),
      this.g2bulk.getGameFields(code),
      this.settings.getExchangeSettings(),
    ]);

    const packages: GamePackageDto[] =
      catalogue?.catalogues?.map((c) => ({
        id: c.id,
        name: c.name,
        amount: c.amount,
        sourcePriceUsd: c.amount,
        unitPrice: this.toMmk(c.amount, exchange),
        currency: 'MMK' as const,
      })) ?? [];

    const minPriceMmk = packages.length
      ? Math.min(...packages.map((p) => p.unitPrice))
      : null;

    return {
      id: game.id,
      code: game.code,
      slug: game.code,
      name: game.name,
      imageUrl: this.g2bulk.resolveImageUrl(
        catalogue?.game?.image_url ?? game.image_url,
      ),
      type: 'direct_topup',
      minPriceMmk,
      currency: 'MMK',
      packages,
      playerFields,
      fieldNotes,
    };
  }

  async validatePlayer(code: string, fieldValues: Record<string, string>) {
    const fieldsRes = await this.g2bulk.fetchFields(code);
    const apiFields = fieldsRes?.info?.fields ?? ['userid'];

    for (const field of apiFields) {
      if (!fieldValues[field]?.trim()) {
        throw new BadRequestException(`${getFieldLabel(field)} is required`);
      }
    }

    const payload = buildValidatePayload(code, apiFields, fieldValues);
    if (!payload.user_id) {
      throw new BadRequestException('User ID is required');
    }

    let result;
    try {
      result = await this.g2bulk.checkPlayerId(payload);
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Player validation failed',
      );
    }

    if (result.valid !== 'valid') {
      throw new BadRequestException(
        result.message ?? 'Invalid Player ID. Please check and try again.',
      );
    }

    return {
      valid: true,
      playerName: result.name ?? '',
      openid: result.openid ?? null,
    };
  }
}
