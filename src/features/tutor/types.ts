import { ChatMessage } from '../../features/auth/types';

export type TutorChatMessage = ChatMessage;

export interface TutorSession {
  lessonId: string;
  userEmail: string;
  messages: TutorChatMessage[];
}
