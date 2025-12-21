import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AdminTokenGuard } from '../auth/admin-token.guard';
import { FollowingService } from './following.service';

@Controller('fedify')
export class FollowingController {
  constructor(private readonly followingService: FollowingService) {}

  @Get('following')
  @UseGuards(AdminTokenGuard)
  async getFollowing(@Query('status') status?: string) {
    return this.followingService.getFollowingList(status);
  }

  @Get('followers')
  @UseGuards(AdminTokenGuard)
  async getFollowers(@Query('status') status?: string) {
    return this.followingService.getFollowersList(status);
  }

  @Post('follow')
  @UseGuards(AdminTokenGuard)
  async follow(@Body() body: { target: string }) {
    return this.followingService.follow(body.target);
  }

  @Post('unfollow')
  @UseGuards(AdminTokenGuard)
  async unfollow(@Body() body: { target: string }) {
    return this.followingService.unfollow(body.target);
  }

  @Get('timeline')
  async getTimeline(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.followingService.getTimeline(limitNum);
  }
}
