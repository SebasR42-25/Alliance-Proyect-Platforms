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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsController = void 0;
const common_1 = require("@nestjs/common");
const news_service_1 = require("./news.service");
const swagger_1 = require("@nestjs/swagger");
let NewsController = class NewsController {
    newsService;
    constructor(newsService) {
        this.newsService = newsService;
    }
    async getNews() {
        return this.newsService.getTechNews();
    }
};
exports.NewsController = NewsController;
__decorate([
    (0, common_1.Get)('tech'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener últimas noticias de tecnología de NewsAPI',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de noticias obtenida exitosamente.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Error al contactar la API externa.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "getNews", null);
exports.NewsController = NewsController = __decorate([
    (0, swagger_1.ApiTags)('Noticias Externas'),
    (0, common_1.Controller)('news'),
    __metadata("design:paramtypes", [news_service_1.NewsService])
], NewsController);
//# sourceMappingURL=news.controller.js.map