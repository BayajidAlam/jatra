import { Injectable, Inject, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from '../common/redis.module';
import { SearchJourneysDto } from './dto/search-journeys.dto';
import { AutocompleteStationsDto } from './dto/autocomplete-stations.dto';
import { InvalidateCacheDto } from './dto/invalidate-cache.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly cachePrefix = 'search:';
  private readonly cacheTTL = {
    journeys: parseInt(this.configService.get('CACHE_TTL_SEARCH_RESULTS', '300')),
    popularRoutes: parseInt(this.configService.get('CACHE_TTL_POPULAR_ROUTES', '3600')),
    stations: parseInt(this.configService.get('CACHE_TTL_STATIONS', '7200')),
    autocomplete: parseInt(this.configService.get('CACHE_TTL_AUTOCOMPLETE', '1800')),
  };

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: RedisClientType,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Search journeys with Redis caching
   */
  async searchJourneys(dto: SearchJourneysDto) {
    const cacheKey = `${this.cachePrefix}journey:${dto.from}:${dto.to}:${dto.date}:${dto.page}:${dto.limit}`;

    // Try cache first
    if (!dto.bypassCache) {
      const cached = await this.getCachedData(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for journey search: ${cacheKey}`);
        await this.incrementSearchCount(dto.from, dto.to);
        return { ...cached, fromCache: true };
      }
    }

    // Cache miss - fetch from database
    this.logger.log(`Cache miss for journey search: ${cacheKey}`);
    
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;
    const take = limit;

    // Find stations by ID or code
    const fromStation = await this.findStation(dto.from);
    const toStation = await this.findStation(dto.to);

    if (!fromStation || !toStation) {
      throw new HttpException('Station not found', HttpStatus.NOT_FOUND);
    }

    // Find routes connecting these stations
    const routes = await this.prisma.route.findMany({
      where: {
        stops: {
          some: {
            OR: [
              { fromStationId: fromStation.id },
              { toStationId: fromStation.id },
            ],
          },
        },
      },
      include: {
        stops: {
          orderBy: { stopOrder: 'asc' },
          include: {
            fromStation: true,
            toStation: true,
          },
        },
      },
    });

    // Filter routes that have both stations in correct order
    const validRoutes = routes.filter((route: any) => {
      const hasFrom = route.stops.some((s: any) => 
        s.fromStationId === fromStation.id || s.toStationId === fromStation.id
      );
      const hasTo = route.stops.some((s: any) => 
        s.fromStationId === toStation.id || s.toStationId === toStation.id
      );
      return hasFrom && hasTo;
    });

    const routeIds = validRoutes.map((r: any) => r.id);

    const startDate = new Date(dto.date);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

    // Count total journeys
    const total = await this.prisma.journey.count({
      where: {
        routeId: { in: routeIds },
        departureTime: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    // Fetch journeys
    const journeys = await this.prisma.journey.findMany({
      where: {
        routeId: { in: routeIds },
        departureTime: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        train: {
          include: {
            coaches: {
              include: {
                seats: true,
              },
            },
          },
        },
        route: {
          include: {
            stops: {
              orderBy: { stopOrder: 'asc' },
              include: {
                fromStation: true,
                toStation: true,
              },
            },
          },
        },
      },
      orderBy: { departureTime: 'asc' },
      skip,
      take,
    });

    const result = {
      data: journeys,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      fromCache: false,
    };

    // Cache the result
    await this.setCachedData(cacheKey, result, this.cacheTTL.journeys);
    
    // Track search analytics
    await this.incrementSearchCount(dto.from, dto.to);

    return result;
  }

  /**
   * Get popular routes based on search frequency
   */
  async getPopularRoutes(limit: number = 10) {
    const cacheKey = `${this.cachePrefix}popular:routes:${limit}`;

    // Try cache first
    const cached = await this.getCachedData(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit for popular routes`);
      return { ...cached, fromCache: true };
    }

    // Fetch from Redis analytics
    const searchCounts = await this.redis.zRangeWithScores(
      `${this.cachePrefix}analytics:routes`,
      0,
      limit - 1,
      { REV: true },
    );

    const popularRoutes = [];
    for (const item of searchCounts) {
      const [from, to] = item.value.split(':');
      
      const fromStation = await this.findStation(from);
      const toStation = await this.findStation(to);

      if (fromStation && toStation) {
        popularRoutes.push({
          from: fromStation,
          to: toStation,
          searchCount: item.score,
        });
      }
    }

    const result = { data: popularRoutes, fromCache: false };

    // Cache for 1 hour
    await this.setCachedData(cacheKey, result, this.cacheTTL.popularRoutes);

    return result;
  }

  /**
   * Station name autocomplete
   */
  async autocompleteStations(dto: AutocompleteStationsDto) {
    const cacheKey = `${this.cachePrefix}autocomplete:${dto.query.toLowerCase()}:${dto.limit}`;

    // Try cache first
    const cached = await this.getCachedData(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit for autocomplete: ${dto.query}`);
      return { ...cached, fromCache: true };
    }

    // Search stations
    const stations = await this.prisma.station.findMany({
      where: {
        OR: [
          { name: { contains: dto.query, mode: 'insensitive' } },
          { code: { contains: dto.query, mode: 'insensitive' } },
          { city: { contains: dto.query, mode: 'insensitive' } },
        ],
      },
      take: dto.limit,
      orderBy: { name: 'asc' },
    });

    const result = { data: stations, fromCache: false };

    // Cache for 30 minutes
    await this.setCachedData(cacheKey, result, this.cacheTTL.autocomplete);

    return result;
  }

  /**
   * Get all stations (with caching)
   */
  async getAllStations() {
    const cacheKey = `${this.cachePrefix}stations:all`;

    const cached = await this.getCachedData(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    const stations = await this.prisma.station.findMany({
      orderBy: { name: 'asc' },
    });

    const result = { data: stations, fromCache: false };
    await this.setCachedData(cacheKey, result, this.cacheTTL.stations);

    return result;
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(limit: number = 20) {
    const routes = await this.redis.zRangeWithScores(
      `${this.cachePrefix}analytics:routes`,
      0,
      limit - 1,
      { REV: true },
    );

    const analytics = await Promise.all(
      routes.map(async ({ value: key, score }: { value: string; score: number }) => {
        const [from, to] = key.split(':');
        const fromStation = await this.findStation(from);
        const toStation = await this.findStation(to);

        return {
          from: fromStation?.name || from,
          to: toStation?.name || to,
          searchCount: score,
        };
      }),
    );

    return { data: analytics };
  }

  /**
   * Invalidate cache
   */
  async invalidateCache(dto: InvalidateCacheDto) {
    let deletedCount = 0;

    if (dto.keys && dto.keys.length > 0) {
      // Delete specific keys
      for (const key of dto.keys) {
        await this.redis.del(key);
        deletedCount++;
      }
    } else if (dto.pattern) {
      // Delete keys matching pattern
      const keys = await this.redis.keys(dto.pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
        deletedCount = keys.length;
      }
    }

    this.logger.log(`Invalidated ${deletedCount} cache keys`);
    return { message: `Invalidated ${deletedCount} cache entries`, count: deletedCount };
  }

  /**
   * Clear all search cache
   */
  async clearAllCache() {
    const pattern = `${this.cachePrefix}*`;
    const keys = await this.redis.keys(pattern);
    
    if (keys.length > 0) {
      await this.redis.del(keys);
    }

    this.logger.log(`Cleared ${keys.length} cache entries`);
    return { message: `Cleared ${keys.length} cache entries`, count: keys.length };
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    const patterns = [
      `${this.cachePrefix}journey:*`,
      `${this.cachePrefix}popular:*`,
      `${this.cachePrefix}autocomplete:*`,
      `${this.cachePrefix}stations:*`,
    ];

    const stats = await Promise.all(
      patterns.map(async (pattern) => {
        const keys = await this.redis.keys(pattern);
        return {
          pattern,
          count: keys.length,
        };
      }),
    );

    const totalKeys = await this.redis.dbSize();

    return {
      totalKeys,
      searchCache: stats,
      analyticsKeys: await this.redis.zCard(`${this.cachePrefix}analytics:routes`),
    };
  }

  // Helper methods

  private async findStation(identifier: string) {
    // Try to find by ID first
    const byId = await this.prisma.station.findUnique({
      where: { id: identifier },
    });
    if (byId) return byId;

    // Try by code
    const byCode = await this.prisma.station.findUnique({
      where: { code: identifier },
    });
    return byCode;
  }

  private async getCachedData(key: string): Promise<any> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.logger.error(`Cache get error: ${error.message}`);
      return null;
    }
  }

  private async setCachedData(key: string, data: any, ttl: number): Promise<void> {
    try {
      await this.redis.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      this.logger.error(`Cache set error: ${error.message}`);
    }
  }

  private async incrementSearchCount(from: string, to: string): Promise<void> {
    try {
      const key = `${from}:${to}`;
      await this.redis.zIncrBy(`${this.cachePrefix}analytics:routes`, 1, key);
    } catch (error) {
      this.logger.error(`Analytics increment error: ${error.message}`);
    }
  }
}
