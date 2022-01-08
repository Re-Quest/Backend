import Router from "koa-router";
import * as questCtrl from './quests.ctrl';

const questRouter = new Router();

questRouter.post('/quest', questCtrl.quest);
questRouter.post('/request', questCtrl.request);
questRouter.post('/terminate', questCtrl.terminate);
questRouter.post('/onProgress', questCtrl.onProgress);
questRouter.post('/complete', questCtrl.complete);
questRouter.post('/remove', questCtrl.remove);
questRouter.post('/readOne', questCtrl.readOne);
questRouter.post('/readAll', questCtrl.readAll);

export default questRouter;