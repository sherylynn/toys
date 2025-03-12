const request = require('supertest');
const { app, server } = require('../src/index');
const { parseNetworkInterface } = require('../src/routes/network');

beforeAll((done) => {
  server.on('listening', done);
});

afterAll((done) => {
  server.close(done);
});

beforeEach(async () => {
  await execAsync('sudo ifconfig vnic_test0 create');
});

afterEach(async () => {
  await execAsync('sudo ifconfig vnic_test0 destroy');
});

describe('网络接口API', () => {
  describe('删除接口', () => {
    it('应该成功删除有效虚拟网卡', async () => {
      const res = await request(app)
        .delete('/network/vnic_test0')
        .set('Authorization', 'Bearer valid_token');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
    });

    it('应该拒绝无效网卡名称', async () => {
      const res = await request(app)
        .delete('/network/invalid*name')
        .set('Authorization', 'Bearer valid_token');
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('无效的网卡名称');
    });

    it('应该拒绝删除核心网卡', async () => {
      const res = await request(app)
        .delete('/network/en0')
        .set('Authorization', 'Bearer valid_token');
      
      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toContain('核心网卡不可删除');
    });

    it('应该处理权限不足的情况', async () => {
      const res = await request(app)
        .delete('/network/testvnic0')
        .set('Authorization', 'Bearer valid_token');
      
      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toContain('无权限');
    });
  });
});