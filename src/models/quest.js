import mongoose from "mongoose";

const {Schema} = mongoose;
const QuestSchema = new Schema({
	title: {type: String, required: true},
	questHolder: {type: Schema.Types.ObjectId, ref: "QuestHolder", required: true},
	comments: [{
		user: {type: Schema.Types.ObjectId, ref: "User"},
		date: {type: Date, required: true},
		comment: {type: String},
		stateChange: {type: String, required: true},
	}],
	generatedBy: {type: Schema.Types.ObjectId, ref: "User"},
	holdingUser: {type: Schema.Types.ObjectId, ref: "User"},
	heldUser: {type: Schema.Types.ObjectId, ref: "User"},
	state: {type: String, required: true},
	dueDate: {type: Date, required: true},
	genDate: {type: Date, required: true},
})


//methods
QuestSchema.methods.serialize = function () {
	return this.toJSON();
}

//TODO in need

//methods

QuestSchema.statics.findByQuestHolder = function (questHolder) {
	return this.find({questHolder});
}

QuestSchema.statics.findByQuestHolderAndDelete = async function (questHolder) {
	const quests = await this.find({questHolder});
	console.log(quests);
	let result = [];
	for (const quest of quests) {
		const deleted = await Quest.findOneAndDelete({_id:quest._id});
		result.push(deleted);
	}
	return result;
}

QuestSchema.statics.findByGeneratedBy = function (generatedBy) {
	return this.find({generatedBy});
}

QuestSchema.statics.findByHeldUser = function (heldUser) {
	return this.find({heldUser});
}

QuestSchema.statics.findByHoldingUser = function (holdingUser) {
	return this.find({holdingUser});
}
//statics

const Quest = mongoose.model('Quest', QuestSchema);
export default Quest;