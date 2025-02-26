package adb

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

// Client represents an ADB client
type Client struct {
	conn       net.Conn
	privateKey *rsa.PrivateKey
}

// NewClient creates a new ADB client
func NewClient() *Client {
	// 生成或加载RSA密钥对
	privateKey, err := loadOrGenerateKey()
	if err != nil {
		fmt.Printf("警告：无法加载或生成RSA密钥：%v\n", err)
	}

	return &Client{
		privateKey: privateKey,
	}
}

// Connect establishes a connection to an ADB server
func (c *Client) Connect(addr string) error {
	// 确保已经初始化了密钥
	if c.privateKey == nil {
		privateKey, err := loadOrGenerateKey()
		if err != nil {
			return fmt.Errorf("无法加载或生成RSA密钥：%v", err)
		}
		c.privateKey = privateKey
	}

	// 启动原生ADB连接并获取日志
	fmt.Println("尝试使用原生ADB连接设备并获取日志...")
	go func() {
		// 启动ADB服务器
		exec.Command("adb", "start-server").Run()
		
		// 连接设备
		cmd := exec.Command("adb", "connect", addr)
		output, err := cmd.CombinedOutput()
		if err != nil {
			fmt.Printf("原生ADB连接失败: %v\n%s\n", err, output)
		} else {
			fmt.Printf("原生ADB连接输出: %s\n", output)
			
			// 获取设备日志，只过滤ADB相关的日志
			logCmd := exec.Command("adb", "logcat", "-d", "-s", "AdbDebuggingManager:*", "adbd:*", "adb:*")
			logOutput, err := logCmd.CombinedOutput()
			if err != nil {
				fmt.Printf("获取设备日志失败: %v\n", err)
			} else {
				fmt.Println("设备ADB认证相关日志:")
				fmt.Printf("%s\n", logOutput)
			}
		}
	}()

	// 设置连接超时
	conn, err := net.DialTimeout("tcp", addr, 10*time.Second)
	if err != nil {
		return fmt.Errorf("failed to connect to ADB server: %v", err)
	}
	c.conn = conn
	defer func() {
		if err != nil {
			c.conn.Close()
		}
	}()

	// 设置读写超时
	c.conn.SetDeadline(time.Now().Add(30 * time.Second))

	// 发送连接消息
	fmt.Println("发送初始连接消息...")
	msg := NewMessage(A_CNXN, A_VERSION, MAX_PAYLOAD, []byte("host::"))
	if err := msg.WriteTo(c.conn); err != nil {
		return fmt.Errorf("failed to send connection message: %v", err)
	}

	// 读取响应
	fmt.Println("等待设备响应...")
	resp, err := ReadMessage(c.conn)
	if err != nil {
		return fmt.Errorf("读取连接响应失败: %v", err)
	}

	// 处理认证
	if resp.Command == A_AUTH {
		fmt.Println("设备请求认证...")
		if c.privateKey == nil {
			return fmt.Errorf("需要认证但没有可用的私钥")
		}

		// 使用认证令牌进行签名
		initialToken := resp.Data
		fmt.Printf("使用认证令牌，长度: %d字节\n", len(initialToken))
		signature, err := SignToken(initialToken, c.privateKey)
		if err != nil {
			return fmt.Errorf("签名令牌失败: %v", err)
		}
		fmt.Printf("生成签名，长度: %d字节\n", len(signature))

		// 发送签名
		fmt.Println("发送认证签名...")
		msg = NewMessage(A_AUTH, ADB_AUTH_SIGNATURE, 0, signature)
		if err := msg.WriteTo(c.conn); err != nil {
			return fmt.Errorf("发送认证签名失败: %v", err)
		}

		// 重置读取超时
		c.conn.SetReadDeadline(time.Now().Add(30 * time.Second))

		// 读取响应
		resp, err = ReadMessage(c.conn)
		if err != nil {
			return fmt.Errorf("读取认证响应失败: %v", err)
		}

		// 如果设备需要公钥
		if resp.Command == A_AUTH {
			fmt.Println("设备需要公钥，准备发送...")
			pubKeyBytes, err := GetPublicKeyBytes(&c.privateKey.PublicKey)
			if err != nil {
				return fmt.Errorf("获取公钥数据失败: %v", err)
			}
			fmt.Printf("生成公钥数据，长度: %d字节\n", len(pubKeyBytes))

			// 在公钥末尾添加换行符
			pubKeyBytes = append(pubKeyBytes, '\n')

			msg = NewMessage(A_AUTH, ADB_AUTH_RSAPUBLICKEY, 0, pubKeyBytes)
			if err := msg.WriteTo(c.conn); err != nil {
				return fmt.Errorf("发送公钥失败: %v", err)
			}

			// 重置读取超时
			c.conn.SetReadDeadline(time.Now().Add(30 * time.Second))

			// 读取最终响应
			fmt.Println("等待设备验证公钥...")
			resp, err = ReadMessage(c.conn)
			if err != nil {
				return fmt.Errorf("读取最终认证响应失败: %v", err)
			}
		}
	}

	if resp.Command != A_CNXN {
		return fmt.Errorf("预期收到CNXN消息，但收到了: 0x%x", resp.Command)
	}

	// 清除超时设置
	c.conn.SetDeadline(time.Time{})

	fmt.Println("成功建立ADB连接！")
	return nil
}

