"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let NewsService = NewsService_1 = class NewsService {
    httpService;
    configService;
    logger = new common_1.Logger(NewsService_1.name);
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
    }
    async getTechNews() {
        const apiKey = this.configService.get('NEWS_API_KEY');
        if (!apiKey) {
            this.logger.warn('NEWS_API_KEY not configured');
            return [];
        }
        const url = `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=20&apiKey=${apiKey}`;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
            return response.data.articles.filter((a) => a.title && a.url);
        }
        catch (error) {
            this.logger.error('NewsAPI request failed', error instanceof Error ? error.message : error);
            return [];
        }
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = NewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], NewsService);
//# sourceMappingURL=news.service.js.map