const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favDishesScehma = new Schema({
    favDish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    },
},{
    timestamps: true
});

const favSchema = new Schema({
    user: {
        // point to an object in another schema
        type: mongoose.Schema.Types.ObjectId,
        // which schema? This schema
        ref: 'User'
    },
    dishes : [favDishesScehma]
},{
    timestamps: true
});

// create a model
// mongoose will create a collection called Dishes
var Favorite = mongoose.model('Favorite',favSchema);

module.exports = Favorite;