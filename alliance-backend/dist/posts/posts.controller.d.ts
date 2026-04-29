import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
interface RequestUser {
    userId: string;
    email: string;
}
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    create(createPostDto: CreatePostDto, user: RequestUser): Promise<Omit<import("mongoose").Document<unknown, {}, import("./schemas/post.schema").Post, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/post.schema").Post & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, never>>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/post.schema").Post, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/post.schema").Post & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    toggleLike(id: string, user: RequestUser): Promise<{
        likesCount: number;
        isLiked: boolean;
    }>;
    addComment(id: string, text: string, user: RequestUser): Promise<Omit<import("mongoose").Document<unknown, {}, import("./schemas/post.schema").Post, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/post.schema").Post & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, never>>;
}
export {};
