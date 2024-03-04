const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new Error('can not find the target to delete'));
    res.status(200).send({
      status: 'success',
      message: {
        data: doc
      }
    });
  } catch (err) {
    res.status(500).send({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateOne = Model => async (req, res) => {
  try {
    const newDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).send({
      status: 'success',
      message: {
        data: newDoc
      }
    });
  } catch (err) {
    res.status(500).send({
      status: 'fail',
      message: err.message
    });
  }
};

exports.createOne = Model => async (req, res) => {
  try {
    const newDoc = await Model.create(req.body);
    res.status(200).send({
      status: 'success',
      message: {
        data: newDoc
      }
    });
  } catch (err) {
    res.status(500).send({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getOne = (Model, popOptions) => async (req, res, next) => {
  try {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new Error('No Document Found'));
    }
    res.status(200).json({
      status: 'success',
      data: doc
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getAll = Model => async (req, res) => {
  try {
    //TO allow nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: doc
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};
