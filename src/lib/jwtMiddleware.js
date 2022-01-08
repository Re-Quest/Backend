import jwt from "jsonwebtoken";

const jwtMiddleware = (ctx, next) => {
	console.log('jwt!');
	const token = ctx.cookies.get('access_tocken');
	if(!token) {
		console.log("no token available!");
		return next();
	} //토큰 없음
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET, null, null);
		console.log(decoded);
		return next();
	} catch (e) {
		//토큰 검증 실패
		console.log("verify failed!");
		return next();
	}
};

export default jwtMiddleware;