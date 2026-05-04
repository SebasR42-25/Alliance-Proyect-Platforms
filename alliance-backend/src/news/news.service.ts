import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
export interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}
export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}
@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getTechNews(): Promise<NewsArticle[]> {
    const apiKey = this.configService.get<string>('NEWS_API_KEY');
    if (!apiKey) {
      this.logger.warn('NEWS_API_KEY not configured');
      return [];
    }
    const url = `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=20&apiKey=${apiKey}`;
    try {
      const response = await firstValueFrom(
        this.httpService.get<NewsApiResponse>(url),
      );
      return response.data.articles.filter((a) => a.title && a.url);
    } catch (error) {
      this.logger.error('NewsAPI request failed', error instanceof Error ? error.message : error);
      return [];
    }
  }
}
