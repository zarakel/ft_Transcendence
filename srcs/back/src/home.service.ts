import { Injectable } from '@nestjs/common';

@Injectable()
export class HomeService {
  getHello(code: string): string {
    return 'R.A.S';
  }
}