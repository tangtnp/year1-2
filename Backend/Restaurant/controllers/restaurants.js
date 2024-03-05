const Restaurant = require('../models/Restaurant');

const Review = require('../models/Review');

exports.getRestaurants=async(req,res,next)=>{

    let query;

    const reqQuery = {...req.query};

    const removeFields = ['select', 'sort', 'page', 'limit'];

    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    let queryStr=JSON.stringify(reqQuery);
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = Restaurant.find(JSON.parse(queryStr)).populate('reservations');

    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page,10)||1;
    const limit = parseInt(req.query.limit, 10)||25;
    const startIndex = (page-1)*limit;
    const endIndex = (page*limit);
    
    try{
        const total = await Restaurant.countDocuments();
        query = query.skip(startIndex).limit(limit);
        
        const restaurants = await query;

        for (let i = 0; i < restaurants.length; i++) {
            const avgRating = await Review.aggregate([
                {
                    $match: { restaurant: restaurants[i]._id }
                },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: "$rating" }
                    }
                }
            ]);

            restaurants[i] = { ...restaurants[i]._doc, reservations: restaurants[i].reservations, averageRating: avgRating.length > 0 ? avgRating[0].averageRating.toFixed(1) : 'No Review' };
        }

        const pagination = {};
        if(endIndex<total){
            pagination.next={
                page:page+1,
                limit
            }
        }

        if(startIndex > 0){
            pagination.prev={
                page:page-1,
                limit
            }
        }

        res.status(200).json({success:true,count: restaurants.length, data: restaurants});
    }catch(err){
        res.status(400).json({success:false});
    }
};

exports.getRestaurant=async(req,res,next)=>{
    try{
        const restaurant = await Restaurant.findById(req.params.id);

        if(!restaurant){
            return res.status(400).json({success:false});
        }

        const avgRating = await Review.aggregate([
            {
                $match: { restaurant: restaurant._id }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" }
                }
            }
        ]);

        res.status(200).json({success:true, data: restaurant, averageRating: avgRating.length > 0 ? avgRating[0].averageRating.toFixed(1) : 'No Review'});
    }catch(err){
        res.status(400).json({success:false});
    }
};



exports.createRestaurant=async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.create(req.body);
        res.status(201).json({success:true, data:restaurant});
    }catch(err){
        res.status(400).json({success:false, msg: "Please provide an alternative name for the restaurant, as the previous one has already been used."});
    }
};


exports.updateRestaurant=async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {

            new: true,
            runValidators: true
        });

        if(!restaurant){
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true, data: restaurant});

    }catch(err){
        res.status(400).json({success:false});
    }};

exports.deleteRestaurant = async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.findById(req.params.id);

        if(!restaurant){
            return res.status(400).json({success:false});
        }

        await restaurant.deleteOne();

        res.status(200).json({success:true, data: {}});
    }catch(err){
        res.status(400).json({success:false});
    }

};