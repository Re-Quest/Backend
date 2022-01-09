import mongoose from "mongoose";

const {Schema} = mongoose;
const GuildSchema = new Schema({
	guildName: {type: String, required: true},
	guildDetail: {type: String},
	manager: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	users: [{
		user: {type: Schema.Types.ObjectId, ref: 'User'},
		position: {type: String, required: true}
	}],
	questHolders: [{type: Schema.Types.ObjectId, ref: 'QuestHolder'}]
});

const Guild = mongoose.model('Guild', GuildSchema);
export default Guild;