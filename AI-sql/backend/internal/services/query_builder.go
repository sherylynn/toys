package services

import (
	"fmt"
	"strings"

	"visual-database-query-system/backend/internal/models"
)

// QueryBuilder builds SQL queries from a QueryRequest
type QueryBuilder struct {
	Request *models.QueryRequest
}

// NewQueryBuilder creates a new QueryBuilder
func NewQueryBuilder(req *models.QueryRequest) *QueryBuilder {
	return &QueryBuilder{Request: req}
}

// BuildSQL generates the SQL query string
func (qb *QueryBuilder) BuildSQL() (string, []interface{}) {
	var args []interface{}
	var sb strings.Builder

	// SELECT clause
	sb.WriteString("SELECT ")
	if len(qb.Request.Columns) == 0 {
		sb.WriteString("*")
	} else {
		for i, col := range qb.Request.Columns {
			if i > 0 {
				sb.WriteString(", ")
			}
			sb.WriteString(fmt.Sprintf("`%s`.`%s`", col.Table, col.Column))
		}
	}

	// FROM clause
	sb.WriteString(" FROM ")
	for i, tbl := range qb.Request.Tables {
		if i > 0 {
			sb.WriteString(", ")
		}
		sb.WriteString(fmt.Sprintf("`%s`", tbl))
	}

	// WHERE clause
	if len(qb.Request.Conditions) > 0 {
		sb.WriteString(" WHERE ")
		for i, cond := range qb.Request.Conditions {
			if i > 0 {
				sb.WriteString(" AND ") // Assuming AND for now
			}
			sb.WriteString(fmt.Sprintf("`%s` %s ?", cond.Column, cond.Operator))
			args = append(args, cond.Value)
		}
	}

	// ORDER BY clause
	if len(qb.Request.OrderBy) > 0 {
		sb.WriteString(" ORDER BY ")
		for i, ob := range qb.Request.OrderBy {
			if i > 0 {
				sb.WriteString(", ")
			}
			sb.WriteString(fmt.Sprintf("`%s` %s", ob.Column, ob.Direction))
		}
	}

	// LIMIT clause
	if qb.Request.Limit > 0 {
		sb.WriteString(" LIMIT ?")
		args = append(args, qb.Request.Limit)
	}

	return sb.String(), args
}
