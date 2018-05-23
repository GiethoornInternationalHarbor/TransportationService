import express from 'express';
import { inject, injectable } from 'inversify';
import {
  controller,
  httpPost,
  interfaces,
  next,
  request,
  response,
  httpGet
} from 'inversify-express-utils';
import { ITruckService } from '../application/services/itruck.service';
import { TYPES } from '../di/types';

@controller('/api/truck')
export class TruckController implements interfaces.Controller {
  constructor(
    @inject(TYPES.ITruckService) private truckService: ITruckService
  ) {}

  /**
   * Gets an overview of all the arriving/departing or already arrived at the harbor
   * @param res The response
   */
  @httpGet('/')
  private async getAll(@response() res: express.Response) {
    const trucks = await this.truckService.getOverview();
    res.status(200).json(trucks);
  }

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
    res.status(200).json(truck);
  }
}
