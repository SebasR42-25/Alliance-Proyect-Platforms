import { Document, Types } from 'mongoose';
export declare class Job extends Document {
    title: string;
    company: Types.ObjectId;
    location: string;
    salaryRange: string;
    description: string;
    tags: string[];
    applicants: Types.ObjectId[];
    savedBy: Types.ObjectId[];
}
export declare const JobSchema: import("mongoose").Schema<Job, import("mongoose").Model<Job, any, any, any, (Document<unknown, any, Job, any, import("mongoose").DefaultSchemaOptions> & Job & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Job, any, import("mongoose").DefaultSchemaOptions> & Job & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, Job>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Job, Document<unknown, {}, Job, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Job & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    tags?: import("mongoose").SchemaDefinitionProperty<string[], Job, Document<unknown, {}, Job, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Job & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, Job, Document<unknown, {}, Job, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Job & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    title?: import("mongoose").SchemaDefinitionProperty<string, Job, Document<unknown, {}, Job, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Job & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Job, Document<unknown, {}, Job, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Job & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    location?: import("mongoose").SchemaDefinitionProperty<string, Job, Document<unknown, {}, Job, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Job & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    company?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Job, Document<unknown, {}, Job, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Job & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    salaryRange?: import("mongoose").SchemaDefinitionProperty<string, Job, Document<unknown, {}, Job, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Job & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    applicants?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], Job, Document<unknown, {}, Job, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Job & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    savedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], Job, Document<unknown, {}, Job, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Job & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Job>;
