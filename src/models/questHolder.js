import mongoose from "mongoose";

const {Schema} = mongoose;
const QuestHolderSchema = new Schema({
	title: {type: String, required: true},
	detail: {type: String},
	dueDate: {type: Date, required: true},
	genDate: {type: Date, required: true},
	generatedBy: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	img: {type: Number, required: true},
});

//TODO in need

//methods


//statics
QuestHolderSchema.statics.findByTitle = function (title) {
	return this.findOne({title});
}

const QuestHolder = mongoose.model('questHolder', QuestHolderSchema);
export default QuestHolder;