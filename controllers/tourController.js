const fs = require('fs');
const Tour = require('./../models/tourModel');

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const exlcudeFields = ['page', 'sort', 'limit', 'fields'];
    exlcudeFields.forEach(el => delete queryObj[el]);
    Tour.find(queryObj);
    const tours = await Tour.find(queryObj);
    res.status(200).json({
      status: 'success',
      data: tours
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: tour
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(200).send({
      status: 'success',
      message: {
        data: newTour
      }
    });
  } catch (err) {
    res.status(500).send({
      status: 'fail',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).send({
      status: 'success',
      message: {
        data: newTour
      }
    });
  } catch (err) {
    res.status(500).send({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).send({
      status: 'success',
      message: {
        data: deletedTour
      }
    });
  } catch (err) {
    res.status(500).send({
      status: 'fail',
      message: err
    });
  }
};
