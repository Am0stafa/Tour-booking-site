//! in this file rather than having alot of duplicate code such as delete update create and reading we will create a factory function which will take the model as an input and return a function to be invoked
//^ this work due to clousers which means that this inner function will get access to the varibales of the outer function even if the outer function has already returned.

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
    
    
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });


//& factors for getting documents

//* here w pass the model and if we want to populate we simple pass the populate options ex:{path:... ,select:...}
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    //! we first build the query then execute it in the end by awaiting it
    let query = Model.findById(req.params.id)
    
    //* only for the tour
    if(req.params.tourId) query.find({tour:req.params.tourId})
    
    //? if we passed populate options we wanto add it to the query
    if (popOptions) query = query.populate(popOptions);
    //? finallt exeute the query
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
  
exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find({}), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    });
  });
