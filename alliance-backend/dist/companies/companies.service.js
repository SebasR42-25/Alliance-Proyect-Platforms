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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const company_schema_1 = require("./schemas/company.schema");
const job_schema_1 = require("../jobs/schemas/job.schema");
let CompaniesService = class CompaniesService {
    companyModel;
    jobModel;
    constructor(companyModel, jobModel) {
        this.companyModel = companyModel;
        this.jobModel = jobModel;
    }
    async findAll() {
        return this.companyModel.find().exec();
    }
    async findOne(id) {
        const company = await this.companyModel.findById(id).exec();
        if (!company)
            throw new common_1.NotFoundException('Empresa no encontrada');
        return company;
    }
    async create(createCompanyDto) {
        const newCompany = new this.companyModel(createCompanyDto);
        return newCompany.save();
    }
    async update(id, updateCompanyDto) {
        const updatedCompany = await this.companyModel
            .findByIdAndUpdate(id, updateCompanyDto, { new: true })
            .exec();
        if (!updatedCompany)
            throw new common_1.NotFoundException('Empresa no encontrada');
        return updatedCompany;
    }
    async remove(id) {
        const deletedCompany = await this.companyModel.findByIdAndDelete(id).exec();
        if (!deletedCompany)
            throw new common_1.NotFoundException('Empresa no encontrada');
        return { message: 'Empresa eliminada correctamente' };
    }
    async findJobsByCompany(companyId) {
        await this.findOne(companyId);
        return this.jobModel
            .find({ company: new mongoose_2.Types.ObjectId(companyId) })
            .exec();
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(company_schema_1.Company.name)),
    __param(1, (0, mongoose_1.InjectModel)(job_schema_1.Job.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map