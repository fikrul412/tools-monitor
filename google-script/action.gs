function actionsController(queryParam, errors, logs) {
  addLog(
    logs,
    `Enter Actions Controller. Chosen action: ${queryParam.action}`
  );

  let response;

  switch (queryParam.action) {
    case "getTool":
      response = getTool(queryParam, errors, logs);
      break;

    case "getTools":
      response = getTools(queryParam, errors, logs);
      break;

    case "getToolLog":
      response = getToolLog(queryParam, errors, logs);
      break;

    case "getToolLogs":
      response = getToolLogs(queryParam, errors, logs);
      break;

    case "postToolLog":
      response = postToolLog(queryParam, errors, logs);
      break;

    case "setTool":
      response = setTool(queryParam, errors, logs);
      break;

    case "setToolLog":
      response = setToolLog(queryParam, errors, logs);
      break;

    default:
      pushError(errors, "Invalid Action", logs);
      response = null;
  }

  return response;
}


function getTool(queryParam, errors, logs) {
  if (!validateID(queryParam, errors, logs)) {
    return null;
  }

  const id = Number(queryParam.id) - 1;

  const tools = getDB(
    "ToolDB",
    ToolSchema,
    errors,
    logs
  );

  if (!tools) {
    return null;
  }

  addLog(logs, `Tools: ${JSON.stringify(tools)}`);

  if (!tools[id]) {
    pushError(
      errors,
      `Tool with id ${queryParam.id} does not exist`,
      logs
    );
    return null;
  }

  if (!validateSchema(tools[id], ToolSchema, errors, logs)) {
    return null;
  }

  const tool = convertArraySchematoObject(
    tools[id],
    ToolSchema
  );

  addLog(logs, `Tool: ${JSON.stringify(tool)}`);

  return createResponse(tool, logs);
}


function getTools(queryParam, errors, logs) {
  const filters = Object.assign({}, queryParam);
  delete filters.action;

  if (!validatePartialSchema(
    filters,
    ToolSchema,
    errors,
    logs
  )) {
    return null;
  }

  const tools = getDB(
    "ToolDB",
    ToolSchema,
    errors,
    logs
  );

  if (!tools) {
    return null;
  }

  const result = tools.reduce(
    (accumulator, tool) => {
      if (!validateSchema(
        tool,
        ToolSchema,
        errors,
        logs
      )) {
        return accumulator;
      }

      const toolObject = convertArraySchematoObject(
        tool,
        ToolSchema
      );

      for (const key in filters) {
        if (filters[key] != toolObject[key]) {
          return accumulator;
        }
      }

      accumulator.push(toolObject);
      return accumulator;
    },
    []
  );

  addLog(logs, `Tools: ${JSON.stringify(result)}`);

  return createResponse(result, logs);
}


function getToolLog(queryParam, errors, logs) {
  if (!validateID(queryParam, errors, logs)) {
    return null;
  }

  const id = Number(queryParam.id) - 1;

  const toolLogs = getDB(
    "ToolLogDB",
    ToolLogSchema,
    errors,
    logs
  );

  if (!toolLogs) {
    return null;
  }

  addLog(
    logs,
    `Tool Logs: ${JSON.stringify(toolLogs)}`
  );

  if (!toolLogs[id]) {
    pushError(
      errors,
      `Tool log with id ${queryParam.id} does not exist`,
      logs
    );
    return null;
  }

  if (!validateSchema(
    toolLogs[id],
    ToolLogSchema,
    errors,
    logs
  )) {
    return null;
  }

  const toolLog = convertArraySchematoObject(
    toolLogs[id],
    ToolLogSchema
  );

  addLog(
    logs,
    `Tool Log: ${JSON.stringify(toolLog)}`
  );

  return createResponse(toolLog, logs);
}


