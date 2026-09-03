const ToolSchema = {
  schema: "Tool",

  0: ["id", "integer", "required"],
  1: ["name", "string", "required"],
  2: ["category", "string", "required"],
  3: ["status", "integer", "required"],

  length: 4
};


const ToolLogSchema = {
  schema: "ToolLog",

  0: ["id", "integer", "required"],
  1: ["username", "string", "required"],
  2: ["tool_id", "integer", "required"],
  3: ["start_date", "date", "required"],
  4: ["end_date", "date", "optional"],
  5: ["status", "string", "required"],

  length: 6
};