// GetDeviceProperty retrieves a device property
func (c *Client) GetDeviceProperty(prop string) (string, error) {
	// 发送shell命令
	cmd := fmt.Sprintf("getprop %s", prop)
	msg := NewMessage(A_OPEN, 1, 0, []byte(fmt.Sprintf("shell:%s", cmd)))
	if err := msg.WriteTo(c.conn); err != nil {
		return "", fmt.Errorf("failed to send shell command: %v", err)
	}

	// 读取响应
	resp, err := ReadMessage(c.conn)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %v", err)
	}

	if resp.Command != A_OKAY {
		return "", fmt.Errorf("unexpected response command: %x", resp.Command)
	}

	// 读取属性值
	resp, err = ReadMessage(c.conn)
	if err != nil {
		return "", fmt.Errorf("failed to read property value: %v", err)
	}

	return string(resp.Data), nil
}

// loadOrGenerateKey loads the RSA key from file or generates a new one
func loadOrGenerateKey() (*rsa.PrivateKey, error) {
	// 获取程序根目录
	execPath, err := os.Executable()
	if err != nil {
		return nil, fmt.Errorf("获取程序路径失败: %v", err)
	}

	// 设置密钥存储路径为程序根目录下的adb_keys目录
	adbDir := filepath.Join(filepath.Dir(execPath), "adb_keys")
	keyPath := filepath.Join(adbDir, "adbkey")
	pubKeyPath := filepath.Join(adbDir, "adbkey.pub")

	// 如果密钥文件不存在，生成新的密钥对
	if _, err := os.Stat(keyPath); os.IsNotExist(err) {
		// 生成新的RSA密钥对
		privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
		if err != nil {
			return nil, fmt.Errorf("生成RSA密钥对失败: %v", err)
		}



		// 将私钥保存到文件，使用PEM格式
		privateKeyPEM := &pem.Block{
			Type:  "RSA PRIVATE KEY",
			Bytes: x509.MarshalPKCS1PrivateKey(privateKey),
		}
		privateKeyBytes := pem.EncodeToMemory(privateKeyPEM)
		if privateKeyBytes == nil {
			return nil, fmt.Errorf("PEM编码私钥失败")
		}

		if err := os.WriteFile(keyPath, privateKeyBytes, 0600); err != nil {
			return nil, fmt.Errorf("保存私钥失败: %v", err)
		}

		// 生成并保存公钥文件
		pubKeyBytes, err := GetPublicKeyBytes(&privateKey.PublicKey)
		if err != nil {
			return nil, fmt.Errorf("生成公钥数据失败: %v", err)
		}
		// 在公钥末尾添加换行符
		pubKeyBytes = append(pubKeyBytes, '\n')

		if err := os.WriteFile(pubKeyPath, pubKeyBytes, 0644); err != nil {
			return nil, fmt.Errorf("保存公钥失败: %v", err)
		}

		return privateKey, nil
	}

	// 从文件加载私钥
	privateKeyBytes, err := os.ReadFile(keyPath)
	if err != nil {
		return nil, fmt.Errorf("读取私钥文件失败: %v", err)
	}

	// 解析PEM格式的私钥
	privateKeyPEM, _ := pem.Decode(privateKeyBytes)
	if privateKeyPEM == nil {
		return nil, fmt.Errorf("无效的PEM格式私钥")
	}

	// 解析私钥
	privateKey, err := x509.ParsePKCS1PrivateKey(privateKeyPEM.Bytes)
	if err != nil {
		return nil, fmt.Errorf("解析私钥失败: %v", err)
	}

	return privateKey, nil
}