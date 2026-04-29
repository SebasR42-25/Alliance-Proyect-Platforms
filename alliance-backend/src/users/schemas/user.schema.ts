import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop()
  location: string;
  @Prop()
  bio: string;
  @Prop({ default: [] })
  skills: string[];
  @Prop()
  profilePicture: string;
  @Prop()
  seniority: string;
  @Prop()
  specialization: string;
  @Prop()
  sector: string;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  connections: Types.ObjectId[]; // Contactos ya aceptados
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  connectionRequests: Types.ObjectId[]; // Solicitudes pendientes
}
export const UserSchema = SchemaFactory.createForClass(User);
