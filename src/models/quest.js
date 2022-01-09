import mongoose from "mongoose";

const {Schema} = mongoose;
const QuestSchema = new Schema({
	taskName: String,
	parentId: String,
	childTasks: [String],
	headId: String,
	holderHistory: [String],
	comments: [{
		nickname: String,
		date: Date,
		commentDetail: String,
		stateChange: String,
	}],
	currentHolder: String,
	state: String,
	dueDate: Date,
	genDate: Date,
})

QuestSchema.methods.serialize = function () {
	const data = this.toJSON();
	return data;
};

QuestSchema.methods.checkPermissionWrite = function (userId) {
	// 현재 holder만 편집 가능
};

QuestSchema.methods.checkPermissionEnd = function (userId) {
	// 생성자만 remove/terminate 가능
};

QuestSchema.statics.findByUserId = function (userId) {

};

QuestSchema.statics.findByTeamId = function (teamId) {
	//TODO: 추가 구현 예정
};

QuestSchema.statics.findByGuildId = function (guildId) {
	//TODO: 추가 구현 예정
};

QuestSchema.statics.update


//TODO



const Quest = mongoose.model('Quest', QuestSchema);
export default Quest;