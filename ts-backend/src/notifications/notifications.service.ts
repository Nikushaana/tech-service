import { Injectable } from '@nestjs/common';
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
        data?: Record<string, any>,
    ) {
        const notification = this.notificationRepo.create({
            message,
            type,
            for: forRole,
            data,
        });

        return this.notificationRepo.save(notification);
    }

}
