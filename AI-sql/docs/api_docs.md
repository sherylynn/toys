# API Documentation

This document describes the RESTful API endpoints for the Visual Database Query System.

## Authentication

### `POST /api/auth/login`

Authenticates a user and returns a JWT token.

*   **Request Body:**
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "token": "string",
      "expires_at": "datetime"
    }
    ```

### `POST /api/auth/register`

Registers a new user (admin only).

*   **Request Body:**
    ```json
    {
      "username": "string",
      "password": "string",
      "role": "string" (e.g., "user", "admin")
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "message": "User created successfully"
    }
    ```

## Database Metadata

### `GET /api/databases`

Retrieves a list of configured databases.

*   **Authentication:** Required (JWT)
*   **Response (200 OK):**
    ```json
    [
      {
        "ID": "string",
        "Name": "string",
        "Type": "string",
        "Host": "string",
        "Port": "int",
        "Database": "string",
        "Username": "string",
        "CreatedAt": "datetime"
      }
    ]
    ```

### `GET /api/databases/{id}/tables`

Retrieves a list of tables for a specific database.

*   **Authentication:** Required (JWT)
*   **Path Parameters:**
    *   `id`: The ID of the database.
*   **Response (200 OK):**
    ```json
    {
      "database_id": "string",
      "tables": [
        "string"
      ]
    }
    ```

## Query Operations

### `POST /api/query/build`

Builds and executes a query based on the provided configuration.

*   **Authentication:** Required (JWT)
*   **Request Body:**
    ```json
    {
      "database_id": "string",
      "tables": [
        "string"
      ],
      "columns": [
        {
          "table": "string",
          "column": "string"
        }
      ],
      "conditions": [
        {
          "column": "string",
          "operator": "string",
          "value": "string"
        }
      ],
      "order_by": [
        {
          "column": "string",
          "direction": "string" ("ASC" or "DESC")
        }
      ],
      "limit": "int"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "sql": "string",
      "columns": [
        "string"
      ],
      "data": [
        { "column_name": "value" }
      ]
    }
    ```

### `POST /api/query/export`

Exports query results to an Excel file.

*   **Authentication:** Required (JWT)
*   **Request Body:** (Same as `POST /api/query/build`)
*   **Response (200 OK):**
    *   File download (application/octet-stream) with `query_results.xlsx` filename.

### `GET /api/query/history`

Retrieves the query history for the authenticated user.

*   **Authentication:** Required (JWT)
*   **Response (200 OK):**
    ```json
    [
      {
        "ID": "int",
        "DatabaseID": "string",
        "QueryJSON": "string",
        "SQL": "string",
        "CreatedAt": "datetime"
      }
    ]
    ```

## User Management (Admin Only)

### `GET /api/users`

Retrieves a list of all users.

*   **Authentication:** Required (JWT, Admin Role)
*   **Response (200 OK):**
    ```json
    [
      {
        "ID": "int",
        "Username": "string",
        "Role": "string",
        "CreatedAt": "datetime"
      }
    ]
    ```
