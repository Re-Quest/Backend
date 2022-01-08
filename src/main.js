import Router from "koa-router";
import api from "./api";

const app = new Router();


app.use('/api', api.routes());
app.listen(80, () => {
	console.log("Listening to port 80")
})