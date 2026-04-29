"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const seed_service_1 = require("./seed.service");
const seed_controller_1 = require("./seed.controller");
const user_schema_1 = require("../users/schemas/user.schema");
const company_schema_1 = require("../companies/schemas/company.schema");
const job_schema_1 = require("../jobs/schemas/job.schema");
const story_schema_1 = require("../stories/schemas/story.schema");
let SeedModule = class SeedModule {
};
exports.SeedModule = SeedModule;
exports.SeedModule = SeedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: company_schema_1.Company.name, schema: company_schema_1.CompanySchema },
                { name: job_schema_1.Job.name, schema: job_schema_1.JobSchema },
                { name: story_schema_1.Story.name, schema: story_schema_1.StorySchema },
            ]),
        ],
        providers: [seed_service_1.SeedService],
        controllers: [seed_controller_1.SeedController],
    })
], SeedModule);
//# sourceMappingURL=seed.module.js.map