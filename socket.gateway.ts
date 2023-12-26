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
    this.server.emit('getPhases', data);
  }

  @SubscribeMessage('getCategories')
  handleGetCategories(data: any) {
    this.server.emit('getCategories', data);
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
    console.log(data);
    console.log(data.receiverEmail);
    this.server.emit(`getNotifications-${data.receiverEmail}`, data);
  }

  @SubscribeMessage('getSummaryReports')
  handleGetSummaryReports(data: any) {
    this.server.emit('getSummaryReports', data);
  }
}
