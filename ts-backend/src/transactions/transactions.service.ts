import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { instanceToPlain } from 'class-transformer';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';

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

    async getUserTransactions(dto: GetTransactionsDto, role: 'individual' | 'company', userId: number) {
        const { page = 1, limit = 10 } = dto;

        const [transactions, total] = await this.transactionRepo.findAndCount({
            where: { [role]: { id: userId } },
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            data: instanceToPlain(transactions),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getTransactions(dto: GetTransactionsDto) {
        const { page = 1, limit = 10 } = dto;

        const [transactions, total] = await this.transactionRepo.findAndCount({
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            data: instanceToPlain(transactions),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
