import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UploadedFiles, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { AdminService } from './admin.service';
import { TokenValidationGuard } from 'src/auth/guards/token-validation.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateAdminIndividualOrTechnicianDto } from './dto/update-admin-individual-or-technician.dto';
import { UpdateAdminCompanyDto } from './dto/update-admin-company.dto';
import { UserFilterDto } from 'src/common/services/base-user/dto/user-filter.dto';
import { UpdateAdminOrderDto } from 'src/order/dto/update-admin-order.dto';
import { CreateCategoryDto } from 'src/category/dto/create-category.dto';
import { UpdateCategoryDto } from 'src/category/dto/update-category.dto';
import { CreateFaqDto } from 'src/faq/dto/create-faq.dto';
import { UpdateFaqDto } from 'src/faq/dto/update-category.dto';
import type { RequestInfo } from 'src/common/types/request-info';
import { MultipleImagesUpload } from 'src/common/interceptors/multiple-images-upload.interceptor';

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
    async updateAdminOneIndividual(@Param('id', ParseIntPipe) id: number, @Body() updateAdminIndividualOrTechnicianDto: UpdateAdminIndividualOrTechnicianDto) {
        return this.adminService.updateAdminOneIndividual(id, updateAdminIndividualOrTechnicianDto);
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
    async updateAdminOneCompany(@Param('id', ParseIntPipe) id: number, @Body() updateAdminCompanyDto: UpdateAdminCompanyDto) {
        return this.adminService.updateAdminOneCompany(id, updateAdminCompanyDto);
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
    async updateAdminOneTechnician(@Param('id', ParseIntPipe) id: number, @Body() updateAdminIndividualOrTechnicianDto: UpdateAdminIndividualOrTechnicianDto) {
        return this.adminService.updateAdminOneTechnician(id, updateAdminIndividualOrTechnicianDto);
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
    async updateOneCategory(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto, @UploadedFiles() images: Express.Multer.File[],) {
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
}
