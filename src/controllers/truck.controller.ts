import express from 'express';
import { inject, injectable } from 'inversify';
import {
  controller,
  httpPost,
  interfaces,
  next,
  request,
  response
} from 'inversify-express-utils';
import { ITruckService } from '../application/services/itruck.service';
import { TYPES } from '../di/types';

@controller('/api/truck')
export class TruckController implements interfaces.Controller {
  constructor(
    @inject(TYPES.ITruckService) private truckService: ITruckService
  ) {}

  @httpPost('/arrive')
  private async arrive(
    @request() req: express.Request,
    @response() res: express.Response
  ) {
    const truck = await this.truckService.arrive(req.body);
    res.status(201).json(truck);
  }

  @httpPost('/depart')
  private async depart(
    @request() req: express.Request,
    @response() res: express.Response
  ) {
    const truck = await this.truckService.depart(req.body);
    res.status(201).json(truck);
  }
}
