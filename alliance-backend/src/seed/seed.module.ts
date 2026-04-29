import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Company, CompanySchema } from '../companies/schemas/company.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { Story, StorySchema } from '../stories/schemas/story.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name,    schema: UserSchema    },
      { name: Company.name, schema: CompanySchema },
      { name: Job.name,     schema: JobSchema     },
      { name: Story.name,   schema: StorySchema   },
    ]),
  ],
  providers: [SeedService],
  controllers: [SeedController],
})
export class SeedModule {}
