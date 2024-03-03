class ApiFeatures {
  public mongooseQuery: any;
  private queryString: any;
  paginationResult!: Record<string, any>;

  constructor(mongooseQuery: any, queryString: any) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }
  filter(): this {
    const queryStringObj: Record<string, any> = { ...this.queryString };
    const excludesFields: string[] = ["page", "sort", "limit", "fields"];
    excludesFields.forEach((field) => delete queryStringObj[field]);
    // Apply filtration using [gte, gt, lte, lt]
    let queryStr: string = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      const sortBy: string = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createAt");
    }
    return this;
  }

  limitFields(): this {
    if (this.queryString.fields) {
      const fields: string = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  search(modelName?: string) {
    if (this.queryString.keyword) {
      let query: { $or?: any } | { name?: any } = {}; // Union type for query

      if (modelName === "Product") {
        query = {
          $or: [
            { title: { $regex: this.queryString.keyword, $options: "i" } },
            {
              description: { $regex: this.queryString.keyword, $options: "i" },
            },
          ],
        };
      } else {
        query = { name: { $regex: this.queryString.keyword, $options: "i" } };
      }

      this.mongooseQuery = this.mongooseQuery.find(query as any); // Type assertion
    }
    return this;
  }

  paginate(countDocuments: number): this {
    const page: number = Number(this.queryString.page) * 1 || 1;
    const limit: number = Number(this.queryString.limit) * 1 || 50;
    const skip: number = (page - 1) * limit;
    const endIndex: number = skip * limit;

    const pagination: Record<string, any> = {};
    pagination.currentPage = page;
    pagination.limit = limit;

    // next page
    if (endIndex < countDocuments) {
      pagination.next = page + 1;
    }
    if (skip > 0) {
      pagination.prev = page - 1;
    }

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;

    return this;
  }
}

export default ApiFeatures;
