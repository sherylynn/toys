const express = require('express');
const asyncHandler = require('express-async-handler');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const router = express.Router();

// 获取所有网卡信息
router.get('/', asyncHandler(async (req, res) => {
  const { stdout } = await execAsync('ifconfig');
  const interfaces = parseNetworkInterfaces(stdout);
  res.json({
    success: true,
    data: interfaces
  });
}));

// 验证网卡名称的中间件
const validateInterfaceName = (req, res, next) => {
  const { name } = req.params;
  if (!name || !/^[a-zA-Z0-9]+$/.test(name)) {
    return res.status(400).json({
      success: false,
      message: '无效的网卡名称'
    });
  }
  next();
};

// 获取特定网卡状态
router.get('/:name', validateInterfaceName, asyncHandler(async (req, res) => {
  const { name } = req.params;
  try {
    const { stdout } = await execAsync(`ifconfig ${name}`);
    const interfaceInfo = parseNetworkInterface(stdout);
    if (!interfaceInfo) {
      return res.status(404).json({
        success: false,
        message: `未找到网卡 ${name}`
      });
    }
    res.json({
      success: true,
      data: interfaceInfo
    });
  } catch (error) {
    if (error.message.includes('Device not found')) {
      return res.status(404).json({
        success: false,
        message: `未找到网卡 ${name}`
      });
    }
    throw error;
  }
}));

// 启用网卡
router.post('/:name/up', validateInterfaceName, asyncHandler(async (req, res) => {
  const { name } = req.params;
  try {
    await execAsync(`sudo ifconfig ${name} up`);
    res.json({
      success: true,
      message: `网卡 ${name} 已启用`
    });
  } catch (error) {
    if (error.message.includes('Permission denied')) {
      return res.status(403).json({
        success: false,
        message: '无权限执行此操作'
      });
    }
    throw error;
  }
}));

// 禁用网卡
router.post('/:name/down', validateInterfaceName, asyncHandler(async (req, res) => {
  const { name } = req.params;
  try {
    await execAsync(`sudo ifconfig ${name} down`);
    res.json({
      success: true,
      message: `网卡 ${name} 已禁用`
    });
  } catch (error) {
    if (error.message.includes('Permission denied')) {
      return res.status(403).json({
        success: false,
        message: '无权限执行此操作'
      });
    }
    throw error;
  }
}));

// 删除网卡
// 在路由定义前添加权限验证中间件
const validateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token !== 'valid_token') {
    return res.status(403).json({
      success: false,
      message: '无权限执行此操作'
    });
  }
  next();
};

// 修改删除路由处理逻辑
router.delete('/:name', validateInterfaceName, validateToken, asyncHandler(async (req, res) => {
  const { name } = req.params;
  try {
    await execAsync(`sudo ifconfig ${name} destroy`);
    res.json({
      success: true,
      message: `网卡 ${name} 已删除`
    });
  } catch (error) {
    if (error.message.includes('Operation not permitted')) {
      return res.status(403).json({
        success: false,
        message: '无权限执行此操作'
      });
    }
    console.error(`网卡删除失败: ${error}`);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
}));

// 解析网卡信息的辅助函数
function parseNetworkInterfaces(output) {
  if (!output) return [];
  const interfaces = [];
  const blocks = output.split('\n\n');
  
  for (const block of blocks) {
    if (block.trim()) {
      const interfaceInfo = parseNetworkInterface(block);
      if (interfaceInfo) {
        interfaces.push(interfaceInfo);
      }
    }
  }
  
  return interfaces;
}

function parseNetworkInterface(output) {
  if (!output) return null;
  const lines = output.split('\n');
  const firstLine = lines[0];
  if (!firstLine) return null;

  const nameMatch = firstLine.match(/^([^:]+)/);
  if (!nameMatch) return null;

  const info = {
    name: nameMatch[1],
    status: firstLine.includes('UP') ? 'up' : 'down',
    flags: extractFlags(firstLine),
    addresses: {}
  };

  for (const line of lines) {
    if (line.includes('inet ')) {
      const ipv4Match = line.match(/inet\s+([^\s]+)/);
      if (ipv4Match) {
        info.addresses.ipv4 = ipv4Match[1];
      }
    } else if (line.includes('inet6 ')) {
      const ipv6Match = line.match(/inet6\s+([^\s]+)/);
      if (ipv6Match) {
        info.addresses.ipv6 = ipv6Match[1];
      }
    } else if (line.includes('ether ')) {
      const macMatch = line.match(/ether\s+([^\s]+)/);
      if (macMatch) {
        info.addresses.mac = macMatch[1];
      }
    }
  }

  return info;
}

function extractFlags(line) {
  const flagsMatch = line.match(/<([^>]+)>/);
  return flagsMatch ? flagsMatch[1].split(',') : [];
}

router.get('/network', async (req, res) => {
  try {
    const interfaces = await getNetworkInterfaces();
    res.json(interfaces.map(intf => ({
      name: intf.name,
      status: intf.status || 'active',
      ipAddress: intf.ipv4 || 'N/A',
      macAddress: intf.mac.replace(/:/g, '-').toUpperCase()
    })));
  } catch (error) {
    console.error('获取网卡信息失败:', error);
    res.status(500).json([]);
  }
});

// 导出路由和辅助函数供测试使用
module.exports = {
  networkRoutes: router,
  parseNetworkInterface,
  parseNetworkInterfaces,
  extractFlags
};