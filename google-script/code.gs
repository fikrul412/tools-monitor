const SPREADSHEET_ID = "11C_CbHSn7EGebeG3uMRJ6z3Rio4yTHr51AiyeqRHCHo";
const debug_state = false;

// Make sure that in the spreadsheet there are two sheets:
// - ToolDB
// - ToolLogDB
//
// Refer to the example of Tool Monitoring DEMO:
// https://docs.google.com/spreadsheets/d/11C_CbHSn7EGebeG3uMRJ6z3Rio4yTHr51AiyeqRHCHo
//
// Make sure all tools in the spreadsheet have an ordered number in DB.


function doGet(e) {
  const errors = [];
  const logs = [];

  try {
    addLog(logs, "INITIATING GET REQUEST");
    const queryParam = Object.assign(
      {},
      e && e.parameter ? e.parameter : {}
    );

    addLog(logs, `Query Params: ${JSON.stringify(queryParam)}`);
    validateAction(queryParam, errors);
    const response = actionsController(queryParam, errors, logs);

    if (errors.length > 0) {
      return createErrorResponse(errors, logs);
    }

    return createSuccessResponse(response, logs);

  } catch (err) {
    errors.push(`Internal server error: ${err.message}`);
    addLog(logs, `Exception: ${err.stack}`);

    return createErrorResponse(errors, logs);
  }
}


function doPost(e) {
  const errors = [];
  const logs = [];

  try {
    addLog(logs, "INITIATING POST REQUEST")
    const queryParam = Object.assign(
      {},
      e && e.parameter ? e.parameter : {}
    );
    if (e && e.postData && e.postData.contents) {
      try {
        queryParam.bodyJSON = JSON.parse(e.postData.contents);

        addLog(
          logs,
          `Body JSON: ${JSON.stringify(queryParam.bodyJSON)}`
        );

      } catch (err) {
        pushError(
          errors,
          `Invalid JSON body: ${err.message}`,
          logs
        );
      }
    }

    addLog(
      logs,
      `Query Params: ${JSON.stringify(queryParam)}`
    );
    validateAction(queryParam, errors, logs);
    const response = actionsController(queryParam, errors,logs);

    if (errors.length > 0) {
      return createErrorResponse(errors, logs);
    }

    return createSuccessResponse(response, logs);

  } catch (err) {
    errors.push(`Internal server error: ${err.message}`);
    addLog(logs, `Exception: ${err.stack}`);

    return createErrorResponse(errors, logs);
  }
}

function createSuccessResponse(data, logs) {
  const response = JSON.stringify({
    success: true,
    data: data
  });

  addLog(logs, `Response: ${response}`);

  return ContentService
    .createTextOutput(response)
    .setMimeType(ContentService.MimeType.JSON);
}


function createErrorResponse(errors, logs) {
  const response = JSON.stringify({
    success: false,
    errors: errors,
    ...(debug_state ? { logs: logs } : {})
  });

  addLog(logs, `Error Response: ${response}`);

  return ContentService
    .createTextOutput(response)
    .setMimeType(ContentService.MimeType.JSON);
}

function createDate(new_dates) {
  // Format:
  // DD/MM/YYYY HH:MM:SS
  //
  // Example:
  // 02/09/2026 08:00:00
  try {
    if (typeof new_dates !== "string") {
      return new Date("Invalid");
    }

    const dates = new_dates.trim().split(/\s+/);

    if (dates.length !== 2) {
      return new Date("Invalid");
    }

    const date_data = dates[0].split("/");
    const hour_data = dates[1].split(":");

    if (
      date_data.length !== 3 ||
      hour_data.length !== 3
    ) {
      return new Date("Invalid");
    }

    const day = Number(date_data[0]);
    const month = Number(date_data[1]);
    const year = Number(date_data[2]);

    const hour = Number(hour_data[0]);
    const minute = Number(hour_data[1]);
    const second = Number(hour_data[2]);

    if (
      !Number.isInteger(day) ||
      !Number.isInteger(month) ||
      !Number.isInteger(year) ||
      !Number.isInteger(hour) ||
      !Number.isInteger(minute) ||
      !Number.isInteger(second)
    ) {
      return new Date("Invalid");
    }

    const date = new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second
    );

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day ||
      date.getHours() !== hour ||
      date.getMinutes() !== minute ||
      date.getSeconds() !== second
    ) {
      return new Date("Invalid");
    }

    return date;

  } catch (err) {
    return new Date("Invalid");
  }
}

function openSpreadsheet(errors, logs) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    addLog(logs, "Spreadsheet opened successfully");

    return ss;

  } catch (err) {
    pushError(
      errors,
      `Failed to open spreadsheet: ${err.message}`,
      logs
    );

    return null;
  }
}

function openSheet(db_name, ss, errors, logs) {
  if (!ss) {
    pushError(
      errors,
      "Cannot open sheet because spreadsheet is invalid",
      logs
    );

    return null;
  }

  const sheet = ss.getSheetByName(db_name);

  if (!sheet) {
    pushError(
      errors,
      `Sheet "${db_name}" does not exist`,
      logs
    );

    return null;
  }

  addLog(
    logs,
    `Opened sheet: ${db_name}`
  );

  return sheet;
}

function getDB(db_name, schema, errors, logs) {
  const ss = openSpreadsheet(errors, logs);

  if (!ss) {
    return false;
  }

  if (!validateSpreadSheet(ss, errors, logs)) {
    return false;
  }

  const sheet = openSheet(
    db_name,
    ss,
    errors,
    logs
  );

  if (!sheet) {
    return false;
  }

  const lastRow = sheet.getLastRow();

  addLog(
    logs,
    `Last Row: ${lastRow}`
  );

  if (lastRow < 2) {
    addLog(
      logs,
      `Sheet "${db_name}" contains no data`
    );

    return [];
  }

  const db = sheet
    .getRange(
      2,
      1,
      lastRow - 1,
      schema.length
    )
    .getDisplayValues();

  if (!db) {
    pushError(
      errors,
      `Failed to retrieve database "${db_name}"`,
      logs
    );

    return false;
  }

  addLog(
    logs,
    `Retrieved ${db.length} rows from ${db_name}`
  );

  return db;
}

function addLog(logsArray, log) {
  if (!debug_state) {
    return;
  }

  if (!Array.isArray(logsArray)) {
    return;
  }

  logsArray.push(log);
}

function pushError(errors, msg, logs) {
  errors.push(msg);

  addLog(
    logs,
    `ERROR: ${msg}`
  );
}