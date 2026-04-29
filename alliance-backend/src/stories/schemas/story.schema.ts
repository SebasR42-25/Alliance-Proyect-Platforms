import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Story extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ required: true })
  mediaUrl: string;

  @Prop({ enum: ['image', 'video'], default: 'image' })
  mediaType: string;

  // ESTA ES LA LÍNEA QUE FALTA:
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  viewedBy: Types.ObjectId[];

  // El TTL de 24 horas
  @Prop({ type: Date, default: Date.now, expires: '24h' })
  createdAt: Date;
}

export const StorySchema = SchemaFactory.createForClass(Story);
