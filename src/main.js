import Koa from "koa";
import Router from "koa-router";
import api from "./api";
import bodyParser from 'koa-bodyparser';

const app = new Koa();
const router = new Router();

router.use('/api', api.routes());
router.get('/', ctx => {
	ctx.body = "home";
});

app.use(bodyParser());

app.use(router.routes).use(router.allowedMethods());
app.listen(80, () => {
	console.log("Listening to port 80")
})