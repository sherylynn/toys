package adb

import (
	"crypto/rsa"
	"crypto/rand"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"os"
)

const (
	rsaKeySize = 2048
	keyFileMode = 0600
)

// 生成RSA密钥对
func generateKeyPair() (*rsa.PrivateKey, error) {
	return rsa.GenerateKey(rand.Reader, rsaKeySize)
}

// 将私钥保存到文件
func savePrivateKey(privateKey *rsa.PrivateKey, filePath string) error {
	privateKeyBytes := x509.MarshalPKCS1PrivateKey(privateKey)
	privateKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: privateKeyBytes,
	})
	return os.WriteFile(filePath, privateKeyPEM, 0600)
}

func savePublicKey(publicKey *rsa.PublicKey, filePath string) error {
	// 将公钥转换为ASN.1 DER格式
	publicKeyBytes := x509.MarshalPKCS1PublicKey(publicKey)

	// 对公钥进行base64编码
	publicKeyBase64 := base64.StdEncoding.EncodeToString(publicKeyBytes)

	// 添加ADB公钥前缀
	// ADB公钥格式：UQAAAAIw[base64 encoded key]
	adbPublicKey := fmt.Sprintf("UQAAAAIw%s", publicKeyBase64)

	// 写入文件，确保每行一个公钥
	return os.WriteFile(filePath, []byte(adbPublicKey+"\n"), 0644)
}

// 初始化ADB密钥
func InitializeADBKeys(adbKeysDir, privateKeyPath, publicKeyPath string) error {
	// 确保ADB密钥目录存在
	if err := os.MkdirAll(adbKeysDir, 0755); err != nil {
		return fmt.Errorf("创建ADB密钥目录失败: %v", err)
	}

	// 如果密钥文件已存在，则跳过
	if _, err := os.Stat(privateKeyPath); err == nil {
		return nil
	}

	// 生成新的密钥对
	privateKey, err := generateKeyPair()
	if err != nil {
		return fmt.Errorf("生成密钥对失败: %v", err)
	}

	// 保存私钥
	if err := savePrivateKey(privateKey, privateKeyPath); err != nil {
		return fmt.Errorf("保存私钥失败: %v", err)
	}

	// 保存公钥
	if err := savePublicKey(&privateKey.PublicKey, publicKeyPath); err != nil {
		return fmt.Errorf("保存公钥失败: %v", err)
	}

	return nil
}