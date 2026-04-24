import { getChannel } from "./worldRoom/getChannel.service";
import { getWorldChannels } from "./worldRoom/getWorldChannels.service";
import { createChannel } from "./worldRoom/createChannel.service";
import { updateChannel } from "./worldRoom/updateChannel.service";
import { getChannelMessages } from "./worldRoom/getChannelMessages.service";
import { createChannelMessage } from "./worldRoom/createChannelMessage.service";
import { updateChannelMessage } from "./worldRoom/updateChannelMessage.service";

export type {
  CreateChannelDto,
  UpdateChannelDto,
  MessagePaginationParams,
  PaginatedResponse,
  CreateChannelMessageDto,
  UpdateChannelMessageDto,
} from "./worldRoom/types";

export const WorldRoomManager = {
  getChannel,
  getWorldChannels,
  createChannel,
  updateChannel,
  getChannelMessages,
  createChannelMessage,
  updateChannelMessage,
};
