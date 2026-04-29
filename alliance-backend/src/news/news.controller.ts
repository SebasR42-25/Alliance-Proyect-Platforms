import { Controller, Get } from '@nestjs/common';
import { NewsService, NewsArticle } from './news.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
@ApiTags('Noticias Externas')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}
  @Get('tech')
  @ApiOperation({
    summary: 'Obtener últimas noticias de tecnología de NewsAPI',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de noticias obtenida exitosamente.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al contactar la API externa.',
  })
  async getNews(): Promise<NewsArticle[]> {
    return this.newsService.getTechNews();
  }
}
