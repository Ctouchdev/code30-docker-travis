const mongoose = require("mongoose");

const userinputSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    usrTitle: String,
    usrContent: String
});

module.exports = mongoose.model("Userinput", userinputSchema);
