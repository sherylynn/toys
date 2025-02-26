package adb

import (
	"bufio"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/binary"
	"fmt"
	"io"
)

const (
	A_SYNC = 0x434e5953
	A_CNXN = 0x4e584e43
	A_OPEN = 0x4e45504f
	A_OKAY = 0x59414b4f
	A_CLSE = 0x45534c43
	A_WRTE = 0x45545257
	A_AUTH = 0x48545541

	A_VERSION = 0x01000000
	MAX_PAYLOAD = 4096

	ADB_CLASS = 0xff
	ADB_SUBCLASS = 0x42
	ADB_PROTOCOL = 0x01

	// 认证相关常量
	ADB_AUTH_TOKEN = 1
	ADB_AUTH_SIGNATURE = 2
	ADB_AUTH_RSAPUBLICKEY = 3
)

// AdbMessage represents the basic structure of an ADB message
type AdbMessage struct {
	Command uint32
	Arg0    uint32
	Arg1    uint32
	Length  uint32
	Check   uint32
	Magic   uint32
	Data    []byte
}

// NewMessage creates a new ADB message
func NewMessage(cmd uint32, arg0, arg1 uint32, data []byte) *AdbMessage {
	dataLen := uint32(0)
	if data != nil {
		dataLen = uint32(len(data))
	}

	msg := &AdbMessage{
		Command: cmd,
		Arg0:    arg0,
		Arg1:    arg1,
		Length:  dataLen,
		Data:    data,
	}

	// Calculate checksum
	msg.Check = msg.calculateChecksum()
	// Calculate magic (XOR of command and 0xffffffff)
	msg.Magic = cmd ^ 0xffffffff

	return msg
}

// calculateChecksum calculates the checksum of the message
func (m *AdbMessage) calculateChecksum() uint32 {
	sum := uint32(0)
	if m.Data != nil {
		for _, b := range m.Data {
			sum += uint32(b)
		}
	}
	return sum
}

// WriteTo writes the message to a writer
func (m *AdbMessage) WriteTo(w io.Writer) error {
	fmt.Printf("发送消息，命令类型: 0x%x\n", m.Command)
	fmt.Printf("参数0: 0x%x\n", m.Arg0)
	fmt.Printf("参数1: 0x%x\n", m.Arg1)
	fmt.Printf("数据长度: %d字节\n", m.Length)
	fmt.Printf("校验和: 0x%x\n", m.Check)
	fmt.Printf("魔数: 0x%x\n", m.Magic)

	// Write header
	if err := binary.Write(w, binary.LittleEndian, m.Command); err != nil {
		return fmt.Errorf("写入命令字段失败: %v", err)
	}
	if err := binary.Write(w, binary.LittleEndian, m.Arg0); err != nil {
		return fmt.Errorf("写入参数0失败: %v", err)
	}
	if err := binary.Write(w, binary.LittleEndian, m.Arg1); err != nil {
		return fmt.Errorf("写入参数1失败: %v", err)
	}
	if err := binary.Write(w, binary.LittleEndian, m.Length); err != nil {
		return fmt.Errorf("写入数据长度失败: %v", err)
	}
	if err := binary.Write(w, binary.LittleEndian, m.Check); err != nil {
		return fmt.Errorf("写入校验和失败: %v", err)
	}
	if err := binary.Write(w, binary.LittleEndian, m.Magic); err != nil {
		return fmt.Errorf("写入魔数失败: %v", err)
	}

	// Write data if present
	if m.Data != nil {
		if _, err := w.Write(m.Data); err != nil {
			return fmt.Errorf("写入消息数据失败: %v", err)
		}
		fmt.Printf("成功写入 %d 字节数据\n", m.Length)
	}

	return nil
}

// ReadMessage reads an ADB message from a reader
func ReadMessage(r io.Reader) (*AdbMessage, error) {
	msg := &AdbMessage{}

	// 设置缓冲读取器以提高性能
	bufReader, ok := r.(*bufio.Reader)
	if !ok {
		bufReader = bufio.NewReader(r)
	}

	// 读取头部
	header := make([]byte, 24) // 6个uint32字段，每个4字节
	if _, err := io.ReadFull(bufReader, header); err != nil {
		return nil, fmt.Errorf("读取消息头失败: %v", err)
	}

	// 解析头部字段
	msg.Command = binary.LittleEndian.Uint32(header[0:4])
	msg.Arg0 = binary.LittleEndian.Uint32(header[4:8])
	msg.Arg1 = binary.LittleEndian.Uint32(header[8:12])
	msg.Length = binary.LittleEndian.Uint32(header[12:16])
	msg.Check = binary.LittleEndian.Uint32(header[16:20])
	msg.Magic = binary.LittleEndian.Uint32(header[20:24])

	// 打印调试信息
	fmt.Printf("收到消息，命令类型: 0x%x\n", msg.Command)
	fmt.Printf("参数0: 0x%x\n", msg.Arg0)
	fmt.Printf("参数1: 0x%x\n", msg.Arg1)
	fmt.Printf("数据长度: %d字节\n", msg.Length)
	fmt.Printf("校验和: 0x%x\n", msg.Check)
	fmt.Printf("魔数: 0x%x\n", msg.Magic)

	// 验证魔数
	if msg.Magic != (msg.Command ^ 0xffffffff) {
		return nil, fmt.Errorf("魔数验证失败：期望 0x%x，实际 0x%x", msg.Command ^ 0xffffffff, msg.Magic)
	}

	// 读取数据（如果有）
	if msg.Length > 0 {
		// 验证数据长度是否合理
		if msg.Length > MAX_PAYLOAD {
			return nil, fmt.Errorf("数据长度超出限制：%d > %d", msg.Length, MAX_PAYLOAD)
		}

		msg.Data = make([]byte, msg.Length)
		if _, err := io.ReadFull(bufReader, msg.Data); err != nil {
			return nil, fmt.Errorf("读取消息数据失败: %v", err)
		}
		fmt.Printf("成功读取 %d 字节数据\n", msg.Length)

		// 验证校验和
		if msg.Check != msg.calculateChecksum() {
			return nil, fmt.Errorf("校验和验证失败：期望 0x%x，实际 0x%x", msg.calculateChecksum(), msg.Check)
		}
		fmt.Println("校验和验证通过")
	}

	return msg, nil
}

// GenerateToken generates a random token for authentication
func GenerateToken() ([]byte, error) {
	token := make([]byte, 20)
	_, err := rand.Read(token)
	return token, err
}

// SignToken signs a token using the provided private key
func SignToken(token []byte, privateKey *rsa.PrivateKey) ([]byte, error) {
	signature, err := rsa.SignPKCS1v15(rand.Reader, privateKey, 0, token)
	return signature, err
}

// GetPublicKeyBytes returns the public key in ADB format
func GetPublicKeyBytes(publicKey *rsa.PublicKey) ([]byte, error) {
	// 使用PKCS1格式序列化公钥
	pubKeyBytes := x509.MarshalPKCS1PublicKey(publicKey)
	
	// 创建包含类型前缀的完整密钥字节数组
	typePrefix := []byte{0x51, 0x00, 0x00, 0x00, 0x02} // "QAAAAg==" 的原始字节
	fullKeyBytes := append(typePrefix, pubKeyBytes...)
	
	// 将完整的密钥字节数组进行base64编码
	base64Key := base64.StdEncoding.EncodeToString(fullKeyBytes)
	
	return []byte(base64Key), nil
}