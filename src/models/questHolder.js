import mongoose from "mongoose";

const {Schema} = mongoose;
const QuestHolderSchema = new Schema({
	title: {type: String, required: true},
	detail: {type: String},
	dueDate: {type: Date, required: true                                           },
	generatedBy: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	quests: [{type: Schema.Types.ObjectId, ref: 'Quest'}]
});

//TODO in need

const QuestHolder = mongoose.model('questHolder', QuestHolderSchema);
export default QuestHolder;