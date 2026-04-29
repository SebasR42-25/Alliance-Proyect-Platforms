import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ timestamps: true })
export class Company extends Document {
  @Prop({ required: true, unique: true })
  name: string;
  @Prop()
  logoUrl: string;
  @Prop()
  description: string;
  @Prop({ default: 0 })
  availableJobs: number;
  @Prop()
  industry: string;
}
export const CompanySchema = SchemaFactory.createForClass(Company);
