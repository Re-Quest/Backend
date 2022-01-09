import mongoose from "mongoose";

const {Schema} = mongoose;
const QuestSchema = new Schema({
	title: {type: String, required: true},
	questHolder: {type: Schema.Types.ObjectId, ref: "QuestHolder", required: true},
	holdingHistory: [{
		user: {type: Schema.Types.ObjectId, ref: "User"},
		order: {type: Number, required: true}
	}],
	comments: [{
		user: {type: Schema.Types.ObjectId, ref: "User"},
		date: {type: Date, required: true},
		comment: {type: String},
		stateChange: {type: String, required: true}
	}],
	holdingUser: {type: Schema.Types.ObjectId, ref: "User"},
	state: {type: String, required: true},
	dueDate: {type: Date, required: true},
	genDate: {type: Date, required: true},
})

QuestSchema.methods.serialize = function () {
	const data = this.toJSON();
	return data;
};

QuestSchema.statics.findByUserId = function (userId) {

};

QuestSchema.statics.findByTeamId = function (teamId) {
	//TODO: 추가 구현 예정
};

QuestSchema.statics.findByGuildId = function (guildId) {
	//TODO: 추가 구현 예정
};


//TODO in need



const Quest = mongoose.model('Quest', QuestSchema);
export default Quest;