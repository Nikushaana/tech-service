import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export type NotificationType = 'new_user' | 'new_order' | 'new_review' | 'profile_activated' | 'profile_blocked';
export type NotificationFor = 'admin' | 'individual' | 'company';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @Column({ type: 'enum', enum: ['new_user', 'new_order', 'new_review', 'profile_activated', 'profile_blocked'] })
    type: NotificationType;

    @Column({ default: false })
    read: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: 'enum', enum: ['admin', 'individual', 'company'], nullable: true })
    for: NotificationFor;

    @Column({ type: 'int', nullable: true })
    forId?: number;

    @Column({ type: 'json', nullable: true })
    data?: Record<string, any>;
}
