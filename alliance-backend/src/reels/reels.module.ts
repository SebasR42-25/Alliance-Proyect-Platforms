import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReelsService } from './reels.service';
import { ReelsController } from './reels.controller';
import { Reel, ReelSchema } from './schemas/reel.schema';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reel.name, schema: ReelSchema }]),
    CloudinaryModule,
  ],
  controllers: [ReelsController],
  providers: [ReelsService],
})
export class ReelsModule {}
