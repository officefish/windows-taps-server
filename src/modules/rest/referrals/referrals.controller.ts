import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Delete,
    //Param,
    Patch,
  } from '@nestjs/common'
  import { ReferralsService } from './referrals.service'
  import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiCreatedResponse,
  } from '@nestjs/swagger'
  import { CurrentUser } from '@/common/decorators'
  import { PlayersTokenDto } from '@/modules/token/dto'
  
  import { 
    GetReferralsQueryDto,
} from './dto'
  
  @ApiTags('referrals')
  @ApiBearerAuth()
  @Controller('referrals')
  export class ReferralsController {
    constructor(private readonly referralsService: ReferralsService) {}
  
    @Get()
    @ApiOperation({ summary: 'Get referrals' })
    @ApiResponse({ status: 200, description: 'List of referrals.' })
    @ApiResponse({ status: 404, description: 'Player not found.' })
    async getReferrals(
      @CurrentUser() currentUser: PlayersTokenDto,
      @Query() query: GetReferralsQueryDto,
    ) {
      return await this.referralsService.getReferrals(currentUser, query);
    }

    // @Post('calculate')
    // @ApiOperation({ summary: 'Calculate referral profit' })
    // @ApiResponse({
    //   status: 201,
    //   description: 'Referral profit added to referrer.',
    // })
    // @ApiResponse({ status: 400, description: 'Invalid input.' })
    // @ApiResponse({ status: 404, description: 'Player not found.' })
    // async calculateReferralProfit(
    //   @Body() dto: CreateReferralEarlyBonusDto,
    //   @Query('playerId') playerId: string,
    // ) {
    //   return await this.referralsService.calculateReferralProfit(dto, playerId);
    // }
  
  
    // @Post('collect')
    // @ApiOperation({ summary: 'Collect referral profit' })
    // @ApiResponse({ status: 200, description: 'Referral profit collected.' })
    // @ApiResponse({
    //   status: 404,
    //   description: 'Player or referral profit not found.',
    // })
    // async collectReferralProfit(@CurrentUser() currentUser: PlayersTokenDto) {
    //   return await this.referralsService.collectReferralProfit(currentUser);
    // }
  
    // @ApiOperation({ summary: 'Create a new referral quest' })
    // @ApiCreatedResponse({ description: 'Referral quest created successfully' })
    // @Post('quest')
    // async createReferralQuest(@Body() dto: CreateReferralQuestDto) {
    //   const referralQuest = await this.referralsService.createReferralQuest(dto);
    //   return referralQuest;
    // }
  
    // @ApiOperation({ summary: 'Update a referral quest by ID' })
    // @ApiOkResponse({ description: 'Referral quest updated successfully' })
    // @ApiNotFoundResponse({ description: 'Referral quest not found' })
    // @Patch('quest/:referralQuestId')
    // async updateReferralQuest(
    //   @Param('referralQuestId') referralQuestId: string,
    //   @Body() dto: UpdateReferralQuestDto,
    // ) {
    //   const result = await this.referralsService.updateReferralQuest(
    //     referralQuestId,
    //     dto,
    //   );
    //   return result;
    // }
  
    // @ApiOperation({ summary: 'Delete a referral quest by ID' })
    // @ApiOkResponse({ description: 'Referral quest deleted successfully' })
    // @ApiNotFoundResponse({ description: 'Referral quest not found' })
    // @Delete('quest/:referralQuestId')
    // async deleteReferralQuest(@Param('referralQuestId') referralQuestId: string) {
    //   const result =
    //     await this.referralsService.deleteReferralQuest(referralQuestId);
    //   return result;
    // }
  
    // @ApiOperation({ summary: 'Get a referral quest by ID' })
    // @ApiOkResponse({ description: 'Referral quest details' })
    // @ApiNotFoundResponse({ description: 'Referral quest not found' })
    // @Get('quest')
    // async getReferralQuest() {
    //   const referralQuest = await this.referralsService.getReferralQuests();
    //   return referralQuest;
    // }
  
    // @ApiOperation({ summary: 'Get and credit referral quest rewards for player' })
    // @ApiOkResponse({ description: 'Rewards credited successfully' })
    // @Post('profit/:playerId')
    // async getReferralQuestsProfit(@Param('playerId') playerId: string) {
    //   const result =
    //     await this.referralsService.getReferralQuestsProfit(playerId);
    //   return result;
    // }
  }