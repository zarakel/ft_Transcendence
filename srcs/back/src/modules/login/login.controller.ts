import { Body, Controller, Param, Post, Inject, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginService } from './login.service';
import { databaseService } from '../database/database.service';
import { User } from '../user/user.entity';
import { Friend } from '../friend/friend.entity';

@Controller('login')
export class LoginController {

  	@Inject(LoginService)
  	private login_service: LoginService;

	@Post('code')
	getCode(@Body() body: any): string 
	{
		let url: URL = new URL("https://api.intra.42.fr/oauth/authorize");
		url.searchParams.append("client_id", process.env["CLIENT_ID"]);
		url.searchParams.append("redirect_uri", body.redirect_uri);
		url.searchParams.append("response_type", "code");

		return JSON.stringify({url: url.toString()});
	}

	@Post('token/:code')
	async getToken(@Param("code") code: string, @Request() req): Promise<any>
	{
		let token = await this.login_service.convertCode(code, req.hostname);
		if (token.access_token == undefined)
			return JSON.stringify({error: true, message: "Communication with 42 API failed"});
		let ft_user = await this.login_service.getUser(token.access_token);
		if (ft_user.login == undefined)
			return JSON.stringify({error: true, message: "Communication with 42 API failed"});

		let ds = databaseService.getDataSource();
		let exist = await ds.manager.findOneBy(User, {login: ft_user.login});

		if (exist)
		{
			if (exist.online)
				return JSON.stringify({error: true, message: "You are already connected."});
			else if (exist.tfa_enable)
				return (JSON.stringify({access_token: token.access_token, 
										tfa_enable: exist.tfa_enable,
										tfa_token: this.login_service.getCredential(exist).jwt_token}));
			else
				return (JSON.stringify({access_token: token.access_token, 
										jwt_token: this.login_service.getCredential(exist).jwt_token,
										login: exist.login,
										tfa_enable: exist.tfa_enable,
										username: exist.username,
										profile_pic: exist.profile_pic,
										id: exist.id,
										pad_color: exist.pad_color}));
			}
		else
		{
			let res = await databaseService.insertUser(ft_user, this.login_service);
			return (JSON.stringify({new: "true",
									access_token: token.access_token, 
									jwt_token: this.login_service.getCredential(res).jwt_token,
									login: res.login, 
									tfa_enable: res.tfa_enable,
									username: res.username,
									profile_pic: res.profile_pic,
									id: res.id,
									pad_color: res.pad_color}));
		}
	}

	@Post("2fa/validate")
	@UseGuards(AuthGuard('jwt'))
	async validateTFA(@Request() req, @Body() body)
	{
		let user = await databaseService.getDataSource().manager.findOneBy(User, {login: req.user.login});
		const verifyCode = this.login_service.validateTFACode(body.code, user);
		if (verifyCode)
		{
			if (!user.tfa_enable)
			{
				await databaseService.getDataSource().manager.update(User, {login: req.user.login}, {tfa_enable: true});
				return JSON.stringify({tfa_enable: true});
			}
			return (JSON.stringify({jwt_token: this.login_service.getCredential(user).jwt_token,
									login: user.login,
									tfa_enable: user.tfa_enable,
									username: user.username,
									profile_pic: user.profile_pic,
									mmr: user.mmr,
									id: user.id,
									pad_color: user.pad_color}));
		}
		else
				return JSON.stringify({invalid_code: true});
	}

	@Post("2fa/enable")
	@UseGuards(AuthGuard('jwt'))
	async enableTFA(@Request() req)
	{
		let user = await databaseService.getDataSource().manager.findOneBy(User, {login: req.user.login});
		const qr_code = await this.login_service.generateTFAQRCode(user);
		return JSON.stringify({qr_code: qr_code});
	}

	@Post("2fa/disable")
	@UseGuards(AuthGuard('jwt'))
	async disableTFA(@Request() req)
	{
		try 
		{
			await databaseService.getDataSource().manager.update(User, {login: req.user.login}, {tfa_enable: false});
		}
		catch (e)
		{
			return JSON.stringify({error: true, message: e});
		}
		return JSON.stringify({tfa_enable: false});
	}
}

