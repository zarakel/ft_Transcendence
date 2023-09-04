import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import { User } from '../user/user.entity';

@Injectable()
export class LoginService 
{

  private jwtService: JwtService;

  constructor()
  {
    this.jwtService = new JwtService({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' }
    });
  }

  async convertCode(code: string, ip: string): Promise<any>
  {
    let request = await fetch("https://api.intra.42.fr/oauth/token", 
		{
      method: "POST",
      headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: code,
        redirect_uri: "http://" + ip
      })
		});
    let rep = await request.json();
    return rep;
  }

  async getUser(token: string): Promise<any>
  {
    let request = await fetch("https://api.intra.42.fr/v2/me", 
		{
      method: "GET",
      headers: 
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
		});
    return await request.json();
  }  

  getCredential(user: User)
  {
    const payload = {login: user.login};
    return {jwt_token: this.jwtService.sign(payload)};
  }

  generateTFASecret()
  {
    return authenticator.generateSecret();
  }

  async generateTFAQRCode(user: User)
  {
    const tfaUrl = authenticator.keyuri(user.login, "ft_Transcendence", user.tfa_secret);
    return tfaUrl;
  }

  validateTFACode(code: string, user: User)
  {
    return authenticator.verify({token: code, secret: user.tfa_secret});
  }
}