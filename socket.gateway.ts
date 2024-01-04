import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('reply-invite')
  handleReplyInvite(data: any) {
    this.server.emit('reply-invite', data);
  }

  @SubscribeMessage('getProjects')
  handleGetProjects(data: any) {
    this.server.emit('getProjects', data);
  }

  @SubscribeMessage('getProjectsOfBusiness')
  handleGetProjectsOfBusiness(data: any) {
    this.server.emit('getProjectsOfBusiness', data);
  }

  @SubscribeMessage('chooseGroup')
  handleChooseGroup(data: any) {
    this.server.emit('chooseGroup', data);
  }

  @SubscribeMessage('getPhases')
  handleGetPhases(data: any) {
    this.server.emit(`getPhases-${data.projectId}`, data);
  }

  @SubscribeMessage('getCategories')
  handleGetCategories(data: any) {
    this.server.emit(`getCategories-${data.phaseId}`, data);
  }

  @SubscribeMessage('changePhaseStatus')
  handleChangePhaseStatus(data: any) {
    this.server.emit('changePhaseStatus', data);
  }

  @SubscribeMessage('changeCategoryStatus')
  handleChangeCategoryStatus(data: any) {
    this.server.emit('changeCategoryStatus', data);
  }

  @SubscribeMessage('getNotifications')
  handleGetNotifications(data: any) {
    this.server.emit(`getNotifications-${data.receiverEmail}`, data);
  }

  @SubscribeMessage('getSummaryReports')
  handleGetSummaryReports(data: any) {
    this.server.emit(`getSummaryReports-${data.projectId}`, data);
  }

  @SubscribeMessage('getAllUserChats')
  handleGetAllUserChats(data: any) {
    this.server.emit(`getAllUserChats-${data.identifierUserChat}`, data);
  }

  @SubscribeMessage('getAllMessage')
  handleGetAllMessage(data: any) {
    this.server.emit(`getAllMessage-${data.identifierUserChat}`, data);
  }

  @SubscribeMessage('getNewMessage')
  handleGetNewMessage(data: any) {
    this.server.emit(`getNewMessage-${data.userEmail}`, data);
  }

  @SubscribeMessage('getAllNewMessage')
  handleGetAllNewMessage(data: any) {
    this.server.emit(`getAllNewMessage-${data.identifierUserChat}`, data);
  }
}
