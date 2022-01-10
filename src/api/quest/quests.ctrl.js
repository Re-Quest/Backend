import Joi from "joi";
import Quest from "../../models/quest";
import QuestHolder from "../../models/questHolder";
import User from "../../models/user";


//TODO: read
//홀더내 퀘스트 목록 조회 (questsInHolder)
export const questsInHolder = async ctx => {

	//로그인 상태 확인
	const { user } = ctx.state;
	if (!user) {
		// 로그인 상태 아님
		ctx.status = 401;
		return;
	}
	const userInfo = await User.findByUserId(user.userId);
	if (!userInfo) { //존재하지 않는 계정
		ctx.status = 401;
		return;
	}

	try {
		const {questHolder} = ctx.query;
		ctx.body = await Quest.findByQuestHolder(questHolder)
			.populate("generatedBy",{_id:1, userId:1, username:1, profileImg:1})
			.populate("heldUser",{_id:1, userId:1, username:1, profileImg:1})
			.populate("holdingUser",{_id:1, userId:1, username:1, profileImg:1})
			.populate("comments.user",{_id:1, userId:1, username:1, profileImg:1});
	}catch (e) {
		ctx.throw(500, e);
	}

};

//유저와 연관된 퀘스트 목록 상태별로 분류 조회 (userQuests)
export const userQuests = async ctx => {

	//로그인 상태 확인
	const { user } = ctx.state;
	if (!user) {
		// 로그인 상태 아님
		ctx.status = 401;
		return;
	}
	const userInfo = await User.findByUserId(user.userId);
	if (!userInfo) { //존재하지 않는 계정
		ctx.status = 401;
		return;
	}

	try {
		const generated = await Quest.findByGeneratedBy(userInfo._id);
		const sent = await Quest.findByHeldUser(userInfo._id);
		const received = await Quest.findByHoldingUser(userInfo._id);

		let result = { generated, sent, received };
		ctx.body = result;
	} catch (e) {
		ctx.throw(500,e);
	}
};

//홀더 목록 조회 (readHolders)
export const readHolders = async ctx => {
	//로그인 상태 확인
	const { user } = ctx.state;
	if (!user) {
		// 로그인 상태 아님
		ctx.status = 401;
		return;
	}
	const userInfo = await User.findByUserId(user.userId);
	if (!userInfo) { //존재하지 않는 계정
		ctx.status = 401;
		return;
	}

	try{
		ctx.body = await QuestHolder.find().populate("generatedBy",{_id:1, userId:1, username:1, email:1, phone:1, profileImg:1});
	} catch (e) {
		ctx.throw(500, e);
	}
};

