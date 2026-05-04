import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User } from '../users/schemas/user.schema';
import { Company } from '../companies/schemas/company.schema';
import { Job } from '../jobs/schemas/job.schema';
import { Story } from '../stories/schemas/story.schema';
import { CreateUserData } from '../users/users.service';
interface SeedUser extends CreateUserData {
  location: string;
  bio: string;
  skills: string[];
  profilePicture: string;
}
@Injectable()
export class SeedService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Company.name) private companyModel: Model<Company>,
    @InjectModel(Job.name) private jobModel: Model<Job>,
    @InjectModel(Story.name) private storyModel: Model<Story>,
  ) {}
  async runSeed() {
    await this.userModel.deleteMany({});
    await this.companyModel.deleteMany({});
    await this.jobModel.deleteMany({});
    await this.storyModel.deleteMany({});
    const companies = await this.companyModel.insertMany([
      { name: 'Amazon',      industry: 'Technology',       description: 'Líder mundial en e-commerce y cloud computing (AWS).', domain: 'amazon.com',      availableJobs: 5  },
      { name: 'Microsoft',   industry: 'Technology',       description: 'Software, cloud y productividad empresarial.',          domain: 'microsoft.com',   availableJobs: 3  },
      { name: 'Google',      industry: 'Technology',       description: 'Búsqueda, publicidad y servicios en la nube.',          domain: 'google.com',      availableJobs: 8  },
      { name: 'Bancolombia', industry: 'Finance & Banking', description: 'Banco líder en Colombia con presencia regional.',      domain: 'bancolombia.com', availableJobs: 12 },
    ]);
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const SEED_USERS = [
      { name: 'Carlos Mendoza',   email: 'carlos.mendoza@alliance.dev',   gender: 'men',   n: 1  },
      { name: 'Laura Gómez',      email: 'laura.gomez@alliance.dev',      gender: 'women', n: 2  },
      { name: 'Andrés Torres',    email: 'andres.torres@alliance.dev',    gender: 'men',   n: 3  },
      { name: 'Valentina Ríos',   email: 'valentina.rios@alliance.dev',   gender: 'women', n: 4  },
      { name: 'Miguel Herrera',   email: 'miguel.herrera@alliance.dev',   gender: 'men',   n: 5  },
      { name: 'Isabella Castro',  email: 'isabella.castro@alliance.dev',  gender: 'women', n: 6  },
      { name: 'Daniel Vargas',    email: 'daniel.vargas@alliance.dev',    gender: 'men',   n: 7  },
      { name: 'Sofía Jiménez',    email: 'sofia.jimenez@alliance.dev',    gender: 'women', n: 8  },
      { name: 'Felipe Moreno',    email: 'felipe.moreno@alliance.dev',    gender: 'men',   n: 9  },
      { name: 'Camila Pedraza',   email: 'camila.pedraza@alliance.dev',   gender: 'women', n: 10 },
    ];
    const users: SeedUser[] = SEED_USERS.map(({ name, email, gender, n }) => ({
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
      // Amazon — 5 vacantes
      { title: 'Backend Developer (NestJS)',   company: companies[0]._id, location: 'Remoto',         salaryRange: '$8M - $12M COP',  description: 'Diseña y escala microservicios de alto tráfico en AWS.',           tags: ['NestJS', 'Node.js', 'AWS'] },
      { title: 'DevOps Engineer',              company: companies[0]._id, location: 'Bogotá / Remoto', salaryRange: '$10M - $15M COP', description: 'Automatiza pipelines CI/CD y gestiona infraestructura en la nube.',  tags: ['AWS', 'Docker', 'Terraform'] },
      { title: 'Frontend Developer (React)',   company: companies[0]._id, location: 'Remoto',         salaryRange: '$7M - $10M COP',  description: 'Construye interfaces de alto rendimiento para millones de usuarios.', tags: ['React', 'TypeScript', 'Next.js'] },
      { title: 'Data Engineer',                company: companies[0]._id, location: 'Remoto',         salaryRange: '$9M - $14M COP',  description: 'Diseña pipelines de datos a escala para Amazon Analytics.',          tags: ['Python', 'Spark', 'AWS Glue'] },
      { title: 'Product Manager',              company: companies[0]._id, location: 'Bogotá',         salaryRange: '$12M - $18M COP', description: 'Lidera el roadmap de productos digitales en América Latina.',         tags: ['Agile', 'Scrum', 'Product'] },
      // Microsoft — 3 vacantes
      { title: '.NET Developer',               company: companies[1]._id, location: 'Remoto',         salaryRange: '$7M - $11M COP',  description: 'Desarrolla soluciones empresariales en el ecosistema Microsoft.',    tags: ['.NET', 'C#', 'Azure'] },
      { title: 'Azure Cloud Architect',        company: companies[1]._id, location: 'Medellín / Remoto', salaryRange: '$14M - $20M COP', description: 'Diseña arquitecturas cloud nativas para clientes corporativos.',  tags: ['Azure', 'Cloud', 'Architecture'] },
      { title: 'UX Designer',                  company: companies[1]._id, location: 'Remoto',         salaryRange: '$6M - $9M COP',   description: 'Crea experiencias de usuario para productos Microsoft 365.',          tags: ['Figma', 'UX', 'Design System'] },
      // Google — 8 vacantes
      { title: 'Software Engineer L4',         company: companies[2]._id, location: 'Remoto',         salaryRange: '$15M - $22M COP', description: 'Trabaja en productos usados por miles de millones de personas.',      tags: ['Go', 'Java', 'Distributed Systems'] },
      { title: 'Machine Learning Engineer',    company: companies[2]._id, location: 'Remoto',         salaryRange: '$16M - $25M COP', description: 'Entrena y despliega modelos de ML a escala global.',                  tags: ['Python', 'TensorFlow', 'ML'] },
      { title: 'Android Developer',            company: companies[2]._id, location: 'Remoto',         salaryRange: '$10M - $15M COP', description: 'Desarrolla features para el sistema operativo más usado del mundo.',   tags: ['Kotlin', 'Android', 'Jetpack'] },
      { title: 'Go Backend Engineer',          company: companies[2]._id, location: 'Remoto',         salaryRange: '$12M - $18M COP', description: 'Construye servicios internos de baja latencia con Go.',               tags: ['Go', 'gRPC', 'Kubernetes'] },
      { title: 'Site Reliability Engineer',    company: companies[2]._id, location: 'Bogotá',         salaryRange: '$14M - $20M COP', description: 'Mantén la disponibilidad de servicios críticos al 99.99%.',           tags: ['SRE', 'Kubernetes', 'Monitoring'] },
      { title: 'Technical Program Manager',    company: companies[2]._id, location: 'Remoto',         salaryRange: '$13M - $19M COP', description: 'Coordina proyectos de ingeniería multidisciplinarios.',               tags: ['Agile', 'Program Management'] },
      { title: 'Data Scientist',               company: companies[2]._id, location: 'Remoto',         salaryRange: '$11M - $17M COP', description: 'Analiza datos a escala para mejorar los productos de Google.',        tags: ['Python', 'BigQuery', 'Statistics'] },
      { title: 'Security Engineer',            company: companies[2]._id, location: 'Remoto',         salaryRange: '$12M - $18M COP', description: 'Protege la infraestructura de Google de amenazas externas.',          tags: ['Security', 'Pentesting', 'GCP'] },
      // Bancolombia — 12 vacantes
      { title: 'Desarrollador Java Backend',   company: companies[3]._id, location: 'Medellín',       salaryRange: '$6M - $9M COP',   description: 'Desarrolla servicios bancarios de alta disponibilidad.',             tags: ['Java', 'Spring Boot', 'Microservices'] },
      { title: 'Analista de Datos',            company: companies[3]._id, location: 'Medellín / Remoto', salaryRange: '$5M - $7M COP', description: 'Analiza datos transaccionales para detectar patrones de negocio.',  tags: ['SQL', 'Power BI', 'Python'] },
      { title: 'Líder de Proyecto TI',         company: companies[3]._id, location: 'Medellín',       salaryRange: '$10M - $14M COP', description: 'Lidera equipos de desarrollo en proyectos de transformación digital.', tags: ['PMP', 'Agile', 'Leadership'] },
      { title: 'Analista de Seguridad',        company: companies[3]._id, location: 'Medellín',       salaryRange: '$7M - $10M COP',  description: 'Monitorea amenazas y asegura la infraestructura bancaria.',           tags: ['SIEM', 'SOC', 'Cybersecurity'] },
      { title: 'Desarrollador Frontend (Angular)', company: companies[3]._id, location: 'Remoto',     salaryRange: '$5M - $8M COP',   description: 'Construye interfaces del portal web de Bancolombia.',               tags: ['Angular', 'TypeScript', 'RxJS'] },
      { title: 'Arquitecto de Software',       company: companies[3]._id, location: 'Medellín',       salaryRange: '$14M - $20M COP', description: 'Define estándares técnicos y arquitectura de plataformas digitales.', tags: ['Architecture', 'Cloud', 'Java'] },
      { title: 'Scrum Master',                 company: companies[3]._id, location: 'Medellín / Remoto', salaryRange: '$6M - $9M COP', description: 'Facilita ceremonias ágiles y acompaña equipos de desarrollo.',      tags: ['Scrum', 'Agile', 'Coaching'] },
      { title: 'DevOps Engineer',              company: companies[3]._id, location: 'Medellín',       salaryRange: '$8M - $12M COP',  description: 'Automatiza despliegues y gestiona la infraestructura bancaria.',     tags: ['Jenkins', 'Docker', 'Kubernetes'] },
      { title: 'Mobile Developer (iOS)',       company: companies[3]._id, location: 'Remoto',         salaryRange: '$7M - $11M COP',  description: 'Desarrolla la app móvil de Bancolombia para iOS.',                  tags: ['Swift', 'iOS', 'Xcode'] },
      { title: 'Analista de QA',               company: companies[3]._id, location: 'Medellín',       salaryRange: '$4.5M - $6.5M COP', description: 'Asegura la calidad de los sistemas bancarios core.',              tags: ['QA', 'Selenium', 'Testing'] },
      { title: 'Gerente de Producto Digital',  company: companies[3]._id, location: 'Medellín',       salaryRange: '$12M - $16M COP', description: 'Define la visión y estrategia del portafolio digital.',              tags: ['Product', 'Fintech', 'Strategy'] },
      { title: 'Especialista en Ciberseguridad', company: companies[3]._id, location: 'Medellín',     salaryRange: '$9M - $13M COP',  description: 'Implementa estrategias de defensa para activos bancarios críticos.', tags: ['Cybersecurity', 'ISO 27001', 'SIEM'] },
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
}
