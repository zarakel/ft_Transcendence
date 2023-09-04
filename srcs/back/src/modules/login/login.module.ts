import { Module } from '@nestjs/common';
import { JwtModule } from "@nestjs/jwt"
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [PassportModule,
            JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '60s' }
            })],
  controllers: [LoginController],
  providers: [LoginService, JwtStrategy]
})
export class LoginModule {}
