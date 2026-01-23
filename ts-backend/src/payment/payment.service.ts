import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from 'src/common/types/order-status.enum';
import { TransactionStatus } from 'src/common/types/transaction-status.enum';
import { NotificationFor } from 'src/notifications/entities/notification.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Order } from 'src/order/entities/order.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,

        @InjectRepository(Transaction)
        private readonly transactionRepo: Repository<Transaction>,

        private readonly notificationService: NotificationsService,
    ) { }

    async mockPayOrder(orderId: number) {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
            relations: ['company', 'individual'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const transaction = await this.transactionRepo.findOne({
            where: { order: { id: orderId } },
        });

        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }

        // Update order status
        order.status = OrderStatus.PENDING;
        await this.orderRepo.save(order);

        // Update transaction status
        transaction.status = TransactionStatus.PAID;
        await this.transactionRepo.save(transaction);

        const user = order.company || order.individual;

        // send notification to admin
        await this.notificationService.sendNotification(
            `შეკვეთა №${order.id}: გადახდა შესრულდა და მზად არის სერვისისთვის.`,
            'order_updated',
            'admin',
            undefined,
            { order_id: order.id },
        );

        // send notification to user
        await this.notificationService.sendNotification(
            `შეკვეთა №${order.id}: გადახდა შესრულდა და მზად არის სერვისისთვის.`,
            'order_updated',
            user.role as NotificationFor,
            user.id,
            { order_id: order.id },
        );

        return {
            success: true,
            message: 'Payment successful',
            orderId: order.id,
        };
    }

}
