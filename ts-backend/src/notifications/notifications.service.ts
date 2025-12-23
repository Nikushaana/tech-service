import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationFor, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepo: Repository<Notification>,
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

        return this.notificationRepo.save(notification);
    }

    async getNotifications(role, userId?: number) {
        const notifications = await this.notificationRepo.find({
            where: { for: role, forId: userId },
            order: {
                read: 'ASC',
                created_at: 'DESC',
            },
        });

        return notifications;
    }

    async readNotification(
        id: number,
    ) {
        const notification = await this.notificationRepo.findOne({
            where: { id },
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

    async getUnreadNotificationsCount(role, userId?: number) {
        const notifications = await this.notificationRepo.find({
            where: { for: role, forId: userId, read: false },
            order: {
                read: 'ASC',
                created_at: 'DESC',
            },
        });

        return notifications.length;
    }
}
