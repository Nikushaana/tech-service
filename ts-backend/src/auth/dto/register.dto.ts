import { Matches, MinLength, IsString, IsNotEmpty, IsIn, ValidateIf } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Matches(/^5[0-9]{8}$/, {
    message: 'Phone number must start with 5 and be 9 digits long',
  })
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsIn(['individual', 'company', 'technician', 'admin'])
  role: 'individual' | 'company' | 'technician' | 'admin';

  // --- Individual & Technician fields ---
  @ValidateIf((o) => o.role === 'individual' || o.role === 'technician' || o.role === 'admin')
  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateIf((o) => o.role === 'individual' || o.role === 'technician' || o.role === 'admin')
  @IsString()
  @IsNotEmpty()
  lastName: string;

  // --- Company fields ---
  @ValidateIf((o) => o.role === 'company')
  @IsString()
  @IsNotEmpty()
  companyAgentName: string;

  @ValidateIf((o) => o.role === 'company')
  @IsString()
  @IsNotEmpty()
  companyAgentLastName: string;

  @ValidateIf((o) => o.role === 'company')
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ValidateIf((o) => o.role === 'company')
  @IsString()
  @IsNotEmpty()
  companyIdentificationCode: string;
}
