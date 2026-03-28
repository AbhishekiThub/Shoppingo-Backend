class APIFeatures {

  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // SEARCH
  search() {

    const keyword = this.queryString.keyword
      ? {
          name: {
            $regex: this.queryString.keyword,
            $options: "i"
          }
        }
      : {};

    this.query = this.query.find({ ...keyword });

    return this;
  }

  // FILTER
  filter() {

    const queryCopy = { ...this.queryString };

    const removeFields = ["keyword", "page", "limit", "sort"];

    removeFields.forEach(field => delete queryCopy[field]);

    let queryStr = JSON.stringify(queryCopy);

    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte)\b/g,
      match => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // SORT
  sort() {

    if (this.queryString.sort) {

      const sortBy = this.queryString.sort.split(",").join(" ");

      this.query = this.query.sort(sortBy);

    } else {

      this.query = this.query.sort("-createdAt");

    }

    return this;
  }

  // PAGINATION
  paginate(resultPerPage) {

    const currentPage = Number(this.queryString.page) || 1;

    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }

}

export default APIFeatures;