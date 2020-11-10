const req = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');
const { clearDirectory } = require('./src/utils/docsHandles');

const configObject = {
  restaurants: [
    {
      name: 'su corrientazo a domicilio',
      perimeterOfService: 10,
      numberOfDrones: 20,
      initialStateOfDrones: {
        location: { x: 0, y: 0 },
        direction: 90,
        availableLoad: 4,
      },
    },
  ],
};

describe('endpoints', () => {
  beforeAll(async () => {
    for (const collection in mongoose.connection.collections) {
      await mongoose.connection.collections[collection].deleteMany({});
    }
    clearDirectory('./src/files/out');
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should create a restaurant with the correct configurations', async (done) => {
    jest.setTimeout(10000);
    const res = await req(app).post('/config').send(configObject);
    expect(res.statusCode).toBe(200);
    expect(res.body[0].perimeterOfService).toBe(10);
    expect(res.body[0].drones.length).toBe(20);
    done();
  });

  it('should send succesfully a path file', async (done) => {
    const res = await req(app)
      .post('/routes')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', './src/files/in/test/in01test.txt');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/all orders sent/i);
    done();
  });

  it('should send succesfully multiple path files', async (done) => {
    const res = await req(app)
      .post('/routes')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', './src/files/in/test/in02test.txt');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/all orders sent/i);
    done();
  });

  it('should retrieve the correct reports in text format', async (done) => {
    const res = await req(app).get('/routes');
    const reports = res.text.split('\r\n');
    expect(reports.length).toBe(5);
    expect(reports[1]).toMatch('==reporte de entregas==');
    expect(reports[2]).toMatch('(2, 4) dirección oriente');
    expect(reports[3]).toMatch('(4, 7) dirección norte');
    expect(reports[4]).toMatch('(3, 5) dirección occidente');
    done();
  });

  it('should retrieve the reports in zip format', async (done) => {
    const res = await req(app)
      .get('/routes?zip=true')
      .expect('Content-Type', 'application/zip')
      .expect('content-disposition', 'attachment; filename=reports.zip')
      .expect(200);
    done();
  });
});
