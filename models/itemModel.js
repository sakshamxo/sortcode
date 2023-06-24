const mongoose = require("mongoose");



const itemModel = new mongoose.Schema(
    {
        Article_code: {
            type: String,
            minLength: [1, "Article code must have atleast 1 characters"],
            required: [true, "Article code is required"],
            unique: true,
        },
        Item_name: {
            type: String,
            require: [true, "Item name is required"],
        },
        sellingprice: {
            type: Number,
            minLength: [1, "sellingprice must have atleast 1 number"],
            required: [true, "sellingprice field must not empty"],
        },
        Item_quantity: {
            type: Number,
            minLength: [1, "Item quantity must have atleast 1 number"],
            required: [true, "Item quantity field must not empty"],
        },
        Item_category: { 
            type: String,
            required: [true, "itemCategory field must not empty"],
            },
        Item_image: { 
            type: Object,
            default: {
                public_id: "",
                url: "",
            },
        },
        ItemAvailableFrom: { 
            type: Date, 
            required: [true, "ItemAvailableFrom field must not empty"],
        },
    },
    { timestamps: true }
);


const item = mongoose.model("item", itemModel);

module.exports = item;