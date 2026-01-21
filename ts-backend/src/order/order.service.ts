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
import { OrderStatus } from 'src/common/types/order-status.enum';
import { RepairDecisionDto } from './dto/repair-decision.dto';
import { OrderType } from 'src/common/types/order-type.enum';
import { TechnicianRequestPaymentDto } from './dto/technician-request-payment.dto';
import { OrderTypeLabelsGeorgian } from 'src/common/labels/order-type-labels';
import { OrderStatusLabelsGeorgian } from 'src/common/labels/order-status-labels';
import { PricingService } from 'src/pricing/pricing.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { TransactionType } from 'src/common/types/transaction-type.enum';
import { PaymentProvider } from 'src/common/types/payment-provider.enum';

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

        private readonly pricingService: PricingService,

        private readonly transactionsService: TransactionsService,
    ) { }

    // order status changes
    private assertStatus(
        current: OrderStatus,
        allowed: OrderStatus[],
        action: string
    ) {
        if (!allowed.includes(current)) {
            throw new BadRequestException(
                `Cannot ${action} when order status is "${current}"`
            );
        }
    }

    // order status update notification
    private async notifyOrderStatusUpdate(
        order: Order,
        roles: Array<{ role: "admin" | "company" | "individual" | "delivery" | "technician"; id?: number }>
    ) {
        const label = OrderStatusLabelsGeorgian[order.status] || order.status;

        for (const r of roles) {
            await this.notificationService.sendNotification(
                `შეკვეთა №${order.id}: ${label}.`,
                'order_updated',
                r.role,
                r.id,
                { order_id: order.id }
            );
        }
    }

    // order service type update notification
    private async notifyOrderServiceTypeUpdate(
        order: Order,
        roles: Array<{ role: "admin" | "company" | "individual" | "delivery" | "technician"; id?: number }>
    ) {
        const label = OrderTypeLabelsGeorgian[order.service_type] || order.service_type;

        for (const r of roles) {
            await this.notificationService.sendNotification(
                `შეკვეთა №${order.id}: ახალი სერვისის ტიპი - ${label}.`,
                'order_updated',
                r.role,
                r.id,
                { order_id: order.id }
            );
        }
    }

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
            return distance <= branch.coverage_radius_km;
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
        if (images.length || videos.length) {
            const imageUrls = images.length
                ? await this.cloudinaryService.uploadImages(images, `tech_service_project/images/orders/${order.id}`)
                : [];

            const videoUrls = videos.length
                ? await this.cloudinaryService.uploadVideos(videos, `tech_service_project/videos/orders/${order.id}`)
                : [];

            order.images = imageUrls;
            order.videos = videoUrls;

            await this.orderRepo.save(order);
        }

        // Calculate price
        const { price } = await this.pricingService.calculatePrice({
            addressId: createOrderDto.addressId,
            service_type: createOrderDto.service_type,
        });

        // 1. payment

        // Create transaction for this order
        await this.transactionsService.createTransaction({
            amount: price,
            reason: `Payment for creating order №${order.id}`,
            type: TransactionType.DEBIT,
            provider: PaymentProvider.BOG,
            individualId: "companyName" in user ? undefined : user.id,
            companyId: "companyName" in user ? user.id : undefined,
            orderId: order.id
        });
 
        const serviceTypeLabel = OrderTypeLabelsGeorgian[order.service_type] || order.service_type;

        // // send notification to admin
        // await this.notificationService.sendNotification(
        //     `შეკვეთა №${order.id}: განაცხადი "${serviceTypeLabel}"-ს შესახებ დაემატა "${("companyName" in user ? user.companyName : (user.name + " " + user.lastName))}"-ს მიერ.`,
        //     'new_order',
        //     'admin',
        //     undefined,
        //     {
        //         order_id: order.id
        //     },
        // );

        // send notification to user
        await this.notificationService.sendNotification(
            `შეკვეთა №${order.id}: დაემატა "${serviceTypeLabel}"-ს შესახებ და ელოდება ანგარიშსწორებას.`,
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

    async getOneOrderEntity(userId: number, id: number, repo: any) {
        const user = await this.baseUserService.getUser(userId, repo);

        const relationKey = "companyName" in user ? "company" : "individual";

        const order = await this.orderRepo.findOne({
            where: { [relationKey]: { id: userId }, id },
            relations: ['company', 'individual', 'technician', 'delivery'],
        });
        if (!order) throw new NotFoundException('Order not found');

        return order
    }

    async getOneOrder(userId: number, id: number, repo: any) {
        const order = await this.getOneOrderEntity(userId, id, repo);
        return instanceToPlain(order);
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
                return distance <= branch.coverage_radius_km;
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

        if (
            updateAdminOrderDto.status !== undefined &&
            updateAdminOrderDto.status === order.status
        ) {
            throw new BadRequestException(
                'The new status must be different from the current status.'
            );
        }

        const { technicianId, deliveryId, ...rest } = updateAdminOrderDto;

        const oldDelivery = order.delivery;
        const oldTechnician = order.technician;
        const oldStatus = order.status;
        const oldServiceType = order.service_type;

        if (technicianId) {
            const technician = await this.technicianRepo.findOne({
                where: { id: technicianId, status: true }
            });
            if (!technician) throw new NotFoundException('Technician not found or inactive');

            if (oldTechnician?.id !== technicianId) {
                // send notification to admin
                await this.notificationService.sendNotification(
                    `შეკვეთა №${order.id}: ${oldTechnician?.id
                        ? `დაენიშნა ახალი ტექნიკოსი — ${technician.name} ${technician.lastName}, ${oldTechnician?.name} ${oldTechnician?.lastName}-ს ნაცვლად`
                        : `დაენიშნა ტექნიკოსი ${technician.name + " " + technician.lastName}`}`,
                    'order_updated',
                    'admin',
                    undefined,
                    {
                        order_id: order.id
                    },
                );
                {
                    oldTechnician?.id &&
                        // send notification to old technician
                        await this.notificationService.sendNotification(
                            `შეკვეთა №${order.id}: აღარ არის შენს სახელზე.`,
                            'order_updated',
                            'technician',
                            oldTechnician?.id,
                        );
                }
                // send notification to new technician
                await this.notificationService.sendNotification(
                    `შენ გაქვს ახალი შეკვეთა — №${order.id}.`,
                    'order_updated',
                    'technician',
                    technician.id,
                    {
                        order_id: order.id
                    },
                );
                // send notification to user
                await this.notificationService.sendNotification(
                    `შეკვეთა №${order.id}: ${oldTechnician?.id
                        ? `დაენიშნა ახალი ტექნიკოსი — ${technician.name} ${technician.lastName}, ${oldTechnician?.name} ${oldTechnician?.lastName}-ს ნაცვლად`
                        : `დაენიშნა ტექნიკოსი ${technician.name + " " + technician.lastName}`}`,
                    'order_updated',
                    `${order.company?.id ? "company" : "individual"}`,
                    order.company?.id || order.individual?.id,
                    {
                        order_id: order.id
                    },
                );
            }

            order.technician = technician;
        }

        if (deliveryId) {
            const delivery = await this.deliveryRepo.findOne({
                where: { id: deliveryId, status: true }
            });
            if (!delivery) throw new NotFoundException('Delivery not found or inactive');

            if (oldDelivery?.id !== deliveryId) {
                // send notification to admin
                await this.notificationService.sendNotification(
                    `შეკვეთა №${order.id}: ${oldDelivery?.id
                        ? `დაენიშნა ახალი კურიერი — ${delivery.name} ${delivery.lastName}, ${oldDelivery.name} ${oldDelivery.lastName}-ს ნაცვლად`
                        : `დაენიშნა კურიერი ${delivery.name + " " + delivery.lastName}`}`,
                    'order_updated',
                    'admin',
                    undefined,
                    {
                        order_id: order.id
                    },
                );
                {
                    oldDelivery?.id &&
                        // send notification to old delivery
                        await this.notificationService.sendNotification(
                            `შეკვეთა №${order.id}: აღარ არის შენს სახელზე.`,
                            'order_updated',
                            'delivery',
                            oldDelivery?.id,
                        );
                }
                // send notification to new delivery
                await this.notificationService.sendNotification(
                    `შენ გაქვს ახალი შეკვეთა — №${order.id}.`,
                    'order_updated',
                    'delivery',
                    delivery.id,
                    {
                        order_id: order.id
                    },
                );
                // send notification to user
                await this.notificationService.sendNotification(
                    `შეკვეთა №${order.id}: ${oldDelivery?.id
                        ? `დაენიშნა ახალი კურიერი — ${delivery.name} ${delivery.lastName}, ${oldDelivery.name} ${oldDelivery.lastName}-ს ნაცვლად`
                        : `დაენიშნა კურიერი ${delivery.name + " " + delivery.lastName}`}.`,
                    'order_updated',
                    `${order.company?.id ? "company" : "individual"}`,
                    order.company?.id || order.individual?.id,
                    {
                        order_id: order.id
                    },
                );
            }

            order.delivery = delivery;
        }

        this.orderRepo.merge(order, rest);
        await this.orderRepo.save(order);

        if (updateAdminOrderDto.status !== oldStatus) {
            // sent status notifications
            await this.notifyOrderStatusUpdate(order, [
                { role: 'admin' },
                { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
                ...((order.delivery?.id && oldDelivery?.id) ? [{ role: 'delivery' as const, id: order.delivery?.id }] : []),
                ...((order.technician?.id && oldTechnician?.id) ? [{ role: 'technician' as const, id: order.technician?.id }] : []),
            ]);
        }

        if (updateAdminOrderDto.service_type !== oldServiceType) {
            // sent service type notifications
            await this.notifyOrderServiceTypeUpdate(order, [
                { role: 'admin' },
                { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
                ...((order.delivery?.id && oldDelivery?.id) ? [{ role: 'delivery' as const, id: order.delivery?.id }] : []),
                ...((order.technician?.id && oldTechnician?.id) ? [{ role: 'technician' as const, id: order.technician?.id }] : []),
            ]);
        }

        return {
            message: `Order updated successfully`,
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

    async findDeliveryOneOrderEntity(deliveryId: number, id: number) {
        const order = await this.orderRepo.findOne({
            where: { id, delivery: { id: deliveryId } },
            relations: ['individual', 'company', 'technician'],
        });
        if (!order) throw new NotFoundException('Order not found');

        return order
    }

    async getDeliveryOneOrder(deliveryId: number, id: number) {
        const order = await this.findDeliveryOneOrderEntity(deliveryId, id);

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

    async findTechnicianOneOrderEntity(technicianId: number, id: number) {
        const order = await this.orderRepo.findOne({
            where: { id, technician: { id: technicianId } },
            relations: ['individual', 'company', 'delivery'],
        });
        if (!order) throw new NotFoundException('Order not found');

        return order
    }

    async getTechnicianOneOrder(technicianId: number, id: number) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        return instanceToPlain(order)
    }

    // order status flow

    // delivery
    async startPickup(deliveryId: number, id: number) {
        const order = await this.findDeliveryOneOrderEntity(deliveryId, id);

        if (order.service_type !== OrderType.FIX_OFF_SITE) {
            throw new BadRequestException(
                `Pickup is only allowed for off-site service orders. Current type: "${order.service_type}".`
            );
        }

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.ASSIGNED],
            'start pickup'
        );

        order.status = OrderStatus.PICKUP_STARTED;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'delivery', id: deliveryId },
        ]);

        return {
            message: 'Pickup started successfully',
            order: instanceToPlain(order),
        };
    }
    // delivery
    async pickedUp(deliveryId: number, id: number) {
        const order = await this.findDeliveryOneOrderEntity(deliveryId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.PICKUP_STARTED],
            'mark as picked up'
        );

        order.status = OrderStatus.PICKED_UP;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'delivery', id: deliveryId },
        ]);

        return {
            message: 'Picked up successfully',
            order: instanceToPlain(order),
        };
    }
    // user
    async toTechnician(userId: number, id: number, repo: any) {
        const order = await this.getOneOrderEntity(userId, id, repo);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.PICKED_UP],
            'send technic to technician'
        );

        order.status = OrderStatus.TO_TECHNICIAN;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: userId },
            { role: 'delivery', id: order.delivery?.id },
        ]);

        return {
            message: 'Technic sent to technician successfully',
            order: instanceToPlain(order),
        };
    }
    // delivery
    async deliveredToTechnician(deliveryId: number, id: number) {
        const order = await this.findDeliveryOneOrderEntity(deliveryId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.TO_TECHNICIAN],
            'deliver technic to technician'
        );

        order.status = OrderStatus.DELIVERED_TO_TECHNICIAN;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'delivery', id: deliveryId },
            { role: 'technician', id: order.technician?.id },
        ]);

        return {
            message: 'Technic delivered to technician successfully',
            order: instanceToPlain(order),
        };
    }
    // technician
    async inspection(technicianId: number, id: number) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.DELIVERED_TO_TECHNICIAN],
            'start inspection'
        );

        order.status = OrderStatus.INSPECTION;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'delivery', id: order.delivery?.id },
            { role: 'technician', id: technicianId },
        ]);

        return {
            message: 'Inspection started successfully',
            order: instanceToPlain(order),
        };
    }
    // technician
    async waitingDecision(technicianId: number, id: number, technicianRequestPaymentDto: TechnicianRequestPaymentDto) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.INSPECTION],
            'request repair decision'
        );

        order.payment_amount = technicianRequestPaymentDto.payment_amount;
        order.payment_reason = technicianRequestPaymentDto.payment_reason;
        order.status = OrderStatus.WAITING_DECISION;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: technicianId },
        ]);

        return {
            message: 'Waiting for user repair decision',
            order: instanceToPlain(order),
        };
    }
    // user
    async decideRepair(userId: number, id: number, repo: any, repairDecisionDto: RepairDecisionDto) {
        const order = await this.getOneOrderEntity(userId, id, repo);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.WAITING_DECISION],
            `make a repair decision`
        );

        order.status = repairDecisionDto.decision == "approve" ? OrderStatus.REPAIRING_OFF_SITE : OrderStatus.REPAIR_CANCELLED;

        if (repairDecisionDto.decision === 'cancel') {
            if (!repairDecisionDto.reason) {
                throw new BadRequestException('Cancel reason is required when rejecting the repair.');
            }
            order.cancel_reason = repairDecisionDto.reason;
        }

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: userId },
            { role: 'technician', id: order.technician?.id },
        ]);

        return {
            message: repairDecisionDto.decision === 'approve'
                ? 'Repair approved'
                : 'Repair cancelled successfully',
            order: instanceToPlain(order),
        };
    }
    // technician
    async brokenReady(technicianId: number, id: number) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.REPAIR_CANCELLED],
            'mark as broken ready'
        );

        order.status = OrderStatus.BROKEN_READY;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: technicianId },
            { role: 'delivery', id: order.delivery?.id },
        ]);

        return {
            message: 'Broken technic is ready to return',
            order: instanceToPlain(order),
        };
    }
    // delivery
    async returningBroken(deliveryId: number, id: number) {
        const order = await this.findDeliveryOneOrderEntity(deliveryId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.BROKEN_READY],
            'mark as returning broken'
        );

        order.status = OrderStatus.RETURNING_BROKEN;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: order.technician?.id },
            { role: 'delivery', id: deliveryId },
        ]);

        return {
            message: 'Broken technic is returning successfully',
            order: instanceToPlain(order),
        };
    }
    // delivery
    async returnedBroken(deliveryId: number, id: number) {
        const order = await this.findDeliveryOneOrderEntity(deliveryId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.RETURNING_BROKEN],
            'mark as returned broken'
        );

        order.status = OrderStatus.RETURNED_BROKEN;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'delivery', id: deliveryId },
        ]);

        return {
            message: 'Broken technic returned successfully',
            order: instanceToPlain(order),
        };
    }
    // user
    async cancelled(userId: number, id: number, repo: any) {
        const order = await this.getOneOrderEntity(userId, id, repo);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.RETURNED_BROKEN],
            `mark as cancelled`
        );

        order.status = OrderStatus.CANCELLED;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: userId },
            { role: 'delivery', id: order.delivery?.id },
        ]);

        return {
            message: `Order Cancelled successfully`,
            order: instanceToPlain(order),
        };
    }
    // technician
    async fixedReady(technicianId: number, id: number) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.REPAIRING_OFF_SITE],
            'mark as fixed ready'
        );

        order.status = OrderStatus.FIXED_READY;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: technicianId },
            { role: 'delivery', id: order.delivery?.id },
        ]);

        return {
            message: 'Fixed technic is ready to return',
            order: instanceToPlain(order),
        };
    }
    // delivery
    async returningFixed(deliveryId: number, id: number) {
        const order = await this.findDeliveryOneOrderEntity(deliveryId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.FIXED_READY],
            'mark as returning fixed'
        );

        order.status = OrderStatus.RETURNING_FIXED;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: order.technician?.id },
            { role: 'delivery', id: deliveryId },
        ]);

        return {
            message: 'Fixed technic is returning successfully',
            order: instanceToPlain(order),
        };
    }
    // delivery
    async returnedFixed(deliveryId: number, id: number) {
        const order = await this.findDeliveryOneOrderEntity(deliveryId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.RETURNING_FIXED],
            'mark as returned fixed'
        );

        order.status = OrderStatus.RETURNED_FIXED;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'delivery', id: deliveryId },
        ]);

        return {
            message: 'Fixed technic returned successfully',
            order: instanceToPlain(order),
        };
    }
    // user
    async completed(userId: number, id: number, repo: any) {
        const order = await this.getOneOrderEntity(userId, id, repo);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.RETURNED_FIXED],
            `mark as completed`
        );

        order.status = OrderStatus.COMPLETED;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: userId },
            { role: 'delivery', id: order.delivery?.id },
        ]);

        return {
            message: `Off-site service completed successfully.`,
            order: instanceToPlain(order),
        };
    }
    // technician
    async technicianComing(technicianId: number, id: number) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        if (order.service_type !== OrderType.FIX_ON_SITE && order.service_type !== OrderType.INSTALLATION) {
            throw new BadRequestException(
                `Technician visit is not allowed for service type "${order.service_type}".`
            );
        }

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.ASSIGNED],
            'mark as technician coming'
        );

        order.status = OrderStatus.TECHNICIAN_COMING;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: technicianId }
        ]);

        return {
            message: 'Technician coming successfully',
            order: instanceToPlain(order),
        };
    }
    // technician
    async repairingOnSite(technicianId: number, id: number) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        if (order.service_type !== OrderType.FIX_ON_SITE) {
            throw new BadRequestException(
                `On-site repair is not allowed for service type "${order.service_type}".`
            );
        }

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.TECHNICIAN_COMING],
            'mark as repairing on site'
        );

        order.status = OrderStatus.REPAIRING_ON_SITE;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: technicianId },
        ]);

        return {
            message: 'Repairing on site goes successfully',
            order: instanceToPlain(order),
        };
    }
    // technician
    async installing(technicianId: number, id: number) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        if (order.service_type !== OrderType.INSTALLATION) {
            throw new BadRequestException(
                `Installation is not allowed for service type "${order.service_type}".`
            );
        }

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.TECHNICIAN_COMING],
            'mark as installing'
        );

        order.status = OrderStatus.INSTALLING;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: technicianId }
        ]);

        return {
            message: 'Installing goes successfully',
            order: instanceToPlain(order),
        };
    }
    // technician
    async waitingPayment(technicianId: number, id: number, technicianRequestPaymentDto: TechnicianRequestPaymentDto) {
        const order = await this.findTechnicianOneOrderEntity(technicianId, id);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.REPAIRING_ON_SITE, OrderStatus.INSTALLING],
            'request payment'
        );

        order.payment_amount = technicianRequestPaymentDto.payment_amount;
        order.payment_reason = technicianRequestPaymentDto.payment_reason;
        order.status = OrderStatus.WAITING_PAYMENT;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: order.company?.id || order.individual?.id },
            { role: 'technician', id: technicianId }
        ]);

        return {
            message: 'Payment request sent successfully',
            order: instanceToPlain(order),
        };
    }
    // user
    async completedOnSite(userId: number, id: number, repo: any) {
        const order = await this.getOneOrderEntity(userId, id, repo);

        // status guard
        this.assertStatus(
            order.status,
            [OrderStatus.WAITING_PAYMENT],
            `mark as completed on site`
        );

        order.status = order.service_type == OrderType.INSTALLATION ? OrderStatus.COMPLETED_ON_SITE_INSTALLING : OrderStatus.COMPLETED_ON_SITE_REPAIRING;

        await this.orderRepo.save(order)

        // sent notifications
        await this.notifyOrderStatusUpdate(order, [
            { role: 'admin' },
            { role: order.company?.id ? 'company' : 'individual', id: userId },
            { role: 'technician', id: order.technician?.id }
        ]);

        return {
            message: `Completed on site successfully`,
            order: instanceToPlain(order),
        };
    }
}
