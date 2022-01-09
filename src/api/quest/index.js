import Router from "koa-router";
import * as questCtrl from './quests.ctrl';

const questRouter = new Router();

questRouter.post('/questsInHolder', questCtrl.questsInHolder);
questRouter.post('/userQuests', questCtrl.userQuests);
questRouter.post('/readHolders', questCtrl.readHolders);
questRouter.post('/quest', questCtrl.quest);
questRouter.post('/request', questCtrl.request);
questRouter.post('/terminate', questCtrl.terminate);
questRouter.post('/confirm', questCtrl.confirm);
questRouter.post('/complete', questCtrl.complete);
questRouter.post('/removeQuest', questCtrl.removeQuest);
questRouter.post('/registerHolder', questCtrl.registerHolder);
questRouter.post('/updateHolder', questCtrl.updateHolder);
questRouter.post('/removeHolder', questCtrl.removeHolder);

export default questRouter;