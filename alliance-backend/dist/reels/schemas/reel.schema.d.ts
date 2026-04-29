import { Document, Types } from 'mongoose';
export declare class Reel extends Document {
    author: Types.ObjectId;
    videoUrl: string;
    caption: string;
    likesCount: number;
}
export declare const ReelSchema: import("mongoose").Schema<Reel, import("mongoose").Model<Reel, any, any, any, (Document<unknown, any, Reel, any, import("mongoose").DefaultSchemaOptions> & Reel & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Reel, any, import("mongoose").DefaultSchemaOptions> & Reel & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, Reel>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Reel, Document<unknown, {}, Reel, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Reel & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Reel, Document<unknown, {}, Reel, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Reel & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    author?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Reel, Document<unknown, {}, Reel, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Reel & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    videoUrl?: import("mongoose").SchemaDefinitionProperty<string, Reel, Document<unknown, {}, Reel, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Reel & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    caption?: import("mongoose").SchemaDefinitionProperty<string, Reel, Document<unknown, {}, Reel, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Reel & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    likesCount?: import("mongoose").SchemaDefinitionProperty<number, Reel, Document<unknown, {}, Reel, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Reel & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Reel>;
