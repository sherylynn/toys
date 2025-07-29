package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// CacheManager 数据缓存管理器
type CacheManager struct {
	cacheDir string
	mu       sync.RWMutex
}

// CacheItem 缓存项
type CacheItem struct {
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
	ExpireIn  time.Duration `json:"expire_in"`
}

// NewCacheManager 创建缓存管理器
func NewCacheManager(cacheDir string) *CacheManager {
	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		fmt.Printf("创建缓存目录失败: %v\n", err)
	}
	
	return &CacheManager{
		cacheDir: cacheDir,
	}
}

// Set 设置缓存
func (cm *CacheManager) Set(key string, data interface{}, expireIn time.Duration) error {
	cm.mu.Lock()
	defer cm.mu.Unlock()
	
	cacheItem := CacheItem{
		Data:      data,
		Timestamp: time.Now(),
		ExpireIn:  expireIn,
	}
	
	dataBytes, err := json.Marshal(cacheItem)
	if err != nil {
		return err
	}
	
	cacheFile := filepath.Join(cm.cacheDir, key+".cache")
	return os.WriteFile(cacheFile, dataBytes, 0644)
}

// Get 获取缓存
func (cm *CacheManager) Get(key string, target interface{}) (bool, error) {
	cm.mu.RLock()
	defer cm.mu.RUnlock()
	
	cacheFile := filepath.Join(cm.cacheDir, key+".cache")
	
	data, err := os.ReadFile(cacheFile)
	if err != nil {
		if os.IsNotExist(err) {
			return false, nil
		}
		return false, err
	}
	
	var cacheItem CacheItem
	if err := json.Unmarshal(data, &cacheItem); err != nil {
		return false, err
	}
	
	// 检查是否过期
	if time.Since(cacheItem.Timestamp) > cacheItem.ExpireIn {
		os.Remove(cacheFile)
		return false, nil
	}
	
	// 将数据反序列化到目标对象
	dataBytes, err := json.Marshal(cacheItem.Data)
	if err != nil {
		return false, err
	}
	
	return true, json.Unmarshal(dataBytes, target)
}

// Delete 删除缓存
func (cm *CacheManager) Delete(key string) error {
	cm.mu.Lock()
	defer cm.mu.Unlock()
	
	cacheFile := filepath.Join(cm.cacheDir, key+".cache")
	return os.Remove(cacheFile)
}

// Clear 清空所有缓存
func (cm *CacheManager) Clear() error {
	cm.mu.Lock()
	defer cm.mu.Unlock()
	
	files, err := os.ReadDir(cm.cacheDir)
	if err != nil {
		return err
	}
	
	for _, file := range files {
		if filepath.Ext(file.Name()) == ".cache" {
			os.Remove(filepath.Join(cm.cacheDir, file.Name()))
		}
	}
	
	return nil
}

// CleanupExpired 清理过期缓存
func (cm *CacheManager) CleanupExpired() error {
	cm.mu.Lock()
	defer cm.mu.Unlock()
	
	files, err := os.ReadDir(cm.cacheDir)
	if err != nil {
		return err
	}
	
	for _, file := range files {
		if filepath.Ext(file.Name()) != ".cache" {
			continue
		}
		
		cacheFile := filepath.Join(cm.cacheDir, file.Name())
		data, err := os.ReadFile(cacheFile)
		if err != nil {
			continue
		}
		
		var cacheItem CacheItem
		if err := json.Unmarshal(data, &cacheItem); err != nil {
			continue
		}
		
		if time.Since(cacheItem.Timestamp) > cacheItem.ExpireIn {
			os.Remove(cacheFile)
		}
	}
	
	return nil
}

// EnhancedValueInvestmentAPI 增强的价值投资API (带缓存)
type EnhancedValueInvestmentAPI struct {
	*ValueInvestmentAPI
	cache *CacheManager
}

// NewEnhancedValueInvestmentAPI 创建增强的价值投资API
func NewEnhancedValueInvestmentAPI() *EnhancedValueInvestmentAPI {
	cacheDir := filepath.Join("cache", "value_investment")
	
	return &EnhancedValueInvestmentAPI{
		ValueInvestmentAPI: NewValueInvestmentAPI(),
		cache:             NewCacheManager(cacheDir),
	}
}

// GetStockBasicInfoWithCache 带缓存的获取股票基本信息
func (api *EnhancedValueInvestmentAPI) GetStockBasicInfoWithCache(stockCode string) (*StockBasicInfo, error) {
	cacheKey := fmt.Sprintf("basic_%s", stockCode)
	
	var cachedData StockBasicInfo
	if found, err := api.cache.Get(cacheKey, &cachedData); err == nil && found {
		return &cachedData, nil
	}
	
	data, err := api.GetStockBasicInfo(stockCode)
	if err != nil {
		return nil, err
	}
	
	// 缓存1小时
	if err := api.cache.Set(cacheKey, data, time.Hour); err != nil {
		fmt.Printf("缓存设置失败: %v\n", err)
	}
	
	return data, nil
}

// GetFinancialMetricsWithCache 带缓存的获取财务指标
func (api *EnhancedValueInvestmentAPI) GetFinancialMetricsWithCache(stockCode string) (*FinancialMetrics, error) {
	cacheKey := fmt.Sprintf("metrics_%s", stockCode)
	
	var cachedData FinancialMetrics
	if found, err := api.cache.Get(cacheKey, &cachedData); err == nil && found {
		return &cachedData, nil
	}
	
	data, err := api.GetFinancialMetrics(stockCode)
	if err != nil {
		return nil, err
	}
	
	// 缓存24小时
	if err := api.cache.Set(cacheKey, data, 24*time.Hour); err != nil {
		fmt.Printf("缓存设置失败: %v\n", err)
	}
	
	return data, nil
}

// AnalyzeValueInvestmentWithCache 带缓存的价值投资分析
func (api *EnhancedValueInvestmentAPI) AnalyzeValueInvestmentWithCache(stockCode string) (*ValueInvestmentData, error) {
	cacheKey := fmt.Sprintf("analysis_%s", stockCode)
	
	var cachedData ValueInvestmentData
	if found, err := api.cache.Get(cacheKey, &cachedData); err == nil && found {
		return &cachedData, nil
	}
	
	data, err := api.AnalyzeValueInvestment(stockCode)
	if err != nil {
		return nil, err
	}
	
	// 缓存6小时
	if err := api.cache.Set(cacheKey, data, 6*time.Hour); err != nil {
		fmt.Printf("缓存设置失败: %v\n", err)
	}
	
	return data, nil
}