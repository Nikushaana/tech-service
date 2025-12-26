import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { BaseUserService } from 'src/common/services/base-user/base-user.service';
import { getDistanceFromLatLonInKm } from 'src/common/utils/geo.utils';
import { instanceToPlain } from 'class-transformer';
import { Category } from 'src/category/entities/category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/address/entities/address.entity';
import { Order } from './entities/order.entity';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UpdateUserOrderDto } from './dto/update-user-order.dto';
import { UpdateAdminOrderDto } from './dto/update-admin-order.dto';
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { Technician } from 'src/technician/entities/technician.entity';
import { BranchesService } from 'src/branches/branches.service';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,

        @InjectRepository(Category)
        private readonly categoryRepo: Repository<Category>,

        @InjectRepository(Address)
        private readonly addressRepo: Repository<Address>,

        @InjectRepository(Technician)
        private technicianRepo: Repository<Technician>,

        @InjectRepository(Delivery)
        private deliveryRepo: Repository<Delivery>,

        private readonly baseUserService: BaseUserService,

        private readonly cloudinaryService: CloudinaryService,

        private readonly notificationService: NotificationsService,

        private readonly branchesService: BranchesService,
    ) { }

    // individual and company
    async createOrder(userId: number, repo: any, createOrderDto: CreateOrderDto, images: Express.Multer.File[] = [], videos: Express.Multer.File[] = []) {
        const user = await this.baseUserService.getUser(userId, repo);

        if (!user.status) {
            throw new BadRequestException('Inactive user cannot create orders');
        }

        const category = await this.categoryRepo.findOne({ where: { id: createOrderDto.categoryId, status: true } });
        if (!category) throw new NotFoundException('Category not found');

        const relationKey = "companyName" in user ? "company" : "individual";

        const address = await this.addressRepo.findOne({ where: { id: createOrderDto.addressId, [relationKey]: { id: userId } } });
        if (!address) throw new NotFoundException('Address not found');

        const branches = await this.branchesService.getBranches();
        if (!branches.length) throw new BadRequestException('No branches available — cannot add order');

        // Check if location is within any branch coverage
        const isWithinCoverage = branches.some((branch) => {
            const distance = getDistanceFromLatLonInKm(
                address.location.lat,
                address.location.lng,
                branch.location.lat,
                branch.location.lng
            );
            return distance <= Number(branch.coverage_radius_km);
        });

        if (!isWithinCoverage) {
            throw new BadRequestException(
                'Address is outside all branch coverage areas. Please choose a closer location.'
            );
        }

        const order = this.orderRepo.create({
            ...createOrderDto,
            category,
            address
        });

        if ("companyName" in user) {
            order.company = user;
        } else {
            order.individual = user;
        }

        await this.orderRepo.save(order);

        // Upload images to Cloudinary if any
        const imageUrls = images.length
            ? await this.cloudinaryService.uploadImages(images, `tech_service_project/images/orders/${order.id}`)
            : [];

        const videoUrls = videos.length
            ? await this.cloudinaryService.uploadVideos(videos, `tech_service_project/videos/orders/${order.id}`)
            : [];

        order.images = imageUrls;
        order.videos = videoUrls;

        await this.orderRepo.save(order);

        // send notification to admin
        await this.notificationService.sendNotification(
            `დაემატა განაცხადი ${("companyName" in user ? user.companyName : (user.name + " " + user.lastName))}-ს მიერ. (${order.service_type})`,
            'new_order',
            'admin',
            undefined,
            {
                order_id: order.id
            },
        );

        // send notification to user
        await this.notificationService.sendNotification(
            `თქვენი განაცხადი ${order.service_type}-ს შესახებ დაემატა.`,
            "new_order",
            user.role,
            userId,
            {
                order_id: order.id
            },
        );

        return { message: `Order created successfully`, order: instanceToPlain(order) };
    }

    async getOrders(userId: number, repo: any) {
        const user = await this.baseUserService.getUser(userId, repo);

        const relationKey = "companyName" in user ? "company" : "individual";

        const orders = await this.orderRepo.find({
            where: { [relationKey]: { id: userId } },
            order: { created_at: 'DESC' },
        });

        return orders;
    }

    async getOneOrder(userId: number, id: number, repo: any) {
        const user = await this.baseUserService.getUser(userId, repo);

        const relationKey = "companyName" in user ? "company" : "individual";

        const order = await this.orderRepo.findOne({
            where: { [relationKey]: { id: userId }, id },
        });
        if (!order) throw new NotFoundException('Order not found');

        return order
    }

    async updateOneOrder(userId: number, id: number, repo: any, updateUserOrderDto: UpdateUserOrderDto, images: Express.Multer.File[] = [], videos: Express.Multer.File[] = []) {
        const user = await this.baseUserService.getUser(userId, repo);

        if (!user.status) {
            throw new BadRequestException('Inactive user cannot update orders');
        }

        const relationKey = "companyName" in user ? "company" : "individual";

        const order = await this.orderRepo.findOne({
            where: { [relationKey]: { id: userId }, id },
        });
        if (!order) throw new NotFoundException('Order not found');

        if (order.status !== 'pending') {
            throw new BadRequestException('Only pending orders can be updated');
        }

        if (updateUserOrderDto.categoryId) {
            const category = await this.categoryRepo.findOne({
                where: { id: updateUserOrderDto.categoryId, status: true },
            });
            if (!category) throw new NotFoundException('Category not found');
            order.category = category;
        }

        if (updateUserOrderDto.addressId) {
            const address = await this.addressRepo.findOne({
                where: { id: updateUserOrderDto.addressId, [relationKey]: { id: userId } },
            });
            if (!address) throw new NotFoundException('Address not found');

            const branches = await this.branchesService.getBranches();
            if (!branches.length) throw new BadRequestException('No branches available — cannot add order');

            // Check if location is within any branch coverage
            const isWithinCoverage = branches.some((branch) => {
                const distance = getDistanceFromLatLonInKm(
                    address.location.lat,
                    address.location.lng,
                    branch.location.lat,
                    branch.location.lng
                );
                return distance <= Number(branch.coverage_radius_km);
            });

            if (!isWithinCoverage) {
                throw new BadRequestException(
                    'Address is outside all branch coverage areas. Please choose a closer location.'
                );
            }

            order.address = address;
        }

        // Handle deleted media
        let imagesToDeleteArray: string[] = [];
        let videosToDeleteArray: string[] = [];

        if (updateUserOrderDto.imagesToDelete) {
            try {
                imagesToDeleteArray = JSON.parse(updateUserOrderDto.imagesToDelete);
            } catch (err) {
                throw new BadRequestException('imagesToDelete must be a JSON string array');
            }
        }

        if (updateUserOrderDto.videosToDelete) {
            try {
                videosToDeleteArray = JSON.parse(updateUserOrderDto.videosToDelete);
            } catch (err) {
                throw new BadRequestException('videosToDeleteArray must be a JSON string array');
            }
        }

        // Then use imagesToDeleteArray and videosToDeleteArray in your deletion logic
        if (imagesToDeleteArray.length > 0) {
            await Promise.all(
                imagesToDeleteArray.map(async (url) => {
                    await this.cloudinaryService.deleteByUrl(url);
                    order.images = order.images.filter((img) => img !== url);
                }),
            );
        }
        if (videosToDeleteArray.length > 0) {
            await Promise.all(
                videosToDeleteArray.map(async (url) => {
                    await this.cloudinaryService.deleteByUrl(url);
                    order.videos = order.videos.filter((img) => img !== url);
                }),
            );
        }

        // Merge with existing media but respect total limits
        const existingImages = order.images || [];
        const existingVideos = order.videos || [];

        const totalImages = existingImages.length + images.length;
        const totalVideos = existingVideos.length + videos.length;

        if (totalImages > 3) {
            throw new BadRequestException('Total number of images cannot exceed 3');
        }

        if (totalVideos > 1) {
            throw new BadRequestException('Total number of videos cannot exceed 1');
        }

        // Upload images to Cloudinary if any
        const newImageUrls = images.length
            ? await this.cloudinaryService.uploadImages(images, `tech_service_project/images/orders/${order.id}`)
            : [];

        const newVideoUrls = videos.length
            ? await this.cloudinaryService.uploadVideos(videos, `tech_service_project/videos/orders/${order.id}`)
            : [];

        order.images = [...existingImages, ...newImageUrls];
        order.videos = [...existingVideos, ...newVideoUrls];

        const { categoryId, addressId, ...rest } = updateUserOrderDto;
        this.orderRepo.merge(order, rest);
        await this.orderRepo.save(order);

        return {
            message: 'Order updated successfully',
            order,
        };
    }

    // admin
    async getAdminOrders() {
        const orders = await this.orderRepo.find({
            order: { created_at: 'DESC' },
            relations: ['individual', 'company', 'technician', 'delivery'],
        });

        return instanceToPlain(orders);
    }

    async findAdminOneOrderEntity(id: number) {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: ['individual', 'company', 'technician', 'delivery'],
        });
        if (!order) throw new NotFoundException('Order not found');

        return order
    }

    async getAdminOneOrder(id: number) {
        const order = await this.findAdminOneOrderEntity(id)

        return instanceToPlain(order)
    }

    async updateAdminOneOrder(id: number, updateAdminOrderDto: UpdateAdminOrderDto) {
        const order = await this.findAdminOneOrderEntity(id)

        const { addressId, technicianId, deliveryId, ...rest } = updateAdminOrderDto;

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

        if (deliveryId !== undefined) {
            if (deliveryId === null) {
                order.delivery = null;
            } else {
                const delivery = await this.deliveryRepo.findOne({
                    where: { id: deliveryId, status: true }
                });
                if (!delivery) throw new NotFoundException('Delivery not found or inactive');
                order.delivery = delivery;
            }
        }

        this.orderRepo.merge(order, rest);
        await this.orderRepo.save(order);

        return {
            message: 'Order updated successfully',
            order: instanceToPlain(order),
        };
    }

    async getOrderStats() {
        const orders = await this.getAdminOrders();

        const ordersByMonth = orders.reduce((acc, order) => {
            const date = new Date(order.created_at);
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
            acc[yearMonth] = (acc[yearMonth] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const stats = Object.keys(ordersByMonth)
            .sort()
            .map((month) => ({
                date: month,
                orders: ordersByMonth[month],
            }));

        return stats;
    }

    // delivery
    async getDeliveryOrders(deliveryId: number) {
        const orders = await this.orderRepo.find({
            where: { delivery: { id: deliveryId } },
            order: { created_at: 'DESC' },
            relations: ['individual', 'company', 'technician'],
        });

        return instanceToPlain(orders);
    }

    async getDeliveryOneOrder(deliveryId: number, id: number) {
        const order = await this.orderRepo.findOne({
            where: { id, delivery: { id: deliveryId } },
            relations: ['individual', 'company', 'technician'],
        });
        if (!order) throw new NotFoundException('Order not found');

        return instanceToPlain(order)
    }

    // technician
    async getTechnicianOrders(technicianId: number) {
        const orders = await this.orderRepo.find({
            where: { technician: { id: technicianId } },
            order: { created_at: 'DESC' },
            relations: ['individual', 'company', 'delivery'],
        });

        return instanceToPlain(orders);
    }

    async getTechnicianOneOrder(technicianId: number, id: number) {
        const order = await this.orderRepo.findOne({
            where: { id, technician: { id: technicianId } },
            relations: ['individual', 'company', 'delivery'],
        });
        if (!order) throw new NotFoundException('Order not found');

        return instanceToPlain(order)
    }
}
