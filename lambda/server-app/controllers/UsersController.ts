import {
  Controller,
  Route,
  Post,
  Get,
  Body,
  Query,
  Path,
  Security,
} from 'tsoa';
import { UserRepository } from '../../../shared/repositories/UserRepository';

type VoteUserParams = {
  vote: number;
};

@Route('users')
export class UsersController extends Controller {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    super();
    this.userRepository = userRepository;
  }

  @Security('JWTAuth')
  @Get()
  public async getUsers(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 25,
    @Query('sort') sort?: string | null,
    @Query('sortField') sortField?: string,
    @Query('filerField') filerField?: string | null,
    @Query('filerOperator') filerOperator?: string,
    @Query('filerValue') filerValue?: string,
    @Query('nameSearch') nameSearch?: string,
    @Query('citySearch') citySearch?: string,
    @Query('genderSearch') genderSearch?: string,
    @Query('voteSearch') voteSearch?: number,
    @Query('ageFrom') ageFrom?: number,
    @Query('ageTo') ageTo?: number,
    @Query('heightFrom') heightFrom?: number,
    @Query('heightTo') heightTo?: number,
  ) {
    const skip = page * pageSize;
    const take = pageSize;

    let orderBy = undefined;
    if (sortField) {
      orderBy = {
        [sortField]: sort,
      };
    }

    let voteFilter: any = { votes: { equals: null } };
    if (voteSearch) {
      voteFilter = { votes: { equals: voteSearch } };
    }

    const where: any = {
      AND: [
        voteFilter,
        filerValue && filerField && filerOperator
          ? { [filerField]: { [filerOperator]: filerValue } }
          : null,
        nameSearch
          ? {
              OR: [
                { firstName: { contains: nameSearch, mode: 'insensitive' } },
                { lastName: { contains: nameSearch, mode: 'insensitive' } },
                { username: { contains: nameSearch, mode: 'insensitive' } },
              ],
            }
          : null,
        citySearch
          ? { city: { contains: citySearch, mode: 'insensitive' } }
          : null,
        genderSearch ? { gender: { equals: genderSearch } } : null,
        ageFrom ? { age: { gte: ageFrom } } : null,
        ageTo ? { age: { lte: ageTo } } : null,
        heightFrom
          ? {
              OR: [
                { height: { equals: null } },
                { height: { gte: heightFrom } },
              ],
            }
          : null,
        heightTo
          ? {
              OR: [{ height: { equals: null } }, { height: { lte: heightTo } }],
            }
          : null,
      ].filter(Boolean),
    };

    const items = await this.userRepository.getUsers({
      skip,
      take,
      orderBy,
      where,
    });
    const count = await this.userRepository.getUsersCount({
      skip,
      take,
      where,
    });
    return { items, count };
  }

  @Security('JWTAuth')
  @Get('{userId}')
  public async getUser(@Path() userId: number) {
    const user = await this.userRepository.getUser({
      id: userId,
    });
    return user;
  }

  @Security('JWTAuth')
  @Post('{userId}/vote')
  public async voteUser(@Path() userId: number, @Body() body: VoteUserParams) {
    const user = await this.userRepository.voteUser({
      id: userId,
      vote: body.vote,
    });
    return user;
  }
}
