import { Model } from 'mongoose';
import { Company } from './schemas/company.schema';
import { Job } from '../jobs/schemas/job.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompaniesService {
    private companyModel;
    private jobModel;
    constructor(companyModel: Model<Company>, jobModel: Model<Job>);
    findAll(): Promise<Company[]>;
    findOne(id: string): Promise<Company>;
    create(createCompanyDto: CreateCompanyDto): Promise<Company>;
    update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company>;
    remove(id: string): Promise<{
        message: string;
    }>;
    findJobsByCompany(companyId: string): Promise<Job[]>;
}
