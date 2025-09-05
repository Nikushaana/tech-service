import { CompanyClient } from "src/company-client/entities/company-client.entity";
import { IndividualClient } from "src/individual-client/entities/individual-client.entity";
import { Order } from "src/order/entities/order.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    apartment_number: string;

    @Column()
    building_floor: string;

    @Column()
    building_entrance: string;

    @Column()
    building_number: string;

    @Column()
    street: string;

    @Column()
    city: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => IndividualClient, (individual) => individual.addresses, { nullable: true })
    individual: IndividualClient;

    @ManyToOne(() => CompanyClient, (company) => company.addresses, { nullable: true })
    company: CompanyClient;

    @OneToMany(() => Order, (order) => order.address)
    orders: Order[];
}
