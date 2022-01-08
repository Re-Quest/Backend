import mongoose from "mongoose";

const {Schema} = mongoose;
const QuestSchema = new Schema({
	task_name: String,
	parent_id: String,
	child_tasks: [String],
	head_id: String,
	holder_history: [String],
	comments: [{
		nickname: String,
		date: Date,
		comment_detail: String,
		state_change: String,
	}],
	current_holder: String,
	state: String,
	due_date: Date,
	gen_date: Date,
})

QuestSchema.methods.serialize = function () {
	const data = this.toJSON();
	return data;
};

//TODO



const Quest = mongoose.model('Quest', QuestSchema);
export default Quest;