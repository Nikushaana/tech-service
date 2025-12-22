import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UploadedFiles, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { AdminService } from './admin.service';
import { TokenValidationGuard } from 'src/auth/guards/token-validation.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateAdminCompanyDto } from './dto/update-admin-company.dto';
import { UserFilterDto } from 'src/common/services/base-user/dto/user-filter.dto';
import { UpdateAdminOrderDto } from 'src/order/dto/update-admin-order.dto';
import { CreateCategoryDto } from 'src/category/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/category/dto/update-category.dto';
import { CreateFaqDto } from 'src/faq/dto/create-faq.dto';
import { UpdateFaqDto } from 'src/faq/dto/update-category.dto';
import type { RequestInfo } from 'src/common/types/request-info';
import { MultipleImagesUpload } from 'src/common/interceptors/multiple-images-upload.factory';
import { UpdateReviewDto } from 'src/reviews/dto/update-review.dto';
import { CreateBranchDto } from 'src/branches/dto/create-branch.dto';
import { UpdateBranchDto } from 'src/branches/dto/update-branch.dto';
import { UpdateAdminIndividualTechnicianDeliveryDto } from './dto/update-adm-ind-tech-del.dto';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // admin

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('')
    async getAdmin(@Req() req: RequestInfo) {
        return this.adminService.getAdmin(req.user.id);
    }

    // individuals

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('individuals')
    async getAdminIndividuals() {
        return this.adminService.getAdminIndividuals();
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('individuals/:id')
    async getAdminOneIndividual(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.getAdminOneIndividual(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('individuals/:id')
    @UseInterceptors(MultipleImagesUpload('images', 1))
    async updateAdminOneIndividual(@Param('id', ParseIntPipe) id: number, @Body() updateAdminIndividualTechnicianDeliveryDto: UpdateAdminIndividualTechnicianDeliveryDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.adminService.updateAdminOneIndividual(id, updateAdminIndividualTechnicianDeliveryDto, images);
    }

    // companies

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('companies')
    async getAdminCompanies() {
        return this.adminService.getAdminCompanies();
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('companies/:id')
    async getAdminOneCompany(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.getAdminOneCompany(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('companies/:id')
    @UseInterceptors(MultipleImagesUpload('images', 1))
    async updateAdminOneCompany(@Param('id', ParseIntPipe) id: number, @Body() updateAdminCompanyDto: UpdateAdminCompanyDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.adminService.updateAdminOneCompany(id, updateAdminCompanyDto, images);
    }

    // technicians

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('technicians')
    async getAdminTechnicians(@Query() userFilterDto: UserFilterDto) {
        return this.adminService.getAdminTechnicians(userFilterDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('technicians/:id')
    async getAdminOneTechnician(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.getAdminOneTechnician(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('technicians/:id')
    @UseInterceptors(MultipleImagesUpload('images', 1))
    async updateAdminOneTechnician(@Param('id', ParseIntPipe) id: number, @Body() updateAdminIndividualTechnicianDeliveryDto: UpdateAdminIndividualTechnicianDeliveryDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.adminService.updateAdminOneTechnician(id, updateAdminIndividualTechnicianDeliveryDto, images);
    }

    // deliveries

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('deliveries')
    async getAdminDeliveries(@Query() userFilterDto: UserFilterDto) {
        return this.adminService.getAdminDeliveries(userFilterDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('deliveries/:id')
    async getAdminOneDelivery(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.getAdminOneDelivery(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('deliveries/:id')
    @UseInterceptors(MultipleImagesUpload('images', 1))
    async updateAdminOneDelivery(@Param('id', ParseIntPipe) id: number, @Body() updateAdminIndividualTechnicianDeliveryDto: UpdateAdminIndividualTechnicianDeliveryDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.adminService.updateAdminOneDelivery(id, updateAdminIndividualTechnicianDeliveryDto, images);
    }

    // orders

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('orders')
    async getOrders() {
        return this.adminService.getOrders();
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('orders/:id')
    async getOneOrder(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.getOneOrder(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('orders/:id')
    async updateOneOrder(@Param('id', ParseIntPipe) id: number, @Body() updateAdminOrderDto: UpdateAdminOrderDto) {
        return this.adminService.updateOneOrder(id, updateAdminOrderDto);
    }

    // categories

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('category')
    async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
        return this.adminService.createCategory(createCategoryDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('categories')
    async getCategories() {
        return this.adminService.getCategories();
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('categories/:id')
    async getOneCategory(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.getOneCategory(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('categories/:id')
    @UseInterceptors(MultipleImagesUpload('images', 1))
    async updateOneCategory(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto, @UploadedFiles() images: Express.Multer.File[]) {
        return this.adminService.updateOneCategory(id, updateCategoryDto, images);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Delete('categories/:id')
    async deleteCategory(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.deleteCategory(id);
    }

    // faqs

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('faq')
    async createFaq(@Body() createFaqDto: CreateFaqDto) {
        return this.adminService.createFaq(createFaqDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('faqs')
    async getFaqs() {
        return this.adminService.getFaqs();
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('faqs/:id')
    async getOneFaq(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.getOneFaq(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('faqs/:id')
    async updateOneFaq(@Param('id', ParseIntPipe) id: number, @Body() updateFaqDto: UpdateFaqDto) {
        return this.adminService.updateOneFaq(id, updateFaqDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Delete('faqs/:id')
    async deleteFaq(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.deleteFaq(id);
    }

    // addresses

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('addresses')
    async getAddresses() {
        return this.adminService.getAddresses();
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('addresses/:id')
    async getUserAddresses(@Param('id', ParseIntPipe) id: number, @Query('role') role: 'individual' | 'company') {
        return this.adminService.getUserAddresses(id, role);
    }

    // reviews

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('reviews')
    async getReviews() {
        return this.adminService.getReviews();
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('reviews/:id')
    async getOneReview(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.getOneReview(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('reviews/:id')
    async updateOneReview(@Param('id', ParseIntPipe) id: number, @Body() updateReviewDto: UpdateReviewDto) {
        return this.adminService.updateOneReview(id, updateReviewDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Delete('reviews/:id')
    async deleteReview(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.deleteReview(id);
    }

    // branches

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('create-branch')
    async createBranch(@Body() createBranchDto: CreateBranchDto) {
        return this.adminService.createBranch(createBranchDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('branches')
    async getBranches() {
        return this.adminService.getBranches();
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('branches/:id')
    async getOneBranch(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.getOneBranch(id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('branches/:id')
    async updateOneBranch(@Param('id', ParseIntPipe) id: number, @Body() updateBranchDto: UpdateBranchDto) {
        return this.adminService.updateOneBranch(id, updateBranchDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Delete('branches/:id')
    async deleteBranch(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.deleteBranch(id);
    }

    // statistics

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('user-registration-stats')
    async getUserRegistrationStats() {
        return this.adminService.getUserRegistrationStats();
    }
    
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('used-devices-stats')
    async getUsedDevicesStats() {
        return this.adminService.getUsedDevicesStats();
    }
    
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('order-stats')
    async getOrderStats() {
        return this.adminService.getOrderStats();
    }

    // notifications

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Get('notifications')
    async getNotifications() {
        return this.adminService.getNotifications();
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Delete('notifications/:id')
    async deleteNotification(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.deleteNotification(id);
    }
    
    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Patch('notifications/:id')
    async readNotification(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.readNotification(id);
    }
}
