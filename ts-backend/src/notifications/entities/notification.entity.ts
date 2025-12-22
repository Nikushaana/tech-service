import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export type NotificationType = 'new_user' | 'new_order' | 'new_review';
export type NotificationFor = 'admin';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @Column({ type: 'enum', enum: ['new_user', 'new_order', 'new_review'] })
    type: NotificationType;

    @Column({ default: false })
    read: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: 'enum', enum: ['admin'], nullable: true })
    for: NotificationFor;

    @Column({ type: 'json', nullable: true })
    data?: Record<string, any>;
}
