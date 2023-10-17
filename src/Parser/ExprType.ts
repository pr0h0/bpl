enum ExprType {
  EMPTY_EXP = "EMPTY_EXP",

  STRING_LITERAL_EXPR = "STRING_LITERAL_EXPR",
  NUMBER_LITERAL_EXPR = "NUMBER_LITERAL_EXPR",
  BOOLEAN_LITERAL_EXPR = "BOOLEAN_LITERAL_EXPR",
  NULL_LITERAL_EXPR = "NULL_LITERAL_EXPR",
  TYPE_LITERAL_EXPR = "TYPE_LITERAL_EXPR",

  IDENTIFIER_EXPR = "IDENTIFIER_EXPR",
  ASSIGNMENT_EXPR = "ASSIGNMENT_EXPR",
  BINARY_EXPR = "BINARY_EXPR",
  UNARY_EXPR = "UNARY_EXPR",
  GROUPING_EXPR = "GROUPING_EXPR",
  CALL_EXPR = "CALL_EXPR",

  VARIABLE_DECLARATION_EXPR = "VARIABLE_DECLARATION_EXPR",
  FUNCTION_DECLARATION_EXPR = "FUNCTION_DECLARATION_EXPR",
  IF_STMT = "IF_STMT",
  WHILE_STMT = "WHILE_STMT",
  UNTIL_STMT = "UNTIL_STMT",
  DO_WHILE_STMT = "DO_WHILE_STMT",
  DO_UNTIL_STMT = "DO_UNTIL_STMT",
  FOR_STMT = "FOR_STMT",
  BLOCK_STMT = "BLOCK_STMT",
  RETURN_STMT = "RETURN_STMT",
  BREAK_STMT = "BREAK_STMT",
  CONTINUE_STMT = "CONTINUE_STMT",

  TYPE_DECLARATION_STMT = "TYPE_DECLARATION_STMT",
  TERINARY_EXPR = "TERINARY_EXPR",
  TEMPLATE_LITERAL_TOKEN = "TEMPLATE_LITERAL_TOKEN",
}

export default ExprType;
