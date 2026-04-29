import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Company } from '../companies/schemas/company.schema';
import { Job } from '../jobs/schemas/job.schema';
import { Story } from '../stories/schemas/story.schema';
export declare class SeedService {
    private userModel;
    private companyModel;
    private jobModel;
    private storyModel;
    constructor(userModel: Model<User>, companyModel: Model<Company>, jobModel: Model<Job>, storyModel: Model<Story>);
    runSeed(): Promise<{
        message: string;
    }>;
}