//TODO: Quest
//퀘스트 생성 (quest)
export const quest = async ctx => {
	//로그인 상태 확인
	const { user } = ctx.state;
	if (!user) {
		// 로그인 상태 아님
		ctx.status = 401;
		return;
	}
	const userInfo = await User.findByUserId(user.userId);
	if (!userInfo) { //존재하지 않는 계정
		ctx.status = 401;
		return;
	}

	const schema = Joi.object({
		title: Joi.string()
			.min(2)
			.required(),
		questHolder: Joi.string().required(),
		comment: Joi.string(),
		receiver: Joi.string().required(),
		dueDate: Joi.date().required(),
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
		dueDate
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
		const userExists = await User.findById(receiver);
		if( !userExists ) {
			ctx.status = 400; //Bad request
			ctx.body = "check generatedBy & receiver id";
			return;
		}

		const genDate = await new Date();

		const quest = new Quest({
			title,
			dueDate,
			genDate,
			generatedBy: userInfo._id,
			holdingUser: receiver,
			heldUser: userInfo._id,
			state: "quest",
			questHolder,
			comments: [{
				user: userInfo._id,
				date: genDate,
				comment,
				stateChange: "quest",
			}],
		});
		await quest.save();
		ctx.body = quest;
	} catch (e) {
		ctx.throw(500, e);
	}
};

//퀘스트 수정&전달 (request)
export const request = async ctx => {
	//로그인 상태 확인
	const { user } = ctx.state;
	if (!user) {
		// 로그인 상태 아님
		ctx.status = 401;
		return;
	}
	const userInfo = await User.findByUserId(user.userId);
	if (!userInfo) { //존재하지 않는 계정
		ctx.status = 401;
		return;
	}

	const schema = Joi.object({
		_id: Joi.string().required(),
		title: Joi.string()
			.min(2),
		comment: Joi.string().required(),
		receiver: Joi.string().required(),
		dueDate: Joi.date()
	});

	const result = schema.validate(ctx.request.body);
	if (result.error) {
		ctx.status = 400; //Bad Request
		ctx.body = result.error;
		return;
	}

	try {
		const {
			_id, title, comment, receiver, dueDate
		} = ctx.request.body;

		const quest = await Quest.findById(_id);
		if (!quest) {
			ctx.status = 400; //Bad Request
			ctx.body = "No Quest match _id!";
			return;
		}

		if (userInfo._id !== quest.holdingUser) {
			ctx.status = 400; //Bac request
			ctx.body = "You are not Holding the Quest!";
			return;
		}

		let setter = {
			holdingUser: receiver,
			heldUser: quest.holdingUser,
			state: "request",
		};
		if (title) setter.title = title;
		if (dueDate) setter.dueDate = dueDate;

		await Quest.updateOne(
			{_id},
			{
				$push: {
					comments: {
						user: userInfo._id,
						date: new Date(),
						comment,
						stateChange: "request"
					}
				},
				"$set": setter
			});
	} catch (e) {
		ctx.throw(500, e);
	}
};

//퀘스트 수락 (confirm)
export const confirm = async ctx => {
	//로그인 상태 확인
	const { user } = ctx.state;
	if (!user) {
		// 로그인 상태 아님
		ctx.status = 401;
		return;
	}
	const userInfo = await User.findByUserId(user.userId);
	if (!userInfo) { //존재하지 않는 계정
		ctx.status = 401;
		return;
	}

	const schema = Joi.object({
		_id: Joi.string().required(),
		comment: Joi.string().required(),
	});

	const result = schema.validate(ctx.request.body);
	if (result.error) {
		ctx.status = 400; //Bad Request
		ctx.body = result.error;
		return;
	}

	try {
		const {
			_id, comment
		} = ctx.request.body;

		const quest = await Quest.findById(_id);
		if (!quest) {
			ctx.status = 400; //Bad Request
			ctx.body = "No Quest match _id!";
			return;
		}

		if (quest.state !== "request" && quest.state !== "quest") {
			ctx.status = 400; //Bad Request
			ctx.body = "Quest is not in request/quest state!";
			return;
		}

		if (userInfo._id !== quest.holdingUser) {
			ctx.status = 400; //Bac request
			ctx.body = "You are not Holding the Quest!";
			return;
		}

		let setter = {
			state: "confirm",
		};

		await Quest.updateOne(
			{_id},
			{
				$push: {
					comments: {
						user: userInfo._id,
						date: new Date(),
						comment,
						stateChange: "confirm"
					}
				},
				"$set": setter
			});
	} catch (e) {
		ctx.throw(500, e);
	}
};

//퀘스트 완료 (complete)
export const complete = async ctx => {

	//로그인 상태 확인
	const { user } = ctx.state;
	if (!user) {
		// 로그인 상태 아님
		ctx.status = 401;
		return;
	}
	const userInfo = await User.findByUserId(user.userId);
	if (!userInfo) { //존재하지 않는 계정
		ctx.status = 401;
		return;
	}

	const schema = Joi.object({
		_id: Joi.string().required(),
		comment: Joi.string().required(),
	});

	const result = schema.validate(ctx.request.body);
	if (result.error) {
		ctx.status = 400; //Bad Request
		ctx.body = result.error;
		return;
	}

	try {
		const {
			_id, comment
		} = ctx.request.body;

		const quest = await Quest.findById(_id);
		if (!quest) {
			ctx.status = 400; //Bad Request
			ctx.body = "No Quest match _id!";
			return;
		}

		if (userInfo._id !== quest.holdingUser) {
			ctx.status = 400; //Bac request
			ctx.body = "You are not Holding the Quest!";
			return;
		}

		if (quest.state !== "confirm") {
			ctx.status = 400; //Bac request
			ctx.body = "Quest is not in CONFIRM state!";
			return;
		}

		let setter = {
			holdingUser: quest.generatedBy,
			heldUser: quest.holdingUser,
			state: "complete",
		};

		await Quest.updateOne(
			{_id},
			{
				$push: {
					comments: {
						user: userInfo._id,
						date: new Date(),
						comment,
						stateChange: "complete"
					}
				},
				"$set": setter
			});
	} catch (e) {
		ctx.throw(500, e);
	}
};

//퀘스트 종결 (terminate)
export const terminate = async ctx => {
	//로그인 상태 확인
	const { user } = ctx.state;
	if (!user) {
		// 로그인 상태 아님
		ctx.status = 401;
		return;
	}
	const userInfo = await User.findByUserId(user.userId);
	if (!userInfo) { //존재하지 않는 계정
		ctx.status = 401;
		return;
	}

	const schema = Joi.object({
		_id: Joi.string().required(),
		comment: Joi.string().required(),
	});

	const result = schema.validate(ctx.request.body);
	if (result.error) {
		ctx.status = 400; //Bad Request
		ctx.body = result.error;
		return;
	}

	try {
		const {
			_id, comment
		} = ctx.request.body;

		const quest = await Quest.findById(_id);
		if (!quest) {
			ctx.status = 400; //Bad Request
			ctx.body = "No Quest match _id!";
			return;
		}

		if (quest.state !== "complete") {
			ctx.status = 400; //Bad Request
			ctx.body = "Quest is not in complete state!";
			return;
		}

		if (userInfo._id !== quest.holdingUser) {
			ctx.status = 400; //Bac request
			ctx.body = "You are not Holding the Quest!";
			return;
		}

		let setter = {
			state: "terminate",
		};

		await Quest.updateOne(
			{_id},
			{
				$push: {
					comments: {
						user: userInfo._id,
						date: new Date(),
						comment,
						stateChange: "terminate"
					}
				},
				"$set": setter
			});
	} catch (e) {
		ctx.throw(500, e);
	}
};

//퀘스트 삭제 (removeQuest)
export const removeQuest = async ctx => {
	//로그인 상태 확인
	const { user } = ctx.state;
	if (!user) {
		// 로그인 상태 아님
		ctx.status = 401;
		return;
	}
	const userInfo = await User.findByUserId(user.userId);
	if (!userInfo) { //존재하지 않는 계정
		ctx.status = 401;
		return;
	}
	const schema = Joi.object({
		_id: Joi.string().required(),
		password: Joi.string().required()
	});

	const result = schema.validate(ctx.request.body);
	if (result.error) {
		ctx.status = 400; //Bad Request
		ctx.body = result.error;
		return;
	}

	const {_id, password} = ctx.request.body;
	const checkPwd = await userInfo.checkPassword(password);
	if (!checkPwd) {
		ctx.status = 401; //Unauthorized
		return;
	}

	const quest = await Quest.findById(_id);
	if (!quest) {
		ctx.status = 400; //Bad Request
		ctx.body = "No Quest match _id!";
		return;
	}

	if (userInfo._id.toString() !== quest.generatedBy.toString()) {
		ctx.status = 400; //Bac request
		ctx.body = "You are not generator of the Quest!";
		return;
	}

	try {
		const deletedQuest = await Quest.findOneAndDelete({_id});
		ctx.body = 	deletedQuest;
	} catch (e) {
		ctx.throw(500,e);
	}
};

//TODO: QuestHolder
//퀘스트홀더 생성 (registerHolder)
export const registerHolder = async ctx => {

	//로그인 상태 확인
	const { user } = ctx.state;
	if (!user) {
		// 로그인 상태 아님
		ctx.status = 401;
		return;
	}
	const userInfo = await User.findByUserId(user.userId);
	if (!userInfo) { //존재하지 않는 계정
		ctx.status = 401;
		return;
	}

	const schema = Joi.object({
		title: Joi.string()
			.min(2)
			.max(20)
			.required(),
		detail: Joi.string(),
		dueDate: Joi.date().required(),
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

		const questHolder = new QuestHolder({
			title, detail, dueDate, genDate: await new Date(), generatedBy: userInfo._id, quests:[], img
		});
		await questHolder.save();
		ctx.body = questHolder;

	} catch (e) {
		ctx.throw(500, e);
	}

};

//퀘스트홀더 수정 (updateHolder)
export const updateHolder = async ctx => {
	//로그인 상태 확인
	const { user } = ctx.state;
	if (!user) {
		// 로그인 상태 아님
		ctx.status = 401;
		return;
	}
	const userInfo = await User.findByUserId(user.userId);
	if (!userInfo) { //존재하지 않는 계정
		ctx.status = 401;
		return;
	}

	const schema = Joi.object({
		_id: Joi.string().required(),
		title: Joi.string()
			.min(2),
		detail: Joi.string(),
		dueDate: Joi.date(),
		img: Joi.number()
	});

	const result = schema.validate(ctx.request.body);
	if (result.error) {
		ctx.status = 400; //Bad Request
		ctx.body = result.error;
		return;
	}

	try {
		const {
			_id, title, detail, dueDate, img
		} = ctx.request.body;

		const questHolder = await QuestHolder.findById(_id);
		if (!questHolder) {
			ctx.status = 400; //Bad Request
			ctx.body = "No QuestHolder match _id!";
			return;
		}

		if (userInfo._id.toString() !== questHolder.generatedBy.toString()) {
			ctx.status = 400; //Bac request
			ctx.body = "You are not generator of the QuestHolder!";
			return;
		}

		let setter = {};
		if (title) setter.title = title;
		if (dueDate) setter.dueDate = dueDate;
		if (detail) setter.detail = detail;
		if (img) setter.img = img;

		await QuestHolder.updateOne(
			{_id},
			{ "$set": setter });
	} catch (e) {
		ctx.throw(500, e);
	}
};

//퀘스트홀더 삭제 (removeHolder)
export const removeHolder = async ctx => {
	//로그인 상태 확인
	const { user } = ctx.state;
	if (!user) {
		// 로그인 상태 아님
		ctx.status = 401;
		return;
	}
	const userInfo = await User.findByUserId(user.userId);
	if (!userInfo) { //존재하지 않는 계정
		ctx.status = 401;
		return;
	}
	const schema = Joi.object({
		_id: Joi.string().required(),
		password: Joi.string().required()
	});

	const result = schema.validate(ctx.request.body);
	if (result.error) {
		ctx.status = 400; //Bad Request
		ctx.body = result.error;
		return;
	}

	const {_id, password} = ctx.request.body;
	const checkPwd = await userInfo.checkPassword(password);
	if (!checkPwd) {
		ctx.status = 401; //Unauthorized
		return;
	}

	const questHolder = await QuestHolder.findById(_id);
	if (!questHolder) {
		ctx.status = 400; //Bad Request
		ctx.body = "No QuestHolder match _id!";
		return;
	}

	if (userInfo._id.toString() !== questHolder.generatedBy.toString()) {
		ctx.status = 400; //Bad request
		ctx.body = userInfo._id + "You are not generator of the QuestHolder!" + questHolder.generatedBy;
		return;
	}

	try {
		const deletedHolder = await QuestHolder.findOneAndDelete({_id});
		const deletedQuests = await Quest.findByQuestHolderAndDelete(_id);
		ctx.body = {
			deletedHolder,
			deletedQuests
		};
	} catch (e) {
		ctx.throw(500,e);
	}
};

//퀘스트홀더 진행도 0~100
export const progress = async ctx => {
	//로그인 상태 확인
	const { user } = ctx.state;
	if (!user) {
		// 로그인 상태 아님
		ctx.status = 401;
		return;
	}
	const userInfo = await User.findByUserId(user.userId);
	if (!userInfo) { //존재하지 않는 계정
		ctx.status = 401;
		return;
	}

	try {
		const {questHolder} = ctx.query;
		const result = await Quest.find({questHolder, state: "terminate"});
		const numTerm = result.length;
		const allresult = await Quest.find({questHolder});
		const numAll = allresult.length;
		ctx.body = {
			progress: parseInt( 100 * numTerm / numAll),
			total: numAll
		};
	}catch (e) {
		ctx.throw(500, e);
	}
}