import { Document, Types } from 'mongoose';
export declare class Story extends Document {
    author: Types.ObjectId;
    mediaUrl: string;
    mediaType: string;
    viewedBy: Types.ObjectId[];
    createdAt: Date;
}
export declare const StorySchema: import("mongoose").Schema<Story, import("mongoose").Model<Story, any, any, any, (Document<unknown, any, Story, any, import("mongoose").DefaultSchemaOptions> & Story & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Story, any, import("mongoose").DefaultSchemaOptions> & Story & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, Story>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Story, Document<unknown, {}, Story, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Story & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Story, Document<unknown, {}, Story, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Story & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    author?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Story, Document<unknown, {}, Story, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Story & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, Story, Document<unknown, {}, Story, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Story & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mediaUrl?: import("mongoose").SchemaDefinitionProperty<string, Story, Document<unknown, {}, Story, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Story & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mediaType?: import("mongoose").SchemaDefinitionProperty<string, Story, Document<unknown, {}, Story, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Story & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    viewedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], Story, Document<unknown, {}, Story, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Story & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Story>;
