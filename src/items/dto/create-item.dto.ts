import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNotEmpty()
  description: string;
}
