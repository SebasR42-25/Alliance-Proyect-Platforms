import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    findAll(): Promise<import("./schemas/company.schema").Company[]>;
    create(createCompanyDto: CreateCompanyDto): Promise<import("./schemas/company.schema").Company>;
    findOne(id: string): Promise<import("./schemas/company.schema").Company>;
    update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<import("./schemas/company.schema").Company>;
    remove(id: string): Promise<{
        message: string;
    }>;
    findJobs(id: string): Promise<import("../jobs/schemas/job.schema").Job[]>;
}
