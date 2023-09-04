import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {

  @UseGuards(AuthGuard("jwt"))
  @Get("logged_in")
  async isLoggedIn(): Promise<any> 
  {
    return JSON.stringify({logged_in: "true"});
  }
}