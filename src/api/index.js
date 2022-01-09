import Router from "koa-router";
import auth from "./auth";
import questRouter from "./quest";


const api = new Router();

api.use('/auth', auth.routes());
api.use('/quest', questRouter.routes());

export default api;