import { Injectable, OnModuleInit } from '@nestjs/common';
import { NotificationsService } from '../notifications.service';
import { NotificationsGateway } from '../gateways/notifications.gateway';

/**
 * Provider to handle circular dependency between NotificationsService and NotificationsGateway
 * This sets up the connections after both services are initialized
 */
@Injectable()
export class GatewayConnectProvider implements OnModuleInit {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  onModuleInit() {
    // Set the gateway reference in the service
    this.notificationsService.setNotificationsGateway(this.notificationsGateway);
  }
}
