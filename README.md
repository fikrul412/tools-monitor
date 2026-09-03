# Tools Monitoring

Tools Monitoring is an application for monitoring and managing tool usage. It uses **Google Sheets as the database** and **Google Apps Script as the backend/controller**.

For an example of the spreadsheet structure, see:

[Tool Monitoring DEMO](https://docs.google.com/spreadsheets/d/11C_CbHSn7EGebeG3uMRJ6z3Rio4yTHr51AiyeqRHCHo/edit?usp=sharing)

> This project is still under development.

## Data and Methods

### Data

The application stores two types of data.

### 1. Tool Log (`ToolLog`)

Stores scheduled and historical tool usage.

| Field             | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `id`              | Unique log ID                                           |
| `username`        | User who scheduled/used the tool                        |
| `tool_id`         | ID of the tool                                          |
| `scheduled_start` | Scheduled starting time                                 |
| `scheduled_end`   | Scheduled ending time (optional)                        |
| `status`          | `Scheduled`, `On Progress`, `Completed`, or `Cancelled` |

### 2. Tool (`Tool`)

Stores the available tools and their current status.

| Field    | Description                 |
| -------- | --------------------------- |
| `id`     | Unique tool ID              |
| `name`   | Tool name                   |
| `status` | `Available` or `Being Used` |

## CRUD Methods

The backend provides the following methods.

### Schedule / Tool Log

1. `getToolLogs(filter, pagination)` — Get multiple tool logs.
2. `getToolLog(id)` — Get a single tool log.
3. `postToolLog(ToolLog)` — Create a new tool log.
4. `setToolLog(id, partialToolLog)` — Update an existing tool log.

### Tool

1. `getTools(filter, pagination)` — Get multiple tools.
2. `getTool(id)` — Get a single tool.
3. `setTool(id, partialTool)` — Update an existing tool.

## Request and Response

Because Google Apps Script does not provide convenient path-based endpoints, the application uses a single endpoint with an `action` query parameter.

Each action is handled by its corresponding function in the Apps Script backend.

### Request Format

#### Query Parameters

Every request contains:

* `action` — The method to execute.
* Additional query parameters — Parameters specific to the selected action.

Since Google Apps Script does not use conventional path parameters, single-resource and multiple-resource operations are separated into different actions.

### GET

#### `getTool`

Get a single tool by ID.

```text
APP_SCRIPT_ENDPOINT?action=getTool&id=1
```

#### `getTools`

Get multiple tools, optionally using filter and pagination parameters.

```text
APP_SCRIPT_ENDPOINT?action=getTools&status=Available
```

#### `getToolLog`

Get a single tool log by ID.

```text
APP_SCRIPT_ENDPOINT?action=getToolLog&id=1
```

#### `getToolLogs`

Get multiple tool logs, optionally using filter and pagination parameters.

```text
APP_SCRIPT_ENDPOINT?action=getToolLogs&tool_id=1&status=Scheduled
```

### POST

POST requests use a JSON request body.

#### `postToolLog`

Create a new tool log.

```text
APP_SCRIPT_ENDPOINT?action=postToolLog
```

Request body:

```json
{
  "username": "user123",
  "tool_id": 1,
  "scheduled_start": "2026-09-03T10:00:00",
  "scheduled_end": "2026-09-03T12:00:00",
  "status": "Scheduled"
}
```

#### `setTool`

Update an existing tool.

```text
APP_SCRIPT_ENDPOINT?action=setTool
```

Request body:

```json
{
  "id": 1,
  "status": "Being Used"
}
```

Only the fields that need to be updated have to be provided.

#### `setToolLog`

Update an existing tool log.

```text
APP_SCRIPT_ENDPOINT?action=setToolLog
```

Request body:

```json
{
  "id": 1,
  "status": "Completed",
  "scheduled_end": "2026-09-03T12:00:00"
}
```

Only the fields that need to be updated have to be provided.

## Response Format

All requests return a JSON response containing the request status and, when applicable, the requested data.

### GET

#### `getTool`

```json
{
  "status": true,
  "data": {
    "id": 1,
    "name": "3D Print Ender 3 V3 SE",
    "status": "Available"
  }
}
```

#### `getTools`

```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "name": "3D Print Ender 3 V3 SE",
      "status": "Available"
    }
  ]
}
```

#### `getToolLog`

```json
{
  "status": true,
  "data": {
    "id": 1,
    "username": "user123",
    "tool_id": 1,
    "scheduled_start": "2026-09-03T10:00:00",
    "scheduled_end": "2026-09-03T12:00:00",
    "status": "Scheduled"
  }
}
```

#### `getToolLogs`

```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "username": "user123",
      "tool_id": 1,
      "scheduled_start": "2026-09-03T10:00:00",
      "scheduled_end": "2026-09-03T12:00:00",
      "status": "Scheduled"
    }
  ]
}
```

### POST

For modification requests, the response indicates whether the operation was successful.

#### `postToolLog`

```json
{
  "status": true
}
```

#### `setTool`

```json
{
  "status": true
}
```

#### `setToolLog`

```json
{
  "status": true
}
```

## Project Status

This project is currently under development. The API, database structure, validation, filtering, and pagination may change as development continues.
