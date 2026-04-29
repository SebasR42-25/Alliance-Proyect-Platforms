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
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const job_schema_1 = require("./schemas/job.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
let JobsService = class JobsService {
    jobModel;
    userModel;
    notificationsGateway;
    constructor(jobModel, userModel, notificationsGateway) {
        this.jobModel = jobModel;
        this.userModel = userModel;
        this.notificationsGateway = notificationsGateway;
    }
    async findAll(query) {
        const filters = {};
        if (query?.location)
            filters.location = new RegExp(query.location, 'i');
        if (query?.title)
            filters.title = new RegExp(query.title, 'i');
        if (query?.company)
            filters.company = new mongoose_2.Types.ObjectId(query.company);
        return this.jobModel
            .find(filters)
            .populate('company', 'name logoUrl')
            .exec();
    }
    async findOne(id) {
        const job = await this.jobModel.findById(id).populate('company').exec();
        if (!job)
            throw new common_1.NotFoundException('Oferta de empleo no encontrada');
        return job;
    }
    async create(createJobDto) {
        const newJob = new this.jobModel(createJobDto);
        const savedJob = await (await newJob.save()).populate('company');
        if (createJobDto.tags && createJobDto.tags.length > 0) {
            const matchingUsers = await this.userModel.find({
                skills: { $in: createJobDto.tags },
            });
            matchingUsers.forEach((user) => {
                this.notificationsGateway.sendNotification(user._id.toString(), {
                    type: 'JOB_MATCH',
                    message: `¡Nueva vacante de ${savedJob.title}! Coincide con tu perfil.`,
                    payload: { jobId: savedJob._id },
                });
            });
        }
        return savedJob;
    }
    async update(id, updateJobDto) {
        const updatedJob = await this.jobModel
            .findByIdAndUpdate(id, updateJobDto, { new: true })
            .exec();
        if (!updatedJob)
            throw new common_1.NotFoundException('Oferta no encontrada');
        return updatedJob;
    }
    async remove(id) {
        const deletedJob = await this.jobModel.findByIdAndDelete(id).exec();
        if (!deletedJob)
            throw new common_1.NotFoundException('Oferta no encontrada');
        return { message: 'Oferta eliminada exitosamente' };
    }
    async applyToJob(jobId, userId) {
        const job = await this.findOne(jobId);
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        if (job.applicants.includes(userObjectId)) {
            throw new common_1.BadRequestException('Ya te has postulado a esta vacante');
        }
        job.applicants.push(userObjectId);
        await job.save();
        return { message: 'Postulación enviada con éxito' };
    }
    async saveJob(jobId, userId) {
        const job = await this.findOne(jobId);
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const index = job.savedBy.indexOf(userObjectId);
        if (index > -1) {
            job.savedBy.splice(index, 1);
            await job.save();
            return { message: 'Oferta eliminada de tus guardados' };
        }
        job.savedBy.push(userObjectId);
        await job.save();
        return { message: 'Oferta guardada exitosamente' };
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(job_schema_1.Job.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        notifications_gateway_1.NotificationsGateway])
], JobsService);
//# sourceMappingURL=jobs.service.js.map