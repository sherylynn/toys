const { describe, test, expect } = require('@jest/globals');

// 导入需要测试的函数
const { parseNetworkInterface, parseNetworkInterfaces, extractFlags } = require('../network.js');

describe('网卡信息解析测试', () => {
  test('解析单个网卡信息', () => {
    const sampleOutput = `en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255
	inet6 fe80::1234:5678:9abc:def0%en0 prefixlen 64 scopeid 0x4
	ether 00:11:22:33:44:55`;

    const result = parseNetworkInterface(sampleOutput);

    expect(result).toEqual({
      name: 'en0',
      status: 'up',
      flags: ['UP', 'BROADCAST', 'SMART', 'RUNNING', 'SIMPLEX', 'MULTICAST'],
      addresses: {
        ipv4: '192.168.1.100',
        ipv6: 'fe80::1234:5678:9abc:def0%en0',
        mac: '00:11:22:33:44:55'
      }
    });
  });

  test('解析多个网卡信息', () => {
    const sampleOutput = `en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255

` +
    `lo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384
	inet 127.0.0.1 netmask 0xff000000`;

    const result = parseNetworkInterfaces(sampleOutput);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('en0');
    expect(result[1].name).toBe('lo0');
  });

  test('解析网卡标志', () => {
    const line = 'en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500';
    const flags = extractFlags(line);

    expect(flags).toEqual(['UP', 'BROADCAST', 'SMART', 'RUNNING', 'SIMPLEX', 'MULTICAST']);
  });

  test('处理无效输入', () => {
    expect(parseNetworkInterface('')).toBeNull();
    expect(parseNetworkInterface(null)).toBeNull();
    expect(parseNetworkInterface(undefined)).toBeNull();
    expect(parseNetworkInterfaces('')).toEqual([]);
    expect(parseNetworkInterfaces(null)).toEqual([]);
    expect(parseNetworkInterfaces(undefined)).toEqual([]);
    expect(extractFlags('')).toEqual([]);
    expect(extractFlags('no flags')).toEqual([]);
  });

  test('处理特殊格式的网卡信息', () => {
    const specialOutput = `en1: flags=963<BROKEN,FORMAT> mtu
	inet 10.0.0.1`;
    const result = parseNetworkInterface(specialOutput);
    
    expect(result).toEqual({
      name: 'en1',
      status: 'down',
      flags: ['BROKEN', 'FORMAT'],
      addresses: {
        ipv4: '10.0.0.1'
      }
    });
  });

  test('处理不完整的网卡信息', () => {
    const incompleteOutput = 'en2: flags=8863<UP> mtu 1500';
    const result = parseNetworkInterface(incompleteOutput);
    
    expect(result).toEqual({
      name: 'en2',
      status: 'up',
      flags: ['UP'],
      addresses: {}
    });
  });
});