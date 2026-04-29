import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface NewsArticle {
    source: {
        id: string | null;
        name: string;
    };
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
export declare class NewsService {
    private readonly httpService;
    private readonly configService;
    constructor(httpService: HttpService, configService: ConfigService);
    getTechNews(): Promise<NewsArticle[]>;
}