function getToolLogs(queryParam, errors, logs) {
  const filters = Object.assign({}, queryParam);
  delete filters.action;

  if (!validatePartialSchema(
    filters,
    ToolLogSchema,
    errors,
    logs
  )) {
    return null;
  }

  const toolLogs = getDB(
    "ToolLogDB",
    ToolLogSchema,
    errors,
    logs
  );

  if (!toolLogs) {
    return null;
  }

  const result = toolLogs.reduce(
    (accumulator, toolLog) => {
      if (!validateSchema(
        toolLog,
        ToolLogSchema,
        errors,
        logs
      )) {
        return accumulator;
      }

      const toolLogObject = convertArraySchematoObject(
        toolLog,
        ToolLogSchema
      );

      for (const key in filters) {
        if (filters[key] != toolLogObject[key]) {
          return accumulator;
        }
      }

      accumulator.push(toolLogObject);
      return accumulator;
    },
    []
  );

  addLog(
    logs,
    `Tool Logs: ${JSON.stringify(result)}`
  );

  return createResponse(result, logs);
}

function parseDateString(dateStr) {
  if (!dateStr) return null;

  // If Apps Script/Spreadsheet already parsed it into a Date object
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? null : dateStr;
  }

  // Ensure it's a string before calling .split()
  const str = String(dateStr).trim();
  if (!str) return null;

  // Handles standard ISO / JS date strings
  if (!str.includes('/')) {
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // Parses custom "DD/MM/YYYY HH:mm:ss" format
  const parts = str.split(" ");
  const datePart = parts[0];
  const timePart = parts[1] || "00:00:00";

  const [day, month, year] = datePart.split("/").map(Number);
  const [hours, minutes, seconds] = timePart.split(":").map(Number);

  if (!day || !month || !year) return null;

  return new Date(year, month - 1, day, hours || 0, minutes || 0, seconds || 0);
}

function postToolLog(queryParam, errors, logs) {
  const bodyJSON = queryParam.bodyJSON || {};

  addLog(
    logs,
    `Body JSON: ${JSON.stringify(bodyJSON)}`
  );

  const ss = openSpreadsheet(errors, logs);
  if (!ss) return null;

  const sheet = openSheet("ToolLogDB", ss, errors, logs);
  if (!sheet) return null;

  // 1. Calculate the next auto-increment ID
  const lastRow = sheet.getLastRow();
  let nextId = 1;

  if (lastRow > 1) {
    const idColumnValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    const existingIds = idColumnValues
      .map(function(row) { return Number(row[0]); })
      .filter(function(id) { return !isNaN(id); });

    if (existingIds.length > 0) {
      nextId = Math.max.apply(null, existingIds) + 1;
    }
  }

  // Assign auto-generated ID before schema validation
  bodyJSON.id = String(nextId);

  // 2. Validate schema with auto-assigned ID
  if (!validateSchema(bodyJSON, ToolLogSchema, errors, logs)) {
    return null;
  }

  // 3. Validate schedule overlap
  const newStart = parseDateString(bodyJSON.start_date);
  const newEnd = parseDateString(bodyJSON.end_date);

  if (!newStart || !newEnd) {
    errors.push("Invalid or missing start_date/end_date format.");
    return null;
  }

  if (newStart >= newEnd) {
    errors.push("Start time must be strictly before end time.");
    return null;
  }

  const existingData = sheet.getDataRange().getValues();

  for (let i = 1; i < existingData.length; i++) {
    const row = existingData[i];
    const logObj = convertArraySchematoObject(row, ToolLogSchema);

    // Only check overlap for the same tool and active (non-cancelled) bookings
    if (String(logObj.tool_id) === String(bodyJSON.tool_id) && logObj.status !== "cancelled") {
      const existingStart = parseDateString(logObj.start_date);
      const existingEnd = parseDateString(logObj.end_date);

      if (existingStart && existingEnd) {
        // Overlap formula: max(start1, start2) < min(end1, end2)
        if (newStart < existingEnd && newEnd > existingStart) {
          errors.push(
            `Schedule conflict: Tool #${bodyJSON.tool_id} is already booked between ${logObj.start_date} and ${logObj.end_date}.`
          );
          addLog(logs, `Overlap detected with log ID ${logObj.id}`);
          return null;
        }
      }
    }
  }

  // 4. Build and append row
  const row = [];
  for (let i = 0; i < ToolLogSchema.length; i++) {
    const fieldName = ToolLogSchema[i][0];
    row.push(bodyJSON[fieldName] ?? "");
  }

  sheet.appendRow(row);

  addLog(
    logs,
    `Added ToolLog: ${JSON.stringify(row)}`
  );

  return createResponse(
    convertArraySchematoObject(row, ToolLogSchema),
    logs
  );
}
function setTool(queryParam, errors, logs) {
  if (!validateID(queryParam, errors, logs)) {
    return null;
  }

  const bodyJSON = queryParam.bodyJSON;

  addLog(
    logs,
    `Body JSON: ${JSON.stringify(bodyJSON)}`
  );

  if (!bodyJSON) {
    pushError(
      errors,
      "No JSON body provided",
      logs
    );
    return null;
  }

  const filters = Object.assign({}, bodyJSON);

  filters.id = Number(queryParam.id);

  if (!validatePartialSchema(
    bodyJSON,
    ToolSchema,
    errors,
    logs
  )) {
    return null;
  }

  const ss = openSpreadsheet(errors, logs);

  if (!ss) {
    return null;
  }

  const sheet = openSheet(
    "ToolDB",
    ss,
    errors,
    logs
  );

  if (!sheet) {
    return null;
  }

  const rowNumber = Number(queryParam.id) + 1;

  if (rowNumber > sheet.getLastRow()) {
    pushError(
      errors,
      `Tool with id ${queryParam.id} does not exist`,
      logs
    );
    return null;
  }

  const currentRow = sheet
    .getRange(
      rowNumber,
      1,
      1,
      ToolSchema.length
    )
    .getDisplayValues()[0];

  if (!validateSchema(
    currentRow,
    ToolSchema,
    errors,
    logs
  )) {
    return null;
  }

  const updatedRow = currentRow.slice();

  for (let i = 0; i < ToolSchema.length; i++) {
    const fieldName = ToolSchema[i][0];

    if (fieldName in bodyJSON) {
      updatedRow[i] = bodyJSON[fieldName];
    }
  }

  sheet
    .getRange(
      rowNumber,
      1,
      1,
      ToolSchema.length
    )
    .setValues([updatedRow]);

  const tool = convertArraySchematoObject(
    updatedRow,
    ToolSchema
  );

  addLog(
    logs,
    `Updated Tool: ${JSON.stringify(tool)}`
  );

  return createResponse(tool, logs);
}


