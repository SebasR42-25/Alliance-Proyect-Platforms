import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job } from './schemas/job.schema';
import { User } from '../users/schemas/user.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobDto } from './dto/query-job.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<Job>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}
  async findAll(query?: QueryJobDto) {
    const filters: { location?: RegExp; title?: RegExp; company?: Types.ObjectId } = {};
    if (query?.location) filters.location = new RegExp(query.location, 'i');
    if (query?.title)    filters.title    = new RegExp(query.title, 'i');
    if (query?.company)  filters.company  = new Types.ObjectId(query.company);
    return this.jobModel
      .find(filters)
      .populate('company', 'name domain logoUrl')
      .exec();
  }
  async findOne(id: string) {
    const job = await this.jobModel.findById(id).populate('company').exec();
    if (!job) throw new NotFoundException('Oferta de empleo no encontrada');
    return job;
  }
  async create(createJobDto: CreateJobDto) {
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
  async update(id: string, updateJobDto: UpdateJobDto) {
    const updatedJob = await this.jobModel
      .findByIdAndUpdate(id, updateJobDto, { new: true })
      .exec();
    if (!updatedJob) throw new NotFoundException('Oferta no encontrada');
    return updatedJob;
  }
  async remove(id: string) {
    const deletedJob = await this.jobModel.findByIdAndDelete(id).exec();
    if (!deletedJob) throw new NotFoundException('Oferta no encontrada');
    return { message: 'Oferta eliminada exitosamente' };
  }
  async applyToJob(jobId: string, userId: string) {
    const job = await this.findOne(jobId);
    const userObjectId = new Types.ObjectId(userId);
    if (job.applicants.includes(userObjectId)) {
      throw new BadRequestException('Ya te has postulado a esta vacante');
    }
    job.applicants.push(userObjectId);
    await job.save();
    return { message: 'Postulación enviada con éxito' };
  }
  async saveJob(jobId: string, userId: string) {
    const job = await this.findOne(jobId);
    const userObjectId = new Types.ObjectId(userId);
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
}
