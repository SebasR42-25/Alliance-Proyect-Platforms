import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company } from './schemas/company.schema';
import { Job } from '../jobs/schemas/job.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
    @InjectModel(Job.name) private jobModel: Model<Job>,
  ) {}
  async findAll(): Promise<Company[]> {
    return this.companyModel.find().exec();
  }
  async findOne(id: string): Promise<Company> {
    const company = await this.companyModel.findById(id).exec();
    if (!company) throw new NotFoundException('Empresa no encontrada');
    return company;
  }
  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const newCompany = new this.companyModel(createCompanyDto);
    return newCompany.save();
  }
  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const updatedCompany = await this.companyModel
      .findByIdAndUpdate(id, updateCompanyDto, { new: true })
      .exec();
    if (!updatedCompany) throw new NotFoundException('Empresa no encontrada');
    return updatedCompany;
  }
  async remove(id: string): Promise<{ message: string }> {
    const deletedCompany = await this.companyModel.findByIdAndDelete(id).exec();
    if (!deletedCompany) throw new NotFoundException('Empresa no encontrada');
    return { message: 'Empresa eliminada correctamente' };
  }
  async findJobsByCompany(companyId: string): Promise<Job[]> {
    await this.findOne(companyId);
    return this.jobModel
      .find({ company: new Types.ObjectId(companyId) })
      .exec();
  }
}
