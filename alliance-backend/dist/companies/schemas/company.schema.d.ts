import { Document } from 'mongoose';
export declare class Company extends Document {
    name: string;
    logoUrl: string;
    domain: string;
    description: string;
    availableJobs: number;
    industry: string;
}
export declare const CompanySchema: import("mongoose").Schema<Company, import("mongoose").Model<Company, any, any, any, (Document<unknown, any, Company, any, import("mongoose").DefaultSchemaOptions> & Company & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Company, any, import("mongoose").DefaultSchemaOptions> & Company & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, Company>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Company, Document<unknown, {}, Company, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Company & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    description?: import("mongoose").SchemaDefinitionProperty<string, Company, Document<unknown, {}, Company, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Company & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    name?: import("mongoose").SchemaDefinitionProperty<string, Company, Document<unknown, {}, Company, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Company & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, Company, Document<unknown, {}, Company, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Company & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    logoUrl?: import("mongoose").SchemaDefinitionProperty<string, Company, Document<unknown, {}, Company, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Company & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    domain?: import("mongoose").SchemaDefinitionProperty<string, Company, Document<unknown, {}, Company, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Company & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    availableJobs?: import("mongoose").SchemaDefinitionProperty<number, Company, Document<unknown, {}, Company, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Company & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    industry?: import("mongoose").SchemaDefinitionProperty<string, Company, Document<unknown, {}, Company, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Company & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Company>;
