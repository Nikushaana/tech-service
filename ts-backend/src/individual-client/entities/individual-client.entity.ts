import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IndividualClientToken } from 'src/individual-client-token/entities/individual-client-token.entity';
import { Order } from 'src/order/entities/order.entity';
import { Address } from 'src/address/entities/address.entity';

@Entity('individual_clients')
export class IndividualClient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  phone: string;

  @Column()
  name: string;

  @Column()
  lastName: string;

  @Column("simple-array", { default: "" })
  images: string[];

  @Column({ default: 'individual' })
  role: string;

  @Column({ default: false })
  status: boolean;

  @Exclude()
  @Column()
  password: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Order, (order) => order.individual)
  orders: Order[];

  @OneToMany(() => Address, (address) => address.individual)
  addresses: Address[];

  @OneToOne(() => IndividualClientToken, (token) => token.individualClient)
  token: IndividualClientToken;
}
