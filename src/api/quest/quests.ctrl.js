import Joi from "@hapi/joi";
import Quest from "../../models/quest";
import QuestHolder from "../../models/questHolder";


//TODO: read
//홀더내 퀘스트 목록 조회 (questsInHolder)
export const questsInHolder = async ctx => {

};

//유저와 연관된 퀘스트 목록 상태별로 분류 조회 (userQuests)
export const userQuests = async ctx => {};

//홀더 목록 조회 (readHolders)
export const readHolders = async ctx => {};

//TODO: Quest
//퀘스트 생성 (quest)
export const quest = async ctx => {
	const schema = Joi.object().keys({
	})
};

//퀘스트 수정&전달 (request)
export const request = async ctx => {};

//퀘스트 수락 (confirm)
export const confirm = async ctx => {};

//퀘스트 완료 (complete)
export const complete = async ctx => {};

//퀘스트 종결 (terminate)
export const terminate = async ctx => {};

//퀘스트 삭제 (removeQuest)
export const removeQuest = async ctx => {};

//TODO: QuestHolder
//퀘스트홀더 생성 (registerHolder)
export const registerHolder = async ctx => {};

//퀘스트홀더 수정 (updateHolder)
export const updateHolder = async ctx => {};

//퀘스트홀더 삭제 (removeHolder)
export const removeHolder = async ctx => {};