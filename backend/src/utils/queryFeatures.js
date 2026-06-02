/**
 * Reusable utility to apply pagination, sorting, selection, and filtering to Mongoose queries
 * @param {Object} model - Mongoose Model
 * @param {Object} reqQuery - Express req.query object
 * @param {Array|String|Object} populate - Optional populate parameters
 * @param {Object} baseFilter - Optional base query filter (e.g., { isDeleted: false })
 */
const queryFeatures = async (model, reqQuery, populate = '', baseFilter = {}) => {
  let query;

  // Copy reqQuery
  const reqQueryCopy = { ...reqQuery };

  // Fields to exclude from filtering matching fields directly
  const excludeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over excludeFields and remove them from reqQueryCopy
  excludeFields.forEach(param => delete reqQueryCopy[param]);

  // Combine base filter with query parameters (e.g. verifiedPurchase=true)
  let filter = { ...baseFilter };

  // Support advanced filtering operators (gt, gte, lt, lte, in, regex)
  let queryStr = JSON.stringify(reqQueryCopy);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
  const parsedFilter = JSON.parse(queryStr);
  
  // Merge advanced filters
  Object.assign(filter, parsedFilter);

  // Initialize query
  query = model.find(filter);

  // Select Fields
  if (reqQuery.select) {
    const fields = reqQuery.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort Fields
  if (reqQuery.sort) {
    // e.g. sort=date:-1 or sort=-date or sort=date:desc or sort=date:asc
    // We convert colon style (field:desc/field:asc/field:1/field:-1) to space-separated style for Mongoose
    const sortBy = reqQuery.sort
      .split(',')
      .map(s => {
        if (s.includes(':')) {
          const [field, dir] = s.split(':');
          return dir === 'desc' || dir === '-1' ? `-${field}` : field;
        }
        return s;
      })
      .join(' ');
    query = query.sort(sortBy);
  } else {
    // Default sort by date descending
    query = query.sort('-date');
  }

  // Populate
  if (populate) {
    query = query.populate(populate);
  }

  // Pagination
  const page = parseInt(reqQuery.page, 10) || 1;
  const limit = Math.min(parseInt(reqQuery.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  // Count total documents matching filters
  const total = await model.countDocuments(filter);

  // Execute query
  query = query.skip(skip).limit(limit);
  const results = await query;

  // Pagination result info
  const totalPages = Math.ceil(total / limit) || 1;
  const pagination = {
    page,
    limit,
    total,
    totalPages
  };

  if (page < totalPages) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (page > 1) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  return {
    results,
    pagination
  };
};

module.exports = queryFeatures;
