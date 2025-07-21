package models

// QueryRequest represents a request to build a query
type QueryRequest struct {
	DatabaseID string           `json:"database_id"`
	Tables     []string         `json:"tables"`
	Columns    []ColumnSelect   `json:"columns"`
	Conditions []QueryCondition `json:"conditions"`
	OrderBy    []OrderByClause  `json:"order_by"`
	Limit      int              `json:"limit"`
}

// ColumnSelect represents a column to be selected in a query
type ColumnSelect struct {
	Table  string `json:"table"`
	Column string `json:"column"`
}

// QueryCondition represents a condition in the WHERE clause of a query
type QueryCondition struct {
	Column   string `json:"column"`
	Operator string `json:"operator"`
	Value    string `json:"value"`
}

// OrderByClause represents a column to order the results by
type OrderByClause struct {
	Column    string `json:"column"`
	Direction string `json:"direction"`
}