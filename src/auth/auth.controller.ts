import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import GoogleTokenDto from './dto/google-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Sign In with Google to get Access Token' })
  @ApiOkResponse({
    description: 'Access token response',
    schema: {
      properties: {
        access_token: {
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsTmFtZSI6Ikh1eW5oIER1b25nIiwiZW1haWwiOiJ0cnVuZ2R1b25nMTIyMDI2MTlAZ21haWwuY29tIiwicm9sZSI6IkN1c3RvbWVyIiwiaWF0IjoxNjg5MjM3MjgyLCJleHAiOjE2ODkyNDA4ODJ9.dkUbqCSL5lPEwGvlAJS7cXVXuFiduWNELjXuQZtvShY',
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Something went wrong when creating user.',
  })
  @Post('/google/login')
  async googleLogin(
    @Body() googleTokenDto: GoogleTokenDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.loginGoogleUser(googleTokenDto.token);
  }

  @ApiOperation({ summary: 'Sign Up new User' })
  @ApiCreatedResponse({
    description: 'Sign up successfully',
  })
  @ApiBadRequestResponse({
    description: 'Email or Phone has already existed.',
  })
  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<string> {
    return this.authService.signUp(signUpDto);
  }

  @ApiOperation({ summary: 'Sign In to get Access Token' })
  @ApiOkResponse({
    description: 'Access token response',
    schema: {
      properties: {
        access_token: {
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsTmFtZSI6Ikh1eW5oIER1b25nIiwiZW1haWwiOiJ0cnVuZ2R1b25nMTIyMDI2MTlAZ21haWwuY29tIiwicm9sZSI6IkN1c3RvbWVyIiwiaWF0IjoxNjg5MjM3MjgyLCJleHAiOjE2ODkyNDA4ODJ9.dkUbqCSL5lPEwGvlAJS7cXVXuFiduWNELjXuQZtvShY',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User does not exist.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid password',
  })
  @Post('signin')
  signIn(@Body() signInDto: SignInDto): Promise<{ accessToken: string }> {
    return this.authService.signIn(signInDto);
  }

  // @ApiOperation({ summary: 'Sign In with Google to get Access Token' })
  // @ApiOkResponse({
  //   description: 'Access token response',
  //   schema: {
  //     properties: {
  //       access_token: {
  //         example:
  //           'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsTmFtZSI6Ikh1eW5oIER1b25nIiwiZW1haWwiOiJ0cnVuZ2R1b25nMTIyMDI2MTlAZ21haWwuY29tIiwicm9sZSI6IkN1c3RvbWVyIiwiaWF0IjoxNjg5MjM3MjgyLCJleHAiOjE2ODkyNDA4ODJ9.dkUbqCSL5lPEwGvlAJS7cXVXuFiduWNELjXuQZtvShY',
  //       },
  //     },
  //   },
  // })
  // @ApiInternalServerErrorResponse({
  //   description: 'Something went wrong when creating user.',
  // })
  // @Post('signin/google')
  // signInGoogle(
  //   @Body() signInGoogleDto: SignInGoogleDto,
  // ): Promise<{ accessToken: string }> {
  //   return this.authService.signInGoogle(signInGoogleDto);
  // }
}
