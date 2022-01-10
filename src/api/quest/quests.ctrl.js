import Joi from "joi";
import Quest from "../../models/quest";
import QuestHolder from "../../models/questHolder";
import User from "../../models/user";


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
	const schema = Joi.object({
		title: Joi.string()
			.min(2)
			.max(20)
			.pattern(/^[가-힣|a-z|A-Z|0-9|\-|(|)|:]+$/)
			.required(),
		questHolder: Joi.string().required(),
		comment: Joi.string(),
		receiver: Joi.string().required(),
		generatedBy: Joi.string().required(),
		dueDate: Joi.date().required(),
		genDate: Joi.date().required(),
		img: Joi.number().required(),
	});
	const result = schema.validate(ctx.request.body);
	if (result.error) {
		ctx.status = 400; //Bad Request
		ctx.body = result.error;
		return;
	}

	const {
		title,
		questHolder,
		comment,
		receiver,
		generatedBy,
		dueDate,
		genDate,
		img
	} = ctx.request.body;

	try{

		//questHolder가 존재하는지 확인
		const exists = await QuestHolder.findById(questHolder)
		if (!exists) {
			ctx.status = 409; //Conflict
			return;
		}

		//QuestHolder 내에서 title 중복이 없는지 확인
		for (const quest in exists.quests) {
			const tempQuest = await Quest.findById(quest);
			if (tempQuest.title === title){
				ctx.status = 409;
				ctx.body = "same title in questHolder";
				return;
			}
		}

		//TODO: (추가구현) QuestHolder 와 같은 Guild 인지 확인 필요

		// user가 존재하는지 확인
		let userExists = await User.findById(receiver);
		userExists = userExists ? await User.findById(generatedBy) : null;
		if( !userExists ) {
			ctx.status = 400; //Bad request
			ctx.body = "check generatedBy & receiver id";
			return;
		}

		const quest = new Quest({
			title,
			dueDate,
			genDate,
			generatedBy,
			holdingUser: receiver,
			state: "quested",
			questHolder,
			comments: [{
				user: generatedBy,
				date: genDate,
				comment,
				stateChange: "quested",
			}],
			img,
		});
		await quest.save();
		ctx.body = quest;
	} catch (e) {
		ctx.throw(500, e);
	}
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
export const registerHolder = async ctx => {
	const schema = Joi.object({
		title: Joi.string()
			.min(2)
			.max(20)
			.required(),
		detail: Joi.string(),
		dueDate: Joi.date().required(),
		generatedBy: Joi.string().required(),
		img: Joi.number().required(),
	});

	const result = schema.validate(ctx.request.body);
	if (result.error) {
		ctx.status = 400; //Bad request
		ctx.body = result.error;
		return;
	}

	const {
		title,
		detail,
		dueDate,
		generatedBy,
		img
	} = ctx.request.body;

	try {

		//title 중복 확인
		//TODO: guild별 title 중복 확인
		const exists = await QuestHolder.findByTitle(title);
		if (exists) {
			ctx.status = 409; //Conflict
			ctx.body = "check title!";
			return;
		}

		//generatedBy 존재 확인
		const userExists = await User.findById(generatedBy);
		if(!userExists) {
			ctx.status = 400; //Bad request
			ctx.body = "Check User _id";
			return;
		}

		const questHolder = new QuestHolder({
			title, detail, dueDate, generatedBy, quests:[], img
		});
		await questHolder.save();
		ctx.body = questHolder;

	} catch (e) {
		ctx.throw(500, e);
	}

};

//퀘스트홀더 수정 (updateHolder)
export const updateHolder = async ctx => {};

//퀘스트홀더 삭제 (removeHolder)
export const removeHolder = async ctx => {};