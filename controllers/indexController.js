const User = require("../models/userModel");
const Item = require("../models/itemModel")
const { sendToken } = require("../utils/auth");
const cloudinary = require("cloudinary")
const formidable = require("formidable");


cloudinary.config({
    cloud_name: "saksham-cloudinary",
    api_key: "189448485493991",
    api_secret: "0D_kAbEmi8MfWafDnlBO5aeGPe8",
    secure: true,
  });


exports.homepage = (req, res, next) => {
    res.json({ message: "This is homepage...", user: req.user });
};

exports.currentuser = (req, res) => {
    res.status(200).json({ user: req.user });
};

exports.signup = async (req, res, next) => {
    try {
        let user = await User.findOne({ email: req.body.email }).exec();
        if (user) {
            return res.status(501).json({ message: "user exists" });
        }
        const newUser = new User(req.body);
        user = await newUser.save();
        sendToken(user, req, res, 200);
        console.log(user)
    } catch (error) {
        res.status(501).json({ message: error.message });
    }
    // res.json({})
};

exports.signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const {phone}    = req.body;
        let user = await User.findOne({ $or: [{ email }, { phone }] }).select("+password").exec();
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        console.log(user)

        const matchpassword = user.comparepassword(password);

        if (!matchpassword) {
            return res.status(500).json({ message: "wrong credientials" });
        }

        sendToken(user, req, res, 200);
    } catch (error) {
        res.status(501).json({ message: error.message });
    }
    // res.json({})
};

exports.signout = (req, res, next) => {
    res.clearCookie("token");
    res.status(200).json({ message: "logged out success" });
};

exports.upload = async (req, res) => {
    try {
        const form = formidable();
        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(500).json({ message: err });
            const item = await Item.findById(req.item._id).exec();
            if (files) {
                const { public_id, secure_url } =
                    await cloudinary.v2.uploader.upload(files.image.filepath, {
                        folder: "kira",
                        width: 1920,
                        crop: "scale",
                    });
                item.Item_image = { public_id, url: secure_url };
                await item.save();
                res.status(200).json({ message: "Image Uploaded" });
            } else {
                res.status(500).json({ message: "No file uploaded" });
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.itemcreate = async (req, res, next) => {
    const {  Article_code,
        Item_name,
        sellingprice,
        Item_quantity,
        Item_category,
        Item_image,
        ItemAvailableFrom} = req.body;
    try {
        let item = await Item.findOne({ Article_code: req.body.Article_code }).exec();
        if (item) {
            return res.status(501).json({ message: "item exists" });
        }
        const newItem = new Item({
            Article_code,
            Item_name,
            sellingprice,
            Item_quantity,
            Item_category,
            Item_image,
            ItemAvailableFrom: new Date(Date.parse(ItemAvailableFrom)),
          });
        item = await newItem.save();
        console.log(item)
        res.status(200).json({ message: "item created" , item});
    } catch (error) {
        res.status(501).json({ message: error.message });
    }
    // res.json({})
};

exports.itemfil = async (req,res,next)=>{
    const { page = 1, limit = 10, sort = 'Item_name', category = '', search = '' } = req.body;
    console.log(category)
    console.log(search)
    const skip = (page - 1) * limit;
    const query = {};
    console.log(query)
    if (category) {
      query.Item_category = category;
      console.log(category)
    }
    if (search) {
      query.Item_name = { $regex: new RegExp(search, 'i') };
    }
  
    try {
      const items = await Item.find(query)
        .sort({ [sort]: 1 })
        .skip(skip)
        .limit(parseInt(limit));
      const count = await Item.countDocuments(query);
      const totalPages = Math.ceil(count / limit);
        console.log(items)
      res.status(200).json({ message: "filtered items",
        items,
        currentPage: parseInt(page),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
}

exports.itemupdate = async (req,res)=>{
    const {Article_code,
        Item_name,
        sellingprice,
        Item_quantity,
        Item_category,
        Item_image,
        ItemAvailableFrom} = req.body;
        try {
       const item = await Item.findOneAndUpdate(req.body.Article_code,{
           Item_name,
           sellingprice,
           Item_quantity,
           Item_category,
           Item_image,
           ItemAvailableFrom},{new: true}).exec()
        if(item){
            console.log(item)
            await item.save()
            res.status(200).json({message:"updated",item})
        }
        else{
            res.status(500).json({message:"not found"})
        }
   } catch (error) {
    res.status(500).json({ message: error });
   }
}

exports.deleteitem = async (req,res)=>{
    try {
        const item = await Item.findOneAndDelete(req.body.Article_code).exec()
        if(item){
            res.status(200).json({message: "deleted successfully"})
        } else{
            res.status(500).json({message : "item not found"})
        }
    } catch (error) {
        res.status(500).json({message : error})
    }
}

exports.showitems = async (req,res)=>{
    const { page = 1, limit = 10, sort = 'Item_name', category = '', search = '' } = req.query;
    const skipIndex = (page - 1) * limit;
    const query = {};
    
    if (category) {
      query.Item_category = category;
    }
    
    if (search) {
      query.Item_name = { $regex: new RegExp(search, 'i') };
    }
    
    try {
      const totalItems = await Item.countDocuments(query);
      const items = await Item.find(query)
        .sort({ [sort]: 1 })
        .skip(skipIndex)
        .limit(parseInt(limit));
        
      res.status(200).json({
        message: "all items",
        totalItems,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        items,
      });
    } catch (error) {
      res.status(500).json({ message: error });
    }
}





