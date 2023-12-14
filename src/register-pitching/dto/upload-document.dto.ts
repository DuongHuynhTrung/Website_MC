import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UploadDocumentDto {
  @IsNotEmpty()
  @IsNumber()
  register_pitching_id: number;

  @IsNotEmpty()
  @IsString()
  document_url: string;
}
