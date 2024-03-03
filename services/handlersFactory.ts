import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import { Document, Model } from "mongoose";
import ApiError from "../utils/apiError";
import ApiFeatures from "../utils/apiFeatures";

export const deleteOne = <T extends Document>(Model: Model<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    res.status(204).send();
  });

export const updateOne = <T extends Document>(Model: Model<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ data: document });
  });

export const createOne = <T extends Document>(Model: Model<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const document = await Model.create(req.body);
    res.status(201).json({ data: document });
  });

export const getOne = <T extends Document>(Model: Model<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const document = await Model.findById(id);
    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });

export const getAll = <T extends Document>(Model: Model<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    //Build query
    const countDocuments: number = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(), req.query)
      .paginate(countDocuments)
      .filter()
      .search()
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res.status(200).json({
      results: documents.length as number,
      paginationResult,
      data: documents,
    });
  });
