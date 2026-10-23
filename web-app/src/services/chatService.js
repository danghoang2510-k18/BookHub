import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

const authConfig = (extra = {}) => ({
  ...extra,
  headers: {
    Authorization: `Bearer ${getToken()}`,
    ...(extra.headers || {}),
  },
});

export const getMyConversations = async () =>
  httpClient.get(API.MY_CONVERSATIONS, authConfig());

export const getConversationMessages = async (conversationId) =>
  httpClient.get(API.GET_CONVERSATION_MESSAGES, authConfig({ params: { conversationId } }));

export const createChatMessage = async (conversationId, content) =>
  httpClient.post(
    API.CREATE_MESSAGE,
    { conversationId, content },
    authConfig({ headers: { "Content-Type": "application/json" } })
  );