function setToolLog(queryParam, errors, logs) {
  if (!validateID(queryParam, errors, logs)) {
    return null;
  }

  const bodyJSON = queryParam.bodyJSON;

  addLog(
    logs,
    `Body JSON: ${JSON.stringify(bodyJSON)}`
  );

  if (!bodyJSON) {
    pushError(
      errors,
      "No JSON body provided",
      logs
    );
    return null;
  }

  if (!validatePartialSchema(
    bodyJSON,
    ToolLogSchema,
    errors,
    logs
  )) {
    return null;
  }

  const ss = openSpreadsheet(errors, logs);

  if (!ss) {
    return null;
  }

  const sheet = openSheet(
    "ToolLogDB",
    ss,
    errors,
    logs
  );

  if (!sheet) {
    return null;
  }

  const rowNumber = Number(queryParam.id) + 1;

  if (rowNumber > sheet.getLastRow()) {
    pushError(
      errors,
      `ToolLog with id ${queryParam.id} does not exist`,
      logs
    );
    return null;
  }

  const currentRow = sheet
    .getRange(
      rowNumber,
      1,
      1,
      ToolLogSchema.length
    )
    .getDisplayValues()[0];

  if (!validateSchema(
    currentRow,
    ToolLogSchema,
    errors,
    logs
  )) {
    return null;
  }

  const updatedRow = currentRow.slice();

  for (let i = 0; i < ToolLogSchema.length; i++) {
    const fieldName = ToolLogSchema[i][0];

    if (fieldName in bodyJSON) {
      updatedRow[i] = bodyJSON[fieldName];
    }
  }

  sheet
    .getRange(
      rowNumber,
      1,
      1,
      ToolLogSchema.length
    )
    .setValues([updatedRow]);

  const toolLog = convertArraySchematoObject(
    updatedRow,
    ToolLogSchema
  );

  addLog(
    logs,
    `Updated ToolLog: ${JSON.stringify(toolLog)}`
  );

  return createResponse(toolLog, logs);
}

function createResponse(data, logs) {
  addLog(logs, `Creating response payload: ${JSON.stringify(data)}`);
  
  if (data === null || data === undefined) {
    return null;
  }
  
  return data;
}