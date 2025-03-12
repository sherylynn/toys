#!/usr/bin/env node
const { exec } = require('child_process');
const { promisify } = require('util');
const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const execAsync = promisify(exec);

// 检测虚拟网卡
async function detectVirtualInterfaces() {
  try {
    const { stdout } = await execAsync('ifconfig');
    return stdout
      .split('\n')
      .filter(line => line.match(/^(utun\d+|bridge\d+)(: |$)/))
      .map(line => line.split(':')[0].trim());
  } catch (error) {
    console.error(chalk.red('检测网卡失败：'), error.message);
    return [];
  }
}

// 删除网卡操作
async function deleteInterface(name) {
  try {
    const exists = (await detectVirtualInterfaces()).includes(name);
    if (!exists) throw new Error('接口不存在');

    const { password } = await inquirer.prompt([{
      type: 'password',
      name: 'password',
      message: '请输入管理员密码：',
      validate: input => !!input || '密码不能为空'
    }]);

    await execAsync(`echo '${password}' | sudo -S ifconfig ${name} destroy`, {
      stdio: 'ignore'
    });
    console.log(chalk.green(`成功删除虚拟网卡 ${name}`));
    return true;
  } catch (error) {
    console.error(chalk.red(`删除失败：${error.message}`));
    return false;
  }
}

program
  .command('delete')
  .description('删除虚拟网卡')
  .action(async () => {
    const interfaces = await detectVirtualInterfaces();
    
    if (interfaces.length === 0) {
      console.log(chalk.yellow('未找到可用的虚拟网卡'));
      return;
    }

    const { selectedInterface } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedInterface',
      message: '选择要删除的虚拟网卡：',
      choices: interfaces
    }]);

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: `确认要删除 ${selectedInterface} 吗？此操作不可恢复！`,
      default: false
    }]);

    if (confirm) {
      await deleteInterface(selectedInterface);
    } else {
      console.log(chalk.yellow('已取消删除操作'));
    }
  });

program.parseAsync();