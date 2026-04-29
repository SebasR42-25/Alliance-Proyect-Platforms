import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true })
export class Reel extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;
  @Prop({ required: true })
  videoUrl: string;
  @Prop()
  caption: string;
  @Prop({ default: 0 })
  likesCount: number;
}
export const ReelSchema = SchemaFactory.createForClass(Reel);
