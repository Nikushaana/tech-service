import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationFor, NotificationType } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { GetNotificationsDto } from './dto/get-notifications.dto';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepo: Repository<Notification>,
        private gateway: NotificationsGateway,
    ) { }

    async sendNotification(
        message: string,
        type: NotificationType,
        forRole: NotificationFor,
        forId: number | undefined,
        data?: Record<string, any>,
    ) {
        const notification = this.notificationRepo.create({
            message,
            type,
            for: forRole,
            forId,
            data,
        });

        this.notificationRepo.save(notification);

        // send signal to exact user
        this.gateway.server.emit(`notification:${forRole}:${forId}`, { type: type });

        return true
    }

    async getNotifications(dto: GetNotificationsDto, role: 'admin' | 'individual' | 'company' | 'technician' | 'delivery', userId?: number) {
        const { type, page = 1, limit = 20 } = dto;

        const where: any = { for: role };

        if (userId) where.forId = userId;
        if (type) where.type = type;

        const [notifications, total] = await this.notificationRepo.findAndCount({
            where,
            order: {
                created_at: 'DESC',
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            data: notifications,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async readNotification(
        role: 'admin' | 'individual' | 'company' | 'technician' | 'delivery',
        id: number,
    ) {
        const notification = await this.notificationRepo.findOne({
            where: { for: role, id },
        });
        if (!notification) throw new NotFoundException('Notification not found');

        // Merge updates
        this.notificationRepo.merge(notification, {
            read: true
        });

        await this.notificationRepo.save(notification);

        return {
            message: 'Notification read successfully',
        };
    }

    async getUnreadNotificationsCount(role: 'admin' | 'individual' | 'company' | 'technician' | 'delivery', userId?: number) {
        const notifications = await this.notificationRepo.find({
            where: { for: role, forId: userId, read: false },
        });

        return notifications.length;
    }
}
