import Joi from '@hapi/joi'
import User from "../../models/user";

export const register = async ctx => {
	//회원가입
	console.log("register");
	const schema = Joi.object().keys({
		userId: Joi.string()
			.lowercase()
			.alphanum()
			.min(3)
			.max(20)
			.required(),
		username: Joi.string()
			.min(1)
			.max(25)
			.pattern(/^[가-힣|a-z|A-Z]+$/)
			.required(),
		password: Joi.string().required(),
		email: Joi.string().email().required(),
		phone: Joi.string().pattern(/^\d{3}-\d{3,4}-\d{4}$/).required(),
		profileImg: Joi.number().required(),
	});
	const result = schema.validate(ctx.request.body);
	if (result.error) {
		ctx.status = 400;
		ctx.body = result.error;
		return;
	}

	const { userId, username, password, email, phone, profileImg } = ctx.request.body;
	try {
		//username이 이미 존재하는지 확인
		let exists = await User.findByUserId(userId);
		exists = exists? await exists : User.findByEmail(email);
		exists = exists? await exists : User.findByPhone(phone);
		if (exists) {
			ctx.status = 409; //Conflict
			return;
		}

		const user = new User({
			userId, username, email, phone, profileImg,
		});
		await user.setPassword(password);
		await user.save();

		//응답할 데이터에서 hashedPassword 필드 제거
		ctx.body = user.serialize();

		const token = user.generateToken();
		ctx.cookies.set('access_token', token, {
			maxAge: 1000 * 60 * 60 * 24 * 7, //7 days
			httpOnly: true,
		});
	} catch (e) {
		ctx.throw(500, e);
	}
};

export const login = async ctx => {
	//로그인
	const { userId, password } = ctx.request.body;

	//userId, password가 없으면 에러처리
	if (!userId || !password) {
		ctx.status = 401; //Unauthorized
		return;
	}

	try {
		const user = await User.findByUserId(userId);
		//계정이 없으면 에러 처리
		if (!user) {
			ctx.status = 401;
			return;
		}

		const valid = await user.checkPassword(password);
		//잘못된 비밀번호
		if (!valid) {
			ctx.status = 401;
			return;
		}
		ctx.body = user.serialize();

		const token = user.generateToken();
		ctx.cookies.set('access_token', token, {
			maxAge: 1000 * 60 * 60 * 24 * 7, //7 days
			httpOnly: true,
		});
	} catch (e) {
		ctx.throw(500, e);
	}
};

export const check = async ctx => {
	//로그인 상태 확인
	const { user } = ctx.state;
	if (!user) {
		// 로그인 상태 아님
		ctx.status = 401;
		return;
	}
	ctx.body = user;
};

export const logout = async ctx => {
	//로그아웃
	//쿠키를 지워주기만 하면 완료
	ctx.cookies.set("access_token");
	ctx.status = 204; //No Content
};

export const leave = async ctx => {
	//회원탈퇴
	const { userId, password } = ctx.request.body;
	//userId, password가 없으면 에러처리
	if (!userId || !password) {
		ctx.status = 401; //Unauthorized
		return;
	}
	try {
		const userExists = await User.findByUserId(userId);
		//계정이 없으면 에러 처리
		if (!userExists) {
			ctx.status = 401;
			return;
		}

		const valid = await userExists.checkPassword(password);
		//잘못된 비밀번호
		if (!valid) {
			ctx.status = 401;
			return;
		}

		const user = await User.deleteByUserId(userId);
		ctx.body = user.serialize();
		//토큰 초기화(로그아웃 처리)
		ctx.cookies.set("access_token");
		// ctx.status = 204; //No Content
	} catch (e) {
		ctx.throw(500, e);
	}
};

export const update = async ctx => {
	//정보 수정
	const {
		userId,
		password,
		newUserId,
		newUsername,
		newPassword,
		newEmail,
		newPhone,
		newProfileImg
	} = ctx.request.body;

	//userId, password가 없으면 에러처리
	if (!userId || !password) {
		ctx.status = 401; //Unauthorized
		return;
	}

	const schema = Joi.object().keys({
		newUserId: Joi.string()
			.lowercase()
			.alphanum()
			.min(3)
			.max(20),
		newUsername: Joi.string()
			.min(1)
			.max(25)
			.pattern(/^[가-힣|a-z|A-Z]+$/),
		newPassword: Joi.string(),
		newEmail: Joi.string().email(),
		newPhone: Joi.string().pattern(/^\d{3}-\d{3,4}-\d{4}$/),
		newProfileImg: Joi.number(),
	});
	const result = schema.validate(ctx.request.body);
	if (result.error) {
		ctx.status = 400;
		ctx.body = result.error;
		return;
	}

	//TODO: update logic 추가하기
}

export const getAll = async ctx => {
	// //로그인 상태 확인
	// const { user } = ctx.state;
	// if (!user) {
	// 	// 로그인 상태 아님
	// 	ctx.status = 401;
	// 	return;
	// }

	const users = await User.findAllInGuild();
	// const users = { userList: userList.toString() };
	ctx.body = users;
}