import type { ISODateTime } from "./common";

export interface DMSenderInfo {
  id: number;
  username: string;
  avatar: string | null;
}

export interface DirectMessage {
  id: number;
  thread: number;
  sender: number;
  content: string;
  sender_info: DMSenderInfo;
  created_at: ISODateTime | null;
  updated_at: ISODateTime | null;
}

export interface DMLastMessage {
  id: number;
  content: string;
  sender_id: number;
  created_at: ISODateTime | null;
}

export interface DirectMessageThread {
  id: number;
  user_a: number;
  user_b: number;
  other_user: DMSenderInfo;
  last_message: DMLastMessage | null;
  has_unread: boolean;
  created_at: ISODateTime | null;
}

export interface WorldMember {
  id: number;
  name: string;
  description: string | null;
  avatar: string | null;
  user_id: number;
}

export interface ProfilePopupData {
  id: number;
  name: string;
  description?: string | null;
  avatar: string | null;
  user_id: number;
}
