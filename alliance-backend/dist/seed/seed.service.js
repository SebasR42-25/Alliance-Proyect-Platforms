"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const user_schema_1 = require("../users/schemas/user.schema");
const company_schema_1 = require("../companies/schemas/company.schema");
const job_schema_1 = require("../jobs/schemas/job.schema");
const story_schema_1 = require("../stories/schemas/story.schema");
let SeedService = class SeedService {
    userModel;
    companyModel;
    jobModel;
    storyModel;
    constructor(userModel, companyModel, jobModel, storyModel) {
        this.userModel = userModel;
        this.companyModel = companyModel;
        this.jobModel = jobModel;
        this.storyModel = storyModel;
    }
    async runSeed() {
        await this.userModel.deleteMany({});
        await this.companyModel.deleteMany({});
        await this.jobModel.deleteMany({});
        await this.storyModel.deleteMany({});
        const companies = await this.companyModel.insertMany([
            {
                name: 'Amazon',
                industry: 'Technology',
                description: 'Líder mundial en e-commerce y cloud computing (AWS).',
                logoUrl: 'https://logo.clearbit.com/amazon.com',
                availableJobs: 5,
            },
            {
                name: 'Microsoft',
                industry: 'Technology',
                description: 'Software, cloud y productividad empresarial.',
                logoUrl: 'https://logo.clearbit.com/microsoft.com',
                availableJobs: 3,
            },
            {
                name: 'Google',
                industry: 'Technology',
                description: 'Búsqueda, publicidad y servicios en la nube.',
                logoUrl: 'https://logo.clearbit.com/google.com',
                availableJobs: 8,
            },
            {
                name: 'Bancolombia',
                industry: 'Finance & Banking',
                description: 'Banco líder en Colombia con presencia regional.',
                logoUrl: 'https://logo.clearbit.com/bancolombia.com',
                availableJobs: 12,
            },
        ]);
        const passwordHash = await bcrypt.hash('Password123!', 10);
        const SEED_USERS = [
            { name: 'Carlos Mendoza', email: 'carlos.mendoza@alliance.dev', gender: 'men', n: 1 },
            { name: 'Laura Gómez', email: 'laura.gomez@alliance.dev', gender: 'women', n: 2 },
            { name: 'Andrés Torres', email: 'andres.torres@alliance.dev', gender: 'men', n: 3 },
            { name: 'Valentina Ríos', email: 'valentina.rios@alliance.dev', gender: 'women', n: 4 },
            { name: 'Miguel Herrera', email: 'miguel.herrera@alliance.dev', gender: 'men', n: 5 },
            { name: 'Isabella Castro', email: 'isabella.castro@alliance.dev', gender: 'women', n: 6 },
            { name: 'Daniel Vargas', email: 'daniel.vargas@alliance.dev', gender: 'men', n: 7 },
            { name: 'Sofía Jiménez', email: 'sofia.jimenez@alliance.dev', gender: 'women', n: 8 },
            { name: 'Felipe Moreno', email: 'felipe.moreno@alliance.dev', gender: 'men', n: 9 },
            { name: 'Camila Pedraza', email: 'camila.pedraza@alliance.dev', gender: 'women', n: 10 },
        ];
        const users = SEED_USERS.map(({ name, email, gender, n }) => ({
            name,
            email,
            password: passwordHash,
            location: 'Cali, Colombia',
            bio: 'Profesional en tecnología buscando nuevas oportunidades.',
            skills: ['TypeScript', 'MongoDB', 'NestJS'],
            profilePicture: `https://randomuser.me/api/portraits/${gender}/${n}.jpg`,
        }));
        await this.userModel.insertMany(users);
        const jobs = [
            { title: 'Backend Developer (NestJS)', company: companies[0]._id, location: 'Remoto', salaryRange: '$8M - $12M COP', description: 'Diseña y escala microservicios de alto tráfico en AWS.', tags: ['NestJS', 'Node.js', 'AWS'] },
            { title: 'DevOps Engineer', company: companies[0]._id, location: 'Bogotá / Remoto', salaryRange: '$10M - $15M COP', description: 'Automatiza pipelines CI/CD y gestiona infraestructura en la nube.', tags: ['AWS', 'Docker', 'Terraform'] },
            { title: 'Frontend Developer (React)', company: companies[0]._id, location: 'Remoto', salaryRange: '$7M - $10M COP', description: 'Construye interfaces de alto rendimiento para millones de usuarios.', tags: ['React', 'TypeScript', 'Next.js'] },
            { title: 'Data Engineer', company: companies[0]._id, location: 'Remoto', salaryRange: '$9M - $14M COP', description: 'Diseña pipelines de datos a escala para Amazon Analytics.', tags: ['Python', 'Spark', 'AWS Glue'] },
            { title: 'Product Manager', company: companies[0]._id, location: 'Bogotá', salaryRange: '$12M - $18M COP', description: 'Lidera el roadmap de productos digitales en América Latina.', tags: ['Agile', 'Scrum', 'Product'] },
            { title: '.NET Developer', company: companies[1]._id, location: 'Remoto', salaryRange: '$7M - $11M COP', description: 'Desarrolla soluciones empresariales en el ecosistema Microsoft.', tags: ['.NET', 'C#', 'Azure'] },
            { title: 'Azure Cloud Architect', company: companies[1]._id, location: 'Medellín / Remoto', salaryRange: '$14M - $20M COP', description: 'Diseña arquitecturas cloud nativas para clientes corporativos.', tags: ['Azure', 'Cloud', 'Architecture'] },
            { title: 'UX Designer', company: companies[1]._id, location: 'Remoto', salaryRange: '$6M - $9M COP', description: 'Crea experiencias de usuario para productos Microsoft 365.', tags: ['Figma', 'UX', 'Design System'] },
            { title: 'Software Engineer L4', company: companies[2]._id, location: 'Remoto', salaryRange: '$15M - $22M COP', description: 'Trabaja en productos usados por miles de millones de personas.', tags: ['Go', 'Java', 'Distributed Systems'] },
            { title: 'Machine Learning Engineer', company: companies[2]._id, location: 'Remoto', salaryRange: '$16M - $25M COP', description: 'Entrena y despliega modelos de ML a escala global.', tags: ['Python', 'TensorFlow', 'ML'] },
            { title: 'Android Developer', company: companies[2]._id, location: 'Remoto', salaryRange: '$10M - $15M COP', description: 'Desarrolla features para el sistema operativo más usado del mundo.', tags: ['Kotlin', 'Android', 'Jetpack'] },
            { title: 'Go Backend Engineer', company: companies[2]._id, location: 'Remoto', salaryRange: '$12M - $18M COP', description: 'Construye servicios internos de baja latencia con Go.', tags: ['Go', 'gRPC', 'Kubernetes'] },
            { title: 'Site Reliability Engineer', company: companies[2]._id, location: 'Bogotá', salaryRange: '$14M - $20M COP', description: 'Mantén la disponibilidad de servicios críticos al 99.99%.', tags: ['SRE', 'Kubernetes', 'Monitoring'] },
            { title: 'Technical Program Manager', company: companies[2]._id, location: 'Remoto', salaryRange: '$13M - $19M COP', description: 'Coordina proyectos de ingeniería multidisciplinarios.', tags: ['Agile', 'Program Management'] },
            { title: 'Data Scientist', company: companies[2]._id, location: 'Remoto', salaryRange: '$11M - $17M COP', description: 'Analiza datos a escala para mejorar los productos de Google.', tags: ['Python', 'BigQuery', 'Statistics'] },
            { title: 'Security Engineer', company: companies[2]._id, location: 'Remoto', salaryRange: '$12M - $18M COP', description: 'Protege la infraestructura de Google de amenazas externas.', tags: ['Security', 'Pentesting', 'GCP'] },
            { title: 'Desarrollador Java Backend', company: companies[3]._id, location: 'Medellín', salaryRange: '$6M - $9M COP', description: 'Desarrolla servicios bancarios de alta disponibilidad.', tags: ['Java', 'Spring Boot', 'Microservices'] },
            { title: 'Analista de Datos', company: companies[3]._id, location: 'Medellín / Remoto', salaryRange: '$5M - $7M COP', description: 'Analiza datos transaccionales para detectar patrones de negocio.', tags: ['SQL', 'Power BI', 'Python'] },
            { title: 'Líder de Proyecto TI', company: companies[3]._id, location: 'Medellín', salaryRange: '$10M - $14M COP', description: 'Lidera equipos de desarrollo en proyectos de transformación digital.', tags: ['PMP', 'Agile', 'Leadership'] },
            { title: 'Analista de Seguridad', company: companies[3]._id, location: 'Medellín', salaryRange: '$7M - $10M COP', description: 'Monitorea amenazas y asegura la infraestructura bancaria.', tags: ['SIEM', 'SOC', 'Cybersecurity'] },
            { title: 'Desarrollador Frontend (Angular)', company: companies[3]._id, location: 'Remoto', salaryRange: '$5M - $8M COP', description: 'Construye interfaces del portal web de Bancolombia.', tags: ['Angular', 'TypeScript', 'RxJS'] },
            { title: 'Arquitecto de Software', company: companies[3]._id, location: 'Medellín', salaryRange: '$14M - $20M COP', description: 'Define estándares técnicos y arquitectura de plataformas digitales.', tags: ['Architecture', 'Cloud', 'Java'] },
            { title: 'Scrum Master', company: companies[3]._id, location: 'Medellín / Remoto', salaryRange: '$6M - $9M COP', description: 'Facilita ceremonias ágiles y acompaña equipos de desarrollo.', tags: ['Scrum', 'Agile', 'Coaching'] },
            { title: 'DevOps Engineer', company: companies[3]._id, location: 'Medellín', salaryRange: '$8M - $12M COP', description: 'Automatiza despliegues y gestiona la infraestructura bancaria.', tags: ['Jenkins', 'Docker', 'Kubernetes'] },
            { title: 'Mobile Developer (iOS)', company: companies[3]._id, location: 'Remoto', salaryRange: '$7M - $11M COP', description: 'Desarrolla la app móvil de Bancolombia para iOS.', tags: ['Swift', 'iOS', 'Xcode'] },
            { title: 'Analista de QA', company: companies[3]._id, location: 'Medellín', salaryRange: '$4.5M - $6.5M COP', description: 'Asegura la calidad de los sistemas bancarios core.', tags: ['QA', 'Selenium', 'Testing'] },
            { title: 'Gerente de Producto Digital', company: companies[3]._id, location: 'Medellín', salaryRange: '$12M - $16M COP', description: 'Define la visión y estrategia del portafolio digital.', tags: ['Product', 'Fintech', 'Strategy'] },
            { title: 'Especialista en Ciberseguridad', company: companies[3]._id, location: 'Medellín', salaryRange: '$9M - $13M COP', description: 'Implementa estrategias de defensa para activos bancarios críticos.', tags: ['Cybersecurity', 'ISO 27001', 'SIEM'] },
        ];
        await this.jobModel.insertMany(jobs);
        const allUsers = await this.userModel.find().limit(2).lean();
        if (allUsers.length >= 2) {
            await this.storyModel.insertMany([
                {
                    author: allUsers[0]._id,
                    mediaUrl: 'https://randomuser.me/api/portraits/men/20.jpg',
                    mediaType: 'image',
                },
                {
                    author: allUsers[1]._id,
                    mediaUrl: 'https://randomuser.me/api/portraits/women/20.jpg',
                    mediaType: 'image',
                },
            ]);
        }
        return { message: 'Seed ejecutado con éxito y tipado fuerte.' };
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(company_schema_1.Company.name)),
    __param(2, (0, mongoose_1.InjectModel)(job_schema_1.Job.name)),
    __param(3, (0, mongoose_1.InjectModel)(story_schema_1.Story.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], SeedService);
//# sourceMappingURL=seed.service.js.map