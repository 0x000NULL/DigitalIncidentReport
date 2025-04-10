const request = require('supertest');
const express = require('express');
const path = require('path');
const winston = require('winston');
const indexRouter = require('../../routes/index');

// Mock winston logger
jest.mock('../../config/logger', () => {
  return {
    info: jest.fn(),
    error: jest.fn()
  };
});

const winstonLogger = require('../../config/logger');

describe('Index Route Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    
    // Set up view engine and views directory
    app.set('views', path.join(__dirname, '../../views'));
    app.set('view engine', 'ejs');
    
    app.use('/', indexRouter);
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should render the index page with correct title', async () => {
      const response = await request(app)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200);

      expect(response.text).toContain('Digital Incident Report');
    });

    it('should log the request with correct metadata', async () => {
      const mockIp = '127.0.0.1';
      const mockUserAgent = 'Mozilla/5.0';

      await request(app)
        .get('/')
        .set('user-agent', mockUserAgent)
        .set('x-forwarded-for', mockIp)
        .expect(200);

      expect(winstonLogger.info).toHaveBeenCalledWith('Home page accessed', {
        ip: expect.any(String),
        userAgent: mockUserAgent
      });
    });

    it('should handle errors gracefully', async () => {
      // Mock the render function to throw an error
      const originalRender = app.render;
      app.render = jest.fn().mockImplementation((view, locals, callback) => {
        callback(new Error('Render error'));
      });

      const response = await request(app)
        .get('/')
        .expect(500);

      expect(response.text).toContain('Error');
      
      // Restore original render function
      app.render = originalRender;
    });
  });
}); 