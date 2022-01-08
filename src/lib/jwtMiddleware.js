import jwt from "jsonwebtoken";

const jwtMiddleware = (ctx, next) => {
	const token = ctx.cookies.get('access_tocken');
	if(!token) return next(); //토큰 없음
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET, null, null);
		console.log(decoded);
		return next();
	} catch (e) {
		//토큰 검증 실패
		return next();
	}
};

export default jwtMiddleware;