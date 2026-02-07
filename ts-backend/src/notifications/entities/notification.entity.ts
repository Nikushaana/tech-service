import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum NotificationType {
    NEW_USER = 'new_user',
    NEW_ORDER = 'new_order',
    NEW_REVIEW = 'new_review',
    PROFILE_UPDATED = 'profile_updated',
    ORDER_UPDATED = 'order_updated',
}
export type NotificationFor = 'admin' | 'individual' | 'company' | 'delivery' | 'technician';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;

    @Column({ default: false })
    read: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: 'enum', enum: ['admin', 'individual', 'company', 'delivery', 'technician'], nullable: true })
    for: NotificationFor;

    @Column({ type: 'int', nullable: true })
    forId?: number;

    @Column({ type: 'json', nullable: true })
    data?: Record<string, any>;
}
