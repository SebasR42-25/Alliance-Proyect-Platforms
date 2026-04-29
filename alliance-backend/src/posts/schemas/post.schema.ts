import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;
  @Prop({ required: true })
  content: string;
  @Prop()
  imageUrl: string;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];
  @Prop([
    {
      user: { type: Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ])
  comments: { user: Types.ObjectId; text: string; createdAt: Date }[];
  @Prop({ type: [String], default: [] })
  hashtags: string[];
}
export const PostSchema = SchemaFactory.createForClass(Post);
