require('dotenv').config();
import Koa from "koa";
import Router from "koa-router";
import api from "./api";
import bodyParser from 'koa-bodyparser';
const mongoose = require('mongoose')

const app = new Koa();
const router = new Router();

const { PORT, MONGO_URI } = process.env;

// mongoose.connect(MONGO_URI);
mongoose.connect(MONGO_URI).then(() => {
	console.log("Connected to MongoDB");
}).catch(e => {
	console.error(e);
})

router.use('/api', api.routes());
router.get('/', ctx => {
	ctx.body = "home";
});

app.use(bodyParser());

app.use(router.routes()).use(router.allowedMethods());
app.listen(PORT, () => {
	console.log("Listening to port 80")
})