const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');
const express = require('express');
const request = require('supertest');
const { networkRoutes } = require('../network.js');

let mockExec = jest.fn();

jest.mock('util', () => ({
  promisify: () => mockExec
}));

describe('网卡管理API集成测试', () => {
  let app;

  beforeAll(() => {
    // 创建测试用的Express应用
    app = express();
    app.use(express.json());
    app.use('/api/network', networkRoutes);

    // 模拟exec函数
    mockExec = jest.fn();
  });

  afterAll(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('GET /api/network - 获取所有网卡信息', async () => {
    const mockOutput = `en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255

` +
    `lo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384
	inet 127.0.0.1 netmask 0xff000000`;

    mockExec.mockResolvedValueOnce({ stdout: mockOutput });

    const response = await request(app)
      .get('/api/network')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].name).toBe('en0');
    expect(response.body.data[1].name).toBe('lo0');
  });

  test('GET /api/network/:name - 获取特定网卡信息', async () => {
    const mockOutput = `en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255`;

    mockExec.mockResolvedValueOnce({ stdout: mockOutput });

    const response = await request(app)
      .get('/api/network/en0')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('en0');
    expect(response.body.data.status).toBe('up');
  });

  test('POST /api/network/:name/up - 启用网卡', async () => {
    mockExec.mockResolvedValueOnce({ stdout: '' });

    const response = await request(app)
      .post('/api/network/en0/up')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('网卡 en0 已启用');
    expect(mockExec).toHaveBeenCalledWith('sudo ifconfig en0 up');
  });

  test('POST /api/network/:name/down - 禁用网卡', async () => {
    mockExec.mockResolvedValueOnce({ stdout: '' });

    const response = await request(app)
      .post('/api/network/en0/down')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('网卡 en0 已禁用');
    expect(mockExec).toHaveBeenCalledWith('sudo ifconfig en0 down');
  });

  test('DELETE /api/network/:name - 删除网卡', async () => {
    mockExec.mockResolvedValueOnce({ stdout: '' });

    const response = await request(app)
      .delete('/api/network/en0')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('网卡 en0 已删除');
    expect(mockExec).toHaveBeenCalledWith('sudo ifconfig en0 destroy');
  });

  test('错误处理 - 命令执行失败', async () => {
    mockExec.mockRejectedValueOnce(new Error('Command failed'));

    const response = await request(app)
      .get('/api/network')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('服务器内部错误');
  });

  test('GET /api/network/:name - 处理无效网卡名称', async () => {
    mockExec.mockRejectedValueOnce(new Error('Device not found'));

    const response = await request(app)
      .get('/api/network/invalid_device')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('服务器内部错误');
  });

  test('POST /api/network/:name/up - 处理特殊字符网卡名称', async () => {
    const response = await request(app)
      .post('/api/network/en0%20test/up')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(response.body.success).toBe(false);
  });

  test('处理无权限执行命令的情况', async () => {
    mockExec.mockRejectedValueOnce(new Error('Permission denied'));

    const response = await request(app)
      .post('/api/network/en0/up')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('服务器内部错误');
  });
});