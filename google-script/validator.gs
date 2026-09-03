function validateAction(queryParam, errors, logs) {
  if (!queryParam || !("action" in queryParam)) {
    pushError(errors, "No Action", logs);
    return false;
  }

  switch (queryParam.action) {
    case "getTool":
    case "getTools":
    case "getToolLog":
    case "getToolLogs":
    case "postToolLog":
    case "setTool":
    case "setToolLog":
      return true;

    default:
      pushError(
        errors,
        `Invalid Action: ${queryParam.action}`,
        logs
      );
      return false;
  }
}


function validateSpreadSheet(ss, errors, logs) {
  if (!ss) {
    pushError(
      errors,
      "Cannot open Spreadsheet File",
      logs
    );
    return false;
  }

  return true;
}


function validateSheet(sheet, errors, logs) {
  if (!sheet) {
    pushError(
      errors,
      "Cannot open Sheet",
      logs
    );
    return false;
  }

  return true;
}


function validateID(queryParam, errors, logs) {
  if (
    !queryParam ||
    queryParam.id === undefined ||
    queryParam.id === null ||
    queryParam.id === ""
  ) {
    pushError(
      errors,
      "ID is Non-Existent or Invalid",
      logs
    );
    return false;
  }

  const id = Number(queryParam.id);

  if (!Number.isInteger(id) || id <= 0) {
    pushError(
      errors,
      "ID must be a positive integer",
      logs
    );
    return false;
  }

  return true;
}


function validateSchema(data, schema, errors, logs) {
  if (data === undefined || data === null) {
    pushError(
      errors,
      `Invalid ${schema.schema}: data is ${data}`,
      logs
    );
    return false;
  }

  if (!Array.isArray(data) && typeof data !== "object") {
    pushError(
      errors,
      `Invalid ${schema.schema}: data must be an array or object`,
      logs
    );
    return false;
  }

  const isArray = Array.isArray(data);

  if (isArray && data.length !== schema.length) {
    pushError(
      errors,
      `Invalid ${schema.schema}: data length is ${data.length} while schema length is ${schema.length}`,
      logs
    );
    return false;
  }

  if (!isArray) {
    const allowedKeys = {};

    for (const key in schema) {
      if (key !== "schema" && key !== "length") {
        allowedKeys[schema[key][0]] = true;
      }
    }

    for (const key in data) {
      if (!(key in allowedKeys)) {
        pushError(
          errors,
          `Invalid ${schema.schema}: unknown field "${key}"`,
          logs
        );
        return false;
      }
    }
  }

  for (const key in schema) {
    if (key === "schema" || key === "length") {
      continue;
    }

    const fieldName = schema[key][0];
    const fieldType = schema[key][1];
    const required = schema[key][2] === "required";

    const value = isArray
      ? data[key]
      : data[fieldName];

    const exists =
      value !== undefined &&
      value !== null &&
      value !== "";

    if (required && !exists) {
      pushError(
        errors,
        `Invalid ${fieldName} on ${schema.schema}: field is required`,
        logs
      );
      return false;
    }

    if (!exists) {
      continue;
    }

    let valid = true;

    switch (fieldType) {
      case "integer":
        valid = Number.isInteger(Number(value));
        break;

      case "string":
        valid = typeof value === "string";
        break;

      case "date":
        valid = validateDate(value, errors, logs);
        break;

      default:
        pushError(
          errors,
          `Unknown type "${fieldType}" for ${fieldName} on ${schema.schema}`,
          logs
        );
        return false;
    }

    if (!valid) {
      pushError(
        errors,
        `Invalid ${fieldName} on ${schema.schema}: type should be ${fieldType} while the data is ${value}`,
        logs
      );
      return false;
    }
  }

  return true;
}


function validateDate(new_dates, errors, logs) {
  const date = createDate(new_dates);

  if (!date || date.toString() === "Invalid Date") {
    return false;
  }

  return true;
}


function validatePartialSchema(
  partialSchema,
  schema,
  errors,
  logs
) {
  const schemaKeys = {};

  for (const index in schema) {
    if (
      index !== "schema" &&
      index !== "length"
    ) {
      schemaKeys[schema[index][0]] = "";
    }
  }

  addLog(
    logs,
    `Schemas on validation: ${JSON.stringify(schemaKeys)}`
  );

  for (const key in partialSchema) {
    if (!(key in schemaKeys)) {
      pushError(
        errors,
        `Query "${key}" is not matching the ${schema.schema}`,
        logs
      );
      return false;
    }
  }

  return true;
}


function convertArraySchematoObject(data, schema) {
  const object = {};

  for (let i = 0; i < schema.length; i++) {
    object[schema[i][0]] = data[i];
  }

  return object;
}