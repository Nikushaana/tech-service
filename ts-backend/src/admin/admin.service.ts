import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Not, Repository } from 'typeorm';
import { IndividualClient } from 'src/individual-client/entities/individual-client.entity';
import { CompanyClient } from 'src/company-client/entities/company-client.entity';
import { Technician } from 'src/technician/entities/technician.entity';
import { Order } from 'src/order/entities/order.entity';
import { Category } from 'src/category/entities/category.entity';
import { Faq } from 'src/faq/entities/faq.entity';
import { Address } from 'src/address/entities/address.entity';
import { BaseUserService } from 'src/common/services/base-user/base-user.service';
import { instanceToPlain } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { UpdateAdminIndividualOrTechnicianDto } from './dto/update-admin-individual-or-technician.dto';
import { UpdateAdminCompanyDto } from './dto/update-admin-company.dto';
import { UserFilterDto } from 'src/common/services/base-user/dto/user-filter.dto';
import { UpdateAdminOrderDto } from 'src/order/dto/update-admin-order.dto';
import { CreateCategoryDto } from 'src/category/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/category/dto/update-category.dto';
import { CreateFaqDto } from 'src/faq/dto/create-faq.dto';
import { UpdateFaqDto } from 'src/faq/dto/update-category.dto';
import { CloudinaryProvider } from 'src/common/cloudinary/cloudinary.provider';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { Review } from 'src/reviews/entities/review.entity';
import { UpdateReviewDto } from 'src/reviews/dto/update-review.dto';
import { CreateBranchDto } from 'src/branches/dto/create-branch.dto';
import { Branch } from 'src/branches/entities/branches.entity';
import { UpdateBranchDto } from 'src/branches/dto/update-branch.dto';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private adminRepo: Repository<Admin>,

        @InjectRepository(IndividualClient)
        private individualClientRepo: Repository<IndividualClient>,

        @InjectRepository(CompanyClient)
        private companyClientRepo: Repository<CompanyClient>,

        @InjectRepository(Technician)
        private technicianRepo: Repository<Technician>,

        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,

        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,

        @InjectRepository(Faq)
        private readonly faqRepo: Repository<Faq>,

        @InjectRepository(Address)
        private readonly addressRepo: Repository<Address>,

        @InjectRepository(Review)
        private readonly reviewRepo: Repository<Review>,

        @InjectRepository(Branch)
        private readonly branchRepo: Repository<Branch>,

        private readonly baseUserService: BaseUserService,

        private readonly cloudinaryService: CloudinaryService,
    ) { }

    // admin

    async getAdmin(adminId: number) {
        const findAdmin = await this.baseUserService.getUser(adminId, this.adminRepo);

        return instanceToPlain(findAdmin);
    }

    // individuals

    async getAdminIndividuals() {
        const findIndividuals = await this.baseUserService.getUsers(this.individualClientRepo);

        return instanceToPlain(findIndividuals);
    }

    async getAdminOneIndividual(individualId: number) {
        const findOneIndividual = await this.baseUserService.getUser(individualId, this.individualClientRepo);

        return instanceToPlain(findOneIndividual)
    }

    async updateAdminOneIndividual(individualId: number, updateAdminIndividualOrTechnicianDto: UpdateAdminIndividualOrTechnicianDto, images: Express.Multer.File[] = []) {
        const findOneIndividual = await this.baseUserService.getUser(individualId, this.individualClientRepo);

        if (updateAdminIndividualOrTechnicianDto.phone && updateAdminIndividualOrTechnicianDto.phone !== findOneIndividual.phone) {
            const phoneExists =
                (await this.individualClientRepo.findOne({
                    where: { phone: updateAdminIndividualOrTechnicianDto.phone },
                })) ||
                (await this.companyClientRepo.findOne({
                    where: { phone: updateAdminIndividualOrTechnicianDto.phone },
                }))
                ||
                (await this.technicianRepo.findOne({
                    where: { phone: updateAdminIndividualOrTechnicianDto.phone },
                })) ||
                (await this.adminRepo.findOne({
                    where: { phone: updateAdminIndividualOrTechnicianDto.phone },
                }));

            if (phoneExists) throw new ConflictException('phone is already in use');
        }

        if (updateAdminIndividualOrTechnicianDto.password) {
            updateAdminIndividualOrTechnicianDto.password = await bcrypt.hash(updateAdminIndividualOrTechnicianDto.password, 10);
        }

        let imagesToDeleteArray: string[] = [];
        if (updateAdminIndividualOrTechnicianDto.imagesToDelete) {
            try {
                imagesToDeleteArray = JSON.parse(updateAdminIndividualOrTechnicianDto.imagesToDelete);
            } catch (err) {
                throw new BadRequestException('imagesToDelete must be a JSON string array');
            }
        }

        // Then use imagesToDeleteArray in your deletion logic
        if (imagesToDeleteArray.length > 0) {
            await Promise.all(
                imagesToDeleteArray.map(async (url) => {
                    await this.cloudinaryService.deleteByUrl(url);
                    findOneIndividual.images = findOneIndividual.images.filter((img) => img !== url);
                }),
            );
        }

        // ✅ Check max limit before uploading
        const MAX_IMAGES = 1;
        const existingCount = findOneIndividual.images?.length || 0;
        const newCount = images?.length || 0;
        const totalAfterUpdate = existingCount + newCount;

        if (totalAfterUpdate > MAX_IMAGES) {
            throw new BadRequestException(
                `Allowed max ${MAX_IMAGES} image. (exists: ${existingCount}, new: ${newCount})`,
            );
        }

        // Upload images to Cloudinary if any
        const imageUrls = await this.cloudinaryService.uploadImages(
            images,
            'tech_service_project/images/individuals',
        );

        const updatedAdminIndividual = this.individualClientRepo.merge(findOneIndividual, updateAdminIndividualOrTechnicianDto);

        // Append new images to existing ones
        if (imageUrls.length > 0) {
            updatedAdminIndividual.images = [...(updatedAdminIndividual.images || []), ...imageUrls];
        }

        await this.individualClientRepo.save(updatedAdminIndividual);

        return {
            message: 'Individual updated successfully',
            user: instanceToPlain(updatedAdminIndividual),
        };
    }

    // companies

    async getAdminCompanies() {
        const findCompanies = await this.baseUserService.getUsers(this.companyClientRepo);

        return instanceToPlain(findCompanies);
    }

    async getAdminOneCompany(companyId: number) {
        const findOneCompany = await this.baseUserService.getUser(companyId, this.companyClientRepo);

        return instanceToPlain(findOneCompany)
    }

    async updateAdminOneCompany(companyId: number, updateAdminCompanyDto: UpdateAdminCompanyDto, images: Express.Multer.File[] = []) {
        const findOneCompany = await this.baseUserService.getUser(companyId, this.companyClientRepo);

        if (updateAdminCompanyDto.phone && updateAdminCompanyDto.phone !== findOneCompany.phone) {
            const phoneExists =
                (await this.individualClientRepo.findOne({
                    where: { phone: updateAdminCompanyDto.phone },
                })) ||
                (await this.companyClientRepo.findOne({
                    where: { phone: updateAdminCompanyDto.phone },
                }))
                ||
                (await this.technicianRepo.findOne({
                    where: { phone: updateAdminCompanyDto.phone },
                })) ||
                (await this.adminRepo.findOne({
                    where: { phone: updateAdminCompanyDto.phone },
                }));

            if (phoneExists) throw new ConflictException('phone is already in use');
        }

        if (updateAdminCompanyDto.password) {
            updateAdminCompanyDto.password = await bcrypt.hash(updateAdminCompanyDto.password, 10);
        }

        let imagesToDeleteArray: string[] = [];
        if (updateAdminCompanyDto.imagesToDelete) {
            try {
                imagesToDeleteArray = JSON.parse(updateAdminCompanyDto.imagesToDelete);
            } catch (err) {
                throw new BadRequestException('imagesToDelete must be a JSON string array');
            }
        }

        // Then use imagesToDeleteArray in your deletion logic
        if (imagesToDeleteArray.length > 0) {
            await Promise.all(
                imagesToDeleteArray.map(async (url) => {
                    await this.cloudinaryService.deleteByUrl(url);
                    findOneCompany.images = findOneCompany.images.filter((img) => img !== url);
                }),
            );
        }

        // ✅ Check max limit before uploading
        const MAX_IMAGES = 1;
        const existingCount = findOneCompany.images?.length || 0;
        const newCount = images?.length || 0;
        const totalAfterUpdate = existingCount + newCount;

        if (totalAfterUpdate > MAX_IMAGES) {
            throw new BadRequestException(
                `Allowed max ${MAX_IMAGES} image. (exists: ${existingCount}, new: ${newCount})`,
            );
        }

        // Upload images to Cloudinary if any
        const imageUrls = await this.cloudinaryService.uploadImages(
            images,
            'tech_service_project/images/companies',
        );

        const updatedAdminCompany = this.companyClientRepo.merge(findOneCompany, updateAdminCompanyDto);

        // Append new images to existing ones
        if (imageUrls.length > 0) {
            updatedAdminCompany.images = [...(updatedAdminCompany.images || []), ...imageUrls];
        }

        await this.companyClientRepo.save(updatedAdminCompany);

        return {
            message: 'Company updated successfully',
            user: instanceToPlain(updatedAdminCompany),
        };
    }

    // technicians

    async getAdminTechnicians(userFilterDto: UserFilterDto) {
        const findTechnicians = await this.baseUserService.getUsers(this.technicianRepo, userFilterDto);

        return instanceToPlain(findTechnicians);
    }

    async getAdminOneTechnician(technicianId: number) {
        const findOneTechnician = await this.baseUserService.getUser(technicianId, this.technicianRepo);

        return instanceToPlain(findOneTechnician)
    }

    async updateAdminOneTechnician(technicianId: number, updateAdminIndividualOrTechnicianDto: UpdateAdminIndividualOrTechnicianDto, images: Express.Multer.File[] = []) {
        const findOneTechnician = await this.baseUserService.getUser(technicianId, this.technicianRepo);

        if (updateAdminIndividualOrTechnicianDto.phone && updateAdminIndividualOrTechnicianDto.phone !== findOneTechnician.phone) {
            const phoneExists =
                (await this.individualClientRepo.findOne({
                    where: { phone: updateAdminIndividualOrTechnicianDto.phone },
                })) ||
                (await this.companyClientRepo.findOne({
                    where: { phone: updateAdminIndividualOrTechnicianDto.phone },
                }))
                ||
                (await this.technicianRepo.findOne({
                    where: { phone: updateAdminIndividualOrTechnicianDto.phone },
                })) ||
                (await this.adminRepo.findOne({
                    where: { phone: updateAdminIndividualOrTechnicianDto.phone },
                }));

            if (phoneExists) throw new ConflictException('phone is already in use');
        }

        if (updateAdminIndividualOrTechnicianDto.password) {
            updateAdminIndividualOrTechnicianDto.password = await bcrypt.hash(updateAdminIndividualOrTechnicianDto.password, 10);
        }

        let imagesToDeleteArray: string[] = [];
        if (updateAdminIndividualOrTechnicianDto.imagesToDelete) {
            try {
                imagesToDeleteArray = JSON.parse(updateAdminIndividualOrTechnicianDto.imagesToDelete);
            } catch (err) {
                throw new BadRequestException('imagesToDelete must be a JSON string array');
            }
        }

        // Then use imagesToDeleteArray in your deletion logic
        if (imagesToDeleteArray.length > 0) {
            await Promise.all(
                imagesToDeleteArray.map(async (url) => {
                    await this.cloudinaryService.deleteByUrl(url);
                    findOneTechnician.images = findOneTechnician.images.filter((img) => img !== url);
                }),
            );
        }

        // ✅ Check max limit before uploading
        const MAX_IMAGES = 1;
        const existingCount = findOneTechnician.images?.length || 0;
        const newCount = images?.length || 0;
        const totalAfterUpdate = existingCount + newCount;

        if (totalAfterUpdate > MAX_IMAGES) {
            throw new BadRequestException(
                `Allowed max ${MAX_IMAGES} image. (exists: ${existingCount}, new: ${newCount})`,
            );
        }

        // Upload images to Cloudinary if any
        const imageUrls = await this.cloudinaryService.uploadImages(
            images,
            'tech_service_project/images/technicians',
        );

        const updatedAdminTechnician = this.technicianRepo.merge(findOneTechnician, updateAdminIndividualOrTechnicianDto);

        // Append new images to existing ones
        if (imageUrls.length > 0) {
            updatedAdminTechnician.images = [...(updatedAdminTechnician.images || []), ...imageUrls];
        }

        await this.technicianRepo.save(updatedAdminTechnician);

        return {
            message: 'Technician updated successfully',
            user: instanceToPlain(updatedAdminTechnician),
        };
    }

    // orders

    async getOrders() {
        const orders = await this.orderRepo.find({
            order: { created_at: 'DESC' },
            relations: ['individual', 'company', 'technician'],
        });

        return instanceToPlain(orders);
    }

    async getOneOrder(id: number) {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: ['individual', 'company', 'technician'],
        });
        if (!order) throw new NotFoundException('Order not found');

        return instanceToPlain(order)
    }

    async updateOneOrder(id: number, updateAdminOrderDto: UpdateAdminOrderDto) {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: ['individual', 'company'],
        });
        if (!order) throw new NotFoundException('Order not found');

        const { addressId, technicianId, ...rest } = updateAdminOrderDto;

        if (addressId) {
            const relationKey = order.company ? 'company' : 'individual';
            const user = order[relationKey];
            if (!user) throw new NotFoundException(`${relationKey} not found for this order`);
            const userId = user.id;

            const address = await this.addressRepo.findOne({
                where: { id: addressId, [relationKey]: { id: userId } },
            });

            if (!address) throw new NotFoundException('Address not found');
            order.address = address;
        }

        if (technicianId !== undefined) {
            if (technicianId === null) {
                order.technician = null;
            } else {
                const technician = await this.technicianRepo.findOne({
                    where: { id: technicianId, status: true }
                });
                if (!technician) throw new NotFoundException('Technician not found or inactive');
                order.technician = technician;
            }
        }

        this.orderRepo.merge(order, rest);
        await this.orderRepo.save(order);

        return {
            message: 'Order updated successfully',
            order: instanceToPlain(order),
        };
    }

    // categories

    async createCategory(createCategoryDto: CreateCategoryDto) {
        const existing = await this.categoryRepo.findOne({ where: { name: createCategoryDto.name } });
        if (existing) throw new BadRequestException('Category already exists');

        const category = this.categoryRepo.create({
            ...createCategoryDto
        });

        await this.categoryRepo.save(category);

        return { message: 'Category created successfully', category };
    }

    async getCategories() {
        const categories = await this.categoryRepo.find({
            order: { created_at: 'DESC' },
        });

        return categories;
    }

    async getOneCategory(id: number) {
        const category = await this.categoryRepo.findOne({
            where: { id },
        });
        if (!category) throw new NotFoundException('Category not found');

        return category
    }

    async updateOneCategory(id: number, updateCategoryDto: UpdateCategoryDto, images: Express.Multer.File[] = []) {
        const category = await this.categoryRepo.findOne({ where: { id } });
        if (!category) throw new NotFoundException('Category not found');

        let imagesToDeleteArray: string[] = [];
        if (updateCategoryDto.imagesToDelete) {
            try {
                imagesToDeleteArray = JSON.parse(updateCategoryDto.imagesToDelete);
            } catch (err) {
                throw new BadRequestException('imagesToDelete must be a JSON string array');
            }
        }

        // Then use imagesToDeleteArray in your deletion logic
        if (imagesToDeleteArray.length > 0) {
            await Promise.all(
                imagesToDeleteArray.map(async (url) => {
                    await this.cloudinaryService.deleteByUrl(url);
                    category.images = category.images.filter((img) => img !== url);
                }),
            );
        }

        // ✅ Check max limit before uploading
        const MAX_IMAGES = 1;
        const existingCount = category.images?.length || 0;
        const newCount = images?.length || 0;
        const totalAfterUpdate = existingCount + newCount;

        if (totalAfterUpdate > MAX_IMAGES) {
            throw new BadRequestException(
                `Allowed max ${MAX_IMAGES} image. (exists: ${existingCount}, new: ${newCount})`,
            );
        }

        // Upload images to Cloudinary if any
        const imageUrls = await this.cloudinaryService.uploadImages(
            images,
            'tech_service_project/images/categories',
        );

        // Merge updates
        const updatedCategory = this.categoryRepo.merge(category, updateCategoryDto);

        // Append new images to existing ones
        if (imageUrls.length > 0) {
            updatedCategory.images = [...(updatedCategory.images || []), ...imageUrls];
        }

        await this.categoryRepo.save(updatedCategory);

        return { message: 'Category updated successfully', category };
    }

    async deleteCategory(id: number) {
        const category = await this.categoryRepo.findOne({
            where: { id },
            relations: ['orders'], // load related orders
        });

        if (!category) throw new NotFoundException('Category not found');

        // Check if there are related orders
        if (category.orders && category.orders.length > 0) {
            throw new BadRequestException('Cannot delete category with existing orders');
        }

        // Delete images from Cloudinary if any
        if (category.images && category.images.length > 0) {
            await Promise.all(
                category.images.map((url) => this.cloudinaryService.deleteByUrl(url)),
            );
        }

        // Delete category
        await this.categoryRepo.remove(category);

        return {
            message: 'Category deleted successfully',
        };
    }

    // faqs

    async createFaq(createFaqDto: CreateFaqDto) {
        const faq = this.faqRepo.create({
            ...createFaqDto,
        });

        await this.faqRepo.save(faq);

        return { message: `Faq created successfully`, faq };
    }

    async getFaqs() {
        const faqs = await this.faqRepo.find({
            order: { order: 'ASC' },
        });

        return faqs;
    }

    async getOneFaq(id: number) {
        const faq = await this.faqRepo.findOne({
            where: { id },
        });
        if (!faq) throw new NotFoundException('Faq not found');

        return faq
    }

    async updateOneFaq(
        id: number,
        updateFaqDto: UpdateFaqDto
    ) {
        const faq = await this.faqRepo.findOne({
            where: { id },
        });
        if (!faq) throw new NotFoundException('Faq not found');

        // Merge updates
        this.faqRepo.merge(faq, {
            ...updateFaqDto
        });

        await this.faqRepo.save(faq);

        return {
            message: 'Faq updated successfully',
            faq
        };
    }

    async deleteFaq(id: number) {
        const faq = await this.faqRepo.findOne({
            where: { id },
        });

        if (!faq) throw new NotFoundException('Faq not found');

        // Delete faq
        await this.faqRepo.remove(faq);

        return {
            message: 'Faq deleted successfully',
        };
    }

    // addresses

    async getAddresses() {
        const addresses = await this.addressRepo.find({
            order: { created_at: 'DESC' },
        });

        return addresses;
    }

    async getUserAddresses(userId: number, role: 'individual' | 'company') {
        const addresses = await this.addressRepo.find({
            where: { [role]: { id: userId } },
            order: { created_at: 'DESC' },
        });

        return addresses;
    }

    // reviews

    async getReviews() {
        const reviews = await this.reviewRepo.find({
            order: { created_at: 'DESC' }, relations: ['individual', 'company'],
        });

        return reviews;
    }

    async getOneReview(id: number) {
        const review = await this.reviewRepo.findOne({
            where: { id }, relations: ['individual', 'company']
        });
        if (!review) throw new NotFoundException('Review not found');

        return instanceToPlain(review)
    }

    async updateOneReview(
        id: number,
        updateReviewDto: UpdateReviewDto
    ) {
        const review = await this.reviewRepo.findOne({
            where: { id },
        });
        if (!review) throw new NotFoundException('Review not found');

        // Merge updates
        this.reviewRepo.merge(review, {
            ...updateReviewDto
        });

        await this.reviewRepo.save(review);

        return {
            message: 'Review updated successfully',
            review
        };
    }

    async deleteReview(id: number) {
        const review = await this.reviewRepo.findOne({
            where: { id },
        });

        if (!review) throw new NotFoundException('Review not found');

        // Delete faq
        await this.reviewRepo.remove(review);

        return {
            message: 'Review deleted successfully',
        };
    }

    // branches

    async createBranch(createBranchDto: CreateBranchDto) {
        const existing = await this.branchRepo.findOne({ where: { name: createBranchDto.name } });
        if (existing) throw new BadRequestException('Branch already exists');

        const branch = this.branchRepo.create({
            ...createBranchDto
        });

        await this.branchRepo.save(branch);

        return { message: 'Branch created successfully', branch };
    }

    async getBranches() {
        const branches = await this.branchRepo.find();

        return branches;
    }

    async getOneBranch(id: number) {
        const branch = await this.branchRepo.findOne({
            where: { id }
        });
        if (!branch) throw new NotFoundException('Branch not found');

        return branch
    }

    async updateOneBranch(
        id: number,
        updateBranchDto: UpdateBranchDto
    ) {
        const branch = await this.branchRepo.findOne({
            where: { id },
        });
        if (!branch) throw new NotFoundException('Branch not found');

        // Merge updates
        this.branchRepo.merge(branch, {
            ...updateBranchDto
        });

        await this.branchRepo.save(branch);

        return {
            message: 'Branch updated successfully',
            branch
        };
    }

    async deleteBranch(id: number) {
        const branch = await this.branchRepo.findOne({
            where: { id },
        });

        if (!branch) throw new NotFoundException('Branch not found');

        // Delete branch
        await this.branchRepo.remove(branch);

        return {
            message: 'Branch deleted successfully',
        };
    }
}
