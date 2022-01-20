import jwt from "jsonwebtoken";
import User from "../models/user";

const jwtMiddleware = async (ctx, next) => {
	const token = ctx.cookies.get('access_token');
	if(!token) {
		console.log("no token available!");
		return next();
	} //토큰 없음
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET, null, null);
		ctx.state.user = {
			_id: decoded._id,
			userId: decoded.userId,
		};
		//토큰의 남은 유효기간이 3일 미만이면 재발급
		const now = Math.floor(Date.now() / 1000);
		if (decoded.exp - now < 60 * 60 * 24 * 3) {
			const user = await User.findById(decoded._id);
			const token = user.generateToken();
			ctx.cookies.set('access_token', token, {
				maxAge: 1000 * 60 * 60 * 24 * 7,
				httpOnly: true,
			});
		}
		console.log("token verified!");
		return next();
	} catch (e) {
		//토큰 검증 실패
		console.log("token verification failed!");
		return next();
	}
};

export default jwtMiddleware;
