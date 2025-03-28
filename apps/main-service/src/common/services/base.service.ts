import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { OrderBy } from 'src/utils/types/orderBy';

export class BaseService<
  CreateDto,
  UpdateDto,
  WhereInput = any,
  SelectInput = any,
  IncludeInput = any,
> {
  constructor(
    protected databaseService: DatabaseService,
    protected modelName: Prisma.ModelName,
  ) {}

  findMany(params: {
    where?: WhereInput;
    select?: SelectInput;
    orderBy?: OrderBy<SelectInput>;
    include?: IncludeInput;
  }) {
    const { where, select, orderBy, include } = params;

    return this.databaseService[this.modelName].findMany({
      where,
      select,
      orderBy,
      include,
    });
  }

  async create(data: CreateDto, include?: IncludeInput) {
    return await this.databaseService[this.modelName].create({ data, include });
  }

  //   find unique

  async update(params: {
    data: UpdateDto;
    where?: WhereInput;
    include?: IncludeInput;
  }) {
    const { data, where, include } = params;
    return await this.databaseService[this.modelName].update({
      data,
      where,
      include,
    });
  }

  async findUnique(params: {
    where?: WhereInput;
    select?: SelectInput;
    include?: IncludeInput;
  }) {
    const { where, include, select } = params;
    return await this.databaseService[this.modelName].findUnique({
      where,
      include,
      select,
    });
  }

  async findById(params: {
    id: number | string;
    select?: SelectInput;
    include?: IncludeInput;
  }) {
    const { id, include, select } = params;
    return await this.databaseService[this.modelName].findUnique({
      where: { id },
      include,
      select,
    });
  }

  async deleteMany(params: { where: WhereInput }) {
    const { where } = params;
    return await this.databaseService[this.modelName].deleteMany({
      where,
    });
  }

  async findOrFailById(params: {
    id: number | string;
    where?: WhereInput;
    select?: SelectInput;
    include?: IncludeInput;
  }): Promise<any> {
    const { id, include, select } = params;

    const result = await this.findById({ id, include, select });
    if (!result) {
      throw new NotFoundException(`${this.modelName} with ID ${id} not found`);
    }
    return result;
  }

  async updateOrFailById(id: number | string, data: UpdateDto) {
    await this.findOrFailById({ id }); // This will throw if not found
    return this.databaseService[this.modelName].update({
      where: { id },
      data,
    });
  }

  delete(params: { where: WhereInput }) {
    const { where } = params;
    return this.databaseService[this.modelName].delete({
      where,
    });
  }

  async deleteOrFailById(id: number | string) {
    await this.findOrFailById({ id }); // This will throw if not found
    return this.databaseService[this.modelName].delete({ where: { id } });
  }

  async findWithPagination(params: {
    where?: WhereInput;
    select?: SelectInput;
    orderBy?: OrderBy<SelectInput>;
    include?: IncludeInput;
    page?: number;
    limit?: number;
  }) {
    const { where, select, orderBy, page = 0, limit = 20, include } = params;

    const skip = (page - 1) * limit;
    const take = limit;

    const totalItems = await this.databaseService[this.modelName].count({
      where,
    });
    const totalPages = Math.ceil(totalItems / limit);

    const finalOrderBy = orderBy || { createdAt: 'desc' };

    const items = await this.databaseService[this.modelName].findMany({
      where,
      orderBy: finalOrderBy,
      select,
      skip,
      take,
      include,
    });

    const hasNextPage = skip + limit < totalItems;

    return {
      items,
      totalItems,
      totalPages,
      currentPage: page,
      hasNextPage,
    };
  }
}
