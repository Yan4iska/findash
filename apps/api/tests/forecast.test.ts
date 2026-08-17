import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { forecastResponseSchema } from '@findash/shared';
import { authHeader, createCategory, getApp, registerUser } from './helpers.js';

describe('forecast', () => {
  it('projects recurring cash flow and flags an underfunded goal', async () => {
    const app = getApp();
    const auth = await registerUser(app);
    const token = auth.body.accessToken;
    const category = await createCategory(app, token, 'Essentials');
    const today = new Date().toISOString().slice(0, 10);
    await request(app)
      .post('/transactions')
      .set(authHeader(token))
      .send({
        categoryId: category.body.id,
        amount: 100,
        type: 'income',
        date: `${today}T12:00:00.000Z`,
      });
    const recurring = await request(app)
      .post('/forecast/recurring')
      .set(authHeader(token))
      .send({
        categoryId: category.body.id,
        amount: 150,
        type: 'expense',
        frequency: 'monthly',
        nextDate: `${today}T00:00:00.000Z`,
        description: 'Rent',
      });
    expect(recurring.status).toBe(201);
    const goal = await request(app)
      .post('/forecast/goals')
      .set(authHeader(token))
      .send({
        name: 'New laptop',
        targetAmount: 500,
        targetDate: `${today}T00:00:00.000Z`,
      });
    expect(goal.status).toBe(201);
    const response = await request(app).get('/forecast').set(authHeader(token)).query({ days: 30 });
    expect(response.status).toBe(200);
    expect(forecastResponseSchema.safeParse(response.body).success).toBe(true);
    expect(response.body.startingBalance).toBe(100);
    expect(
      response.body.alerts.some((alert: { type: string }) => alert.type === 'low_balance'),
    ).toBe(true);
    expect(
      response.body.alerts.some((alert: { type: string }) => alert.type === 'goal_at_risk'),
    ).toBe(true);
  });
});
