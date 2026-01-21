import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { instanceToPlain } from 'class-transformer';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepo: Repository<Transaction>,
    ) { }

    async createTransaction(dto: CreateTransactionDto) {
        const transaction = this.transactionRepo.create(dto);

        return await this.transactionRepo.save(transaction);
    }

    async getUserTransactions(role: 'individual' | 'company', userId: number) {
        const transactions = await this.transactionRepo.find({
            where: { [role]: { id: userId } },
            order: { created_at: 'DESC' },
        });

        return instanceToPlain(transactions);
    }

    async getTransactions() {
        const transactions = await this.transactionRepo.find({
            order: { created_at: 'DESC' },
        });

        return instanceToPlain(transactions);
    }
}
