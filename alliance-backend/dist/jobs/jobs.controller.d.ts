import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobDto } from './dto/query-job.dto';
interface RequestUser {
    userId: string;
    email: string;
}
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    findAll(query: QueryJobDto): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/job.schema").Job, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/job.schema").Job & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    create(createJobDto: CreateJobDto): Promise<Omit<import("mongoose").Document<unknown, {}, import("./schemas/job.schema").Job, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/job.schema").Job & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, never>>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/job.schema").Job, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/job.schema").Job & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, updateJobDto: UpdateJobDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/job.schema").Job, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/job.schema").Job & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    apply(id: string, user: RequestUser): Promise<{
        message: string;
    }>;
    saveJob(id: string, user: RequestUser): Promise<{
        message: string;
    }>;
}
export {};
