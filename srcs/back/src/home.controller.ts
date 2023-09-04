import { Controller, Get, Req } from '@nestjs/common';
import { HomeService } from './home.service';
import { Request } from 'express';

@Controller('Home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  getData(@Req() request: Request): Object {
    return {...request.params, ...request.query};
}
}