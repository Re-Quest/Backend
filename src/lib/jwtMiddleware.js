import jwt from "jsonwebtoken";

const jwtMiddleware = (ctx, next) => {
	const token = ctx.cookies.get('access_token');
	if(!token) {
		console.log("no token available!");
		return next();
	} //토큰 없음
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET, null, null);
		ctx.state.user = {
			_id: decoded._id,
			username: decoded.username,
		};
		console.log(decoded);
		return next();
	} catch (e) {
		//토큰 검증 실패
		console.log("token verification failed!");
		return next();
	}
};

export default jwtMiddleware;