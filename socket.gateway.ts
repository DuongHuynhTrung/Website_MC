import {
  OnGatewayInit,
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
export class SocketGateway implements OnGatewayInit {
  private static server: Server;

  @WebSocketServer() serverInstance: Server;

  afterInit(server: Server) {
    SocketGateway.setServerInstance(server);
  }

  static setServerInstance(server: Server) {
    SocketGateway.server = server;
  }

  private static emitToServer(event: string, data: any) {
    if (SocketGateway.server) {
      SocketGateway.server.emit(event, data);
    } else {
      console.error('Socket server is not initialized!');
    }
  }

  @SubscribeMessage('reply-invite')
  static handleReplyInvite(data: any) {
    SocketGateway.emitToServer('reply-invite', data);
  }

  @SubscribeMessage('getProjects')
  static handleGetProjects(data: any) {
    SocketGateway.emitToServer('getProjects', data);
  }

  @SubscribeMessage('getProjectsOfBusiness')
  static handleGetProjectsOfBusiness(data: any) {
    SocketGateway.emitToServer(
      `getProjectsOfBusiness-${data.emailBusiness}`,
      data,
    );
  }

  @SubscribeMessage('chooseGroup')
  static handleChooseGroup(data: any) {
    SocketGateway.emitToServer('chooseGroup', data);
  }

  @SubscribeMessage('getPhases')
  static handleGetPhases(data: any) {
    SocketGateway.emitToServer(`getPhases-${data.projectId}`, data);
  }

  @SubscribeMessage('getCategories')
  static handleGetCategories(data: any) {
    SocketGateway.emitToServer(`getCategories-${data.phaseId}`, data);
  }

  @SubscribeMessage('changePhaseStatus')
  static handleChangePhaseStatus(data: any) {
    SocketGateway.emitToServer('changePhaseStatus', data);
  }

  @SubscribeMessage('changeCategoryStatus')
  static handleChangeCategoryStatus(data: any) {
    SocketGateway.emitToServer('changeCategoryStatus', data);
  }

  @SubscribeMessage('getNotifications')
  static handleGetNotifications(data: any) {
    SocketGateway.emitToServer(`getNotifications-${data.receiverEmail}`, data);
  }

  @SubscribeMessage('getSummaryReports')
  static handleGetSummaryReports(data: any) {
    SocketGateway.emitToServer(`getSummaryReports-${data.projectId}`, data);
  }

  @SubscribeMessage('getAllUserChats')
  static handleGetAllUserChats(data: any) {
    SocketGateway.emitToServer('getAllUserChats', data);
  }

  @SubscribeMessage('getAllMessage')
  static handleGetAllMessage(data: any) {
    SocketGateway.emitToServer(
      `getAllMessage-${data.identifierUserChat}`,
      data,
    );
  }

  @SubscribeMessage('getNewMessage')
  static handleGetNewMessage(data: any) {
    SocketGateway.emitToServer(`getNewMessage-${data.userEmail}`, data);
  }

  @SubscribeMessage('getAllNewMessage')
  static handleGetAllNewMessage(data: any) {
    SocketGateway.emitToServer(
      `getAllNewMessage-${data.identifierUserChat}`,
      data,
    );
  }

  @SubscribeMessage('getAllRegisterPitching')
  static handleGetAllRegisterPitching(data: any) {
    SocketGateway.emitToServer(`getAllRegisterPitching-${data.email}`, data);
  }
}
