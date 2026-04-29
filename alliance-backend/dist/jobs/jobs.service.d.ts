import { Model, Types } from 'mongoose';
import { Job } from './schemas/job.schema';
import { User } from '../users/schemas/user.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobDto } from './dto/query-job.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
export declare class JobsService {
    private jobModel;
    private userModel;
    private readonly notificationsGateway;
    constructor(jobModel: Model<Job>, userModel: Model<User>, notificationsGateway: NotificationsGateway);
    findAll(query?: QueryJobDto): Promise<(import("mongoose").Document<unknown, {}, Job, {}, import("mongoose").DefaultSchemaOptions> & Job & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, Job, {}, import("mongoose").DefaultSchemaOptions> & Job & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(createJobDto: CreateJobDto): Promise<Omit<import("mongoose").Document<unknown, {}, Job, {}, import("mongoose").DefaultSchemaOptions> & Job & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, never>>;
    update(id: string, updateJobDto: UpdateJobDto): Promise<import("mongoose").Document<unknown, {}, Job, {}, import("mongoose").DefaultSchemaOptions> & Job & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    applyToJob(jobId: string, userId: string): Promise<{
        message: string;
    }>;
    saveJob(jobId: string, userId: string): Promise<{
        message: string;
    }>;
}
