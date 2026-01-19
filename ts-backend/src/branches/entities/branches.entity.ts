import { Exclude } from 'class-transformer';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

class Location {
    lat: number;
    lng: number;
}

@Entity('branches')
export class Branch {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    city: string;

    @Column()
    street: string;

    @Column()
    building_number: string;

    @Column()
    description: string;

    @Column({ type: 'json' })
    location: Location;

    @Column()
    coverage_radius_km: number;

    @Exclude()
    @Column()
    delivery_visit_price: number;
    
    @Exclude()
    @Column()
    technician_visit_price: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
