import { FilterQuery, Model } from 'mongoose';
import { IPaginationOptions, IPaginatedResponse } from '../../types/pagination.types';

export class PaginationService {
  /**
   * Generic pagination method for Mongoose models
   * @param model The Mongoose model to query
   * @param filter The filter criteria
   * @param options Pagination options (page, limit, sort, etc.)
   * @returns Paginated response with data and metadata
   */
  static async paginate<T>(
    model: Model<T>,
    filter: FilterQuery<T> = {},
    options: IPaginationOptions,
  ): Promise<IPaginatedResponse<T>> {
    const { page, limit, sortBy, sortOrder, select, populate } = options;

    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, Math.min(limit, 100)); // Limit to 100 items max
    const skip = (validPage - 1) * validLimit;

    // Create sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute the query with pagination
    const query = model.find(filter);

    // Apply select if provided
    if (select) {
      query.select(select);
    }

    // Apply populate if provided
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach((field) => {
          query.populate(field);
        });
      } else {
        query.populate(populate);
      }
    }

    // Apply sort and pagination
    const data = await query.sort(sort).skip(skip).limit(validLimit);

    // Get total count for pagination metadata
    const total = await model.countDocuments(filter);
    const totalPages = Math.ceil(total / validLimit);

    return {
      data,
      meta: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1,
      },
    };
  }
}
