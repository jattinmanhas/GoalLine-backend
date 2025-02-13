// __tests__/app.test.ts
import request from 'supertest';
import { Application } from 'express';
import { createServer } from "../src/index"; // Adjust the import based on your server setup

let app: Application;

beforeAll(async () => {
  app = await createServer(); // Adjust based on your server setup
});

describe('GET /', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });
});