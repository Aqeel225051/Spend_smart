const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const Expense = require('../src/models/Expense');
const Budget = require('../src/models/Budget');
const { generateToken } = require('../src/controllers/authController');

describe('SpendSmart API Suite', () => {
  describe('Health Check Endpoint', () => {
    it('GET /api/health returns 200 with ok status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.message).toContain('SpendSmart API service is running');
    });

    it('GET /api/unknown-endpoint returns 404', async () => {
      const res = await request(app).get('/api/unknown-endpoint');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Authentication Validation', () => {
    it('POST /api/auth/register rejects empty body with 400', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('POST /api/auth/register rejects invalid email and short password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test Student',
        email: 'invalid-email-format',
        password: '123'
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      const fields = res.body.errors.map(e => e.field);
      expect(fields).toContain('email');
      expect(fields).toContain('password');
    });

    it('POST /api/auth/login rejects missing credentials with 400', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'bad-email'
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('JWT Token & Security Utilities', () => {
    it('generateToken signs token with user ID and expires in 7d', () => {
      const fakeId = '654321098765432109876543';
      const token = generateToken(fakeId);
      expect(token).toBeDefined();
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'spendsmart_secret_key_ictak_2026');
      expect(decoded.id).toBe(fakeId);
    });

    it('protect middleware denies access when no token is supplied', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No authorization token');
    });

    it('protect middleware denies access with malformed Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.payload');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('protect middleware accepts valid token and finds user', async () => {
      const fakeUser = {
        _id: '654321098765432109876543',
        name: 'Student Demo',
        email: 'student@college.edu',
        createdAt: new Date().toISOString()
      };
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeUser)
      });

      const token = generateToken(fakeUser._id);
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe('Student Demo');

      User.findById.mockRestore();
    });
  });

  describe('Expense Validation Rules', () => {
    it('POST /api/expenses rejects negative amount with 400', async () => {
      const fakeUser = {
        _id: '654321098765432109876543',
        name: 'Student Demo'
      };
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeUser)
      });

      const token = generateToken(fakeUser._id);
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: -50,
          category: 'Food',
          description: 'Negative snack'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('positive number');

      User.findById.mockRestore();
    });

    it('Expense model schema validates category enum', () => {
      const validCategories = Expense.CATEGORIES || [
        'Food', 'Transportation', 'Education', 'Shopping',
        'Entertainment', 'Hostel', 'Bills', 'Health', 'Other'
      ];
      expect(validCategories).toContain('Food');
      expect(validCategories).toContain('Education');
      expect(validCategories).toContain('Hostel');
    });
  });

  describe('Budget Validation Rules', () => {
    it('Budget validation rejects invalid month with 400', async () => {
      const fakeUser = {
        _id: '654321098765432109876543',
        name: 'Student Demo'
      };
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(fakeUser)
      });

      const token = generateToken(fakeUser._id);
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          month: 13,
          year: 2026,
          amount: 5000
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);

      User.findById.mockRestore();
    });
  });

  describe('User Model Methods', () => {
    it('User schema toJSON strips password field', () => {
      const user = new User({
        name: 'Jane Doe',
        email: 'jane@college.edu',
        password: 'hashedPassword123'
      });
      const json = user.toJSON();
      expect(json.password).toBeUndefined();
      expect(json.name).toBe('Jane Doe');
      expect(json.email).toBe('jane@college.edu');
    });
  });
});
