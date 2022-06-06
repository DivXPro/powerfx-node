export const lang = {
  data: [
    {
      name: 'ListItemSingleQuotedFormat',
      value: "'{0}'",
      comment: 'The format for single quoting a list item.',
    },
    {
      name: 'AboutIf',
      value:
        'Checks if any one of the specified conditions are met and returns the corresponding value. If none of the conditions are met, the function returns the specified default value.',
      comment: "Description of 'If' function.",
    },
    {
      name: 'IfArgCond',
      value: 'logical_test',
      comment:
        'function_parameter - First parameter for the If function, the condition that will be evaluated. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'IfArgTrueValue',
      value: 'true_value',
      comment:
        'function_parameter - Second parameter for the If function, an expression which will be evaluated if the first parameter is true. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'IfArgElseValue',
      value: 'else_value',
      comment:
        'function_parameter - Third parameter for the If function, an expression which will be evaluated if the first parameter is false. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutIf_logical_test',
      value: 'A condition that results in a boolean value.',
    },
    {
      name: 'AboutIf_true_value',
      value: 'An expression that provides the result of If when the condition is true.',
      comment: '{Locked=If}',
    },
    {
      name: 'AboutIf_else_value',
      value: 'An expression that provides the result of If when all specified conditions are false.',
      comment: '{Locked=If}',
    },
    {
      name: 'AboutSwitch',
      value:
        'Matches the result of a formula with a series of values. When a match is found, a corresponding formula is evaluated and returned. If no matches are found, the last default formula is evaluated and returned.',
      comment: "Description of 'Switch' function.",
    },
    {
      name: 'SwitchExpression',
      value: 'switch_value',
      comment:
        "function_parameter - First parameter for the Switch function, the value to compare against each 'match_value' parameter passed to the function. Translate this string. Maintain as a single word (do not add spaces).",
    },
    {
      name: 'SwitchDefaultReturn',
      value: 'default_result',
      comment:
        'function_parameter - Last optional parameter for the Switch function, formula evaluated and returned when there is no match found. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'SwitchCaseExpr',
      value: 'match_value',
      comment:
        'function_parameter - match_value parameter for the Switch function, the value that will be matched with switch_value. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'SwitchCaseArg',
      value: 'match_result',
      comment:
        'function_parameter - result statement to return when match is found. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutSwitch_switch_value',
      value: 'Value to compare against each match_value.',
      comment: "The term 'match_value' should be translated the same way as the resource with the key 'SwitchCaseExpr'",
    },
    {
      name: 'AboutSwitch_match_value',
      value: 'Value to match with switch_value.',
      comment:
        "The term 'switch_value' should be translated the same way as the resource with the key 'SwitchExpression'",
    },
    {
      name: 'AboutSwitch_match_result',
      value: 'Formula to evaluate and return if match is found.',
    },
    {
      name: 'AboutSwitch_default_result',
      value: 'Formula to evaluate and return if no matches are found.',
    },
    {
      name: 'AboutAnd',
      value: 'Checks whether all arguments are true, and returns true if all arguments are true.',
      comment: "Description of 'And' function.",
    },
    {
      name: 'AboutOr',
      value:
        'Checks whether any of the arguments are true, and returns true or false. Returns false only if all arguments are false.',
      comment: "Description of 'Or' function.",
    },
    {
      name: 'AboutNot',
      value: 'Changes false to true and true to false.',
      comment: "Description of 'Not' function.",
    },
    {
      name: 'LogicalFuncParam',
      value: 'logical',
      comment:
        'function_parameter - Parameter for logical functions (And, Or, Not), an expression with a true/false value.',
    },
    {
      name: 'AboutAnd_logical',
      value: 'A logical expression to factor into the And operation.',
    },
    {
      name: 'AboutOr_logical',
      value: 'A logical expression to factor into the Or operation.',
    },
    {
      name: 'AboutNot_logical',
      value: 'A logical expression to negate.',
    },
    {
      name: 'AboutCount',
      value: 'Counts the numeric values in the specified column.',
      comment: "Description of 'Count' function.",
    },
    {
      name: 'AboutCountA',
      value: 'Counts the number of rows in the column that are not empty.',
      comment: "Description of 'CountA' function.",
    },
    {
      name: 'AboutCountRows',
      value: 'Counts the number of rows in the input table or collection.',
      comment: "Description of 'CountRows' function.",
    },
    {
      name: 'CountArg1',
      value: 'source',
      comment: 'function_parameter - First argument to the Count function - the source to have its elements counted.',
    },
    {
      name: 'AboutCount_source',
      value: 'A column of values to count.',
    },
    {
      name: 'AboutCountA_source',
      value: 'A column of values to count.',
    },
    {
      name: 'AboutCountRows_source',
      value: 'A table whose rows will be counted.',
    },
    {
      name: 'AboutCountIf',
      value: 'Counts the number of rows that meet the given condition.',
      comment: "Description of 'CountIf' function.",
    },
    {
      name: 'CountIfArg1',
      value: 'source',
      comment: 'function_parameter - First argument to the CountIf function - the source to have its elements counted.',
    },
    {
      name: 'CountIfArg2',
      value: 'condition',
      comment:
        'function_parameter - Second argument to the CountIf function - the condition to be evaluated for which the items will be counted.',
    },
    {
      name: 'AboutCountIf_source',
      value: 'A table where rows that meet certain criteria will be counted.',
    },
    {
      name: 'AboutCountIf_condition',
      value: 'An expression evaluated for each row, that specifies whether the row should be counted.',
    },
    {
      name: 'AboutSumT',
      value: 'Returns the sum of the numbers the expression evaluates to in the context of the table.',
      comment: "Description of 'SumT' function.",
    },
    {
      name: 'AboutMaxT',
      value: 'Returns the largest value the expression evaluates to in the context of the table.',
      comment: "Description of 'MaxT' function.",
    },
    {
      name: 'AboutMinT',
      value: 'Returns the smallest value the expression evaluates to in the context of the table.',
      comment: "Description of 'MinT' function.",
    },
    {
      name: 'AboutAverageT',
      value:
        'Returns the average (arithmetic mean) of the numbers the expression evaluates to in the context of the table.',
      comment: "Description of 'AverageT' function.",
    },
    {
      name: 'StatisticalTArg1',
      value: 'source',
      comment:
        'function_parameter - First argument to statistical aggregation functions (Sum, Average, StdevP, ...) - the source to have its elements aggregated.',
    },
    {
      name: 'StatisticalTArg2',
      value: 'expression',
      comment:
        'function_parameter - Second argument to statistical aggregation functions (Sum, Average, StdevP, ...) - the expression to be applied to the elements.',
    },
    {
      name: 'AboutMin_source',
      value: 'A table over which this min operation will be computed.',
    },
    {
      name: 'AboutMin_expression',
      value:
        'An expression evaluated over each row in the input table, that provides numeric values for this min operation.',
    },
    {
      name: 'AboutMax_source',
      value: 'A table over which this max operation will be computed.',
    },
    {
      name: 'AboutMax_expression',
      value:
        'An expression evaluated over each row in the input table, that provides numeric values for this max operation.',
    },
    {
      name: 'AboutAverage_source',
      value: 'A table over which this average operation will be computed.',
    },
    {
      name: 'AboutAverage_expression',
      value:
        'An expression evaluated over each row in the input table, that provides numeric values for this average operation.',
    },
    {
      name: 'AboutSum_source',
      value: 'A table over which this sum operation will be computed.',
    },
    {
      name: 'AboutSum_expression',
      value:
        'An expression evaluated over each row in the input table, that provides numeric values for this sum operation.',
    },
    {
      name: 'AboutSum',
      value: 'Returns the sum of its arguments.',
      comment: "Description of 'Sum' function.",
    },
    {
      name: 'AboutMax',
      value: 'Returns the largest value in a set of values. Ignores logical values and text.',
      comment: "Description of 'Max' function.",
    },
    {
      name: 'AboutMin',
      value: 'Returns the smallest value in a set of values. Ignores logical values and text.',
      comment: "Description of 'Min' function.",
    },
    {
      name: 'AboutAverage',
      value: 'Returns the average (arithmetic mean) of its arguments.',
      comment: "Description of 'Average' function.",
    },
    {
      name: 'StatisticalArg',
      value: 'number',
      comment:
        'function_parameter - Argument to statistical functions (Sum, Average, StdevP, ...) - one of the values to be aggregated.',
    },
    {
      name: 'AboutSum_number',
      value: 'A numeric value for this sum operation.',
    },
    {
      name: 'AboutMin_number',
      value: 'A numeric value for this min operation.',
    },
    {
      name: 'AboutMax_number',
      value: 'A numeric value for this max operation.',
    },
    {
      name: 'AboutAverage_number',
      value: 'A numeric value for this average operation.',
    },
    {
      name: 'AboutAddColumns',
      value: "Returns a table with new columns computed by evaluating all 'expression' over 'source'.",
      comment:
        "Description of 'AddColumns' function. 'expression' is the third parameter of the function, so it should be translated the same way as 'AddColumnsArg3'; 'source' is the first parameter of the function, so it should be translated as 'AddColumnsArg1'",
    },
    {
      name: 'AddColumnsArg1',
      value: 'source',
      comment: 'function_parameter - First argument to the AddColumns function - the source to have columns added to.',
    },
    {
      name: 'AddColumnsArg2',
      value: 'column',
      comment: 'function_parameter - Second argument to the AddColumns function - the name of the column to be added.',
    },
    {
      name: 'AddColumnsArg3',
      value: 'expression',
      comment:
        'function_parameter - Third argument to the AddColumns function - the expression used to create the new column.',
    },
    {
      name: 'AboutAddColumns_source',
      value: 'A table to add columns to.',
      comment: 'AddColumns Parameter.',
    },
    {
      name: 'AboutAddColumns_column',
      value: 'A unique column name.',
      comment: 'AddColumns Parameter.',
    },
    {
      name: 'AboutAddColumns_expression',
      value: 'An expression that provides values for the new column.',
      comment: 'AddColumns Parameter.',
    },
    {
      name: 'AboutDropColumns',
      value: "Returns a table with one or more specified 'columns' removed from the 'source' table.",
      comment:
        "Description of 'DropColumns' function. 'source' is the first parameter of the function, so it should be translated as 'DropColumnsArg1'",
    },
    {
      name: 'DropColumnsArg1',
      value: 'source',
      comment: 'function_parameter - First argument to the DropColumns function - the source to have columns dropped.',
    },
    {
      name: 'DropColumnsArg2',
      value: 'column_name',
      comment:
        'function_parameter - Second argument to the DropColumns function - the name of the column to be dropped. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutDropColumns_source',
      value: 'A table value to remove columns from.',
    },
    {
      name: 'AboutDropColumns_column_name',
      value: 'The name of a column to remove.',
    },
    {
      name: 'AboutFilter',
      value: 'Returns the rows from the table for which all the specified conditions are true.',
      comment: "Description of 'Filter' function.",
    },
    {
      name: 'FilterArg1',
      value: 'source',
      comment: 'function_parameter - First argument to the Filter function - the source to be filtered.',
    },
    {
      name: 'FilterArg2',
      value: 'logical_test',
      comment:
        'function_parameter - Second argument to the Filter function - the expression used to filter the source. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutFilter_source',
      value: 'A table to filter.',
    },
    {
      name: 'AboutFilter_logical_test',
      value:
        'A logical test to evaluate for each row. Only the rows that pass this test will be included in the result of Filter.',
    },
    {
      name: 'AboutFirst',
      value: "Returns the first row of 'source'.",
      comment:
        "Description of 'First' function. 'source' is the first parameter of the function, so it should be translated the same way as 'FirstLastArg1'",
    },
    {
      name: 'AboutLast',
      value: "Returns the last row of 'source'.",
      comment:
        "Description of 'Last' function. 'source' is the first parameter of the function, so it should be translated the same way as 'FirstLastArg1'",
    },
    {
      name: 'FirstLastArg1',
      value: 'source',
      comment:
        'function_parameter - First argument to the First and Last functions - the source to extract the first/last element.',
    },
    {
      name: 'AboutFirst_source',
      value: 'A table whose first row will be returned.',
    },
    {
      name: 'AboutLast_source',
      value: 'A table whose last row will be returned.',
    },
    {
      name: 'AboutFirstN',
      value: "Returns the first 'count' rows of 'source'.",
      comment:
        "Description of 'FirstN' function. 'source' should be translated as 'FirstLastNArg1'; 'count' should be translated as 'FirstLastNArg2'",
    },
    {
      name: 'AboutLastN',
      value: "Returns the last 'count' rows of 'source'.",
      comment:
        "Description of 'LastN' function. 'source' should be translated as 'FirstLastNArg1'; 'count' should be translated as 'FirstLastNArg2'",
    },
    {
      name: 'FirstLastNArg1',
      value: 'source',
      comment:
        'function_parameter - First argument to the FirstN and LastN functions - the source to extract the first/last N elements.',
    },
    {
      name: 'FirstLastNArg2',
      value: 'count',
      comment:
        'function_parameter - Second argument to the FirstN and LastN functions - the number of elements to be extracted.',
    },
    {
      name: 'AboutFirstN_source',
      value: 'A table from which rows will be returned.',
    },
    {
      name: 'AboutFirstN_count',
      value: 'The number of rows to return.',
    },
    {
      name: 'AboutLastN_source',
      value: 'A table from which rows will be returned.',
    },
    {
      name: 'AboutLastN_count',
      value: 'The number of rows to return.',
    },
    {
      name: 'AboutText',
      value: "Converts a 'value' to text in a specific number 'format_text'.",
      comment:
        "Description of 'Text' function. 'value' is the name of the first parameter of the function, so it should be translated the same way as 'TextArg1'; 'format_text' is the name of the second parameter of the function, so it should be translated the same way as 'TextArg2'",
    },
    {
      name: 'TextArg1',
      value: 'value',
      comment: 'function_parameter - First argument to the Text function - the value to be converted to text.',
    },
    {
      name: 'TextArg2',
      value: 'format_text',
      comment:
        'function_parameter - Second argument to the Text function - the format used to convert the value to text. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'TextArg3',
      value: 'language',
      comment:
        'function_parameter - Third argument to the Text function - the language used when converting from the value to text.',
    },
    {
      name: 'AboutText_value',
      value: 'A value to format into text.',
    },
    {
      name: 'AboutText_format_text',
      value: "A text value that specifies the way in which 'value' will be formatted.",
      comment:
        "'value' is the name of the first parameter of the function, so it should be translated the same way as 'TextArg1'",
    },
    {
      name: 'AboutText_language',
      value: 'Language code to use when converting to text.',
      comment: 'Text Parameter description.',
    },
    {
      name: 'AboutValue',
      value: "Converts a 'text' that represents a number to a numeric value.",
      comment: "Description of 'Value' function.",
    },
    {
      name: 'ValueArg1',
      value: 'text',
      comment:
        'function_parameter - First argument to the Value function - the text that will be converted to a number.',
    },
    {
      name: 'ValueArg2',
      value: 'language',
      comment:
        'function_parameter - Second argument to the Value function - the language whose rules will be used when converting from text to number.',
    },
    {
      name: 'AboutValue_text',
      value: 'The text value to convert to a numeric value.',
    },
    {
      name: 'AboutValue_language',
      value: 'Language code to use when converting the value.',
      comment: 'Value Parameter description.',
    },
    {
      name: 'AboutCoalesce',
      value: 'Returns the first non blank argument',
      comment: "Description of 'Coalesce' function.",
    },
    {
      name: 'CoalesceArg1',
      value: 'value',
      comment: 'function_parameter - Argument to the Coalesce function - a value to be evaluated if non blank.',
    },
    {
      name: 'AboutCoalesce_value',
      value: 'An argument to be returned if it is the first non blank argument.',
    },
    {
      name: 'AboutConcatenate',
      value: 'Joins several text values into one text value.',
      comment: "Description of 'Concatenate' function.",
    },
    {
      name: 'ConcatenateArg1',
      value: 'text',
      comment: 'function_parameter - Argument to the Concatenate function - the text to be concatenated.',
    },
    {
      name: 'AboutConcatenate_text',
      value: 'A text value, to be concatenated with the rest of the arguments.',
    },
    {
      name: 'AboutConcatenateT',
      value: 'Joins several text values or tables into one column of text values.',
      comment: "Description of 'Concatenate' function.",
    },
    {
      name: 'ConcatenateTArg1',
      value: 'value',
      comment: 'function_parameter - Argument to the Concatenate function - the text or table to be concatenated.',
    },
    {
      name: 'AboutConcatenate_value',
      value: 'A text value or a column of text values, to be concatenated with the rest of the arguments.',
    },
    {
      name: 'AboutConcat',
      value:
        'Joins all text values produced by evaluating the given expression over the given table into one text value.',
      comment: "Description of 'Concat' function.",
    },
    {
      name: 'ConcatArg1',
      value: 'table',
      comment:
        'function_parameter - First argument to the Concat function - the table to have its rows concatenated by a given expression.',
    },
    {
      name: 'ConcatArg2',
      value: 'expression',
      comment:
        'function_parameter - Second argument to the Concat function - the expression used to convert the table rows into text.',
    },
    {
      name: 'ConcatArg3',
      value: 'separator',
      comment:
        'function_parameter - Third optional argument to the Concat function - the separator to insert between concatenated rows.',
    },
    {
      name: 'AboutConcat_table',
      value: 'A table value, over which the expression given by the second parameter is to be evaluated.',
    },
    {
      name: 'AboutConcat_expression',
      value: 'An text-producing expression to evaluate for each row in the given table.',
    },
    {
      name: 'AboutConcat_separator',
      value: 'A text value to be inserted between concatenated rows of the table.',
      comment: "Description of optional 'separator' parameter",
    },
    {
      name: 'AboutLen',
      value: 'Returns the number of characters in a text value.',
      comment: "Description of 'Len' function.",
    },
    {
      name: 'AboutLen_text',
      value: 'A text value whose length in characters will be returned.',
    },
    {
      name: 'AboutLenT',
      value:
        'Returns the number of characters in a text value, evaluated per row within the specified table or collection.',
      comment: "Description of 'Len' function.",
    },
    {
      name: 'AboutLen_text_column',
      value: 'A column of text values whose lengths in characters will be returned (as a new column).',
    },
    {
      name: 'LenArg1',
      value: 'text',
      comment: 'function_parameter - First argument to the Len function - the text to have its length retrieved.',
    },
    {
      name: 'LenTArg1',
      value: 'text_column',
      comment:
        'function_parameter - First argument to the Len function - the name of the column in a data source the length of its elements retrieved. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutUpper',
      value: 'Converts a text value to all uppercase letters.',
      comment: "Description of 'Upper' function.",
    },
    {
      name: 'AboutUpperT',
      value:
        'Converts all letters in a text value, evaluated per row within the specified table or collection, to uppercase.',
      comment: "Description of 'Update' function.",
    },
    {
      name: 'AboutUpper_text',
      value: 'A text value to convert to uppercase.',
    },
    {
      name: 'AboutUpper_text_column',
      value: 'A column of text values to convert to a column of uppercase text values.',
    },
    {
      name: 'AboutLower',
      value: 'Converts all letters in a text value to lowercase.',
      comment: "Description of 'Lower' function.",
    },
    {
      name: 'AboutLowerT',
      value:
        'Converts all letters in a text value, evaluated per row within the specified table or collection, to lowercase.',
      comment: "Description of 'Lower' function.",
    },
    {
      name: 'AboutLower_text',
      value: 'A text value to convert to lowercase.',
    },
    {
      name: 'AboutLower_text_column',
      value: 'A column of text values to convert to a column of lowercase text values.',
    },
    {
      name: 'AboutProper',
      value:
        'Converts a text value to proper case; the first letter in each word in uppercase, and all other letters to lowercase.',
      comment: "Description of 'Proper' function.",
    },
    {
      name: 'AboutProperT',
      value:
        'Converts a text value, evaluated per row within the specified table or collection, to proper case; the first letter in each word in uppercase, and all other letters to lowercase.',
      comment: "Description of 'Proper' function.",
    },
    {
      name: 'AboutProper_text',
      value: 'A text value to convert to proper case.',
    },
    {
      name: 'AboutProper_text_column',
      value: 'A column of text values to convert to a column of proper case text values.',
    },
    {
      name: 'AboutTrim',
      value: 'Removes all spaces from a text value except for single spaces between words.',
      comment: "Description of 'Trim' function.",
    },
    {
      name: 'AboutTrim_text',
      value: 'A text value to convert to trim.',
    },
    {
      name: 'AboutTrim_text_column',
      value: 'A column of text values to trim.',
    },
    {
      name: 'AboutTrimEnds',
      value: 'Removes all leading and trailing spaces from a text value.',
      comment: "Description of 'TrimEnds' function.",
    },
    {
      name: 'AboutTrimEnds_text',
      value: 'A text value to trim the trailing and leading whitespace.',
    },
    {
      name: 'AboutTrimEnds_text_column',
      value: 'A column of text values to trim the trailing and leading whitespace.',
    },
    {
      name: 'AboutMid',
      value: 'Returns the characters from the middle of a text value, given a starting position and length.',
      comment: "Description of 'Mid' function.",
    },
    {
      name: 'AboutMidT',
      value:
        'Returns the characters from the middle of a text value, given a starting position and length, evaluated per row within the specified table or collection.',
      comment: "Description of 'Mid' function.",
    },
    {
      name: 'AboutMid_text',
      value: 'A text value from which characters will be extracted.',
    },
    {
      name: 'AboutMid_text_column',
      value: 'A column of text values from which characters will be extracted into a new column.',
    },
    {
      name: 'AboutMid_start_num',
      value: 'The start position where to extract characters from.',
    },
    {
      name: 'AboutMid_num_chars',
      value: 'The number of characters to extract.',
    },
    {
      name: 'StringFuncArg1',
      value: 'text',
      comment:
        'function_parameter - First argument of string related functions, such as Trim, Lower, Upper - the text to have the function applied to.',
    },
    {
      name: 'StringTFuncArg1',
      value: 'text_column',
      comment:
        'function_parameter - First argument of string related functions, such as Trim, Lower, Upper - the text column in a data source to have the function applied to. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'StringFuncArg2',
      value: 'start_num',
      comment:
        'function_parameter - Second argument of string related functions, such as Mid, Replace, indicating the start position of the string to apply the function. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'StringFuncArg3',
      value: 'num_chars',
      comment:
        'function_parameter - Third argument of string related functions, such as Mid, Replace, indicating the number of characters that the function should be applied to. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutReplace',
      value: 'Replace part of a text value with a different text value.',
      comment: "Description of 'Replace' function.",
    },
    {
      name: 'AboutReplaceT',
      value:
        'Replace part of a text value with a different text value, evaluated per row within the specified table or collection.',
      comment: "Description of 'Replace' function.",
    },
    {
      name: 'ReplaceFuncArg1',
      value: 'old_text',
      comment:
        'function_parameter - First argument to the Replace function - the text to be replaced. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'ReplaceFuncArg4',
      value: 'new_text',
      comment:
        'function_parameter - Last argument to the Replace function - the text to replace the original text. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutReplace_old_text',
      value: 'The text value to process.',
    },
    {
      name: 'AboutReplace_start_num',
      value: 'The starting position where the replacement will take place.',
    },
    {
      name: 'AboutReplace_num_chars',
      value: 'The number of characters to replace.',
    },
    {
      name: 'AboutReplace_new_text',
      value: 'A replacement text value.',
    },
    {
      name: 'AboutReplace_text_column',
      value: 'A column of text values to process.',
    },
    {
      name: 'AboutError',
      value: 'Produces an error with custom values.',
      comment: "Description of 'Error' function.",
    },
    {
      name: 'AboutError_error_information',
      value: 'A record containing the custom values for the produced error.',
      comment:
        'Description of the first (and only) parameter to the Error function, which is a record containing certain properties that identify the error that is created.',
    },
    {
      name: 'ErrorArg1',
      value: 'error_information',
      comment:
        'function_parameter - Argument to the Error function - a record of information for generating a custom error. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'ErrErrorIrrelevantField',
      value: 'The Error function only uses the fields "Kind", "Message", "Notify", "Control", and "Property".',
      comment:
        'An error message for when the user passes in an unexpected extra field to Error. {Locked=Kind} {Locked=Message} {Locked=Notify} {Locked=Control} {Locked=Property} {Locked=Error}',
    },
    {
      name: 'AboutIfError',
      value: 'Evaluates and returns the first non-error argument.',
      comment: "Description of 'IfError' function.",
    },
    {
      name: 'IfErrorArg1',
      value: 'value',
      comment: 'function_parameter - Argument to the IfError function - a value to be returned if non error.',
    },
    {
      name: 'AboutIfError_value',
      value: 'Value that is returned if it is not an error.',
      comment: 'Description of the first parameter IfError accepts',
    },
    {
      name: 'IfErrorArg2',
      value: 'fallback',
      comment:
        'function_parameter - Argument to the IfError function - a value to fallback on if the previous args are errors.',
    },
    {
      name: 'AboutIfError_fallback',
      value: 'Value that is returned if it is the first non error argument.',
      comment: 'Description of the repeated parameter: a value to fallback on if the previous args are errors',
    },
    {
      name: 'AboutSubstitute',
      value: 'Replaces existing text with new text in a text value.',
      comment: "Description of 'Substitute' function.",
    },
    {
      name: 'AboutSubstituteT',
      value:
        'Replaces existing text with new text in a text value evaluated per row within the specified table or collection.',
      comment: "Description of 'Substitute' function.",
    },
    {
      name: 'SubstituteFuncArg1',
      value: 'text',
      comment:
        'function_parameter - First argument to the Substitute function - the text to have (part of) it replaced.',
    },
    {
      name: 'SubstituteTFuncArg1',
      value: 'text_column',
      comment:
        'function_parameter - First argument to the Substitute function - a text column to have (part of) its values replaced. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'SubstituteFuncArg2',
      value: 'old_text',
      comment:
        'function_parameter - Second argument to the Substitute function - the text to be replaced. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'SubstituteFuncArg3',
      value: 'new_text',
      comment:
        'function_parameter - Third argument to the Substitute function - the text to replace the old value. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'SubstituteFuncArg4',
      value: 'instance_num',
      comment:
        'function_parameter - Fourth (optional) argument to the Substitute function - the specific instance to be replaced. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutSubstitute_text',
      value: 'The text value to process.',
    },
    {
      name: 'AboutSubstitute_old_text',
      value: 'The text to replace.',
    },
    {
      name: 'AboutSubstitute_new_text',
      value: 'A replacement text.',
    },
    {
      name: 'AboutSubstitute_instance_num',
      value: 'Specifies which occurrence of the given text to replace.',
    },
    {
      name: 'AboutSubstitute_text_column',
      value: 'A column of text values to process.',
    },
    {
      name: 'AboutSort',
      value:
        "Sorts 'source' based on the results of the 'expression' evaluated for each row, optionally specifying a sort 'order'.",
      comment: "Description of 'Sort' function.",
    },
    {
      name: 'SortArg1',
      value: 'source',
      comment:
        'function_parameter - First argument to the Sort function - the source (table / collection) to be sorted.',
    },
    {
      name: 'SortArg2',
      value: 'expression',
      comment: 'function_parameter - Second argument to the Sort function - the expression used to sort the source',
    },
    {
      name: 'SortArg3',
      value: 'order',
      comment:
        'function_parameter - Third argument to the Sort function - the order (ascending / descending) to apply the sorting.',
    },
    {
      name: 'AboutSort_source',
      value: 'The table to sort.',
    },
    {
      name: 'AboutSort_expression',
      value: "An expression that gets evaluated over rows in 'source' and provides values for sorting.",
    },
    {
      name: 'AboutSort_order',
      value: 'Ascending or Descending',
    },
    {
      name: 'AboutSortByColumns',
      value: "Sorts 'source' based on the column, optionally specifying a sort 'order'.",
      comment: "Description of 'SortByColumns' function.",
    },
    {
      name: 'SortByColumnsArg1',
      value: 'source',
      comment:
        'function_parameter - First argument to the SortByColumns function - the source (table / collection) to be sorted.',
    },
    {
      name: 'SortByColumnsArg2',
      value: 'column',
      comment:
        'function_parameter - Second argument to the SortByColumns function - the column based on which the source will be sorted.',
    },
    {
      name: 'SortByColumnsArg3',
      value: 'order',
      comment:
        'function_parameter - Third argument to the SortByColumns function - the order (ascending / descending) to apply the sorting.',
    },
    {
      name: 'AboutSortByColumns_source',
      value: 'The table to sort.',
    },
    {
      name: 'AboutSortByColumns_column',
      value: 'A unique column name.',
    },
    {
      name: 'AboutSortByColumns_order',
      value: 'Ascending or Descending',
    },
    {
      name: 'AboutSortByColumnsWithOrderValues',
      value: "Sorts 'source' based on the index of matching values in the specified column.",
      comment: "Description of 'SortByColumns' function.",
    },
    {
      name: 'SortByColumnsWithOrderValuesArg1',
      value: 'source',
      comment:
        'function_parameter - First argument to the SortByColumns function - the source (table / collection) to be sorted.',
    },
    {
      name: 'SortByColumnsWithOrderValuesArg2',
      value: 'column',
      comment:
        'function_parameter - Second argument to the SortByColumns function - the column based on which the source will be sorted.',
    },
    {
      name: 'SortByColumnsWithOrderValuesArg3',
      value: 'values',
      comment:
        'function_parameter - Third argument to the SortByColumns function - a list of values specifying the order of items to be sorted.',
    },
    {
      name: 'AboutSortByColumns_values',
      value:
        'A column of values to be used for sorting purposes. Sorting is not done ascendingly/descendingly, but rather based on the index of matching values in the column ',
    },
    {
      name: 'AboutRand',
      value: 'Returns a random number greater than or equal to 0 and less than 1, evenly distributed.',
      comment: "Description of 'Rand' function.",
    },
    {
      name: 'AboutRandBetween',
      value: 'Returns a random number between bottom and top, evenly distributed.',
      comment: "Description of 'RandBetween' function.",
    },
    {
      name: 'AboutRandBetween_bottom',
      value: 'The smallest integer that the function can return.',
    },
    {
      name: 'AboutRandBetween_top',
      value: 'The largest integer that the function can return. Must be equal to or greater than bottom.',
    },
    {
      name: 'RandBetweenArg1',
      value: 'bottom',
      comment:
        'function_parameter - First argument to the RandBetween function - the smallest integer that the function can return.',
    },
    {
      name: 'RandBetweenArg2',
      value: 'top',
      comment:
        'function_parameter - Second argument to the RandBetween function - the largest integer that the function can return.',
    },
    {
      name: 'AboutGUID',
      value: 'Creates a GUID from a string, or returns a randomly generated GUID if no arguments are supplied.',
      comment: "Description of 'GUID' function.",
    },
    {
      name: 'GUIDArg',
      value: 'GUID_string',
      comment: 'function_parameter - String to convert into a GUID',
    },
    {
      name: 'AboutGUID_GUID_string',
      value: 'String to convert into a GUID',
      comment: 'Description of the GUID String param for the GUID function',
    },
    {
      name: 'AboutNow',
      value: 'Returns the current date and time.',
      comment: "Description of 'Now' function.",
    },
    {
      name: 'AboutUTCNow',
      value: 'Returns the current date and time in UTC time.',
      comment: "Description of 'UTCNow' function.",
    },
    {
      name: 'AboutTimeZoneOffset',
      value:
        'Returns the time difference between UTC time and local time, in minutes.For example, If your time zone is UTC+2, -120 will be returned.',
      comment: "Description of 'TimeZoneOffset' function.",
    },
    {
      name: 'TimeZoneOffsetArg1',
      value: 'date',
      comment: 'function_parameter - Argument of the TimeZoneOffset function - the date for the timezone offset.',
    },
    {
      name: 'AboutTimeZoneOffset_date',
      value: "The date on which to calculate the 'TimeZoneOffset'.",
      comment: '{Locked=TimeZoneOffset}',
    },
    {
      name: 'AboutToday',
      value: 'Returns the current date.',
      comment: "Description of 'Today' function.",
    },
    {
      name: 'AboutUTCToday',
      value: 'Returns the current date in UTC time.',
      comment: "Description of 'UTCToday' function.",
    },
    {
      name: 'AboutWeekNum',
      value: 'Returns the week number for a given date.',
      comment: "Description of 'WeekNum' function.",
    },
    {
      name: 'WeekNumArg1',
      value: 'date',
      comment:
        'function_parameter - First parameter for the WeekNum function - a date value for which the week number will be calculated.',
    },
    {
      name: 'WeekNumArg2',
      value: 'start_of_week',
      comment:
        'function_parameter - Second (optional) parameter for the WeekNum function - the weekday that is used to start the week. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutWeekNum_date',
      value: 'A date value for which the week number will be calculated.',
    },
    {
      name: 'AboutWeekNum_start_of_week',
      value:
        'A value from the StartOfWeek enumeration or a number from the corresponding Excel function to indicate how the days of the week should be numbered.',
      comment: '{Locked=StartOfWeek}',
    },
    {
      name: 'AboutISOWeekNum',
      value: 'Returns the week number according to ISO rules for a given date.',
      comment: "Description of 'ISOWeekNum' function.",
    },
    {
      name: 'ISOWeekNumArg1',
      value: 'date',
      comment:
        'function_parameter - First parameter for the ISOWeekNum function - a date value for which the ISO week number will be calculated.',
    },
    {
      name: 'AboutISOWeekNum_date',
      value: 'A date value for which the ISO week number will be calculated.',
    },
    {
      name: 'AboutInt',
      value: "Truncates 'number' by rounding toward negative infinity.",
      comment: "Description of 'Int' function.",
    },
    {
      name: 'AboutIntT',
      value: 'Truncates the values in a column of numbers by rounding toward negative infinity.',
      comment: "Description of 'Int' function.",
    },
    {
      name: 'AboutInt_number',
      value: 'A numeric value to process.',
    },
    {
      name: 'AboutInt_input',
      value: 'A column of numeric values to process.',
    },
    {
      name: 'AboutTrunc',
      value: "Truncates 'number' by rounding toward zero.",
      comment: "Description of 'Trunc' function.",
    },
    {
      name: 'AboutTrunc_number',
      value: 'The number to truncate.',
    },
    {
      name: 'AboutTrunc_source',
      value: 'A column of numbers to truncate.',
    },
    {
      name: 'AboutTrunc_num_digits',
      value: 'The number of fractional digits to use for truncating.',
    },
    {
      name: 'AboutTruncT',
      value: "Truncates all numbers in 'source' by rounding toward zero.",
      comment: "Description of 'TruncT' function.",
    },
    {
      name: 'TruncArg1',
      value: 'number',
      comment: 'function_parameter - First argument to the Trunc function - the number to be rounded.',
    },
    {
      name: 'TruncArg2',
      value: 'num_digits',
      comment:
        'function_parameter - Second argument to the Trunc function - the number of digits to apply the rounding. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'TruncTArg1',
      value: 'source',
      comment: 'function_parameter - First argument to the Trunc function - numeric column to be rounded.',
    },
    {
      name: 'TruncTArg2',
      value: 'num_digits',
      comment:
        'function_parameter - Second argument to the Trunc function - the number of digits to apply the rounding. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutRound',
      value: "Rounds 'number' to the specified number of digits.",
      comment: "Description of 'Round' function.",
    },
    {
      name: 'AboutRoundUp',
      value: "Rounds 'number' up, away from zero.",
      comment: "Description of 'RoundUp' function.",
    },
    {
      name: 'AboutRoundDown',
      value: "Rounds 'number' down, toward zero.",
      comment: "Description of 'RoundDown' function.",
    },
    {
      name: 'RoundArg1',
      value: 'number',
      comment: 'function_parameter - First argument to the Round function - the number to be rounded.',
    },
    {
      name: 'RoundArg2',
      value: 'num_digits',
      comment:
        'function_parameter - Second argument to the Round function - the number of digits to apply the rounding. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutRound_number',
      value: 'The number to round.',
    },
    {
      name: 'AboutRound_source',
      value: 'A column of numbers to round.',
    },
    {
      name: 'AboutRound_num_digits',
      value: 'The number of fractional digits to use for rounding.',
    },
    {
      name: 'AboutRoundUp_number',
      value: 'The number to round.',
    },
    {
      name: 'AboutRoundUp_source',
      value: 'A column of numbers to round.',
    },
    {
      name: 'AboutRoundUp_num_digits',
      value: 'The number of fractional digits to use for rounding.',
    },
    {
      name: 'AboutRoundDown_number',
      value: 'The number to round.',
    },
    {
      name: 'AboutRoundDown_source',
      value: 'A column of numbers to round.',
    },
    {
      name: 'AboutRoundDown_num_digits',
      value: 'The number of fractional digits to use for rounding.',
    },
    {
      name: 'AboutRoundT',
      value: "Rounds all numbers in 'source' to the specified number of digits.",
      comment: "Description of 'RoundT' function.",
    },
    {
      name: 'AboutRoundUpT',
      value: "Rounds all numbers in 'source' up, away from zero.",
      comment: "Description of 'RoundUpT' function.",
    },
    {
      name: 'AboutRoundDownT',
      value: "Rounds all numbers in 'source' down, toward zero.",
      comment: "Description of 'RoundDownT' function.",
    },
    {
      name: 'RoundTArg1',
      value: 'source',
      comment: 'function_parameter - First argument to the Round function - numeric column to be rounded.',
    },
    {
      name: 'RoundTArg2',
      value: 'num_digits',
      comment:
        'function_parameter - Second argument to the Round function - the number of digits to apply the rounding. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutRGBA',
      value:
        'Takes in numeric values for Red, Green, Blue and Alpha components of the color and generates the specific color. R, G, B are numeric between 0 to 255. Alpha is decimal between 0 to 1.',
      comment: "Description of 'RGBA' function.",
    },
    {
      name: 'RGBAArg1',
      value: 'red_value',
      comment:
        'function_parameter - First argument to the RGBA function - the red component of the color. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'RGBAArg2',
      value: 'green_value',
      comment:
        'function_parameter - Second argument to the RGBA function - the green component of the color. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'RGBAArg3',
      value: 'blue_value',
      comment:
        'function_parameter - Third argument to the RGBA function - the blue component of the color. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'RGBAArg4',
      value: 'alpha_value',
      comment:
        'function_parameter - Second argument to the RGBA function - the alpha (transparency) component of the color. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutRGBA_red_value',
      value: 'The red component, 0 to 255.',
    },
    {
      name: 'AboutRGBA_green_value',
      value: 'The green component, 0 to 255.',
    },
    {
      name: 'AboutRGBA_blue_value',
      value: 'The blue component, 0 to 255.',
    },
    {
      name: 'AboutRGBA_alpha_value',
      value: 'The alpha component, 0 to 1 (or a percentage, such as 49%).',
    },
    {
      name: 'AboutColorFade',
      value: "Produces a new shade of the specified 'color', based on the specified 'fade' percentage.",
      comment: "Description of 'ColorFade' function.",
    },
    {
      name: 'ColorFadeArg1',
      value: 'color',
      comment:
        'function_parameter - First argument to the ColorFade function - the color on which the function will apply a fade transformation.',
    },
    {
      name: 'ColorFadeArg2',
      value: 'fade',
      comment:
        'function_parameter - Second argument to the ColorFade function - the amount of fade that will be applied to the color.',
    },
    {
      name: 'AboutColorFade_color',
      value: 'A color to fade.',
    },
    {
      name: 'AboutColorFade_fade',
      value:
        'A percentage by which the color will be faded. A negative percentage produces a darker shade. A positive percentage produces a lighter shade.',
    },
    {
      name: 'AboutColorFadeT',
      value: "Produces new shades of the specified 'color' values, based on the specified 'fade' percentage values.",
    },
    {
      name: 'ColorFadeTArg1',
      value: 'color_or_column',
      comment:
        'function_parameter - First argument to the ColorFade function - the color on which the function will apply a fade transformation, or a column in a table containing the colors. When translating, maintain as a single word (i.e., do not add spaces)',
    },
    {
      name: 'ColorFadeTArg2',
      value: 'fade_or_column',
      comment:
        'function_parameter - Second argument to the ColorFade function - the amount of fade that will be applied to the color, or a column in a table containing the amounts. When translating, maintain as a single word (i.e., do not add spaces)',
    },
    {
      name: 'AboutColorFade_color_or_column',
      value: 'A color (or column of color values) to fade.',
    },
    {
      name: 'AboutColorFade_fade_or_column',
      value:
        'A percentage (or column of percentage values) by which the color (or column of color values) will be faded. A negative percentage produces a darker shade. A positive percentage produces a lighter shade.',
    },
    {
      name: 'AboutAbs',
      value: 'Returns the absolute value of a number, a number without its sign.',
      comment: "Description of 'Abs' function.",
    },
    {
      name: 'AboutAbsT',
      value: 'Returns the absolute values (numbers without their sign) of a column of numbers.',
      comment: "Description of 'Abs' function.",
    },
    {
      name: 'AboutAbs_number',
      value: 'A numeric value to process.',
    },
    {
      name: 'AboutAbs_input',
      value: 'A column of numeric values to process.',
    },
    {
      name: 'AboutSin_number',
      value: 'A numeric value (in radians) to process.',
    },
    {
      name: 'AboutSin_input',
      value: 'A column of numeric values (in radians) to process.',
    },
    {
      name: 'AboutSin',
      value: 'Returns the sine value of a number.',
      comment: 'Sin function parameter in radians.',
    },
    {
      name: 'AboutSinT',
      value: 'Returns the sine values of a column of numbers.',
      comment: 'Sin function parameter is a column of numbers in radians.',
    },
    {
      name: 'AboutAsin_number',
      value: 'A numeric value to process.',
    },
    {
      name: 'AboutAsin_input',
      value: 'A column of numeric values to process.',
    },
    {
      name: 'AboutAsin',
      value: 'Returns the arc sine value (in radians) of a number.',
      comment: 'Asin function parameter.',
    },
    {
      name: 'AboutAsinT',
      value: 'Returns the arc sine values (in radians) of a column of numbers.',
      comment: 'Asin function parameter.',
    },
    {
      name: 'AboutCos',
      value: 'Returns the cosine value of a number.',
      comment: 'Cos function parameter in radians.',
    },
    {
      name: 'AboutCosT',
      value: 'Returns the cosine values of a column of numbers.',
      comment: 'Cos function parameter is a column of numbers in radians.',
    },
    {
      name: 'AboutCos_number',
      value: 'A numeric value (in radians) to process.',
    },
    {
      name: 'AboutCos_input',
      value: 'A column of numeric values (in radians) to process.',
    },
    {
      name: 'AboutAcos',
      value: 'Returns the arc cosine value (in radians) of a number.',
      comment: 'Acos function parameter.',
    },
    {
      name: 'AboutAcos_number',
      value: 'A numeric value to process.',
    },
    {
      name: 'AboutAcosT',
      value: 'Returns the arc cosine values (in radians) of a column of numbers.',
      comment: 'Acos function parameter.',
    },
    {
      name: 'AboutAcos_input',
      value: 'A column of numeric values to process.',
    },
    {
      name: 'AboutAcot_number',
      value: 'A numeric value to process.',
    },
    {
      name: 'AboutAcot_input',
      value: 'A column of numeric values to process.',
    },
    {
      name: 'AboutAcot',
      value: 'Returns the arc cotangent value (in radians) of a number.',
      comment: 'Acot function parameter.',
    },
    {
      name: 'AboutAcotT',
      value: 'Returns the arc cotangent values (in radians) of a column of numbers.',
      comment: 'Acot function parameter.',
    },
    {
      name: 'AboutTan',
      value: 'Returns the tangent value of a number.',
      comment: 'Tan function parameter in radians.',
    },
    {
      name: 'AboutTanT',
      value: 'Returns the tangent values of a column of numbers.',
      comment: 'Tan function parameter in a column of numbers in radians.',
    },
    {
      name: 'AboutTan_number',
      value: 'A numeric value (in radians) to process.',
    },
    {
      name: 'AboutTan_input',
      value: 'A column of numeric values (in radians) to process.',
    },
    {
      name: 'AboutAtan',
      value: 'Returns the arc tangent value (in radians) of a number.',
      comment: 'Atan function parameter.',
    },
    {
      name: 'AboutAtanT',
      value: 'Returns the arc tangent values (in radians) of a column of numbers.',
      comment: 'Atan function parameter.',
    },
    {
      name: 'AboutAtan_number',
      value: 'A numeric value to process.',
    },
    {
      name: 'AboutAtan_input',
      value: 'A column of numeric values to process.',
    },
    {
      name: 'AboutCot',
      value: 'Returns the cotangent value of a number.',
      comment: 'Cot function parameter in radians.',
    },
    {
      name: 'AboutCotT',
      value: 'Returns the cotangent values of a column of numbers.',
      comment: 'Cot function parameter in a column of numbers in radians.',
    },
    {
      name: 'AboutCot_number',
      value: 'A numeric value (in radians) to process.',
    },
    {
      name: 'AboutCot_input',
      value: 'A column of numeric values (in radians) to process.',
    },
    {
      name: 'AboutLn',
      value: 'Returns the natural logarithm (base E) of a number.',
      comment: 'Ln function parameter.',
    },
    {
      name: 'AboutLnT',
      value: 'Returns the natural logarithm values (base E) of a column of numbers.',
      comment: 'Ln function parameter.',
    },
    {
      name: 'AboutLn_number',
      value: 'A numeric value to process.',
    },
    {
      name: 'AboutLn_input',
      value: 'A column of numeric values to process.',
    },
    {
      name: 'AboutLog',
      value: 'Returns the logarithm of a number for the given base. The default base is 10.',
      comment: 'Description of Log function.',
    },
    {
      name: 'AboutLogT',
      value:
        'Returns the logarithm values of a number or column of numbers for the given base or column of bases. The default base is 10.',
      comment: 'Description of Log function.',
    },
    {
      name: 'AboutLog_number',
      value: 'A numeric value to process.',
    },
    {
      name: 'AboutLog_input',
      value: 'A column of numeric values to process.',
    },
    {
      name: 'LogBase',
      value: 'base',
      comment: 'function_parameter - First argument to the Logarithm function - the base of the logarithm.',
    },
    {
      name: 'AboutLog_base',
      value: 'The base for the logarithm.',
    },
    {
      name: 'AboutExp',
      value:
        'Returns E raised to the power of a number. To calculate powers of other bases, use the exponentiation operator (^).',
      comment: 'Exp function parameter.',
    },
    {
      name: 'AboutExpT',
      value:
        'Returns a column containing E raised to the power of each corresponding number in a column of numbers. To calculate powers of other bases, use the exponentiation operator (^).',
      comment: 'Exp function parameter.',
    },
    {
      name: 'AboutExp_number',
      value: 'A numeric value to process.',
    },
    {
      name: 'AboutExp_input',
      value: 'A column of numeric values to process.',
    },
    {
      name: 'AboutPi',
      value: 'Returns the value of pi.',
    },
    {
      name: 'AboutRadians',
      value: 'Returns the radians value of a number.',
      comment: 'Radians function parameter.',
    },
    {
      name: 'AboutRadiansT',
      value: 'Returns the radians values of a column of numbers.',
      comment: 'Radians function parameter.',
    },
    {
      name: 'AboutRadians_number',
      value: 'A numeric value (in degrees) to process.',
    },
    {
      name: 'AboutRadians_input',
      value: 'A column of numeric values (in degrees) to process.',
    },
    {
      name: 'AboutDegrees',
      value: 'Returns the degrees value of a number.',
      comment: 'Degrees function parameter.',
    },
    {
      name: 'AboutDegreesT',
      value: 'Returns the degrees values of a column of numbers.',
      comment: 'Degrees function parameter.',
    },
    {
      name: 'AboutDegrees_number',
      value: 'A numeric value (in radians) to process.',
    },
    {
      name: 'AboutDegrees_input',
      value: 'A column of numeric values (in radians) to process.',
    },
    {
      name: 'AboutAtan2',
      value: 'Returns the arctangent (in radians) of the specified x- and y-coordinates.',
    },
    {
      name: 'AboutAtan2Arg1',
      value: 'x_coordinate',
      comment:
        'function_parameter - First parameter to the Atan function - the x coordinate for arctangent to be returned. When translating, maintain as a single word (i.e., do not add spaces)',
    },
    {
      name: 'AboutAtan2Arg2',
      value: 'y_coordinate',
      comment:
        'function_parameter - Second parameter to the Atan function - the y coordinate for arctangent to be returned. When translating, maintain as a single word (i.e., do not add spaces)',
    },
    {
      name: 'AboutAtan2_x_coordinate',
      value: 'x-coordinate.',
    },
    {
      name: 'AboutAtan2_y_coordinate',
      value: 'y-coordinate.',
    },
    {
      name: 'AboutSqrt',
      value: 'Returns the square root of a number.',
      comment: "Description of 'Sqrt' function.",
    },
    {
      name: 'AboutSqrtT',
      value: 'Returns the square roots of a column of numbers.',
      comment: "Description of 'Sqrt' function.",
    },
    {
      name: 'AboutSqrt_number',
      value: 'A numeric value to process.',
    },
    {
      name: 'AboutSqrt_input',
      value: 'A column of numeric values to process.',
    },
    {
      name: 'MathFuncArg1',
      value: 'number',
      comment:
        'function_parameter - First parameter to generic math functions - the number on which the function will be applied.',
    },
    {
      name: 'MathTFuncArg1',
      value: 'input',
      comment:
        'function_parameter - First parameter to generic math functions - the column in a table on which the function will be applied.',
    },
    {
      name: 'AboutLeft',
      value: 'Returns the specified number of characters from the start of a text value.',
      comment: "Description of 'Left' function.",
    },
    {
      name: 'AboutLeftT',
      value:
        'Returns a column containing the specified number of characters from the start of the text value evaluated per row within the specified table or collection.',
      comment: "Description of 'Left' function.",
    },
    {
      name: 'AboutLeft_text',
      value: 'A text value to extract characters from.',
    },
    {
      name: 'AboutLeft_num_chars',
      value: 'The number of characters to extract.',
    },
    {
      name: 'AboutLeft_text_column',
      value: 'A column of text values to extract characters from.',
    },
    {
      name: 'AboutRight',
      value: 'Returns the specified number of characters from the end of a text value.',
      comment: "Description of 'Right' function.",
    },
    {
      name: 'AboutRightT',
      value:
        'Returns a column containing the specified number of characters from the end of the text value evaluated per row within the specified table or collection.',
      comment: "Description of 'Right' function.",
    },
    {
      name: 'AboutRight_text',
      value: 'A text value to extract characters from.',
    },
    {
      name: 'AboutRight_num_chars',
      value: 'The number of characters to extract.',
    },
    {
      name: 'AboutRight_text_column',
      value: 'A column of text values to extract characters from.',
    },
    {
      name: 'LeftRightArg1',
      value: 'text',
      comment:
        'function_parameter - First parameter of the Left/Right functions - the text to retrieve the first characters to the left/right.',
    },
    {
      name: 'LeftRightTArg1',
      value: 'text_column',
      comment:
        'function_parameter - First parameter of the Left/Right functions - the text column to retrieve the first characters to the left/right. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'LeftRightArg2',
      value: 'num_chars',
      comment:
        'function_parameter - Second parameter of the Left/Right functions - the number of characters to retrieve on the left/right of the given text. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutIsBlank',
      value: 'Checks whether the expression results in blank, and returns true or false.',
      comment: "Description of 'IsBlank' function.",
    },
    {
      name: 'IsBlankArg1',
      value: 'expression',
      comment: 'function_parameter - First parameter to the IsBlank function - the expression to be evaluated.',
    },
    {
      name: 'AboutIsBlank_expression',
      value: 'An expression to be tested.',
    },
    {
      name: 'AboutIsBlankOrError',
      value: 'Checks whether the expression results in blank result or an error, and returns true or false.',
      comment: "Description of 'IsBlank' function.",
    },
    {
      name: 'IsBlankOrErrorArg1',
      value: 'expression',
      comment: 'function_parameter - First parameter to the IsBlankOrError function - the expression to be evaluated.',
    },
    {
      name: 'AboutIsEmpty',
      value: 'Checks if a collection is empty and returns true or false.',
      comment: "Description of 'IsEmpty' function.",
    },
    {
      name: 'IsEmptyArg1',
      value: 'source',
      comment: 'function_parameter - First parameter to the IsEmpty function - the source expression to be evaluated.',
    },
    {
      name: 'AboutShuffle',
      value: "Returns a randomly shuffled copy of the input 'source' table.",
      comment: "Description of 'Shuffle' function.",
    },
    {
      name: 'ShuffleArg1',
      value: 'source',
      comment: 'function_parameter - First parameter to the Shuffle function - the source to be shuffled.',
    },
    {
      name: 'AboutShuffle_source',
      value: 'A table to be shuffled.',
    },
    {
      name: 'AboutLookUp',
      value:
        'Looks up the first row for which the specified condition evaluates to true and returns the result of expression evaluated within the context of that row if provided an expression and the entire row otherwise.',
      comment: "Description of 'LookUp' function.",
    },
    {
      name: 'LookUpArg1',
      value: 'source',
      comment:
        'function_parameter - First argument to the LookUp function - the source to have the lookup operation performed.',
    },
    {
      name: 'LookUpArg2',
      value: 'condition',
      comment:
        'function_parameter - Second argument to the LookUp function - the condition on which the lookup operation is performed.',
    },
    {
      name: 'LookUpArg3',
      value: 'result',
      comment:
        'function_parameter - Third argument to the LookUp function - an expression to be applied to the returned row.',
    },
    {
      name: 'AboutLookUp_source',
      value: 'A table where values will be looked up.',
    },
    {
      name: 'AboutLookUp_condition',
      value: 'A condition to evaluate for rows in the specified input.',
    },
    {
      name: 'AboutLookUp_result',
      value:
        'An expression to evaluate over the row that match the specified condition, and that will provide the result.',
    },
    {
      name: 'AboutStdevP',
      value:
        'Calculates standard deviation based on the entire population given as arguments (ignores logical values and text).',
      comment: "Description of 'StdevP' function.",
    },
    {
      name: 'AboutStdevP_number',
      value: 'A number to factor into the standard deviation calculation.',
    },
    {
      name: 'AboutStdevP_source',
      value: 'A table that specifies the population for the standard deviation calculation.',
    },
    {
      name: 'AboutStdevP_expression',
      value:
        'An expression evaluated over rows in the input, that specifies values for the standard deviation calculation.',
    },
    {
      name: 'AboutStdevPT',
      value:
        'Calculates standard deviation based on the entire population given as a column (ignores logical values and text within the column).',
      comment: "Description of 'StdevPT' function.",
    },
    {
      name: 'AboutVarP',
      value: 'Calculates variance based on the entire population (ignores logical values and text in the population).',
      comment: "Description of 'VarP' function.",
    },
    {
      name: 'AboutVarP_number',
      value: 'A number to factor into the variance calculation.',
    },
    {
      name: 'AboutVarP_source',
      value: 'A table that specifies the population for the variance calculation.',
    },
    {
      name: 'AboutVarP_expression',
      value: 'An expression evaluated over rows in the input, that specifies values for the variance calculation.',
    },
    {
      name: 'AboutVarPT',
      value:
        'Calculates variance based on the entire population specified as a column (ignores logical values and text in the column).',
      comment: "Description of 'VarPT' function.",
    },
    {
      name: 'SetArg1',
      value: 'variable',
      comment:
        'function_parameter - First argument to the Set function - the name of a global variable, scoped to the app.',
    },
    {
      name: 'AboutSplit',
      value: 'Splits a string into substrings using a delimiter.',
      comment: "Description of 'Split' function.",
    },
    {
      name: 'AboutSplit_text',
      value: 'Text to be split into substrings.',
      comment: "Description of first argument of the 'Split' function",
    },
    {
      name: 'AboutSplit_separator',
      value: 'Delimiter text used to split the input text into substrings.',
      comment: "Description of second argument of the 'Split' function",
    },
    {
      name: 'SplitArg1',
      value: 'text',
      comment:
        'function_parameter - First argument to the Split function - the input text that will be split into substrings using SplitArg2 as the delimiter.',
    },
    {
      name: 'SplitArg2',
      value: 'separator',
      comment:
        'function_parameter - Second argument to the Split function - the delimiter text that is used to split SplitArg1 into substrings.',
    },
    {
      name: 'AboutIsType',
      value: 'Returns true if the provided value is of the given type.',
      comment: "Description of the 'IsType' function.",
    },
    {
      name: 'IsTypeArg1',
      value: 'value',
      comment: 'function_parameter - First argument of the IsType function - The polymorphic value to be inspected.',
    },
    {
      name: 'IsTypeArg2',
      value: 'typeTable',
      comment:
        'function_parameter - Second argument of the IsType function - The Entity table representing the type that we wish to compare the value to. For example, if the author has a CDS data source named Account, that table could be passed here (eg IsType(myVal, Account)).',
    },
    {
      name: 'AboutAsType',
      value: 'Uses the provided value as the given type.',
      comment: "Description of the 'AsType' function.",
    },
    {
      name: 'AsTypeArg1',
      value: 'value',
      comment:
        'function_parameter - First argument of the IsType function - The polymorphic value to be used as the new type.',
    },
    {
      name: 'AsTypeArg2',
      value: 'typeTable',
      comment:
        'function_parameter - Second argument of the AsType function - The Entity table representing the type that we wish the value to be used as. For example, if the author has a CDS data source named Account, that table could be passed here (eg AsType(myVal, Account)).',
    },
    {
      name: 'AboutAsType_value',
      value: 'The polymorphic record to cast as a new type.',
    },
    {
      name: 'AboutAsType_typeTable',
      value: 'The entity table representing the type we wish the value to be used as.',
    },
    {
      name: 'AboutWith',
      value: 'Executes the formula provided as second parameter using the scope provided by the first.',
      comment: "Description of the 'With' function.",
    },
    {
      name: 'WithArg1',
      value: 'scope',
      comment: 'function_parameter - First argument of the With function - Record type.',
    },
    {
      name: 'WithArg2',
      value: 'formula',
      comment: 'function_parameter - Second argument of the With function - Any Power Apps expression',
    },
    {
      name: 'AboutWith_scope',
      value: 'The scope with which to call the formula defined by the second parameter.',
      comment: 'Function argument',
    },
    {
      name: 'AboutWith_formula',
      value: 'The formula to be called using the scope provided by the first parameter.',
      comment: 'Function argument',
    },
    {
      name: 'AboutSequence',
      value: 'Generates a table of sequential numbers',
      comment: "Description text for the 'Sequence' function.",
    },
    {
      name: 'SequenceArg1',
      value: 'records',
      comment:
        'function_parameter - Optional first argument to the Sequence function, number of records in the resulting table',
    },
    {
      name: 'AboutSequence_records',
      value: 'Number of records in the single column table with name "Value". Maximum 50,000.',
      comment: 'Description of the first parameter to Sequence',
    },
    {
      name: 'SequenceArg2',
      value: 'start',
      comment:
        'function_parameter - Second optional argument to the Sequence function, the first number in the resulting table',
    },
    {
      name: 'AboutSequence_start',
      value: 'Optional. The first number in the sequence. Default 1.',
      comment: 'Description of the second optional parameter to Sequence',
    },
    {
      name: 'SequenceArg3',
      value: 'step',
      comment:
        'function_parameter - optional third argument to the Sequence function, the difference between each number in the sequence',
    },
    {
      name: 'AboutSequence_step',
      value: 'Optional. The amount to increment each subsequent value in the table. Default 1.',
      comment: 'Description of the third parameter to Sequence',
    },
    {
      name: 'ErrInvalidDot',
      value: "Invalid use of '.'",
      comment: 'Error Message.',
    },
    {
      name: 'ErrUnknownFunction',
      value: 'Invocation of unknown or unsupported function.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrUnSupportedComponentBehaviorInvocation',
      value: 'Component behavior can only be invoked from within a component.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrUnSupportedComponentDataPropertyAccess',
      value:
        'Component custom data property with parameters can only be accessed from within a component or from component output properties.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrBadArity',
      value: 'Invalid number of arguments: received {0}, expected {1}.',
      comment: 'Error Message. {0} Will be a number, and {1} will be a number',
    },
    {
      name: 'ErrBadArityEven',
      value: 'Invalid number of arguments: received {0}, expected an even number.',
      comment: 'Error Message. {0} Will be a number',
    },
    {
      name: 'ErrBadArityOdd',
      value: 'Invalid number of arguments: received {0}, expected an odd number.',
      comment: 'Error Message. {0} Will be a number',
    },
    {
      name: 'ErrBadType',
      value: 'Invalid argument type.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrBadType_Type',
      value: 'Invalid argument type. Cannot use {0} values in this context.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrBadOperatorTypes',
      value: "This operation isn't valid on these types: {0}, {1}.",
      comment:
        'Error message when the user attempts to use an operator (e.g. + or -) on two values that don\'t make sense together. {0} and {1} will be canonical type representations like "Number" or "Boolean".',
    },
    {
      name: 'ErrGuidStrictComparison',
      value: 'GUID values can only be compared to other GUID values.',
      comment: "Error message when the user attempts to a GUID value is equal to something that isn't a GUID.",
    },
    {
      name: 'ErrBadRecordFieldType_FieldName_ExpectedType',
      value: "Invalid type for field '{0}'. Expected field type of '{1}'.",
      comment: 'Error message shown to the user when a field in a record has the incorrect type.',
    },
    {
      name: 'ErrBadType_ExpectedType',
      value: 'Invalid argument type. Expecting a {0} value.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrBadType_ExpectedType_ProvidedType',
      value: 'Invalid argument type ({1}). Expecting a {0} value instead.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrBadSchema_ExpectedType',
      value: 'Invalid argument type. Expecting a {0} value, but of a different schema.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrBadType_ExpectedTypesCSV',
      value: 'Invalid argument type. Expecting one of the following: {0}.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrInvalidArgs_Func',
      value: "The function '{0}' has some invalid arguments.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrNeedTable_Func',
      value: "The first argument of '{0}' should be a table.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrInvalidPropertyAccess',
      value: 'Property expects a required parameter. Please use parentheses to pass the required parameter.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrNeedTableCol_Func',
      value: "The first argument of '{0}' should be a one-column table.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrInvalidSchemaNeedStringCol_Col',
      value: "Invalid schema, expected a column of text values for '{0}'.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrInvalidSchemaNeedDateCol_Col',
      value: "Invalid schema, expected a column of date values for '{0}'.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrInvalidSchemaNeedNumCol_Col',
      value: "Invalid schema, expected a column of numeric values for '{0}'.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrInvalidSchemaNeedColorCol_Col',
      value: "Invalid schema, expected a column of color values for '{0}'.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrInvalidSchemaNeedCol',
      value: 'Invalid schema, expected a one-column table.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrNeedRecord',
      value: 'Cannot use a non-record value in this context.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrIncompatibleRecord',
      value: 'Cannot use this record. It may contain colliding fields of incompatible types.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrNeedRecord_Func',
      value: "The first argument of '{0}' should be a record.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrNeedEntity_EntityName',
      value:
        "Using this option set as an enumeration value or in the Choices function requires that the '{0}' entity be added as a Data Source. To add, use the View menu and then select Data sources.",
      comment:
        'Error Message. {Locked=Choices} Indicates a given entity must be imported as a first class entity. This is a result of usage of an option set that is exposed via a relationship in a CDS 2 entity.',
    },
    {
      name: 'ErrNotAccessibleInCurrentContext',
      value: 'The specified property is not accessible in this context.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrInternalControlInInputProperty',
      value: "Controls inside a component can't be referenced in that same component's input properties.",
      comment: 'Error Message when a user attempts to use a control inside the formula for a component input property.',
    },
    {
      name: 'ErrColumnNotAccessibleInCurrentContext',
      value: 'The specified column is not accessible in this context.',
      comment: 'Error Message.',
    },
    {
      name: 'WrnRowScopeOneToNExpandNumberOfCalls',
      value:
        "A One-to-Many or Many-to-Many relationship is being referenced in this function's record scope.  This may result in a large number of calls to your data source that can impact performance.",
      comment: 'Warning Message.',
    },
    {
      name: 'ErrNumberTooLarge',
      value: 'Numeric value is too large.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrInvalidDataSource',
      value:
        'This Data source is invalid. Please fix the error in "Data sources" pane by clicking "Content -> Data sources" or "View -> Options"',
      comment: 'Error Message.',
    },
    {
      name: 'ErrExpectedDataSourceRestriction',
      value: 'Expected a data source identifier to restrict the inline record.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrIncompatibleTypes',
      value: 'The given types are incompatible.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrTypeError_Ex1_Ex2_Found',
      value: "The type of this argument '{2}' does not match one of the expected types '{0}' or '{1}'.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrTypeError_Arg_Expected_Found',
      value: "The type of this argument '{0}' does not match the expected type '{1}'. Found type '{2}'.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrTypeErrorRecordIncompatibleWithSource',
      value: 'The type of the record is incompatible with the source.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrExpectedStringLiteralArg_Name',
      value: "Argument '{0}' is invalid, expected a text literal.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrArgNotAValidIdentifier_Name',
      value: "Argument '{0}' is not a valid identifier.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrColExists_Name',
      value: "A column named '{0}' already exists.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrColConflict_Name',
      value: "Column name conflict for '{0}'.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrColDNE_Name',
      value: "The specified column '{0}' does not exist.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrColumnDoesNotExist_Name_Similar',
      value: "The specified column '{0}' does not exist. The column with the most similar name is '{1}'.",
      comment:
        "Error message when attempting to put a column that does not exist into a table. {0} has the column display name that doesn't exist, and {1} has the most similar column name in the table.",
    },
    {
      name: 'ErrSortIncorrectOrder',
      value: 'The sort order is incorrect for the type of the expression.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrSortWrongType',
      value: 'Cannot sort on the expression type.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrFunctionDoesNotAcceptThisType_Function_Expected',
      value: 'Type error: {0} expects either {1} or a table column of {1} type.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrIncorrectFormat_Func',
      value: "Incorrect format specifier for '{0}'.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrAsyncLambda',
      value: 'Asynchronous invocations cannot be used in conditions and value functions.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrValueMustBeFullyQualified',
      value: "This is a namespace, you can access its members using the '.' operator.",
      comment: 'Error message shown when a maker tries to use fully qualified value name as a First name node only',
    },
    {
      name: 'ErrScopeModificationLambda',
      value: 'This function cannot operate on the same data source that is used in {0}.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrFunctionDisallowedWithinNondeterministicOperationOrder',
      value: 'This function cannot be invoked within {0}.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrAsTypeAndIsTypeExpectConnectedDataSource',
      value:
        'Incorrect argument. This formula expects a table from a connected data source. The AsType and IsType functions require connected data sources.',
      comment:
        '{Locked=AsType}{Locked=IsType} Error message provided when the user attempts to use a non-Connected data source table as the second argument to AsType or IsType.',
    },
    {
      name: 'ErrUnmatchedCurly',
      value: "One or more '{' or '}' characters are mismatched.",
      comment:
        'Error message when the lexer mode stack is empty, or when lexing terminates with more than a single mode in the stack.',
    },
    {
      name: 'InfoMessage',
      value: 'Message: ',
      comment: 'Message Label.',
    },
    {
      name: 'InfoNode_Node',
      value: 'Node: {0}',
      comment: 'Node Label.',
    },
    {
      name: 'InfoTok_Tok',
      value: 'Tok: {0}',
      comment: 'Tok Label.',
    },
    {
      name: 'FormatSpan_Min_Lim',
      value: '({0},{1}) ',
      comment: 'Format String.',
    },
    {
      name: 'FormatErrorSeparator',
      value: ', ',
      comment: 'Format String.',
    },
    {
      name: 'AboutDate',
      value: 'Returns the number that represents the date in Power Apps date-time code.',
      comment: "Description of 'Date' function.",
    },
    {
      name: 'DateArg1',
      value: 'year',
      comment: 'function_parameter - First parameter for the Date function - the year.',
    },
    {
      name: 'DateArg2',
      value: 'month',
      comment: 'function_parameter - Second parameter for the Date function - the month.',
    },
    {
      name: 'DateArg3',
      value: 'day',
      comment: 'function_parameter - Third parameter for the Date function - the day.',
    },
    {
      name: 'AboutDate_year',
      value: 'The year.',
    },
    {
      name: 'AboutDate_month',
      value: 'The month.',
    },
    {
      name: 'AboutDate_day',
      value: 'The day.',
    },
    {
      name: 'AboutTime',
      value: 'Converts hours, minutes and seconds into a decimal number.',
      comment: "Description of 'Time' function.",
    },
    {
      name: 'TimeArg1',
      value: 'hour',
      comment: 'function_parameter - First parameter for the Time function - the hour.',
    },
    {
      name: 'TimeArg2',
      value: 'minute',
      comment: 'function_parameter - Second parameter for the Time function - the minute.',
    },
    {
      name: 'TimeArg3',
      value: 'second',
      comment: 'function_parameter - Third parameter for the Time function - the second.',
    },
    {
      name: 'TimeArg4',
      value: 'millisecond',
      comment: 'function_parameter - Fourth parameter for the Time function - the milliseconds.',
    },
    {
      name: 'AboutTime_hour',
      value: 'The hour component.',
    },
    {
      name: 'AboutTime_minute',
      value: 'The minute component.',
    },
    {
      name: 'AboutTime_second',
      value: 'The second component.',
    },
    {
      name: 'AboutTime_millisecond',
      value: 'The millisecond component.',
    },
    {
      name: 'AboutYear',
      value: 'Year returns the year of a given date, a number greater than 1900.',
      comment: "Description of 'Year' function.",
    },
    {
      name: 'YearArg1',
      value: 'date_time',
      comment:
        'function_parameter - First parameter for the Year function - the date to extract the year component. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutYear_date_time',
      value: 'A date value from which the year component will be extracted.',
    },
    {
      name: 'AboutMonth',
      value: 'Returns the month, a number from 1 (January) to 12 (December).',
      comment: "Description of 'Month' function.",
    },
    {
      name: 'MonthArg1',
      value: 'date_time',
      comment:
        'function_parameter - First parameter for the Month function - the date to extract the month component. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutMonth_date_time',
      value: 'The date value from which the month component will be extracted.',
    },
    {
      name: 'AboutDay',
      value: 'Day returns the day of the month, a number from 1 to 31.',
      comment: "Description of 'Day' function.",
    },
    {
      name: 'DayArg1',
      value: 'date_time',
      comment:
        'function_parameter - First parameter for the Day function - the date to extract the day component. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutDay_date_time',
      value: 'The date value from which the day component will be extracted.',
    },
    {
      name: 'AboutHour',
      value: 'Hour returns the hour as a number between 0 (12:00:00 AM) and 23 (11:00:00 PM).',
      comment: "Description of 'Hour' function.",
    },
    {
      name: 'HourArg1',
      value: 'date_time',
      comment:
        'function_parameter - First parameter for the Hour function - the date to extract the hour component. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutHour_date_time',
      value: 'The date or time value from which the component will be extracted.',
    },
    {
      name: 'AboutMinute',
      value: 'Returns the minute, a number from 0 to 59.',
      comment: "Description of 'Minute' function.",
    },
    {
      name: 'MinuteArg1',
      value: 'date_time',
      comment:
        'function_parameter - First parameter for the Minute function - the date to extract the minute component. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutMinute_date_time',
      value: 'The date or time value from which the minute component will be extracted.',
    },
    {
      name: 'AboutSecond',
      value: 'Returns the second, a number from 0 to 59.',
      comment: "Description of 'Second' function.",
    },
    {
      name: 'SecondArg1',
      value: 'date_time',
      comment:
        'function_parameter - First parameter for the Second function - the date to extract the second component. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutSecond_date_time',
      value: 'The date or time value from which the second component will be extracted.',
    },
    {
      name: 'AboutWeekday',
      value:
        'Returns the weekday of a datetime value. By default, the result ranges from 1 (Sunday) to 7 (Saturday). You can specify a different range with a StartOfWeek enumeration value or a Microsoft Excel Weekday function code.',
      comment: "Description of 'Weekday' function.",
    },
    {
      name: 'WeekdayArg1',
      value: 'date',
      comment:
        'function_parameter - First parameter for the Weekday function - a date value for which the day of the week will be calculated.',
    },
    {
      name: 'WeekdayArg2',
      value: 'start_of_week',
      comment:
        'function_parameter - Second (optional) parameter for the Weekday function - the weekday that is used to start the week. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutWeekday_date',
      value: 'A date value for which the day of the week will be calculated.',
    },
    {
      name: 'AboutWeekday_start_of_week',
      value:
        'A value from the StartOfWeek enumeration or a number from the corresponding Excel function to indicate how the days of the week should be numbered.',
      comment: '{Locked=StartOfWeek}',
    },
    {
      name: 'AboutCalendar__MonthsLong',
      value: 'Returns a single column table containing the full names of each month.',
      comment: "Description of 'WeekdaysLong' function.",
    },
    {
      name: 'AboutCalendar__MonthsShort',
      value: 'Returns a single column table containing the shorthand names of each month.',
      comment: "Description of 'WeekdaysLong' function.",
    },
    {
      name: 'AboutCalendar__WeekdaysLong',
      value: 'Returns a single column table containing the full names of each day of the week.',
      comment: "Description of 'WeekdaysLong' function.",
    },
    {
      name: 'AboutCalendar__WeekdaysShort',
      value: 'Returns a single column table containing the shorthand names of each day of the week.',
      comment: "Description of 'WeekdaysLong' function.",
    },
    {
      name: 'AboutClock__AmPm',
      value: 'Returns a single column table containing the uppercase designations for before and after noon.',
      comment: "Description of 'AmPm' function.",
    },
    {
      name: 'AboutClock__AmPmShort',
      value:
        'Returns a single column table containing the abbreviated uppercase designations for before and after noon.',
      comment: "Description of 'AmPmShort' function.",
    },
    {
      name: 'AboutClock__IsClock24',
      value: 'Returns a boolean value indicating whether or not the clock uses 24 hour time.',
      comment: "Description of 'IsClock24' function.",
    },
    {
      name: 'AboutDateValue',
      value: 'Converts a date in the form of text to a number that represents the date in Power Apps date-time code.',
      comment: "Description of 'DateValue' function.",
    },
    {
      name: 'DateValueArg1',
      value: 'date_text',
      comment:
        'function_parameter - First argument to the DateValue function - the text to be parsed as a date. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'DateValueArg2',
      value: 'language_code',
      comment:
        'function_parameter - Second argument to the DateValue function - the language code to be used when parsing the text as a date. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutDateValue_date_text',
      value: 'A text representation of a date/time stamp, in a platform-supported format.',
    },
    {
      name: 'AboutDateValue_language_code',
      value: 'Language code of the supplied text.',
    },
    {
      name: 'AboutTimeValue',
      value:
        'Converts a time in the form of text to a number that represents the date in Microsoft Power Apps date-time code, ignoring any date portion.',
      comment: "Description of 'TimeValue' function.",
    },
    {
      name: 'TimeValueArg1',
      value: 'time_text',
      comment:
        'function_parameter - First argument to the TimeValue function - the text to be parsed as a time. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'TimeValueArg2',
      value: 'language_code',
      comment:
        'function_parameter - Second argument to the TimeValue function - the language code to be used when parsing the text as a date. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutTimeValue_time_text',
      value: 'A text representation of a date/time stamp, in a platform supported format.',
    },
    {
      name: 'AboutTimeValue_language_code',
      value: 'Language code of the supplied text.',
    },
    {
      name: 'ErrAutoRefreshNotAllowed',
      value: 'Automatically refreshing service functions cannot be used in Action rules.',
      comment: 'Error message when trying to use auto-refresh functions in Action rules.',
    },
    {
      name: 'ErrMultipleValuesForField_Name',
      value: "A field named '{0}' was specified more than once in this record.",
      comment: 'Parse error on duplicate field definitions.',
    },
    {
      name: 'WarnColumnNameSpecifiedMultipleTimes_Name',
      value: "A column named '{0}' was specified more than once.",
      comment: 'Duplicate columns.',
    },
    {
      name: 'WarnLiteralPredicate',
      value: 'Warning: This predicate is a literal value and does not reference the input table.',
      comment: 'Warning given when a literal predicate is given to a function operating over a table.',
    },
    {
      name: 'WarnDynamicMetadata',
      value:
        'Warning: Select "Capture Schema" at the bottom of the expanded formula bar to set and refresh this method\'s result schema. Otherwise this method will return no result.',
      comment: 'Warning given when service function returns dynamic metadata.',
    },
    {
      name: 'FindArg1',
      value: 'find_text',
      comment:
        'function_parameter - First argument of the Find function - the text to search for. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'FindArg2',
      value: 'within_text',
      comment:
        'function_parameter - Second argument of the Find function - the text to be searched. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'FindArg3',
      value: 'start_num',
      comment:
        'function_parameter - Third argument of the Find function - the initial position in the text to be searched. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutFind_find_text',
      value: 'A text value to look for.',
    },
    {
      name: 'AboutFind_within_text',
      value: 'The text value to look in.',
    },
    {
      name: 'AboutFind_start_num',
      value: 'An optional starting position.',
    },
    {
      name: 'AboutFind',
      value: 'Returns the starting position of one text value within another text value. Find is case sensitive.',
      comment: "Description of 'Find' function",
    },
    {
      name: 'AboutFindT',
      value:
        'Returns a column of starting positions of one text value (or column of strings) within another text value (or column of strings). Find is case sensitive.',
      comment: "Description of 'Find' function",
    },
    {
      name: 'FindTArg1',
      value: 'find_text_or_column',
      comment:
        'function_parameter - First argument of the Find function - the text to search for. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'FindTArg2',
      value: 'within_text_or_column',
      comment:
        'function_parameter - Second argument of the Find function - the text to be searched. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'FindTArg3',
      value: 'start_num',
      comment:
        'function_parameter - Third argument of the Find function - the initial position in the text to be searched. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutFind_find_text_or_column',
      value: 'A text value (or column of text values) to look for.',
    },
    {
      name: 'AboutFind_within_text_or_column',
      value: 'The text value (or column of text values) to look in.',
    },
    {
      name: 'AboutColorValue',
      value: 'Returns the color corresponding to the given color string.',
      comment: "Description of 'ColorValue' function",
    },
    {
      name: 'ColorValueArg1',
      value: 'color_text',
      comment:
        'function_parameter - First argument of the ColorValue function - the text to be converted to a color value. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutColorValue_color_text',
      value: 'A color specified by name, such as "Blue", or using the standard 6-digit hex notation #rrggbb.',
    },
    {
      name: 'ErrInvalidJsonPointer',
      value: 'Invalid json pointer.',
      comment: 'Generic json pointer parsing error.',
    },
    {
      name: 'Text',
      value: 'Text',
    },
    {
      name: 'Logical',
      value: 'Logical',
    },
    {
      name: 'Table',
      value: 'Table',
    },
    {
      name: 'Behavior',
      value: 'Behavior',
    },
    {
      name: 'DateTime',
      value: 'Date & Time',
    },
    {
      name: 'MathAndStat',
      value: 'Math & Statistical',
    },
    {
      name: 'Information',
      value: 'Information',
    },
    {
      name: 'Color',
      value: 'Color',
    },
    {
      name: 'REST',
      value: 'Services',
      comment: 'REST is an acronym for REpresentational State Transfer, a category of web services.',
    },
    {
      name: 'FunctionReference_Link',
      value: 'https://go.microsoft.com/fwlink/?LinkId=722347#',
      comment: '{StringContains=LCID}',
    },
    {
      name: 'InvalidXml_ElementMissingAttribute_ElemName_AttrName',
      value: "The element '{0}' is missing attribute '{1}'.",
      comment: 'Invalid xml error message.',
    },
    {
      name: 'InvalidXml_AttributeCannotBeEmpty_AttrName',
      value: "The attribute '{0}' cannot be an empty string.",
      comment: 'Invalid xml error message.',
    },
    {
      name: 'InvalidXml_AttributeValueInvalidGuid_AttrName_Value',
      value: "The attribute '{0}' has an invalid GUID value '{1}'.",
      comment: 'Invalid xml error message.',
    },
    {
      name: 'InvalidJson_MissingRequiredNamedValue_PropName',
      value: "The property '{0}' is missing.",
      comment: 'Invalid Json value error message.',
    },
    {
      name: 'InvalidJson_NamedValueTypeNotCorrect_PropName_ExpectedType_ActualType',
      value: "The property '{0}' has an invalid type value: {2}. Expected type value: {1}.",
      comment: 'Invalid Json value error message.',
    },
    {
      name: 'InvalidJson_NamedValueCannotBeEmpty_PropName',
      value: "The property '{0}' cannot be empty.",
      comment: 'Invalid Json value error message.',
    },
    {
      name: 'InvalidJson_NamedEnumStringInvalid_PropName_ActualValue',
      value: "The enum '{0}' is expected to have a valid value but its value {1} is out of range for the enum.",
      comment:
        "Invalid Json enum value error message indicating property does not support value. (ex: property 'dayOfWeek' with invalid value 'Mondayday')",
    },
    {
      name: 'InvalidJson_NamedIntegerOverflow_PropName_ActualValue',
      value: "The property '{0}' is expected to have an integer value but its value {1} is out of range.",
      comment: 'Invalid Json integer value error message.',
    },
    {
      name: 'InvalidJson_IndexedValueTypeNotCorrect_Index_ExpectedType_ActualType',
      value: 'The item at index {0} has an invalid type value: {2}. Expected type value: {1}.',
    },
    {
      name: 'InvalidJson_IndexedValueMustBeNonEmpty_Index',
      value: 'The item at index {0} must be a non-empty string.',
    },
    {
      name: 'AboutDateAdd',
      value: 'Add the specified number of units to a date.',
      comment: "Description of 'DateAdd' function.",
    },
    {
      name: 'AboutDateDiff',
      value: 'Calculate the difference between two dates.',
      comment: "Description of 'DateDiff' function",
    },
    {
      name: 'DateAddArg1',
      value: 'date',
      comment: 'function_parameter - First argument of the DateAdd function - the original date.',
    },
    {
      name: 'DateAddArg2',
      value: 'number_of_units',
      comment:
        'function_parameter - Second argument of the DateAdd function - the number of units (days, months, etc.) to be added. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'DateAddArg3',
      value: 'unit',
      comment:
        'function_parameter - Third argument of the DateAdd function - the type of unit (days, months, etc.) to be added.',
    },
    {
      name: 'AboutDateAdd_date',
      value: 'A reference date value.',
    },
    {
      name: 'AboutDateAdd_number_of_units',
      value: 'A number of units to add. The number can be negative.',
    },
    {
      name: 'AboutDateAdd_unit',
      value:
        'The unit to use, which can be one of Years, Quarters, Months, Days, Hours, Minutes, Seconds, Milliseconds.',
      comment:
        '{Locked=Years}{Locked=Quarters}{Locked=Months}{Locked=Days}{Locked=Hours}{Locked=Minutes}{Locked=Seconds}{Locked=Milliseconds}',
    },
    {
      name: 'DateDiffArg1',
      value: 'start_date',
      comment:
        'function_parameter - First argument of the DateDiff function - the start date. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'DateDiffArg2',
      value: 'end_date',
      comment:
        'function_parameter - Second argument of the DateDiff function - the end date. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'DateDiffArg3',
      value: 'unit',
      comment:
        'function_parameter - Third argument of the DateDiff function - the type of unit (days, months, etc.) to return the date difference.',
    },
    {
      name: 'AboutDateDiff_start_date',
      value: 'A start date for the difference operation.',
    },
    {
      name: 'AboutDateDiff_end_date',
      value: 'An end date for the different operation.',
    },
    {
      name: 'AboutDateDiff_unit',
      value:
        'The unit to express the result in, which can be one of Years, Quarters, Months, Days, Hours, Minutes, Seconds, Milliseconds.',
      comment:
        '{Locked=Years}{Locked=Quarters}{Locked=Months}{Locked=Days}{Locked=Hours}{Locked=Minutes}{Locked=Seconds}{Locked=Milliseconds}',
    },
    {
      name: 'AboutDateAddT',
      value: 'Add the specified number of units to a column of dates.',
      comment: "Description of 'DateAdd' table function.",
    },
    {
      name: 'AboutDateDiffT',
      value: 'Calculate the difference between two columns of dates.',
      comment: "Description of 'DateDiff' table function",
    },
    {
      name: 'DateAddTArg1',
      value: 'date_column',
      comment:
        'function_parameter - First argument of the DateAdd function - the table column that contains date values. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'DateAddTArg2',
      value: 'number_of_units',
      comment:
        'function_parameter - Second argument of the DateAdd function - the number of units (days, months, etc.) to be added. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'DateAddTArg3',
      value: 'unit',
      comment:
        'function_parameter - Third argument of the DateAdd function - the type of unit (days, months, etc.) to be added.',
    },
    {
      name: 'AboutDateAdd_date_column',
      value: 'A column of date values.',
    },
    {
      name: 'DateDiffTArg1',
      value: 'start_date_column',
      comment:
        'function_parameter - First argument of the DateDiff function - the table column that contains the start dates. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'DateDiffTArg2',
      value: 'end_date_column',
      comment:
        'function_parameter - Second argument of the DateDiff function - the table column that contains the end dates. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'DateDiffTArg3',
      value: 'unit',
      comment:
        'function_parameter - Third argument of the DateDiff function - the type of unit (days, months, etc.) to return the date difference.',
    },
    {
      name: 'AboutDateDiff_start_date_column',
      value: 'A column of start dates for the difference operation.',
    },
    {
      name: 'AboutDateDiff_end_date_column',
      value: 'A column of end dates for the difference operation..',
    },
    {
      name: 'AboutChar',
      value: 'Returns the character specified by the code number from the character set on your platform.',
      comment: "Description of 'Char' function.",
    },
    {
      name: 'CharArg1',
      value: 'number',
      comment:
        'function_parameter - First argument of the Char function - the number from the character set in your platform to be converted to a character.',
    },
    {
      name: 'AboutChar_number',
      value: 'A code number from the character set on your platform.',
    },
    {
      name: 'AboutCharT',
      value: 'Returns a table of characters specified by the code numbers from the character set on your platform.',
      comment: "Description of 'Char' function (table overload).",
    },
    {
      name: 'CharTArg1',
      value: 'column_of_numbers',
      comment:
        'function_parameter - First argument of the Char function - a table column of code numbers from the character set in your platform to be converted to characters. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutChar_column_of_numbers',
      value: 'A column of code numbers from the character set on your platform.',
    },
    {
      name: 'FormMode_Edit_Name',
      value: 'Edit',
      comment: '{Locked} Enum value',
    },
    {
      name: 'FormMode_View_Name',
      value: 'View',
      comment: '{Locked} Enum value',
    },
    {
      name: 'FormMode_New_Name',
      value: 'New',
      comment: '{Locked} Enum value',
    },
    {
      name: 'SelectedState_Edit_Name',
      value: 'Edit',
      comment: '{Locked} Enum value',
    },
    {
      name: 'SelectedState_View_Name',
      value: 'View',
      comment: '{Locked} Enum value',
    },
    {
      name: 'SelectedState_New_Name',
      value: 'New',
      comment: '{Locked} Enum value',
    },
    {
      name: 'NotificationType_Error_Name',
      value: 'Error',
      comment: '{Locked} Enum value',
    },
    {
      name: 'NotificationType_Warning_Name',
      value: 'Warning',
      comment: '{Locked} Enum value',
    },
    {
      name: 'NotificationType_Success_Name',
      value: 'Success',
      comment: '{Locked} Enum value',
    },
    {
      name: 'NotificationType_Information_Name',
      value: 'Information',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LocaleSpecificEnum_SortOrder',
      value: 'SortOrder',
      comment: '{Locked} Enum name',
    },
    {
      name: 'ListItemTemplate_Single_Name',
      value: 'Single',
      comment: '{Locked} List item single line template enum name.',
    },
    {
      name: 'ListItemTemplate_Double_Name',
      value: 'Double',
      comment: '{Locked} List item double line template enum name.',
    },
    {
      name: 'ListItemTemplate_Person_Name',
      value: 'Person',
      comment: '{Locked} List item person (image with details) template enum name.',
    },
    {
      name: 'Screen_Name_DisplayName',
      value: 'Name',
      comment: 'Display text for the Name property of the screen',
    },
    {
      name: 'Screen_Printing_DisplayName',
      value: 'Printing',
      comment: 'Display text for the Printing property of the screen',
    },
    {
      name: 'Screen_ImagePosition_DisplayName',
      value: 'Image position',
      comment: 'Display text for position of background image on the screen.',
    },
    {
      name: 'Screen_Size_DisplayName',
      value: 'Size',
      comment: 'Display text for the property to fetch the current size of the screen.',
    },
    {
      name: 'barcode_Type_DisplayName',
      value: 'Barcode type',
      comment: 'Display text for Barcode Type',
    },
    {
      name: 'BarcodeType_Auto_Name',
      value: 'Auto',
      comment: '{Locked} Locale-specific name for this enum value.',
    },
    {
      name: 'BarcodeType_Aztec_Name',
      value: 'Aztec',
      comment: '{Locked} Locale-specific name for this enum value.',
    },
    {
      name: 'BarcodeType_Codabar_Name',
      value: 'Codabar',
      comment: '{Locked} Locale-specific name for this enum value.',
    },
    {
      name: 'BarcodeType_DataMatrix_Name',
      value: 'DataMatrix',
      comment: '{Locked} Locale-specific name for this enum value.',
    },
    {
      name: 'BarcodeType_Ean_Name',
      value: 'Ean',
      comment: '{Locked} Locale-specific name for this enum value.',
    },
    {
      name: 'BarcodeType_QRCode_Name',
      value: 'QRCode',
      comment: '{Locked} Locale-specific name for this enum value.',
    },
    {
      name: 'BarcodeType_RssExpanded_Name',
      value: 'RssExpanded',
      comment: '{Locked} Locale-specific name for this enum value.',
    },
    {
      name: 'BarcodeType_Upc_Name',
      value: 'Upc',
      comment: '{Locked} Locale-specific name for this enum value.',
    },
    {
      name: 'camera_Contrast_DisplayName',
      value: 'Contrast',
      comment: 'Display text for Contrast',
    },
    {
      name: 'camera_Zoom_DisplayName',
      value: 'Zoom',
      comment: 'Display text for Zoom',
    },
    {
      name: 'camera_Camera_DisplayName',
      value: 'Camera',
      comment: 'Display text for Camera',
    },
    {
      name: 'export_Data_DisplayName',
      value: 'Data',
      comment: 'Display text for Data',
    },
    {
      name: 'Edit',
      value: 'Edit',
      comment: 'Value of label',
    },
    {
      name: 'Dust',
      value: 'Dust',
      comment: 'Value of checkbox',
    },
    {
      name: 'image_Image_DisplayName',
      value: 'Image',
      comment: 'Display text for Image',
    },
    {
      name: 'icon_Icon_DisplayName',
      value: 'Icon',
      comment: 'Display text for Icon',
    },
    {
      name: 'icon_Rotation_DisplayName',
      value: 'Rotation',
      comment: 'Display text for Rotation',
    },
    {
      name: 'image_ImagePosition_DisplayName',
      value: 'Image position',
      comment: 'Display text for ImagePosition',
    },
    {
      name: 'image_ImageRotation_DisplayName',
      value: 'Rotate',
      comment:
        'Display text for Image Rotation. An enumeration describing what degree of rotation should be applied to the image of this control.',
    },
    {
      name: 'ImageRotation_None_Name',
      value: 'None',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ImageRotation_None_DisplayName',
      value: 'None',
      comment:
        'Display text representing the None (do not rotate) value of ImageRotation enum (ImageRotation_None_Name). The possible values for this enumeration are: None, Rotate90, Rotate180, Rotate270.',
    },
    {
      name: 'label_Live_DisplayName',
      value: 'Live',
      comment:
        'Display text for Live. Live as in live announcement. Equivalent to HTML attribute "aria-live", which determines how text changes should be announced by screen readers.',
    },
    {
      name: 'label_Overflow_DisplayName',
      value: 'Overflow',
      comment: 'Display text for Overflow',
    },
    {
      name: 'DatePicker_DateTimeZone_DisplayName',
      value: 'Date time zone',
      comment: 'The kind of date (local / UTC) that the picker will use',
    },
    {
      name: 'DatePicker_Format_DisplayName',
      value: 'Format',
      comment: 'Display text for the Format property of DatePicker control.',
    },
    {
      name: 'DatePicker_Language_DisplayName',
      value: 'Language',
      comment: 'Display text for the Language property of DatePicker control.',
    },
    {
      name: 'Calendar_Width_DisplayName',
      value: 'Calendar width',
      comment: 'Display name for the Width of the calendar',
    },
    {
      name: 'Hide_Calendar_DisplayName',
      value: 'Hide calendar',
      comment: 'Display name for hiding the calendar',
    },
    {
      name: 'Calendar_StartOfWeek_DisplayName',
      value: 'Start of week',
      comment: 'The property that specifies which weekday is the first day of a week',
    },
    {
      name: 'microphone_Mic_DisplayName',
      value: 'Mic',
      comment: 'Display text for Mic',
    },
    {
      name: 'text_Default_DisplayName',
      value: 'Default',
      comment: 'Display text for Default',
    },
    {
      name: 'text_Mode_DisplayName',
      value: 'Mode',
      comment: 'Display text for Mode',
    },
    {
      name: 'text_Format_DisplayName',
      value: 'Format',
      comment: 'Display text for Format',
    },
    {
      name: 'text_VirtualKeyboardMode_DisplayName',
      value: 'Virtual keyboard mode',
      comment: 'Text input property for which type of virtual keyboard will be used for the text input control',
    },
    {
      name: 'text_TeamsTheme_DisplayName',
      value: 'Teams theme',
      comment: 'Text input property for which Teams theme will be used',
    },
    {
      name: 'text_Clear_DisplayName',
      value: 'Clear button',
      comment: 'Display text for Clear',
    },
    {
      name: 'SortOrder_Ascending_Name',
      value: 'Ascending',
      comment: '{Locked} Enum value',
    },
    {
      name: 'SortOrder_Descending_Name',
      value: 'Descending',
      comment: '{Locked} Enum value',
    },
    {
      name: 'BorderStyle_None_Name',
      value: 'None',
      comment: '{Locked} Enum value',
    },
    {
      name: 'BorderStyle_Dashed_Name',
      value: 'Dashed',
      comment: '{Locked} Enum value',
    },
    {
      name: 'BorderStyle_Solid_Name',
      value: 'Solid',
      comment: '{Locked} Enum value',
    },
    {
      name: 'BorderStyle_Dotted_Name',
      value: 'Dotted',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Direction_Start_Name',
      value: 'Start',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Direction_End_Name',
      value: 'End',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DisplayMode_Disabled_Name',
      value: 'Disabled',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DisplayMode_Edit_Name',
      value: 'Edit',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DisplayMode_View_Name',
      value: 'View',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LayoutMode_Manual_Name',
      value: 'Manual',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LayoutMode_Auto_Name',
      value: 'Auto',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LayoutDirection_Horizontal_Name',
      value: 'Horizontal',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LayoutDirection_Vertical_Name',
      value: 'Vertical',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LayoutAlignItems_Start_Name',
      value: 'Start',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LayoutAlignItems_Center_Name',
      value: 'Center',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LayoutAlignItems_End_Name',
      value: 'End',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LayoutAlignItems_Stretch_Name',
      value: 'Stretch',
      comment: '{Locked} Enum value',
    },
    {
      name: 'AlignInContainer_Start_Name',
      value: 'Start',
      comment: '{Locked} Enum value',
    },
    {
      name: 'AlignInContainer_Center_Name',
      value: 'Center',
      comment: '{Locked} Enum value',
    },
    {
      name: 'AlignInContainer_End_Name',
      value: 'End',
      comment: '{Locked} Enum value',
    },
    {
      name: 'AlignInContainer_Stretch_Name',
      value: 'Stretch',
      comment: '{Locked} Enum value',
    },
    {
      name: 'AlignInContainer_SetByContainer_Name',
      value: 'SetByContainer',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LayoutJustifyContent_Start_Name',
      value: 'Start',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LayoutJustifyContent_Center_Name',
      value: 'Center',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LayoutJustifyContent_End_Name',
      value: 'End',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LayoutJustifyContent_SpaceEvenly_Name',
      value: 'SpaceEvenly',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LayoutJustifyContent_SpaceAround_Name',
      value: 'SpaceAround',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LayoutJustifyContent_SpaceBetween_Name',
      value: 'SpaceBetween',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LayoutOverflow_Hide_Name',
      value: 'Hide',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LayoutOverflow_Scroll_Name',
      value: 'Scroll',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Font_Arial_Name',
      value: 'Arial',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Font_Georgia_Name',
      value: 'Georgia',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Font_Lato_Name',
      value: 'Lato',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Font_Verdana_Name',
      value: 'Verdana',
      comment: '{Locked} Enum value',
    },
    {
      name: 'FontWeight_Normal_Name',
      value: 'Normal',
      comment: '{Locked} Enum value',
    },
    {
      name: 'FontWeight_Semibold_Name',
      value: 'Semibold',
      comment: '{Locked} Enum value',
    },
    {
      name: 'FontWeight_Bold_Name',
      value: 'Bold',
      comment: '{Locked} Enum value',
    },
    {
      name: 'FontWeight_Lighter_Name',
      value: 'Lighter',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ImagePosition_Fill_Name',
      value: 'Fill',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ImagePosition_Fit_Name',
      value: 'Fit',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ImagePosition_Stretch_Name',
      value: 'Stretch',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ImagePosition_Tile_Name',
      value: 'Tile',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ImagePosition_Center_Name',
      value: 'Center',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Layout_Horizontal_Name',
      value: 'Horizontal',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Layout_Vertical_Name',
      value: 'Vertical',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TextMode_SingleLine_Name',
      value: 'SingleLine',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TextMode_Password_Name',
      value: 'Password',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TextMode_MultiLine_Name',
      value: 'MultiLine',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TextFormat_Text_Name',
      value: 'Text',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TextFormat_Number_Name',
      value: 'Number',
      comment: '{Locked} Enum value',
    },
    {
      name: 'VirtualKeyboardMode_Auto_Name',
      value: 'Auto',
      comment: '{Locked} Enum value',
    },
    {
      name: 'VirtualKeyboardMode_Numeric_Name',
      value: 'Numeric',
      comment: '{Locked} Enum value',
    },
    {
      name: 'VirtualKeyboardMode_Text_Name',
      value: 'Text',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TeamsTheme_Default_Name',
      value: 'Default',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TeamsTheme_Dark_Name',
      value: 'Dark',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TeamsTheme_Contrast_Name',
      value: 'Contrast',
      comment: '{Locked} Enum value',
    },
    {
      name: 'PenMode_Draw_Name',
      value: 'Draw',
      comment: '{Locked} Enum value',
    },
    {
      name: 'PenMode_Erase_Name',
      value: 'Erase',
      comment: '{Locked} Enum value',
    },
    {
      name: 'PenMode_Select_Name',
      value: 'Select',
      comment: '{Locked} Enum value',
    },
    {
      name: 'RemoveFlags_First_Name',
      value: 'First',
      comment: '{Locked} Enum value',
    },
    {
      name: 'RemoveFlags_All_Name',
      value: 'All',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ScreenTransition_Fade_Name',
      value: 'Fade',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ScreenTransition_Cover_Name',
      value: 'Cover',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ScreenTransition_UnCover_Name',
      value: 'UnCover',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ScreenTransition_CoverRight_Name',
      value: 'CoverRight',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ScreenTransition_UnCoverRight_Name',
      value: 'UnCoverRight',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ScreenTransition_None_Name',
      value: 'None',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Align_Left_Name',
      value: 'Left',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Align_Right_Name',
      value: 'Right',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Align_Center_Name',
      value: 'Center',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Align_Justify_Name',
      value: 'Justify',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Align_Left_DisplayName',
      value: 'Align left',
      comment: 'Represents a left alignment of text',
    },
    {
      name: 'Align_Right_DisplayName',
      value: 'Align right',
      comment: 'Represents a right alignment of text',
    },
    {
      name: 'Align_Center_DisplayName',
      value: 'Align center',
      comment: 'Represents a centered alignment of text',
    },
    {
      name: 'Align_Justify_DisplayName',
      value: 'Justify',
      comment: 'Represents a justified alignment of text',
    },
    {
      name: 'VerticalAlign_Top_Name',
      value: 'Top',
      comment: '{Locked} Enum value',
    },
    {
      name: 'VerticalAlign_Middle_Name',
      value: 'Middle',
      comment: '{Locked} Enum value',
    },
    {
      name: 'VerticalAlign_Bottom_Name',
      value: 'Bottom',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Transition_Push_Name',
      value: 'Push',
      comment:
        "{Locked} Enum value - when used in a gallery, the items will have a 'pushed down' effect when moused over.",
    },
    {
      name: 'Transition_Pop_Name',
      value: 'Pop',
      comment:
        "{Locked} Enum value - when used in a gallery, the items will have a 'popped up' effect when moused over.",
    },
    {
      name: 'Transition_None_Name',
      value: 'None',
      comment: '{Locked} Enum value - when used in a gallery, the items will have no effect when moused over.',
    },
    {
      name: 'TimeUnit_Years_Name',
      value: 'Years',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TimeUnit_Quarters_Name',
      value: 'Quarters',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TimeUnit_Months_Name',
      value: 'Months',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TimeUnit_Days_Name',
      value: 'Days',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TimeUnit_Hours_Name',
      value: 'Hours',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TimeUnit_Minutes_Name',
      value: 'Minutes',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TimeUnit_Seconds_Name',
      value: 'Seconds',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TimeUnit_Milliseconds_Name',
      value: 'Milliseconds',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Color_Black_Name',
      value: 'Black',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Color_Red_Name',
      value: 'Red',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Color_Tan_Name',
      value: 'Tan',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Themes_Vivid_Name',
      value: 'Vivid',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Themes_Eco_Name',
      value: 'Eco',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Themes_Harvest_Name',
      value: 'Harvest',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Themes_Dust_Name',
      value: 'Dust',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Themes_Awakening_Name',
      value: 'Awakening',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Overflow_Hidden_Name',
      value: 'Hidden',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Overflow_Scroll_Name',
      value: 'Scroll',
      comment: '{Locked} Enum value',
    },
    {
      name: 'MapStyle_Aerial_Name',
      value: 'Aerial',
      comment: '{Locked} Enum value',
    },
    {
      name: 'MapStyle_Auto_Name',
      value: 'Auto',
      comment: '{Locked} Enum value',
    },
    {
      name: 'MapStyle_Road_Name',
      value: 'Road',
      comment: '{Locked} Enum value',
    },
    {
      name: 'GridStyle_XOnly_Name',
      value: 'XOnly',
      comment: '{Locked} Enum value',
    },
    {
      name: 'GridStyle_YOnly_Name',
      value: 'YOnly',
      comment: '{Locked} Enum value',
    },
    {
      name: 'GridStyle_All_Name',
      value: 'All',
      comment: '{Locked} Enum value',
    },
    {
      name: 'GridStyle_None_Name',
      value: 'None',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LabelPosition_Inside_Name',
      value: 'Inside',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LabelPosition_Outside_Name',
      value: 'Outside',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TextPosition_Left_Name',
      value: 'Left',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TextPosition_Right_Name',
      value: 'Right',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DataSourceInfo_DisplayName_Name',
      value: 'DisplayName',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DataSourceInfo_Required_Name',
      value: 'Required',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DataSourceInfo_MaxLength_Name',
      value: 'MaxLength',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DataSourceInfo_MinLength_Name',
      value: 'MinLength',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DataSourceInfo_MaxValue_Name',
      value: 'MaxValue',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DataSourceInfo_MinValue_Name',
      value: 'MinValue',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DataSourceInfo_AllowedValues_Name',
      value: 'AllowedValues',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DataSourceInfo_EditPermission_Name',
      value: 'EditPermission',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DataSourceInfo_ReadPermission_Name',
      value: 'ReadPermission',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DataSourceInfo_CreatePermission_Name',
      value: 'CreatePermission',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DataSourceInfo_DeletePermission_Name',
      value: 'DeletePermission',
      comment: '{Locked} Enum value',
    },
    {
      name: 'RecordInfo_EditPermission_Name',
      value: 'EditPermission',
      comment: '{Locked} Enum value',
    },
    {
      name: 'RecordInfo_ReadPermission_Name',
      value: 'ReadPermission',
      comment: '{Locked} Enum value',
    },
    {
      name: 'RecordInfo_DeletePermission_Name',
      value: 'DeletePermission',
      comment: '{Locked} Enum value',
    },
    {
      name: 'State_NoChange_Name',
      value: 'NoChange',
      comment: '{Locked} Enum value',
    },
    {
      name: 'State_Added_Name',
      value: 'Added',
      comment: '{Locked} Enum value',
    },
    {
      name: 'State_Updated_Name',
      value: 'Updated',
      comment: '{Locked} Enum value',
    },
    {
      name: 'State_Deleted_Name',
      value: 'Deleted',
      comment: '{Locked} Enum value',
    },
    {
      name: 'State_All_Name',
      value: 'All',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorState_DataSourceError_Name',
      value: 'DataSourceError',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorState_NoError_Name',
      value: 'NoError',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorState_All_Name',
      value: 'All',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorSeverity_NoError_Name',
      value: 'NoError',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorSeverity_Warning_Name',
      value: 'Warning',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorSeverity_Moderate_Name',
      value: 'Moderate',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorSeverity_Severe_Name',
      value: 'Severe',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_Email_Name',
      value: 'Email',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_Any_Name',
      value: 'Any',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_Letter_Name',
      value: 'Letter',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_MultipleLetters_Name',
      value: 'MultipleLetters',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_OptionalLetters_Name',
      value: 'OptionalLetters',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_Digit_Name',
      value: 'Digit',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_MultipleDigits_Name',
      value: 'MultipleDigits',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_OptionalDigits_Name',
      value: 'OptionalDigits',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_Hyphen_Name',
      value: 'Hyphen',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_Period_Name',
      value: 'Period',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_Comma_Name',
      value: 'Comma',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_LeftParen_Name',
      value: 'LeftParen',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_RightParen_Name',
      value: 'RightParen',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_Space_Name',
      value: 'Space',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_MultipleSpaces_Name',
      value: 'MultipleSpaces',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_OptionalSpaces_Name',
      value: 'OptionalSpaces',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_NonSpace_Name',
      value: 'NonSpace',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_MultipleNonSpaces_Name',
      value: 'MultipleNonSpaces',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Match_OptionalNonSpaces_Name',
      value: 'OptionalNonSpaces',
      comment: '{Locked} Enum value',
    },
    {
      name: 'MatchOptions_BeginsWith_Name',
      value: 'BeginsWith',
      comment: '{Locked} Enum value',
    },
    {
      name: 'MatchOptions_EndsWith_Name',
      value: 'EndsWith',
      comment: '{Locked} Enum value',
    },
    {
      name: 'MatchOptions_Contains_Name',
      value: 'Contains',
      comment: '{Locked} Enum value',
    },
    {
      name: 'MatchOptions_Complete_Name',
      value: 'Complete',
      comment: '{Locked} Enum value',
    },
    {
      name: 'MatchOptions_IgnoreCase_Name',
      value: 'IgnoreCase',
      comment: '{Locked} Enum value',
    },
    {
      name: 'MatchOptions_Multiline_Name',
      value: 'Multiline',
      comment: '{Locked} Enum value',
    },
    {
      name: 'JSONFormat_Compact_Name',
      value: 'Compact',
      comment: '{Locked} Enum value',
    },
    {
      name: 'JSONFormat_IndentFour_Name',
      value: 'IndentFour',
      comment: '{Locked} Enum value',
    },
    {
      name: 'JSONFormat_IncludeBinaryData_Name',
      value: 'IncludeBinaryData',
      comment: '{Locked} Enum value',
    },
    {
      name: 'JSONFormat_IgnoreBinaryData_Name',
      value: 'IgnoreBinaryData',
      comment: '{Locked} Enum value',
    },
    {
      name: 'JSONFormat_IgnoreUnsupportedTypes_Name',
      value: 'IgnoreUnsupportedTypes',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TraceOptions_IgnoreUnsupportedTypes_Name',
      value: 'IgnoreUnsupportedTypes',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TraceOptions_None_Name',
      value: 'None',
      comment: '{Locked} Enum value',
    },
    {
      name: 'AboutIsNumeric',
      value: 'Checks whether a value is a number, and returns true or false.',
      comment: "Description of 'IsNumeric' function.",
    },
    {
      name: 'IsNumericArg1',
      value: 'value',
      comment: 'function_parameter - First argument to the IsNumeric function - a value that will be tested',
    },
    {
      name: 'AboutIsNumeric_value',
      value: 'The value to test.',
    },
    {
      name: 'ErrorKind_None_Name',
      value: 'None',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_Sync_Name',
      value: 'Sync',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_MissingRequired_Name',
      value: 'MissingRequired',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_CreatePermission_Name',
      value: 'CreatePermission',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_EditPermission_Name',
      value: 'EditPermissions',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_DeletePermission_Name',
      value: 'DeletePermissions',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_Conflict_Name',
      value: 'Conflict',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_NotFound_Name',
      value: 'NotFound',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_ConstraintViolated_Name',
      value: 'ConstraintViolated',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_GeneratedValue_Name',
      value: 'GeneratedValue',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_ReadOnlyValue_Name',
      value: 'ReadOnlyValue',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_Validation_Name',
      value: 'Validation',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_Unknown_Name',
      value: 'Unknown',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_BadLanguageCode_Name',
      value: 'BadLanguageCode',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_BadRegex_Name',
      value: 'BadRegex',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_InvalidFunctionUsage_Name',
      value: 'InvalidFunctionUsage',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_FileNotFound_Name',
      value: 'FileNotFound',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_AnalysisError_Name',
      value: 'AnalysisError',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_ReadPermission_Name',
      value: 'ReadPermission',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_NotSupported_Name',
      value: 'NotSupported',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_InsufficientMemory_Name',
      value: 'InsufficientMemory',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_QuotaExceeded_Name',
      value: 'QuotaExceeded',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_Network_Name',
      value: 'Network',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_Numeric_Name',
      value: 'Numeric',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ErrorKind_InvalidArgument_Name',
      value: 'InvalidArgument',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Post',
      value: 'Post',
      comment: 'Button text to post comment',
    },
    {
      name: 'DateTimeFormat_LongDateTime_Name',
      value: 'LongDateTime',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DateTimeFormat_LongDate_Name',
      value: 'LongDate',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DateTimeFormat_LongTime_Name',
      value: 'LongTime',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DateTimeFormat_ShortDateTime_Name',
      value: 'ShortDateTime',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DateTimeFormat_ShortDate_Name',
      value: 'ShortDate',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DateTimeFormat_ShortTime_Name',
      value: 'ShortTime',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DateTimeFormat_UTC_Name',
      value: 'UTC',
      comment: '{Locked} Enum value',
    },
    {
      name: 'StartOfWeek_Sunday_Name',
      value: 'Sunday',
      comment: '{Locked} Enum value',
    },
    {
      name: 'StartOfWeek_Monday_Name',
      value: 'Monday',
      comment: '{Locked} Enum value',
    },
    {
      name: 'StartOfWeek_MondayZero_Name',
      value: 'MondayZero',
      comment: '{Locked} Enum value',
    },
    {
      name: 'StartOfWeek_Tuesday_Name',
      value: 'Tuesday',
      comment: '{Locked} Enum value',
    },
    {
      name: 'StartOfWeek_Wednesday_Name',
      value: 'Wednesday',
      comment: '{Locked} Enum value',
    },
    {
      name: 'StartOfWeek_Thursday_Name',
      value: 'Thursday',
      comment: '{Locked} Enum value',
    },
    {
      name: 'StartOfWeek_Friday_Name',
      value: 'Friday',
      comment: '{Locked} Enum value',
    },
    {
      name: 'StartOfWeek_Saturday_Name',
      value: 'Saturday',
      comment: '{Locked} Enum value',
    },
    {
      name: 'SupportedDateTimeLanguageCodes',
      value:
        '"bg-BG","ca-ES","cs-CZ","da","da-DK","de","de-DE","el-GR","en","en-GB","en-US","es","es-ES","es-MX","et-EE","eu-ES","fi-FI","fr","fr-FR","gl-ES","hi-IN","hr-HR","hu-HU","id-ID","it","it-IT","ja","ja-JP","kk-KZ","ko","ko-KO","lt-LT","lv-LV","ms-MY","nb-NO","nl","nl-NL","pl","pl-PL","pt","pt-BR","pt-PT","ro-RO","ru","ru-RU","sk-SK","sl-SL","sr-cyrl-RS","sr-latn-RS","sv","sv-SE","th-TH","tr-TR","uk-UA","vi-VN","zh-CN","zh-TW"',
      comment: '{Locked}Supported DateTime language codes.',
    },
    {
      name: 'AboutDateTimeValue',
      value:
        'Converts a date and time in the form of text to a number that represents the date in Power Apps date-time code.',
      comment: "Description of 'DateTimeValue' function.",
    },
    {
      name: 'DateTimeValueArg1',
      value: 'time_text',
      comment:
        'function_parameter - First argument of the DateTimeValue function - the text to be parsed. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'DateTimeValueArg2',
      value: 'language_code',
      comment:
        'function_parameter - Second argument of the DateTimeValue function - the language code in which the text to be parsed is defined. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutDateTimeValue_time_text',
      value: 'A text representation of a date/time stamp, in a platform supported format.',
    },
    {
      name: 'AboutDateTimeValue_language_code',
      value: 'Language code of the supplied text.',
    },
    {
      name: 'AboutTable',
      value:
        'Creates a table from the specified records, with as many columns as there are unique record fields. For example: Table({key1: val1, key2: val2, ...}, ...)',
      comment: "Description of 'Table' function.",
    },
    {
      name: 'TableArg1',
      value: 'record',
      comment:
        'function_parameter - Argument of the Table function - a record that will become a row in the resulting table.',
    },
    {
      name: 'AboutTable_record',
      value: 'A record that will become a row in the resulting table.',
    },
    {
      name: 'AboutShowColumns',
      value: "Returns a table with all columns removed from the 'source' table except the specified columns.",
      comment: 'Description of ShowColumns function.',
    },
    {
      name: 'ShowColumnsArg1',
      value: 'source',
      comment:
        'function_parameter - First argument of the ShowColumns function - the data source from which columns will be selected.',
    },
    {
      name: 'ShowColumnsArg2',
      value: 'column_name',
      comment:
        'function_parameter - Second argument of the ShowColumns function - the name of the column to be selected. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'AboutShowColumns_source',
      value: 'A table value to remove columns from.',
    },
    {
      name: 'AboutShowColumns_column_name',
      value: 'The name of a column to keep.',
    },
    {
      name: 'AboutIsToday',
      value: 'Checks whether the given date is today, and returns true or false.',
      comment: "Description of 'IsToday' function",
    },
    {
      name: 'AboutIsToday_date',
      value: 'The date value to test.',
    },
    {
      name: 'IsTodayFuncArg1',
      value: 'date',
      comment: 'function_parameter - First argument to the IsToday function - the date to be tested.',
    },
    {
      name: 'AboutIsUTCToday',
      value: 'Checks whether the given date is today in UTC, and returns true or false.',
      comment: "Description of 'IsUTCToday' function",
    },
    {
      name: 'AboutIsUTCToday_date',
      value: 'The date value to test.',
    },
    {
      name: 'IsUTCTodayFuncArg1',
      value: 'date',
      comment: 'function_parameter - First argument to the IsUTCToday function - the date to be tested.',
    },
    {
      name: 'AboutMod',
      value:
        'Returns the remainder after a number is divided by a divisor. The result has the same sign as the divisor.',
      comment: "Description of 'Mod' function.",
    },
    {
      name: 'AboutModT',
      value:
        'Returns a column containing the remainder after a number (or a column of numbers) is divided by a divisor (or a column of divisors).',
      comment: "Description of 'ModT' function.",
    },
    {
      name: 'AboutMod_divisor',
      value: 'The number to divide by.',
    },
    {
      name: 'AboutMod_divisor_or_column',
      value: 'The number or column of numbers to divide by.',
    },
    {
      name: 'AboutMod_number',
      value: 'The number to find the remainder for.',
    },
    {
      name: 'AboutMod_number_or_column',
      value: 'The number or column of numbers to find the remainder for.',
    },
    {
      name: 'ModFuncArg1',
      value: 'number',
      comment: 'function_parameter - First argument of the Mod function - the number to find the reminder for.',
    },
    {
      name: 'ModFuncArg2',
      value: 'divisor',
      comment: 'function_parameter - Second argument of the Mod function - the number to divide by.',
    },
    {
      name: 'ModTFuncArg1',
      value: 'number_or_column',
      comment:
        'function_parameter - First argument of the Mod function - the number or column of numbers to find the reminder for. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'ModTFuncArg2',
      value: 'divisor_or_column',
      comment:
        'function_parameter - Second argument of the Mod function - the number or column of numbers to divide by. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'pdfViewer_Document_DisplayName',
      value: 'Document',
      comment: 'Display text for Document',
    },
    {
      name: 'pdfViewer_Zoom_DisplayName',
      value: 'Zoom',
      comment: 'Display text for Zoom',
    },
    {
      name: 'pdfViewer_Password_DisplayName',
      value: 'Password',
      comment: 'Display text for Password',
    },
    {
      name: 'pdfViewer_PasswordState_DisplayName',
      value: 'Password state',
      comment: 'Display text for PasswordState',
    },
    {
      name: 'Zoom_FitWidth_Name',
      value: 'FitWidth',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Zoom_FitHeight_Name',
      value: 'FitHeight',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Zoom_FitBoth_Name',
      value: 'FitBoth',
      comment: '{Locked} Enum value',
    },
    {
      name: 'PDFPasswordState_NoPasswordNeeded_Name',
      value: 'NoPasswordNeeded',
      comment: '{Locked} Enum value',
    },
    {
      name: 'PDFPasswordState_PasswordNeeded_Name',
      value: 'PasswordNeeded',
      comment: '{Locked} Enum value',
    },
    {
      name: 'PDFPasswordState_IncorrectPassword_Name',
      value: 'IncorrectPassword',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DateTimeZone_Local_Name',
      value: 'Local',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DateTimeZone_UTC_Name',
      value: 'UTC',
      comment: '{Locked} Enum value',
    },
    {
      name: 'DataDescriptionInvalidFormat_Reason',
      value: 'The data description is invalid: {0}',
    },
    {
      name: 'DataDescriptionParserUnknownException',
      value: 'An unknown error occurred trying to parse the data description.',
    },
    {
      name: 'AboutForAll',
      value: 'Applies a given formula on each row in a data source, then returns a new table with results per row.',
      comment: "Description of 'ForAll' function.",
    },
    {
      name: 'AboutForAll_source',
      value: 'The data source or table to operate on.',
    },
    {
      name: 'AboutForAll_formula',
      value: 'The formula to evaluate for all rows of the table.',
    },
    {
      name: 'ForAllArg1',
      value: 'source',
      comment:
        'function_parameter - First argument to the ForAll function - the data source (table / collection) to operate on.',
    },
    {
      name: 'ForAllArg2',
      value: 'formula',
      comment:
        'function_parameter - Second argument to the ForAll function - the formula to evaluate for all rows in the source.',
    },
    {
      name: 'AboutPower',
      value: 'Raises a number x to the power of another number y. Same as x^y.',
      comment: "Description of 'Power' function.",
    },
    {
      name: 'AboutPower_base',
      value: 'The base number to be raised.',
    },
    {
      name: 'AboutPower_exponent',
      value: 'The exponent by which the base will be raised.',
    },
    {
      name: 'PowerFuncArg1',
      value: 'base',
      comment: 'function_parameter - First argument to the Power function - the base number to be raised.',
    },
    {
      name: 'PowerFuncArg2',
      value: 'exponent',
      comment:
        'function_parameter - Second argument to the power function - the exponent by which the base will be raised.',
    },
    {
      name: 'TraceSeverity_Information_Name',
      value: 'Information',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TraceSeverity_Warning_Name',
      value: 'Warning',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TraceSeverity_Error_Name',
      value: 'Error',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TraceSeverity_Critical_Name',
      value: 'Critical',
      comment: '{Locked} Enum value',
    },
    {
      name: 'AboutStartsWith',
      value: 'Returns true if the provided text starts with the provided start string.',
      comment: "Description of 'StartsWith' function.",
    },
    {
      name: 'AboutStartsWith_text',
      value: 'The text to be checked.',
    },
    {
      name: 'AboutStartsWith_start',
      value: 'The starting string. The function returns true if the text starts with this string.',
    },
    {
      name: 'StartsWithArg1',
      value: 'text',
      comment: 'function_parameter - First argument to the StartsWith function - the text to be checked.',
    },
    {
      name: 'StartsWithArg2',
      value: 'start',
      comment:
        'function_parameter - Second argument to the StartsWith function - the text to be checked whether is on the beginning of the given text.',
    },
    {
      name: 'AboutEndsWith',
      value: 'Returns true if the provided text ends with the provided end string.',
      comment: "Description of 'EndsWith' function.",
    },
    {
      name: 'AboutEndsWith_text',
      value: 'The text to be checked.',
    },
    {
      name: 'AboutEndsWith_end',
      value: 'The ending string. The function returns true if the text ends with this string.',
    },
    {
      name: 'EndsWithArg1',
      value: 'text',
      comment: 'function_parameter - First argument to the EndsWith function - the text to be checked.',
    },
    {
      name: 'EndsWithArg2',
      value: 'end',
      comment:
        'function_parameter - Second argument to the EndsWith function - the text to be checked whether is on the end of the given text.',
    },
    {
      name: 'AboutBlank',
      value: 'Returns a null (blank) value',
    },
    {
      name: 'AboutPowerT',
      value:
        'Raises a number x (or column of numbers) to the power of another number y (or column of numbers). Same as x^y.',
      comment: "Description of 'Power' function.",
    },
    {
      name: 'AboutPower_base_or_column',
      value: 'The base number (or column of base numbers) to be raised.',
    },
    {
      name: 'AboutPower_exponent_or_column',
      value: 'The exponent (or column of exponents) by which the base will be raised.',
    },
    {
      name: 'PowerTFuncArg1',
      value: 'base_or_column',
      comment:
        'function_parameter - First argument to the Power function - the base number (or column of numbers) to be raised. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'PowerTFuncArg2',
      value: 'exponent_or_column',
      comment:
        'function_parameter - Second argument to the Power function - the exponent (or column of numbers) by which the base will be raised. Translate this string. Maintain as a single word (do not add spaces).',
    },
    {
      name: 'FormPattern_None_Name',
      value: 'None',
      comment: '{Locked} Enum value',
    },
    {
      name: 'FormPattern_Details_Name',
      value: 'Details',
      comment: '{Locked} Enum value',
    },
    {
      name: 'FormPattern_List_Name',
      value: 'List',
      comment: '{Locked} Enum value',
    },
    {
      name: 'FormPattern_CardList_Name',
      value: 'CardList',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LoadingSpinner_Data_Name',
      value: 'Data',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LoadingSpinner_Controls_Name',
      value: 'Controls',
      comment: '{Locked} Enum value',
    },
    {
      name: 'LoadingSpinner_None_Name',
      value: 'None',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Live_Off_Name',
      value: 'Off',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Live_Polite_Name',
      value: 'Polite',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Live_Assertive_Name',
      value: 'Assertive',
      comment: '{Locked} Enum value',
    },
    {
      name: 'TextRole_Default_Name',
      value: 'Default',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ScreenSize_Small_Name',
      value: 'Small',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ScreenSize_Medium_Name',
      value: 'Medium',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ScreenSize_Large_Name',
      value: 'Large',
      comment: '{Locked} Enum value',
    },
    {
      name: 'ScreenSize_ExtraLarge_Name',
      value: 'ExtraLarge',
      comment: '{Locked} Enum name',
    },
    {
      name: 'Icon_Add_Name',
      value: 'Add',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Cancel_Name',
      value: 'Cancel',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Edit_Name',
      value: 'Edit',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Check_Name',
      value: 'Check',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Search_Name',
      value: 'Search',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Filter_Name',
      value: 'Filter',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Sort_Name',
      value: 'Sort',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Reload_Name',
      value: 'Reload',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Trash_Name',
      value: 'Trash',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Save_Name',
      value: 'Save',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Download_Name',
      value: 'Download',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Copy_Name',
      value: 'Copy',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_LikeDislike_Name',
      value: 'LikeDislike',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Crop_Name',
      value: 'Crop',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Pin_Name',
      value: 'Pin',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ClearDrawing_Name',
      value: 'ClearDrawing',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ExpandView_Name',
      value: 'ExpandView',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_CollapseView_Name',
      value: 'CollapseView',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Draw_Name',
      value: 'Draw',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Compose_Name',
      value: 'Compose',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Erase_Name',
      value: 'Erase',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Message_Name',
      value: 'Message',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Post_Name',
      value: 'Post',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_AddDocument_Name',
      value: 'AddDocument',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_AddLibrary_Name',
      value: 'AddLibrary',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Home_Name',
      value: 'Home',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Hamburger_Name',
      value: 'Hamburger',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Settings_Name',
      value: 'Settings',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_More_Name',
      value: 'More',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Waffle_Name',
      value: 'Waffle',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ChevronLeft_Name',
      value: 'ChevronLeft',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ChevronRight_Name',
      value: 'ChevronRight',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ChevronUp_Name',
      value: 'ChevronUp',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ChevronDown_Name',
      value: 'ChevronDown',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_NextArrow_Name',
      value: 'NextArrow',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_BackArrow_Name',
      value: 'BackArrow',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ArrowDown_Name',
      value: 'ArrowDown',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ArrowUp_Name',
      value: 'ArrowUp',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ArrowLeft_Name',
      value: 'ArrowLeft',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ArrowRight_Name',
      value: 'ArrowRight',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Camera_Name',
      value: 'Camera',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Document_Name',
      value: 'Document',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_DockCheckProperties_Name',
      value: 'DockCheckProperties',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Folder_Name',
      value: 'Folder',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Journal_Name',
      value: 'Journal',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ForkKnife_Name',
      value: 'ForkKnife',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Transportation_Name',
      value: 'Transportation',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Airplane_Name',
      value: 'Airplane',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Bus_Name',
      value: 'Bus',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Cars_Name',
      value: 'Cars',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Money_Name',
      value: 'Money',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Currency_Name',
      value: 'Currency',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_AddToCalendar_Name',
      value: 'AddToCalendar',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_CalendarBlank_Name',
      value: 'CalendarBlank',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_OfficeBuilding_Name',
      value: 'OfficeBuilding',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_PaperClip_Name',
      value: 'PaperClip',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Newspaper_Name',
      value: 'Newspaper',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Lock_Name',
      value: 'Lock',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Waypoint_Name',
      value: 'Waypoint',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Location_Name',
      value: 'Location',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_DocumentPDF_Name',
      value: 'DocumentPDF',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Bell_Name',
      value: 'Bell',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ShoppingCart_Name',
      value: 'ShoppingCart',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Phone_Name',
      value: 'Phone',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_PhoneHangUp_Name',
      value: 'PhoneHangUp',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Mobile_Name',
      value: 'Mobile',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Laptop_Name',
      value: 'Laptop',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ComputerDesktop_Name',
      value: 'ComputerDesktop',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Devices_Name',
      value: 'Devices',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Controller_Name',
      value: 'Controller',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Tools_Name',
      value: 'Tools',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ToolsWrench_Name',
      value: 'ToolsWrench',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Mail_Name',
      value: 'Mail',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Send_Name',
      value: 'Send',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Clock_Name',
      value: 'Clock',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ListWatchlistRemind_Name',
      value: 'ListWatchlistRemind',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_LogJournal_Name',
      value: 'LogJournal',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Note_Name',
      value: 'Note',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_PhotosPictures_Name',
      value: 'PhotosPictures',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_RadarActivityMonitor_Name',
      value: 'RadarActivityMonitor',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Tablet_Name',
      value: 'Tablet',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Tag_Name',
      value: 'Tag',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_CameraAperture_Name',
      value: 'CameraAperture',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ColorPicker_Name',
      value: 'ColorPicker',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_DetailList_Name',
      value: 'DetailList',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_DocumentWithContent_Name',
      value: 'DocumentWithContent',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ListScrollEmpty_Name',
      value: 'ListScrollEmpty',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ListScrollWatchlist_Name',
      value: 'ListScrollWatchlist',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_OptionsList_Name',
      value: 'OptionsList',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_People_Name',
      value: 'People',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Person_Name',
      value: 'Person',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_EmojiFrown_Name',
      value: 'EmojiFrown',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_EmojiSmile_Name',
      value: 'EmojiSmile',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_EmojiSad_Name',
      value: 'EmojiSad',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_EmojiNeutral_Name',
      value: 'EmojiNeutral',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Warning_Name',
      value: 'Warning',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Information_Name',
      value: 'Information',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Database_Name',
      value: 'Database',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Weather_Name',
      value: 'Weather',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_TrendingHashtag_Name',
      value: 'TrendingHashtag',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_TrendingUpwards_Name',
      value: 'TrendingUpwards',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Items_Name',
      value: 'Items',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_LevelsLayersItems_Name',
      value: 'LevelsLayersItems',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Trending_Name',
      value: 'Trending',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_LineWeight_Name',
      value: 'LineWeight',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Import_Name',
      value: 'Import',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Import_DisplayName',
      value: 'Import',
      comment:
        'Icon control name representing an import action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Import value.',
    },
    {
      name: 'Icon_AddUser_Name',
      value: 'AddUser',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_AddUser_DisplayName',
      value: 'Add user',
      comment:
        'Icon control name representing an add user object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the AddUser value.',
    },
    {
      name: 'Icon_Alarm_Name',
      value: 'Alarm',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Alarm_DisplayName',
      value: 'Alarm',
      comment:
        'Icon control name representing an alarm object. Display text representing the value of Icon enum that will be shown in the icon control. Should be translated the same as the Alarm icon in fabric https://uifabricicons.azurewebsites.net/.',
    },
    {
      name: 'Icon_Blocked_Name',
      value: 'Blocked',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Blocked_DisplayName',
      value: 'Blocked',
      comment:
        'Icon control name representing an blocked action. Display text representing the value of Icon enum that will be shown in the icon control. Should be translated the same as the Blocked icon in fabric https://uifabricicons.azurewebsites.net/.',
    },
    {
      name: 'Icon_Bookmark_Name',
      value: 'Bookmark',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Bookmark_DisplayName',
      value: 'Bookmark',
      comment:
        'Icon control name representing an bookmark action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Bookmark value.',
    },
    {
      name: 'Icon_Bug_Name',
      value: 'Bug',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Bug_DisplayName',
      value: 'Bug',
      comment:
        'Icon control name representing an bug object. Display text representing the value of Icon enum that will be shown in the icon control. Should be translated the same as the Bug icon in fabric https://uifabricicons.azurewebsites.net/.',
    },
    {
      name: 'Icon_Calculator_Name',
      value: 'Calculator',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Calculator_DisplayName',
      value: 'Calculator',
      comment:
        'Icon control name representing an calculator object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Calculator value.',
    },
    {
      name: 'Icon_Diamond_Name',
      value: 'Diamond',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Diamond_DisplayName',
      value: 'Diamond',
      comment:
        'Icon control name representing an diamond object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Diamond value.',
    },
    {
      name: 'Icon_DockLeft_Name',
      value: 'DockLeft',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_DockLeft_DisplayName',
      value: 'Dock left',
      comment:
        'Icon control name representing an dock left action. Display text representing the value of Icon enum that will be shown in the icon control. Should be translated the same as the DockLeft icon in fabric https://uifabricicons.azurewebsites.net/',
    },
    {
      name: 'Icon_DockRight_Name',
      value: 'DockRight',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_DockRight_DisplayName',
      value: 'Dock right',
      comment:
        'Icon control name representing an dock right action. Display text representing the value of Icon enum that will be shown in the icon control. Should be translated the same as the DockRight icon in fabric https://uifabricicons.azurewebsites.net/.',
    },
    {
      name: 'Icon_Enhance_Name',
      value: 'Enhance',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Enhance_DisplayName',
      value: 'Enhance',
      comment:
        'Icon control name representing an enhance object. Display text representing the value of Icon enum that will be shown in the icon control. Enhance means the same as it does in the fabric icons AutoEnhanceOn and AutoEnhanceOff https://uifabricicons.azurewebsites.net/.',
    },
    {
      name: 'Icon_Error_Name',
      value: 'Error',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Error_DisplayName',
      value: 'Error',
      comment:
        'Icon control name representing an error object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Error value.',
    },
    {
      name: 'Icon_Export_Name',
      value: 'Export',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Export_DisplayName',
      value: 'Export',
      comment:
        'Icon control name representing an export action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Export value.',
    },
    {
      name: 'Icon_Flag_Name',
      value: 'Flag',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Flag_DisplayName',
      value: 'Flag',
      comment:
        'Icon control name representing an flag object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Flag value.',
    },
    {
      name: 'Icon_Globe_Name',
      value: 'Globe',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Globe_DisplayName',
      value: 'Globe',
      comment:
        'Icon control name representing an globe object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Globe value.',
    },
    {
      name: 'Icon_HalfFilledCircle_Name',
      value: 'HalfFilledCircle',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_HalfFilledCircle_DisplayName',
      value: 'Half filled circle',
      comment:
        'Icon control name representing an half filled circle object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the HalfFilledCircle value.',
    },
    {
      name: 'Icon_Health_Name',
      value: 'Health',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Health_DisplayName',
      value: 'Health',
      comment:
        'Icon control name representing an health object. Display text representing the value of Icon enum that will be shown in the icon control. Should be translated the same as the Health icon in fabric https://uifabricicons.azurewebsites.net/.',
    },
    {
      name: 'Icon_Heart_Name',
      value: 'Heart',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Heart_DisplayName',
      value: 'Heart',
      comment:
        'Icon control name representing an heart object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Heart value.',
    },
    {
      name: 'Icon_Help_Name',
      value: 'Help',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Help_DisplayName',
      value: 'Help',
      comment:
        'Icon control name representing an help action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Help value.',
    },
    {
      name: 'Icon_Hide_Name',
      value: 'Hide',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Hide_DisplayName',
      value: 'Hide',
      comment:
        'Icon control name representing an hide action. Display text representing the value of Icon enum that will be shown in the icon control. Should be translated the same as the Hide icon in fabric https://uifabricicons.azurewebsites.net/.',
    },
    {
      name: 'Icon_History_Name',
      value: 'History',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_History_DisplayName',
      value: 'History',
      comment:
        'Icon control name representing an history object. Display text representing the value of Icon enum that will be shown in the icon control. Should be translated the same as the History icon in fabric https://uifabricicons.azurewebsites.net/.',
    },
    {
      name: 'Icon_HorizontalLine_Name',
      value: 'HorizontalLine',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_HorizontalLine_DisplayName',
      value: 'Horizontal line',
      comment:
        'Icon control name representing an horizontal line object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the HorizontalLine value.',
    },
    {
      name: 'Icon_Hospital_Name',
      value: 'Hospital',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Hospital_DisplayName',
      value: 'Hospital',
      comment:
        'Icon control name representing an hospital object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Hospital value.',
    },
    {
      name: 'Icon_Key_Name',
      value: 'Key',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Key_DisplayName',
      value: 'Key',
      comment:
        'Icon control name representing an key object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Key value.',
    },
    {
      name: 'Icon_Lightbulb_Name',
      value: 'Lightbulb',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Lightbulb_DisplayName',
      value: 'Lightbulb',
      comment:
        'Icon control name representing an lightbulb object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Lightbulb value.',
    },
    {
      name: 'Icon_LightningBolt_Name',
      value: 'LightningBolt',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_LightningBolt_DisplayName',
      value: 'Lightning bolt',
      comment:
        'Icon control name representing an lightning bolt object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the LightningBolt value.',
    },
    {
      name: 'Icon_Link_Name',
      value: 'Link',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Link_DisplayName',
      value: 'Link',
      comment:
        'Icon control name representing an hyperlink. Display text representing the value of Icon enum that will be shown in the icon control. Should be translated the same as the Link icon in fabric https://uifabricicons.azurewebsites.net/.',
    },
    {
      name: 'Icon_Manufacture_Name',
      value: 'Manufacture',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Manufacture_DisplayName',
      value: 'Manufacture',
      comment:
        'Icon control name representing an manufacture object. Display text representing the value of Icon enum that will be shown in the icon control. Should be translated the similar to the Manufacturing icon in fabric https://uifabricicons.azurewebsites.net/',
    },
    {
      name: 'Icon_Medical_Name',
      value: 'Medical',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Medical_DisplayName',
      value: 'Medical',
      comment:
        'Icon control name representing an medical object. Display text representing the value of Icon enum that will be shown in the icon control. Should be translated the same as the Medical icon in fabric https://uifabricicons.azurewebsites.net/',
    },
    {
      name: 'Icon_Microphone_Name',
      value: 'Microphone',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Microphone_DisplayName',
      value: 'Microphone',
      comment:
        'Icon control name representing an microphone object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Microphone value.',
    },
    {
      name: 'Icon_Notebook_Name',
      value: 'Notebook',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Notebook_DisplayName',
      value: 'Notebook',
      comment:
        'Icon control name representing an notebook object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Notebook value.',
    },
    {
      name: 'Icon_OpenInNewWindow_Name',
      value: 'OpenInNewWindow',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_OpenInNewWindow_DisplayName',
      value: 'Open in new window',
      comment:
        'Icon control name representing an open in new window action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the OpenInNewWindow value.',
    },
    {
      name: 'Icon_Phonebook_Name',
      value: 'Phonebook',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Phonebook_DisplayName',
      value: 'Phonebook',
      comment:
        'Icon control name representing an phonebook object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Phonebook value.',
    },
    {
      name: 'Icon_Print_Name',
      value: 'Print',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Print_DisplayName',
      value: 'Print',
      comment:
        'Icon control name representing an print object. Display text representing the value of Icon enum that will be shown in the icon control. Should be translated the same as the Print icon in fabric https://uifabricicons.azurewebsites.net/',
    },
    {
      name: 'Icon_Publish_Name',
      value: 'Publish',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Publish_DisplayName',
      value: 'Publish',
      comment:
        'Icon control name representing an publish action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Publish value.',
    },
    {
      name: 'Icon_QuestionMark_Name',
      value: 'QuestionMark',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_QuestionMark_DisplayName',
      value: 'Question mark',
      comment:
        'Icon control name representing an question mark action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the QuestionMark value.',
    },
    {
      name: 'Icon_Redo_Name',
      value: 'Redo',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Redo_DisplayName',
      value: 'Redo',
      comment:
        'Icon control name representing an redo action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Redo value.',
    },
    {
      name: 'Icon_Reset_Name',
      value: 'Reset',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Reset_DisplayName',
      value: 'Reset',
      comment:
        'Icon control name representing an reset action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Reset value.',
    },
    {
      name: 'Icon_Ribbon_Name',
      value: 'Ribbon',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Ribbon_DisplayName',
      value: 'Ribbon',
      comment:
        'Icon control name representing an ribbon object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Ribbon value.',
    },
    {
      name: 'Icon_Scan_Name',
      value: 'Scan',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Scan_DisplayName',
      value: 'Scan',
      comment:
        'Icon control name representing an scan object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Scan value.',
    },
    {
      name: 'Icon_Share_Name',
      value: 'Share',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Share_DisplayName',
      value: 'Share',
      comment:
        'Icon control name representing an share action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Share value.',
    },
    {
      name: 'Icon_Shirt_Name',
      value: 'Shirt',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Shirt_DisplayName',
      value: 'Shirt',
      comment:
        'Icon control name representing an shirt object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Shirt value.',
    },
    {
      name: 'Icon_Shop_Name',
      value: 'Shop',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Shop_DisplayName',
      value: 'Shop',
      comment:
        'Icon control name representing an shop object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Shop value.',
    },
    {
      name: 'Icon_Signal_Name',
      value: 'Signal',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Signal_DisplayName',
      value: 'Signal',
      comment:
        'Icon control name representing an signal object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Signal value.',
    },
    {
      name: 'Icon_Support_Name',
      value: 'Support',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Support_DisplayName',
      value: 'Support',
      comment:
        'Icon control name representing an support object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Support value.',
    },
    {
      name: 'Icon_Sync_Name',
      value: 'Sync',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Sync_DisplayName',
      value: 'Sync',
      comment:
        'Icon control name representing an sync action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Sync value.',
    },
    {
      name: 'Icon_Text_Name',
      value: 'Text',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Text_DisplayName',
      value: 'Text',
      comment:
        'Icon control name representing an text object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Text value.',
    },
    {
      name: 'Icon_ThumbsDown_Name',
      value: 'ThumbsDown',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ThumbsDown_DisplayName',
      value: 'Thumbs down',
      comment:
        'Icon control name representing an thumbs down action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ThumbsDown value.',
    },
    {
      name: 'Icon_ThumbsUp_Name',
      value: 'ThumbsUp',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ThumbsUp_DisplayName',
      value: 'Thumbs up',
      comment:
        'Icon control name representing an thumbs up action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ThumbsUp value.',
    },
    {
      name: 'Icon_Train_Name',
      value: 'Train',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Train_DisplayName',
      value: 'Train',
      comment:
        'Icon control name representing an train object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Train value.',
    },
    {
      name: 'Icon_Tray_Name',
      value: 'Tray',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Tray_DisplayName',
      value: 'Tray',
      comment:
        'Icon control name representing an tray object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Tray value.',
    },
    {
      name: 'Icon_Undo_Name',
      value: 'Undo',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Undo_DisplayName',
      value: 'Undo',
      comment:
        'Icon control name representing an undo action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Undo value.',
    },
    {
      name: 'Icon_Unlock_Name',
      value: 'Unlock',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Unlock_DisplayName',
      value: 'Unlock',
      comment:
        'Icon control name representing an unlock object. Display text representing the value of Icon enum that will be shown in the icon control. Should be translated the same as the Unlock icon in fabric https://uifabricicons.azurewebsites.net/',
    },
    {
      name: 'Icon_VerticalLine_Name',
      value: 'VerticalLine',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_VerticalLine_DisplayName',
      value: 'Vertical line',
      comment:
        'Icon control name representing an vertical line object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the VerticalLine value.',
    },
    {
      name: 'Icon_Video_Name',
      value: 'Video',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Video_DisplayName',
      value: 'Video',
      comment:
        'Icon control name representing an video object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Video value.',
    },
    {
      name: 'Icon_View_Name',
      value: 'View',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_View_DisplayName',
      value: 'View',
      comment:
        'Icon control name representing an view action. Display text representing the value of Icon enum that will be shown in the icon control. This is the opposite as the Hide value',
    },
    {
      name: 'Icon_ZoomIn_Name',
      value: 'ZoomIn',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ZoomIn_DisplayName',
      value: 'Zoom in',
      comment:
        'Icon control name representing an zoom in action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ZoomIn value.',
    },
    {
      name: 'Icon_ZoomOut_Name',
      value: 'ZoomOut',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ZoomOut_DisplayName',
      value: 'Zoom out',
      comment:
        'Icon control name representing an zoom out action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ZoomOut value.',
    },
    {
      name: 'Icon_BookmarkFilled_Name',
      value: 'BookmarkFilled',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_BookmarkFilled_DisplayName',
      value: 'Bookmark (filled)',
      comment:
        'Icon control name representing an bookmark (filled) action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the BookmarkFilled value.',
    },
    {
      name: 'Icon_CancelBadge_Name',
      value: 'CancelBadge',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_CancelBadge_DisplayName',
      value: 'Cancel (badge)',
      comment:
        'Icon control name representing an cancel (badge) action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Cancel action inside a circle.',
    },
    {
      name: 'Icon_CheckBadge_Name',
      value: 'CheckBadge',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_CheckBadge_DisplayName',
      value: 'Check (badge)',
      comment:
        'Icon control name representing an check (badge) action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Check action inside a circle.',
    },
    {
      name: 'Icon_Cut_Name',
      value: 'Cut',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Cut_DisplayName',
      value: 'Cut',
      comment:
        'Icon control name representing an cut action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Cut value.',
    },
    {
      name: 'Icon_FilterFlat_Name',
      value: 'FilterFlat',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_FilterFlat_DisplayName',
      value: 'Flat filter',
      comment:
        'Icon control name representing an flat filter object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the FilterFlat value.',
    },
    {
      name: 'Icon_FilterFlatFilled_Name',
      value: 'FilterFlatFilled',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_FilterFlatFilled_DisplayName',
      value: 'Flat filter (filled)',
      comment:
        'Icon control name representing an flat filter (filled) object. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the FilterFlatFilled value.',
    },
    {
      name: 'Icon_Leave_Name',
      value: 'Leave',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Leave_DisplayName',
      value: 'Leave',
      comment:
        'Icon control name representing an leave action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Leave value.',
    },
    {
      name: 'Icon_Paste_Name',
      value: 'Paste',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_Paste_DisplayName',
      value: 'Paste',
      comment:
        'Icon control name representing an paste action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Paste value.',
    },
    {
      name: 'Icon_ThumbsDownFilled_Name',
      value: 'ThumbsDownFilled',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ThumbsDownFilled_DisplayName',
      value: 'Thumbs down (filled)',
      comment:
        'Icon control name representing an thumbs down (filled) action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ThumbsDownFilled value.',
    },
    {
      name: 'Icon_ThumbsUpFilled_Name',
      value: 'ThumbsUpFilled',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_ThumbsUpFilled_DisplayName',
      value: 'Thumbs up (filled)',
      comment:
        'Icon control name representing an thumbs up (filled) action. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ThumbsUpFilled value.',
    },
    {
      name: 'Icon_EmojiHappy_Name',
      value: 'EmojiHappy',
      comment: '{Locked} Enum value',
    },
    {
      name: 'Icon_EmojiHappy_DisplayName',
      value: 'Emoji - Happy',
      comment:
        'Icon control name representing an emoji - happy glyph. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the EmojiHappy value.',
    },
    {
      name: 'LaunchTarget_New_Name',
      value: 'New',
      comment: '{Locked} Enum name',
    },
    {
      name: 'LaunchTarget_Replace_Name',
      value: 'Replace',
      comment: '{Locked} Enum name',
    },
    {
      name: 'SuggestRemoteExecutionHint_OpNotSupportedByClient',
      value:
        "Part of this formula cannot be evaluated remotely. '{0}' operation is currently not supported in this context.",
      comment:
        'Suggestion emitted when non-delegable parts of the expression found which could be made delegable by rearranging the formula.',
    },
    {
      name: 'SuggestRemoteExecutionHint_StringMatchSecondParam',
      value:
        "Part of this formula cannot be evaluated remotely. The '{0}' function cannot be delegated if a field name appears in the second argument.",
      comment:
        'Suggestion emitted when non-delegable parts of the expression found which could be made delegable by rearranging the formula.',
    },
    {
      name: 'entityForm_EntityForm_DisplayName',
      value: 'Entity form',
      comment: 'Display text for internal hidden property',
    },
    {
      name: 'BorderStyle_None_DisplayName',
      value: 'None',
      comment:
        'Display text representing the None value of BorderStyle enum (BorderStyle_None_Name). The possible values for this enumeration are: None, Dashed, Solid, Dotted.',
    },
    {
      name: 'BorderStyle_Dashed_DisplayName',
      value: 'Dashed',
      comment:
        'Display text representing the Dashed value of BorderStyle enum (BorderStyle_Dashed_Name). The possible values for this enumeration are: None, Dashed, Solid, Dotted.',
    },
    {
      name: 'BorderStyle_Solid_DisplayName',
      value: 'Solid',
      comment:
        'Display text representing the Solid value of BorderStyle enum (BorderStyle_Solid_Name). The possible values for this enumeration are: None, Dashed, Solid, Dotted.',
    },
    {
      name: 'BorderStyle_Dotted_DisplayName',
      value: 'Dotted',
      comment:
        'Display text representing the Dotted value of BorderStyle enum (BorderStyle_Dotted_Name). The possible values for this enumeration are: None, Dashed, Solid, Dotted.',
    },
    {
      name: 'DisplayMode_Disabled_DisplayName',
      value: 'Disabled',
      comment:
        'Display text representing the Disabled value of DisplayMode enum (DisplayMode_Disabled_Name). The possible values for this enumeration are: Disabled, Edit, View.',
    },
    {
      name: 'DisplayMode_Edit_DisplayName',
      value: 'Edit',
      comment:
        'Display text representing the Edit value of DisplayMode enum (DisplayMode_Edit_Name). The possible values for this enumeration are: Disabled, Edit, View. Notice that the term ‘Edit’ is used as an adjective (edit display mode), not a verb.',
    },
    {
      name: 'DisplayMode_View_DisplayName',
      value: 'View',
      comment:
        'Display text representing the View value of DisplayMode enum (DisplayMode_View_Name). The possible values for this enumeration are: Disabled, Edit, View. Notice that the term ‘View’ is used as an adjective (view display mode), not a verb.',
    },
    {
      name: 'LayoutMode_Manual_DisplayName',
      value: 'Manual',
      comment:
        'Display text for Manual ("Fixed") LayoutMode enum option (LayoutMode_Manual_Name), where users can position controls using X/Y coordinates. The possible values for this enumeration are: Manual, Auto.',
    },
    {
      name: 'LayoutMode_Auto_DisplayName',
      value: 'Auto',
      comment:
        'Display text for Auto ("Flex") LayoutMode enum option (LayoutMode_Auto_Name), where the container automatically positions controls based on the available space. The possible values for this enumeration are: Manual, Auto.',
    },
    {
      name: 'LayoutDirection_Horizontal_DisplayName',
      value: 'Horizontal',
      comment:
        'Display text for Horizontal enum option (LayoutDirection_Horizontal_Name). The possible values for this enumeration are: Horizontal, Vertical.',
    },
    {
      name: 'LayoutDirection_Vertical_DisplayName',
      value: 'Vertical',
      comment:
        'Display text for Vertical enum option (LayoutDirection_Vertical_Name). The possible values for this enumeration are: Horizontal, Vertical.',
    },
    {
      name: 'LayoutAlignItems_Start_DisplayName',
      value: 'Start',
      comment:
        "Display text for Start enum option (LayoutAlignItems_Start_Name), where the child controls are aligned to the top or left of the container. 'Start' is to be treated as a noun, as it aligns the control to the start of a container. The possible values for this enumeration are: Start, Center, End, Stretch.",
    },
    {
      name: 'LayoutAlignItems_Center_DisplayName',
      value: 'Center',
      comment:
        'Display text for Center enum option (LayoutAlignItems_Center_Name), where the child controls are aligned to the center of the container. The possible values for this enumeration are: Start, Center, End, Stretch.',
    },
    {
      name: 'LayoutAlignItems_End_DisplayName',
      value: 'End',
      comment:
        "Display text for End enum option (LayoutAlignItems_End_Name), where the child controls are aligned to the bottom or right of the container. 'End' is to be treated as a noun, as it aligns the control to the end of a container. The possible values for this enumeration are: Start, Center, End, Stretch.",
    },
    {
      name: 'LayoutAlignItems_Stretch_DisplayName',
      value: 'Stretch',
      comment:
        'Display text for Stretch enum option (LayoutAlignItems_Stretch_Name), where the child controls stretch to take up available space on the cross axis. The possible values for this enumeration are: Start, Center, End, Stretch.',
    },
    {
      name: 'AlignInContainer_Start_DisplayName',
      value: 'Start',
      comment:
        "Display text for Start enum option (AlignInContainer_Start_Name), where the control is aligned to the top or left of its container. 'Start' is to be treated as a noun, as it aligns the control to the start of a container. The possible values for this enumeration are: Start, Center, End, Stretch, SetByContainer.",
    },
    {
      name: 'AlignInContainer_Center_DisplayName',
      value: 'Center',
      comment:
        'Display text for Center enum option (AlignInContainer_Center_Name), where the control is aligned to the center of its container. The possible values for this enumeration are: Start, Center, End, Stretch, SetByContainer.',
    },
    {
      name: 'AlignInContainer_End_DisplayName',
      value: 'End',
      comment:
        "Display text for End enum option (AlignInContainer_End_Name), where the control is aligned to the bottom or right of its container. 'End' is to be treated as a noun, as it aligns the control to the end of a container. The possible values for this enumeration are: Start, Center, End, Stretch, SetByContainer.",
    },
    {
      name: 'AlignInContainer_Stretch_DisplayName',
      value: 'Stretch',
      comment:
        'Display text for Stretch enum option (AlignInContainer_Stretch_Name), where the control stretches to take up available space on the cross axis. The possible values for this enumeration are: Start, Center, End, Stretch, SetByContainer.',
    },
    {
      name: 'AlignInContainer_SetByContainer_DisplayName',
      value: 'Set by container',
      comment:
        "Display text for SetByContainer enum option (AlignInContainer_SetByContainer_Name), where the control's alignment is automatically determined based on its container. The possible values for this enumeration are: Start, Center, End, Stretch, SetByContainer.",
    },
    {
      name: 'LayoutJustifyContent_Start_DisplayName',
      value: 'Start',
      comment:
        "Display text for Start enum option (LayoutJustifyContent_Start_Name), where the controls are justified to the top or left of the container. 'Start' is to be treated as a noun, as it justifies the control along the start of a container. The possible values for this enumeration are: Start, Center, End, SpaceEvenly, SpaceAround, SpaceBetween.",
    },
    {
      name: 'LayoutJustifyContent_Center_DisplayName',
      value: 'Center',
      comment:
        'Display text for Center enum option (LayoutJustifyContent_Center_Name), where the controls are justified to the center of the container. The possible values for this enumeration are: Start, Center, End, SpaceEvenly, SpaceAround, SpaceBetween.',
    },
    {
      name: 'LayoutJustifyContent_End_DisplayName',
      value: 'End',
      comment:
        "Display text for End enum option (LayoutJustifyContent_End_Name), where the controls are justified to the bottom or right of the container. 'End' is to be treated as a noun, as it justifies the control along the end of a container. The possible values for this enumeration are: Start, Center, End, SpaceEvenly, SpaceAround, SpaceBetween.",
    },
    {
      name: 'LayoutJustifyContent_SpaceEvenly_DisplayName',
      value: 'Space Evenly',
      comment:
        'Display text for SpaceEvenly enum option (LayoutJustifyContent_SpaceEvenly_Name), where the controls are spaced evenly through the container. The possible values for this enumeration are: Start, Center, End, SpaceEvenly, SpaceAround, SpaceBetween.',
    },
    {
      name: 'LayoutJustifyContent_SpaceAround_DisplayName',
      value: 'Space Around',
      comment:
        'Display text for SpaceAround enum option (LayoutJustifyContent_SpaceAround_Name), where extra space in the container is distributed around each control. The possible values for this enumeration are: Start, Center, End, SpaceEvenly, SpaceAround, SpaceBetween.',
    },
    {
      name: 'LayoutJustifyContent_SpaceBetween_DisplayName',
      value: 'Space Between',
      comment:
        'Display text for SpaceBetween enum option (LayoutJustifyContent_SpaceBetween_Name), where extra space is distributed between each control. The possible values for this enumeration are: Start, Center, End, SpaceEvenly, SpaceAround, SpaceBetween.',
    },
    {
      name: 'LayoutOverflow_Hide_DisplayName',
      value: 'Hide',
      comment:
        'Display text for LayoutOverflow_Hide enum option (LayoutOverflow_Hide_Name). The possible values for this enumeration are: Hide, Scroll.',
    },
    {
      name: 'LayoutOverflow_Scroll_DisplayName',
      value: 'Scroll',
      comment:
        'Display text for LayoutOverflow_Scroll enum option (LayoutOverflow_Scroll_Name). The possible values for this enumeration are: Hide, Scroll.',
    },
    {
      name: 'Overflow_Hidden_DisplayName',
      value: 'Hidden',
      comment:
        'Display text representing the Hidden value of Overflow enum (Overflow_Hidden_Name). The possible values for this enumeration are: Hidden, Scroll.',
    },
    {
      name: 'Overflow_Scroll_DisplayName',
      value: 'Scroll',
      comment:
        'Display text representing the Scroll value of Overflow enum (Overflow_Scroll_Name). The possible values for this enumeration are: Hidden, Scroll.',
    },
    {
      name: 'TextMode_SingleLine_DisplayName',
      value: 'Single line',
      comment:
        'Display text representing the SingleLine value of TextMode enum (TextMode_SingleLine_Name). The possible values for this enumeration are: SingleLine, Password, MultiLine.',
    },
    {
      name: 'TextMode_Password_DisplayName',
      value: 'Password',
      comment:
        'Display text representing the Password value of TextMode enum (TextMode_Password_Name). The possible values for this enumeration are: SingleLine, Password, MultiLine.',
    },
    {
      name: 'TextMode_MultiLine_DisplayName',
      value: 'Multiline',
      comment:
        'Display text representing the MultiLine value of TextMode enum (TextMode_MultiLine_Name). The possible values for this enumeration are: SingleLine, Password, MultiLine.',
    },
    {
      name: 'TextFormat_Text_DisplayName',
      value: 'Text',
      comment:
        'Display text representing the Text value of TextFormat enum (TextFormat_Text_Name). The possible values for this enumeration are: Text, Number.',
    },
    {
      name: 'TextFormat_Number_DisplayName',
      value: 'Number',
      comment:
        'Display text representing the Number value of TextFormat enum (TextFormat_Number_Name). The possible values for this enumeration are: Text, Number.',
    },
    {
      name: 'VirtualKeyboardMode_Auto_DisplayName',
      value: 'Auto keyboard',
      comment:
        'Display text representing the Auto value of VirtualKeyboardMode enum (VirtualKeyboardMode_Auto_Name). The possible values for this enumeration are: Auto, Numeric, Text.',
    },
    {
      name: 'VirtualKeyboardMode_Numeric_DisplayName',
      value: 'Numeric keyboard',
      comment:
        'Display text representing the Numeric value of VirtualKeyboardMode enum (VirtualKeyboardMode_Numeric_Name). The possible values for this enumeration are: Auto, Numeric, Text.',
    },
    {
      name: 'VirtualKeyboardMode_Text_DisplayName',
      value: 'Text keyboard',
      comment:
        'Display text representing the Text value of VirtualKeyboardMode enum (VirtualKeyboardMode_Text_Name). The possible values for this enumeration are: Auto, Numeric, Text.',
    },
    {
      name: 'TeamsTheme_Default_DisplayName',
      value: 'Default theme',
      comment:
        'Display text representing the Default value of TeamsTheme enum (TeamsTheme_Default_Name). The possible values for this enumeration are: Default, Dark, Contrast.',
    },
    {
      name: 'TeamsTheme_Dark_DisplayName',
      value: 'Dark theme',
      comment:
        'Display text representing the Dark value of TeamsTheme enum (TeamsTheme_Dark_Name). The possible values for this enumeration are: Default, Dark, Contrast.',
    },
    {
      name: 'TeamsTheme_Contrast_DisplayName',
      value: 'Contrast theme',
      comment:
        'Display text representing the Contrast value of TeamsTheme enum (TeamsTheme_Contrast_Name). The possible values for this enumeration are: Default, Dark, Contrast.',
    },
    {
      name: 'PenMode_Draw_DisplayName',
      value: 'Draw',
      comment:
        'Display text representing the Draw value of PenMode enum (PenMode_Draw_Name). The possible values for this enumeration are: Draw, Erase.',
    },
    {
      name: 'PenMode_Erase_DisplayName',
      value: 'Erase',
      comment:
        'Display text representing the Erase value of PenMode enum (PenMode_Erase_Name). The possible values for this enumeration are: Draw, Erase.',
    },
    {
      name: 'DateTimeZone_Local_DisplayName',
      value: 'Local',
      comment:
        'Display text representing the Local value of DateTimeZone enum (DateTimeZone_Local_Name). The possible values for this enumeration are: Local, UTC.',
    },
    {
      name: 'DateTimeZone_UTC_DisplayName',
      value: 'UTC',
      comment:
        'Display text representing the UTC value of DateTimeZone enum (DateTimeZone_UTC_Name). The possible values for this enumeration are: Local, UTC.',
    },
    {
      name: 'ImagePosition_Fill_DisplayName',
      value: 'Fill',
      comment:
        'Display text representing the Fill value of ImagePosition enum (ImagePosition_Fill_Name). The possible values for this enumeration are: Fill, Fit, Stretch, Tile, Center.',
    },
    {
      name: 'ImagePosition_Fit_DisplayName',
      value: 'Fit',
      comment:
        'Display text representing the Fit value of ImagePosition enum (ImagePosition_Fit_Name). The possible values for this enumeration are: Fill, Fit, Stretch, Tile, Center.',
    },
    {
      name: 'ImagePosition_Stretch_DisplayName',
      value: 'Stretch',
      comment:
        'Display text representing the Stretch value of ImagePosition enum (ImagePosition_Stretch_Name). The possible values for this enumeration are: Fill, Fit, Stretch, Tile, Center.',
    },
    {
      name: 'ImagePosition_Tile_DisplayName',
      value: 'Tile',
      comment:
        'Display text representing the Tile value of ImagePosition enum (ImagePosition_Tile_Name). The possible values for this enumeration are: Fill, Fit, Stretch, Tile, Center.',
    },
    {
      name: 'ImagePosition_Center_DisplayName',
      value: 'Center',
      comment:
        'Display text representing the Center value of ImagePosition enum (ImagePosition_Center_Name). The possible values for this enumeration are: Fill, Fit, Stretch, Tile, Center.',
    },
    {
      name: 'VerticalAlign_Top_DisplayName',
      value: 'Top',
      comment:
        'Display text representing the Top value of VerticalAlign enum (VerticalAlign_Top_Name). The possible values for this enumeration are: Top, Middle, Bottom.',
    },
    {
      name: 'VerticalAlign_Middle_DisplayName',
      value: 'Middle',
      comment:
        'Display text representing the Middle value of VerticalAlign enum (VerticalAlign_Middle_Name). The possible values for this enumeration are: Top, Middle, Bottom.',
    },
    {
      name: 'VerticalAlign_Bottom_DisplayName',
      value: 'Bottom',
      comment:
        'Display text representing the Bottom value of VerticalAlign enum (VerticalAlign_Bottom_Name). The possible values for this enumeration are: Top, Middle, Bottom.',
    },
    {
      name: 'Layout_Horizontal_DisplayName',
      value: 'Horizontal',
      comment:
        'Display text representing the Horizontal value of Layout enum (Layout_Horizontal_Name). The possible values for this enumeration are: Horizontal, Vertical.',
    },
    {
      name: 'Layout_Vertical_DisplayName',
      value: 'Vertical',
      comment:
        'Display text representing the Vertical value of Layout enum (Layout_Vertical_Name). The possible values for this enumeration are: Horizontal, Vertical.',
    },
    {
      name: 'TextPosition_Left_DisplayName',
      value: 'Left',
      comment:
        'Display text representing the Left value of TextPosition enum (TextPosition_Left_Name). The possible values for this enumeration are: Left, Right.',
    },
    {
      name: 'TextPosition_Right_DisplayName',
      value: 'Right',
      comment:
        'Display text representing the Right value of TextPosition enum (TextPosition_Right_Name). The possible values for this enumeration are: Left, Right.',
    },
    {
      name: 'Transition_Push_DisplayName',
      value: 'Push',
      comment:
        "Display text representing the Push value of Transition enum (Transition_Push_Name) - when used in a gallery, the items will have a 'pushed down' effect when moused over. The possible values for this enumeration are: Push, Pop, None.",
    },
    {
      name: 'Transition_Pop_DisplayName',
      value: 'Pop',
      comment:
        "Display text representing the Pop value of Transition enum (Transition_Pop_Name) - when used in a gallery, the items will have a 'popped up' effect when moused over. The possible values for this enumeration are: Push, Pop, None.",
    },
    {
      name: 'Transition_None_DisplayName',
      value: 'None',
      comment:
        'Display text representing the None value of Transition enum (Transition_None_Name) - when used in a gallery, the items will have no effect when moused over. The possible values for this enumeration are: Push, Pop, None.',
    },
    {
      name: 'FontWeight_Normal_DisplayName',
      value: 'Normal',
      comment:
        'Display text representing the Normal value of FontWeight enum (FontWeight_Normal_Name). The possible values for this enumeration are: Normal, Semibold, Bold, Lighter.',
    },
    {
      name: 'FontWeight_Semibold_DisplayName',
      value: 'Semibold',
      comment:
        'Display text representing the Semibold value of FontWeight enum (FontWeight_Semibold_Name). The possible values for this enumeration are: Normal, Semibold, Bold, Lighter.',
    },
    {
      name: 'FontWeight_Bold_DisplayName',
      value: 'Bold',
      comment:
        'Display text representing the Bold value of FontWeight enum (FontWeight_Bold_Name). The possible values for this enumeration are: Normal, Semibold, Bold, Lighter.',
    },
    {
      name: 'FontWeight_Lighter_DisplayName',
      value: 'Lighter',
      comment:
        'Display text representing the Lighter value of FontWeight enum (FontWeight_Lighter_Name). The possible values for this enumeration are: Normal, Semibold, Bold, Lighter.',
    },
    {
      name: 'FormPattern_None_DisplayName',
      value: 'None',
      comment:
        'Display text representing the None value of FormPattern enum (FormPattern_None_Name). The possible values for this enumeration are: None, Details, List, CardList.',
    },
    {
      name: 'FormPattern_Details_DisplayName',
      value: 'Details',
      comment:
        'Display text representing the Details value of FormPattern enum (FormPattern_Details_Name). The possible values for this enumeration are: None, Details, List, CardList.',
    },
    {
      name: 'FormPattern_List_DisplayName',
      value: 'List',
      comment:
        'Display text representing the List value of FormPattern enum (FormPattern_List_Name). The possible values for this enumeration are: None, Details, List, CardList.',
    },
    {
      name: 'FormPattern_CardList_DisplayName',
      value: 'Card list',
      comment:
        'Display text representing the CardList value of FormPattern enum (FormPattern_CardList_Name). The possible values for this enumeration are: None, Details, List, CardList.',
    },
    {
      name: 'BarcodeType_Auto_DisplayName',
      value: 'Auto',
      comment:
        'Display text representing the Auto value of BarcodeType enum (BarcodeType_Auto_Name). This describes a type of barcode used for scanning. The possible values for this enumeration are: Auto, Aztec, Codabar, Code128, Code39, Code93, DataMatrix, Ean, I2of5, Pdf417, QRCode, Rss14, RssExpanded, Upc.',
    },
    {
      name: 'BarcodeType_Aztec_DisplayName',
      value: 'Aztec',
      comment:
        'Display text representing the Aztec value of BarcodeType enum (BarcodeType_Aztec_Name). This describes a type of barcode used for scanning. The possible values for this enumeration are: Auto, Aztec, Codabar, Code128, Code39, Code93, DataMatrix, Ean, I2of5, Pdf417, QRCode, Rss14, RssExpanded, Upc.',
    },
    {
      name: 'BarcodeType_Codabar_DisplayName',
      value: 'Codabar',
      comment:
        'Display text representing the Codabar value of BarcodeType enum (BarcodeType_Codabar_Name). This describes a type of barcode used for scanning. The possible values for this enumeration are: Auto, Aztec, Codabar, Code128, Code39, Code93, DataMatrix, Ean, I2of5, Pdf417, QRCode, Rss14, RssExpanded, Upc.',
    },
    {
      name: 'BarcodeType_DataMatrix_DisplayName',
      value: 'Data Matrix',
      comment:
        'Display text representing the DataMatrix value of BarcodeType enum (BarcodeType_DataMatrix_Name). This describes a type of barcode used for scanning. The possible values for this enumeration are: Auto, Aztec, Codabar, Code128, Code39, Code93, DataMatrix, Ean, I2of5, Pdf417, QRCode, Rss14, RssExpanded, Upc.',
    },
    {
      name: 'BarcodeType_Ean_DisplayName',
      value: 'EAN',
      comment:
        'Display text representing the Ean value of BarcodeType enum (BarcodeType_Ean_Name). This describes a type of barcode used for scanning. The possible values for this enumeration are: Auto, Aztec, Codabar, Code128, Code39, Code93, DataMatrix, Ean, I2of5, Pdf417, QRCode, Rss14, RssExpanded, Upc.',
    },
    {
      name: 'BarcodeType_QRCode_DisplayName',
      value: 'QR Code',
      comment:
        'Display text representing the QRCode value of BarcodeType enum (BarcodeType_QRCode_Name). This describes a type of barcode used for scanning. The possible values for this enumeration are: Auto, Aztec, Codabar, Code128, Code39, Code93, DataMatrix, Ean, I2of5, Pdf417, QRCode, Rss14, RssExpanded, Upc.',
    },
    {
      name: 'BarcodeType_RssExpanded_DisplayName',
      value: 'RSS Expanded',
      comment:
        'Display text representing the RssExpanded value of BarcodeType enum (BarcodeType_RssExpanded_Name). This describes a type of barcode used for scanning. The possible values for this enumeration are: Auto, Aztec, Codabar, Code128, Code39, Code93, DataMatrix, Ean, I2of5, Pdf417, QRCode, Rss14, RssExpanded, Upc.',
    },
    {
      name: 'BarcodeType_Upc_DisplayName',
      value: 'UPC',
      comment:
        'Display text representing the Upc value of BarcodeType enum (BarcodeType_Upc_Name). This describes a type of barcode used for scanning. The possible values for this enumeration are: Auto, Aztec, Codabar, Code128, Code39, Code93, DataMatrix, Ean, I2of5, Pdf417, QRCode, Rss14, RssExpanded, Upc.',
    },
    {
      name: 'GridStyle_XOnly_DisplayName',
      value: 'X only',
      comment:
        'Display text representing the XOnly value of GridStyle enum (GridStyle_XOnly_Name). This describes an x axis only style grid. The possible values for this enumeration are: XOnly, YOnly, All, None.',
    },
    {
      name: 'GridStyle_YOnly_DisplayName',
      value: 'Y only',
      comment:
        'Display text representing the YOnly value of GridStyle enum (GridStyle_YOnly_Name). This describes a y axis only style grid. The possible values for this enumeration are: XOnly, YOnly, All, None.',
    },
    {
      name: 'GridStyle_All_DisplayName',
      value: 'All',
      comment:
        'Display text representing the All value of GridStyle enum (GridStyle_All_Name). This describes a grid with both x and y axis style. The possible values for this enumeration are: XOnly, YOnly, All, None.',
    },
    {
      name: 'GridStyle_None_DisplayName',
      value: 'None',
      comment:
        'Display text representing the None value of GridStyle enum (GridStyle_None_Name). This describes a grid with neither x nor y axis style. The possible values for this enumeration are: XOnly, YOnly, All, None.',
    },
    {
      name: 'FormMode_Edit_DisplayName',
      value: 'Edit',
      comment:
        'Display text representing the Edit value of FormMode enum (FormMode_Edit_Name). This describes a form in edit mode. The possible values for this enumeration are: Edit, New, View.',
    },
    {
      name: 'FormMode_View_DisplayName',
      value: 'View',
      comment:
        'Display text representing the View value of FormMode enum (FormMode_View_Name). This describes a form in view mode. The possible values for this enumeration are: Edit, New, View.',
    },
    {
      name: 'FormMode_New_DisplayName',
      value: 'New',
      comment:
        'Display text representing the New value of FormMode enum (FormMode_New_Name). This describes a form in new mode. The possible values for this enumeration are: Edit, New, View.',
    },
    {
      name: 'SelectedState_Edit_DisplayName',
      value: 'Edit',
      comment:
        'Display text representing the Edit value of SelectedState enum (SelectedState_Edit_Name). This describes a form in edit mode. The possible values for this enumeration are: Edit, New, View.',
    },
    {
      name: 'SelectedState_View_DisplayName',
      value: 'View',
      comment:
        'Display text representing the View value of SelectedState enum (SelectedState_View_Name). This describes a form in view mode. The possible values for this enumeration are: Edit, New, View.',
    },
    {
      name: 'SelectedState_New_DisplayName',
      value: 'New',
      comment:
        'Display text representing the New value of SelectedState enum (SelectedState_New_Name). This describes a form in new mode. The possible values for this enumeration are: Edit, New, View.',
    },
    {
      name: 'LoadingSpinner_Controls_DisplayName',
      value: 'Controls',
      comment:
        'Display text representing the Controls value of LoadingSpinner enum (LoadingSpinner_Controls_Name). This describes showing a loading spinner while a controls children controls load. The possible values for this enumeration are: Controls, Data, None.',
    },
    {
      name: 'LoadingSpinner_Data_DisplayName',
      value: 'Data',
      comment:
        'Display text representing the Data value of LoadingSpinner enum (LoadingSpinner_Data_Name). This describes showing a loading spinner while a controls data loads. The possible values for this enumeration are: Controls, Data, None.',
    },
    {
      name: 'LoadingSpinner_None_DisplayName',
      value: 'None',
      comment:
        'Display text representing the None value of LoadingSpinner enum (LoadingSpinner_None_Name). This describes not showing a loading spinner at all. The possible values for this enumeration are: Controls, Data, None.',
    },
    {
      name: 'NotificationType_Error_DisplayName',
      value: 'Error',
      comment:
        'Display text representing the Error value of NotificationType enum (NotificationType_Error_Name). This describes showing an error notification. The possible values for this enumeration are: Error, Warning, Success, Information.',
    },
    {
      name: 'NotificationType_Warning_DisplayName',
      value: 'Warning',
      comment:
        'Display text representing the Warning value of NotificationType enum (NotificationType_Warning_Name). This describes showing an warning notification. The possible values for this enumeration are: Error, Warning, Success, Information.',
    },
    {
      name: 'NotificationType_Success_DisplayName',
      value: 'Success',
      comment:
        'Display text representing the Error value of NotificationType enum (NotificationType_Success_Name). This describes showing an success notification. The possible values for this enumeration are: Error, Warning, Success, Information.',
    },
    {
      name: 'NotificationType_Information_DisplayName',
      value: 'Information',
      comment:
        'Display text representing the Error value of NotificationType enum (NotificationType_Information_Name). This describes showing an information notification. The possible values for this enumeration are: Error, Warning, Success, Information.',
    },
    {
      name: 'Icon_Add_DisplayName',
      value: 'Add',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Add value.',
    },
    {
      name: 'Icon_Cancel_DisplayName',
      value: 'Cancel',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Cancel value.',
    },
    {
      name: 'Icon_Edit_DisplayName',
      value: 'Edit',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Edit value.',
    },
    {
      name: 'Icon_Check_DisplayName',
      value: 'Check',
      comment:
        'This string represents an icon with a checkmark (Unicode U+2713). Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Check value.',
    },
    {
      name: 'Icon_Search_DisplayName',
      value: 'Search',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Search value.',
    },
    {
      name: 'Icon_Filter_DisplayName',
      value: 'Filter',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Filter value.',
    },
    {
      name: 'Icon_Sort_DisplayName',
      value: 'Sort',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Sort value.',
    },
    {
      name: 'Icon_Reload_DisplayName',
      value: 'Reload',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Reload value.',
    },
    {
      name: 'Icon_Trash_DisplayName',
      value: 'Trash',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Trash value.',
    },
    {
      name: 'Icon_Save_DisplayName',
      value: 'Save',
      comment:
        'Icon control name representing the act of saving a file, symbolized with a diskette. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Save value.',
    },
    {
      name: 'Icon_Download_DisplayName',
      value: 'Download',
      comment:
        'Icon control name representing a file download. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Download value.',
    },
    {
      name: 'Icon_Copy_DisplayName',
      value: 'Copy',
      comment:
        'Icon control name representing the act of copying, symbolized with two rectangles, one of top of the other. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Copy value.',
    },
    {
      name: 'Icon_LikeDislike_DisplayName',
      value: 'Like / Dislike',
      comment:
        'Icon control name representing the act of liking or disliking. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the LikeDislike value.',
    },
    {
      name: 'Icon_Crop_DisplayName',
      value: 'Crop',
      comment:
        'Crop is used here in the verb context, meaning to cut / trim, usually associated with images. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Crop value.',
    },
    {
      name: 'Icon_Pin_DisplayName',
      value: 'Pin',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Pin value.',
    },
    {
      name: 'Icon_ClearDrawing_DisplayName',
      value: 'Clear drawing',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ClearDrawing value.',
    },
    {
      name: 'Icon_ExpandView_DisplayName',
      value: 'Expand view',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ExpandView value.',
    },
    {
      name: 'Icon_CollapseView_DisplayName',
      value: 'Collapse view',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the CollapseView value.',
    },
    {
      name: 'Icon_Draw_DisplayName',
      value: 'Draw',
      comment:
        'Draw is used here in the verb context, like in drawing a picture or an image. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Draw value.',
    },
    {
      name: 'Icon_Compose_DisplayName',
      value: 'Compose',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Compose value.',
    },
    {
      name: 'Icon_Erase_DisplayName',
      value: 'Erase',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Erase value.',
    },
    {
      name: 'Icon_Message_DisplayName',
      value: 'Message',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Message value.',
    },
    {
      name: 'Icon_Post_DisplayName',
      value: 'Post',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Post value.',
    },
    {
      name: 'Icon_AddDocument_DisplayName',
      value: 'Add document',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the AddDocument value.',
    },
    {
      name: 'Icon_AddLibrary_DisplayName',
      value: 'Add library',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the AddLibrary value.',
    },
    {
      name: 'Icon_Home_DisplayName',
      value: 'Home',
      comment:
        'Home here is representing a home navigation button. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Home value.',
    },
    {
      name: 'Icon_Hamburger_DisplayName',
      value: 'Hamburger',
      comment:
        'Icon control name representing a hamburger-style menu button. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Hamburger value.',
    },
    {
      name: 'Icon_Settings_DisplayName',
      value: 'Settings',
      comment:
        'Icon control name representing software settings. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Settings value.',
    },
    {
      name: 'Icon_More_DisplayName',
      value: 'More',
      comment:
        'Icon control name representing an ellipsis, symbolized with a set of dots. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the More value.',
    },
    {
      name: 'Icon_Waffle_DisplayName',
      value: 'Waffle',
      comment:
        'Icon control name representing a waffle-style menu button. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Waffle value.',
    },
    {
      name: 'Icon_ChevronLeft_DisplayName',
      value: 'Left',
      comment:
        'Icon control name representing an arrow head shape which is pointing left (it is image which looks like a less than sign). Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ChevronLeft value.',
    },
    {
      name: 'Icon_ChevronRight_DisplayName',
      value: 'Right',
      comment:
        'Icon control name representing an arrow head shape which is pointing right (it is image which looks like a greater than sign). Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ChevronRight value.',
    },
    {
      name: 'Icon_ChevronUp_DisplayName',
      value: 'Up',
      comment:
        "Icon control name representing an arrow head shape which is pointing up (it is image which looks like this '^'). Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ChevronUp value.",
    },
    {
      name: 'Icon_ChevronDown_DisplayName',
      value: 'Down',
      comment:
        "Icon control name representing an arrow head shape which is pointing down (it is image which looks like this 'v'). Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ChevronDown value.",
    },
    {
      name: 'Icon_NextArrow_DisplayName',
      value: 'Next',
      comment:
        "Icon with an arrow pointing right, representing a 'next' or 'forward' action in an app. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the NextArrow value.",
    },
    {
      name: 'Icon_BackArrow_DisplayName',
      value: 'Back',
      comment:
        "Icon with an arrow pointing left, representing a 'back' action in an app. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the BackArrow value.",
    },
    {
      name: 'Icon_ArrowDown_DisplayName',
      value: 'Arrow down',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ArrowDown value.',
    },
    {
      name: 'Icon_ArrowUp_DisplayName',
      value: 'Arrow up',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ArrowUp value.',
    },
    {
      name: 'Icon_ArrowLeft_DisplayName',
      value: 'Arrow left',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ArrowLeft value.',
    },
    {
      name: 'Icon_ArrowRight_DisplayName',
      value: 'Arrow right',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ArrowRight value.',
    },
    {
      name: 'Icon_Camera_DisplayName',
      value: 'Camera',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Camera value.',
    },
    {
      name: 'Icon_Document_DisplayName',
      value: 'Document',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Document value.',
    },
    {
      name: 'Icon_DockCheckProperties_DisplayName',
      value: 'Document checkmark',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the DockCheckProperties value.',
    },
    {
      name: 'Icon_Folder_DisplayName',
      value: 'Folder',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Folder value.',
    },
    {
      name: 'Icon_Journal_DisplayName',
      value: 'Journal',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Journal value.',
    },
    {
      name: 'Icon_ForkKnife_DisplayName',
      value: 'Food',
      comment:
        'Icon control name representing food, symbolized with a knife and fork. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ForkKnife value.',
    },
    {
      name: 'Icon_Transportation_DisplayName',
      value: 'Transportation',
      comment:
        'Icon control name representing an assortment of transportation modes. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Transportation value.',
    },
    {
      name: 'Icon_Airplane_DisplayName',
      value: 'Airplane',
      comment:
        'Icon control name representing an airplane. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Airplane value.',
    },
    {
      name: 'Icon_Bus_DisplayName',
      value: 'Bus',
      comment:
        'Icon control name representing a transit bus. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Bus value.',
    },
    {
      name: 'Icon_Cars_DisplayName',
      value: 'Cars',
      comment:
        'Icon control name representing a group of cars. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Cars value.',
    },
    {
      name: 'Icon_Money_DisplayName',
      value: 'Money',
      comment:
        'Icon control name representing money, symbolized with a coin with a dollar sign on it. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Money value.',
    },
    {
      name: 'Icon_Currency_DisplayName',
      value: 'Currency',
      comment:
        'Icon control name representing currency, symbolized by coins with different currency signs. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Currency value.',
    },
    {
      name: 'Icon_AddToCalendar_DisplayName',
      value: 'Add to calendar',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the AddToCalendar value.',
    },
    {
      name: 'Icon_CalendarBlank_DisplayName',
      value: 'Calendar blank',
      comment:
        'This string represents an icon of an empty calendar. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the CalendarBlank value.',
    },
    {
      name: 'Icon_OfficeBuilding_DisplayName',
      value: 'Office building',
      comment:
        'Icon control name representing an office building. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the OfficeBuilding value.',
    },
    {
      name: 'Icon_PaperClip_DisplayName',
      value: 'Paper clip',
      comment:
        'Icon control name representing a file attachment, symbolized with a paperclip. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the PaperClip value.',
    },
    {
      name: 'Icon_Newspaper_DisplayName',
      value: 'Newspaper',
      comment:
        'Icon control name representing a newspaper. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Newspaper value.',
    },
    {
      name: 'Icon_Lock_DisplayName',
      value: 'Lock',
      comment:
        'Icon control name representing a lock, symbolized with a padlock. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Lock value.',
    },
    {
      name: 'Icon_Waypoint_DisplayName',
      value: 'Waypoint',
      comment:
        'Icon control name representing a mapping destination. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Waypoint value.',
    },
    {
      name: 'Icon_Location_DisplayName',
      value: 'Location',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Location value.',
    },
    {
      name: 'Icon_DocumentPDF_DisplayName',
      value: 'PDF document',
      comment:
        'Icon control name representing a PDF document. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the DocumentPDF value.',
    },
    {
      name: 'Icon_Bell_DisplayName',
      value: 'Bell',
      comment:
        'Icon control name representing a bell. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Bell value.',
    },
    {
      name: 'Icon_ShoppingCart_DisplayName',
      value: 'Shopping cart',
      comment:
        'Icon control name representing a shopping cart. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ShoppingCart value.',
    },
    {
      name: 'Icon_Phone_DisplayName',
      value: 'Phone',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Phone value.',
    },
    {
      name: 'Icon_PhoneHangUp_DisplayName',
      value: 'End call',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the PhoneHangUp value.',
    },
    {
      name: 'Icon_Mobile_DisplayName',
      value: 'Mobile',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Mobile value.',
    },
    {
      name: 'Icon_Laptop_DisplayName',
      value: 'Laptop',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Laptop value.',
    },
    {
      name: 'Icon_ComputerDesktop_DisplayName',
      value: 'Computer desktop',
      comment:
        'This string represents an icon of a desktop computer. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ComputerDesktop value.',
    },
    {
      name: 'Icon_Devices_DisplayName',
      value: 'Devices',
      comment:
        'This string represents an icon of multiple electronic devices (computer and phone). Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Laptop value.',
    },
    {
      name: 'Icon_Controller_DisplayName',
      value: 'Controller',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Controller value.',
    },
    {
      name: 'Icon_Tools_DisplayName',
      value: 'Tools',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Tools value.',
    },
    {
      name: 'Icon_ToolsWrench_DisplayName',
      value: 'Tools wrench',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ToolsWrench value.',
    },
    {
      name: 'Icon_Mail_DisplayName',
      value: 'Mail',
      comment:
        'This string represents an icon of an envelope. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Mail value.',
    },
    {
      name: 'Icon_Send_DisplayName',
      value: 'Send',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Send value.',
    },
    {
      name: 'Icon_Clock_DisplayName',
      value: 'Clock',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Clock value.',
    },
    {
      name: 'Icon_ListWatchlistRemind_DisplayName',
      value: 'List reminder',
      comment:
        "This string represents an icon of a paper with a pushpin on it - the term 'List' is a noun. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ListWatchlistRemind value.",
    },
    {
      name: 'Icon_LogJournal_DisplayName',
      value: 'Log journal',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the LogJournal value.',
    },
    {
      name: 'Icon_Note_DisplayName',
      value: 'Note',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Note value.',
    },
    {
      name: 'Icon_PhotosPictures_DisplayName',
      value: 'Picture frames',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the PhotosPictures value.',
    },
    {
      name: 'Icon_RadarActivityMonitor_DisplayName',
      value: 'Radar',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the RadarActivityMonitor value.',
    },
    {
      name: 'Icon_Tablet_DisplayName',
      value: 'Tablet',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Tablet value.',
    },
    {
      name: 'Icon_Tag_DisplayName',
      value: 'Tag',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Tag value.',
    },
    {
      name: 'Icon_CameraAperture_DisplayName',
      value: 'Camera aperture',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the CameraAperture value.',
    },
    {
      name: 'Icon_ColorPicker_DisplayName',
      value: 'Color picker',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ColorPicker value.',
    },
    {
      name: 'Icon_DetailList_DisplayName',
      value: 'Detail list',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the DetailList value.',
    },
    {
      name: 'Icon_DocumentWithContent_DisplayName',
      value: 'Document with content',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the DocumentWithContent value.',
    },
    {
      name: 'Icon_ListScrollEmpty_DisplayName',
      value: 'List scroll empty',
      comment:
        "This string represents an icon of a blank scroll (paper) - the term 'List' is a noun. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ListScrollEmpty value.",
    },
    {
      name: 'Icon_ListScrollWatchlist_DisplayName',
      value: 'List scroll watchlist',
      comment:
        "This string represents an icon of a scroll (paper) with lines - the term 'List' is a noun. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the ListScrollWatchlist value.",
    },
    {
      name: 'Icon_OptionsList_DisplayName',
      value: 'Options list',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the OptionsList value.',
    },
    {
      name: 'Icon_People_DisplayName',
      value: 'People',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the People value.',
    },
    {
      name: 'Icon_Person_DisplayName',
      value: 'Person',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Person value.',
    },
    {
      name: 'Icon_EmojiFrown_DisplayName',
      value: 'Emoji - Frown',
      comment:
        'Icon control name representing an emoji of a face with an upset expression. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the EmojiFrown value.',
    },
    {
      name: 'Icon_EmojiSmile_DisplayName',
      value: 'Emoji - Smile',
      comment:
        'Icon control name representing an emoji of a face with a happy expression. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the EmojiSmile value.',
    },
    {
      name: 'Icon_EmojiSad_DisplayName',
      value: 'Emoji - Sad',
      comment:
        'Icon control name representing an emoji of a face with a sad expression. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the EmojiSad value.',
    },
    {
      name: 'Icon_EmojiNeutral_DisplayName',
      value: 'Emoji - Neutral',
      comment:
        'Icon control name representing an emoji of a face with a neutral expression. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the EmojiNeutral value.',
    },
    {
      name: 'Icon_Warning_DisplayName',
      value: 'Warning',
      comment:
        'Icon control name representing a cautionary warning. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Warning value.',
    },
    {
      name: 'Icon_Information_DisplayName',
      value: 'Information',
      comment:
        'Icon control name representing helpful information. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Information value.',
    },
    {
      name: 'Icon_Database_DisplayName',
      value: 'Database',
      comment:
        'Icon control name representing data, symbolized by the flowchart shape of stacked cylinders. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Database value.',
    },
    {
      name: 'Icon_Weather_DisplayName',
      value: 'Weather',
      comment:
        'Icon control name representing weather. Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Weather value.',
    },
    {
      name: 'Icon_TrendingHashtag_DisplayName',
      value: 'Hashtag',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the TrendingHashtag value.',
    },
    {
      name: 'Icon_TrendingUpwards_DisplayName',
      value: 'Trending upward',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the TrendingUpwards value.',
    },
    {
      name: 'Icon_Items_DisplayName',
      value: 'Items',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Items value.',
    },
    {
      name: 'Icon_LevelsLayersItems_DisplayName',
      value: 'Layers',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the LevelsLayersItems value.',
    },
    {
      name: 'Icon_Trending_DisplayName',
      value: 'Trending',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the Trending value.',
    },
    {
      name: 'Icon_LineWeight_DisplayName',
      value: 'Line weight',
      comment:
        'Display text representing the value of Icon enum that will be shown in the icon control. This value represents the LineWeight value.',
    },
    {
      name: 'AboutIsError',
      value: 'Returns whether an error occurred when evaluating the given argument.',
      comment: "Description text for the 'IsError' function.",
    },
    {
      name: 'IsErrorArg',
      value: 'value',
      comment:
        'function_parameter - First argument to the IsError function - any value, to check if there was an error in producing it.',
    },
    {
      name: 'AboutIsError_value',
      value: 'The value to check for errors.',
      comment: 'Description of the first parameter to IsError',
    },
    {
      name: 'ErrBadArityMinimum',
      value: 'Invalid number of arguments: received {0}, expected {1} or more.',
      comment: 'Error Message. {0} Will be a number, and {1} will be a number, the minimum number of arguments.',
    },
    {
      name: 'ErrBadArityRange',
      value: 'Invalid number of arguments: received {0}, expected {1}-{2}.',
      comment:
        'Error Message. {0} Will be a number, and {1} will be the minimum arity and {2} will be the maximum arity',
    },
    {
      name: 'ErrGeneralError',
      value: '{0}',
      comment:
        'Error message. {0} will be replaced with the contents of the message. In a few specific instances, we pull error messages from a source other than this file, but we need a error key in this file to attach it to, hence why we have an error message that is only a format specifier.',
    },
    {
      name: 'FormulaColumns_NotSupported',
      value: 'Not supported in formula columns.',
      comment:
        'Error Message. Used in formula columns for scenarios where there the full PowerApps support is not available.',
    },
    {
      name: 'FormulaColumns_ArgNotSupported',
      value: 'The {0} argument is not supported for the {1} function in formula columns.',
      comment:
        'Error Message. Used in formula columns for arguments that are not supported there.  The {0} will be the name of the argument that is not supported.  The {1} will be the name of the function.',
    },
    {
      name: 'FormulaColumns_ArgTypeNotSupported',
      value: 'This argument can not be passed as this type in formula columns.',
      comment: 'Error Message. Used in formula columns for an argument where the type is not supported.',
    },
    {
      name: 'FormulaColumns_LiteralArgRequired',
      value: 'Only a literal value is supported for this argument.',
      comment:
        'Error Message. Used in formula columns for arguments where the value supplied must be a literal value (for example, a number or a string), instead of a calculation.',
    },
    {
      name: 'FormulaColumns_TimeZoneConversion',
      value:
        '{0} cannot be performed on this input without a time zone conversion, which is not supported in formula columns.',
      comment:
        'Error Message. Used in formula columns for scenarios where time zone conversion is needed to perform the operation. The {0} will be the name of the function.',
    },
    {
      name: 'FormulaColumns_IncompatibleDateTimes',
      value: 'This operation cannot be performed on values which are of different Date Time Behaviors.',
      comment:
        'Error Message. Used in formula columns for scenarios where values of different Date Time Behaviors are used together, which is not supported',
    },
    {
      name: 'FormulaColumns_DateTimeFormatNotSupported',
      value: 'Only the short date and time format strings are supported in formula columns.',
      comment: 'Error Message. Used in formula columns for scenarios where the maker supplies an invalid format string',
    },
    {
      name: 'FormulaColumns_NumericFormatNotSupported',
      value: 'Locale-specific formatting tokens such as "." and "," are not supported in formula columns.',
      comment: 'Error Message. Used in formula columns for scenarios where the maker supplies an invalid format string',
    },
    {
      name: 'FormulaColumns_FunctionNotSupported',
      value: '{0} is not supported in formula columns, use {1} instead.',
      comment:
        'Error Message. Used in formula columns for scenarios where the maker attempts to use a function that is not supported, providing an alternate function name.  The {0} will be the name of the function that is not supported, and {1} is the name of the suggested alternate.',
    },
    {
      name: 'FormulaColumns_ResultTypeNotSupported',
      value: 'This result type {0} is not supported in formula columns.',
      comment: 'Error Message. Used in formula columns for a formula that returns a type which is not supported.',
    },
    {
      name: 'FormulaColumns_ResultTypeMustMatch',
      value:
        'The result type for this formula is expected to be {0}, but the actual result type is {1}. The result type of a formula column cannot be changed.',
      comment:
        'Error Message. Used in formula columns for a formula that returns an unexpected result type during editing. The {0} will be the name of the required type. The {1} will be the name of the incorrect type.',
    },
    {
      name: 'ErrorResource_ErrOperandExpected_ShortMessage',
      value:
        "Expected an operand. The formula or expression expects a valid operand. For example, you can add the operand '2' to the expression ' 1 +_' so that the result is '3'. Or, you can add the operand \"there\" to the expression '\"Hi \"& _ ' so that the result is 'Hi there'.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrOperandExpected_HowToFix_1',
      value:
        "Supply an operand value that will complete the expression. Ensure that the operand's type (text, number, date, or true/false) fits the expression. Match numbers with numbers, text with text, and so on. For example, '1 + \"Hi\"' isn't valid, but '1 + 2' is valid.",
      comment: 'How to fix the error.',
    },
    {
      name: 'ErrorResource_ErrBadToken_ShortMessage',
      value: 'Unexpected characters. Characters are used in the formula in an unexpected way.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrBadToken_LongMessage',
      value:
        "For example, the character '\\' isn't expected after a number, like this: '32\\'. A space ('32') would be expected so that it's just the number 32, or another number (as in '323') would be expected.",
    },
    {
      name: 'ErrorResource_ErrBadToken_HowToFix_1',
      value: 'Remove or replace the unexpected characters.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrBadToken_Link_1',
      value: 'Article: Formula reference for Power Apps',
      comment: 'Article: Formula reference for Power Apps',
    },
    {
      name: 'ErrorResource_ErrBadToken_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132478',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_UnexpectedCharacterToken_ShortMessage',
      value: "Unexpected character '{0}' at position '{1}' in the formula.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_UnexpectedCharacterToken_LongMessage',
      value:
        "For example, the character '\\' isn't expected after a number, like this: '32\\'. A space ('32') would be expected so that it's just the number 32, or another number (as in '323') would be expected.",
    },
    {
      name: 'ErrorResource_UnexpectedCharacterToken_HowToFix_1',
      value: 'Remove or replace the unexpected character.',
    },
    {
      name: 'ErrorResource_UnexpectedCharacterToken_Link_1',
      value: 'Article: Formula reference for Power Apps',
      comment: 'Article: Formula reference for Power Apps',
    },
    {
      name: 'ErrorResource_UnexpectedCharacterToken_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132478',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrMissingEndOfBlockComment_ShortMessage',
      value: 'Missing end-comment identifier. The block comment has no end-comment identifier.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrMissingEndOfBlockComment_LongMessage',
      value:
        "Each block comment must start with '/*' and end with '*/'. If you don't end each block comment properly, all code after the comment becomes part of that comment. If a comment comprises only one line, you can start it with '//' and not identify the end of the comment.",
    },
    {
      name: 'ErrorResource_ErrMissingEndOfBlockComment_HowToFix_1',
      value: "Add '*/' to the end of your block comment, or change it to a set of line comments.",
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrMissingEndOfBlockComment_Link_1',
      value: 'Article: Formula reference for Power Apps',
      comment: 'Article: Formula reference for Power Apps',
    },
    {
      name: 'ErrorResource_ErrMissingEndOfBlockComment_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132478',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrExpectedFound_Ex_Fnd_ShortMessage',
      value: "Unexpected characters. The formula contains '{0}' where '{1}' is expected.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrExpectedFound_Ex_Fnd_LongMessage',
      value:
        "This error occurs if, for example, a formula contains '{{Val@ 7}}' instead of '{{Val: 7}}'. When you set a variable, the syntax requires a colon instead of an \"at\" symbol.",
    },
    {
      name: 'ErrorResource_ErrExpectedFound_Ex_Fnd_HowToFix_1',
      value: 'Remove or replace the unexpected characters with an expected character.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrExpectedFound_Ex_Fnd_Link_1',
      value: 'Article: Formula reference for Power Apps',
      comment: 'Article: Formula reference for Power Apps',
    },
    {
      name: 'ErrorResource_ErrExpectedFound_Ex_Fnd_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132478',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrInvalidName_ShortMessage',
      value: "Name isn't valid. This identifier isn't recognized.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrInvalidName_LongMessage',
      value:
        "This error appears most commonly when a formula refers to something that no longer exists (for example, a control that you've deleted).",
    },
    {
      name: 'ErrorResource_ErrInvalidName_HowToFix_1',
      value: "Remove or correct the reference to the name that isn't valid.",
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrInvalidName_Link_1',
      value: 'Article: Formula reference for Power Apps',
      comment: 'Article: Formula reference for Power Apps',
    },
    {
      name: 'ErrorResource_ErrInvalidName_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132478',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrInvalidPropertyReference_ShortMessage',
      value: "Property reference isn't valid.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrInvalidPropertyReference_LongMessage',
      value:
        'This error appears when a formula refers to component behavior properties with invalid syntax. (For example, Component.OnCustomChange instead of Component.OnCustomChange())',
    },
    {
      name: 'ErrorResource_ErrInvalidPropertyReference_HowToFix_1',
      value: 'Use correct syntax to refer to component behavior property. For example, Component.OnCustomChange()',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrInvalidPropertyReference_Link_1',
      value: 'Article: Formula reference for PowerApps',
      comment: 'Article: Formula reference for PowerApps',
    },
    {
      name: 'ErrorResource_ErrInvalidPropertyReference_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132478',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrInvalidParentUse_ShortMessage',
      value: "'Parent' reference isn't valid. You can't reference a parent control in this context.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrInvalidParentUse_LongMessage',
      value:
        "You can't use the Parent operator with a control that doesn't have a parent control. This operator refers to the control that hosts the given control and makes all of its properties available.",
    },
    {
      name: 'ErrorResource_ErrInvalidParentUse_HowToFix_1',
      value: "Remove the 'Parent' operator.",
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrInvalidParentUse_Link_1',
      value: 'Article: Add and configure a canvas-app control in Power Apps',
      comment: 'Article on UI design - working with controls ',
    },
    {
      name: 'ErrorResource_ErrInvalidParentUse_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2119116',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrTooManyUps_ShortMessage',
      value: "Row-scope nesting too deep. Your formula's row scope exceeds 63 nesting levels.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrTooManyUps_LongMessage',
      value:
        'Complexity increases with each nesting level, so Power Apps supports row-scope nesting only up to 63 levels.',
    },
    {
      name: 'ErrorResource_ErrTooManyUps_HowToFix_1',
      value: 'Rewrite the formula with fewer nesting levels.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrRuleNestedTooDeeply_ShortMessage',
      value: 'Expression nesting too deep. An expression in your formula is nested more than 50 levels.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrRuleNestedTooDeeply_LongMessage',
      value:
        'Power Apps supports expression nesting up to only 50 levels. An expression this deep is difficult to understand and maintain.',
    },
    {
      name: 'ErrorResource_ErrRuleNestedTooDeeply_HowToFix_1',
      value: 'Rewrite the formula with fewer nesting levels.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrOperatorExpected_ShortMessage',
      value: 'Expected operator. We expect an operator such as +, *, or & at this point in the formula.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrOperatorExpected_LongMessage',
      value:
        'Operators join two operands together. This error occurs if you put two functions (operands) together with no operator between them -- for example, Len("mytext")Len("mytext").',
    },
    {
      name: 'ErrorResource_ErrOperatorExpected_HowToFix_1',
      value: 'Edit your formula so that it includes an operator between the operands.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrOperatorExpected_Link_1',
      value: 'Module: Use basic formulas',
      comment: '3 crown link on basic formulas',
    },
    {
      name: 'ErrorResource_ErrOperatorExpected_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132396',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrNumberExpected_ShortMessage',
      value: 'Expected number. We expect a number at this point in the formula.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrNumberExpected_LongMessage',
      value:
        'This error will occur if you use a function that requires a number but you supply, for example, an image instead.',
    },
    {
      name: 'ErrorResource_ErrNumberExpected_HowToFix_1',
      value: 'Edit your formula so that it evaluates to a number at this point in the formula.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrNumberExpected_Link_1',
      value: 'Article: Formula reference for Power Apps',
      comment: 'Article: Formula reference for Power Apps',
    },
    {
      name: 'ErrorResource_ErrNumberExpected_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132478',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrBooleanExpected_ShortMessage',
      value: 'Expected boolean. We expect a boolean (true/false) at this point in the formula.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrBooleanExpected_LongMessage',
      value:
        'A boolean is also known as a true/false value in applications such as Microsoft Excel. This error will occur if you use a function that requires a boolean but you supply, for example, a date instead.',
    },
    {
      name: 'ErrorResource_ErrBooleanExpected_HowToFix_1',
      value: 'Edit your formula so that it evaluates to a boolean at this point in the formula.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrBooleanExpected_Link_1',
      value: 'Article: Formula reference for Power Apps',
      comment: 'Article: Formula reference for Power Apps',
    },
    {
      name: 'ErrorResource_ErrBooleanExpected_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132478',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrColonExpected_ShortMessage',
      value: 'Expected colon. We expect a colon (:) at this point in the formula.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrColonExpected_LongMessage',
      value:
        'A colon separates a field name, sometimes called a column name, from a field value in a record (for example, {Month:"1"}, {Month:"2"} …). A colon also separates hours from minutes and seconds (for example, "3:04").',
    },
    {
      name: 'ErrorResource_ErrColonExpected_HowToFix_1',
      value: 'Edit your formula so that it includes a colon.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrColonExpected_Link_1',
      value: 'Article: Show text, dates, and times in Power Apps',
      comment: 'Article: Show text, dates, and times ',
    },
    {
      name: 'ErrorResource_ErrColonExpected_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132645',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrBehaviorPropertyExpected_ShortMessage',
      value:
        "Behavior function in a non-behavior property. You can't use this property to change values elsewhere in the app.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrBehaviorPropertyExpected_LongMessage',
      value:
        "Behavior functions change the state of the app by changing values elsewhere in the app. 'Navigate', 'Patch', 'UpdateContext', and 'Collect' are common behavior functions. 'OnSelect', 'OnVisible', and other 'On …' properties are common behavior-based properties.",
    },
    {
      name: 'ErrorResource_ErrBehaviorPropertyExpected_HowToFix_1',
      value: 'Move the behavior function to a behavior-based property.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrBehaviorPropertyExpected_Link_1',
      value: 'Article: Understand behavior formulas for canvas apps in Power Apps',
      comment: 'Article: Understand behavior formulas',
    },
    {
      name: 'ErrorResource_ErrBehaviorPropertyExpected_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132570',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrTestPropertyExpected_ShortMessage',
      value: "Test function in a non-test property. You can't use this property to invoke test-only functions.",
      comment: "Error Message. The term 'Test' is an adjective ('Test function' = 'function for testing').",
    },
    {
      name: 'ErrorResource_ErrTestPropertyExpected_LongMessage',
      value:
        "Test functions are those that can be used to simulate user input when testing an app. 'SetProperty', 'SelectRow', and 'Assert' are common test functions. They can only be used in the in test cases.",
    },
    {
      name: 'ErrorResource_ErrTestPropertyExpected_HowToFix_1',
      value: 'Use the function in a test case, not in the app itself.',
      comment: 'How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrCannotCoerce_SourceType_TargetType_ShortMessage',
      value: "Can't convert this data type. Power Apps can't convert this {0} to a {1}.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrCannotCoerce_SourceType_TargetType_LongMessage',
      value:
        'Power Apps can convert some types of data in your formula to other types for you. For example, it can convert "1" (a string) to a 1 (a number), but it can\'t all data types to all other data type. For example, it can\'t convert an image to a number.',
    },
    {
      name: 'ErrorResource_ErrCannotCoerce_SourceType_TargetType_HowToFix_1',
      value: 'Edit your formula so that you convert the data in question to the expected type.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrStringExpected_ShortMessage',
      value: 'Expected text. We expect text at this point in the formula.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrStringExpected_LongMessage',
      value:
        'This error occurs if you use a function that requires a text (or string) argument and you supply, for example, a date instead.',
    },
    {
      name: 'ErrorResource_ErrStringExpected_HowToFix_1',
      value: 'Edit your formula so that it evaluates to text at this point in the formula.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrStringExpected_Link_1',
      value: 'Article: Formula reference for Power Apps',
      comment: 'Article: Formula reference for Power Apps',
    },
    {
      name: 'ErrorResource_ErrStringExpected_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132478',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrNumberOrStringExpected_ShortMessage',
      value: 'Expected text or number. We expect text or a number at this point in the formula.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrNumberOrStringExpected_LongMessage',
      value:
        'This error will occur if you use a function that requires either text or a number but you supply, for example, a boolean (true/false) value.',
    },
    {
      name: 'ErrorResource_ErrNumberOrStringExpected_HowToFix_1',
      value: 'Edit your formula so that it evaluates to text or a number at this point in the formula.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrNumberOrStringExpected_Link_1',
      value: 'Article: Formula reference for Power Apps',
      comment: 'Article: Formula reference for Power Apps',
    },
    {
      name: 'ErrorResource_ErrNumberOrStringExpected_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132478',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrClosingBracketExpected_ShortMessage',
      value: 'Expected closing bracket. We expect a closing bracket (}) at this point in the formula.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrClosingBracketExpected_LongMessage',
      value: 'A closing bracket indicates the end of a record (for example, {Month:"1"}, {Month:"2"} …).',
    },
    {
      name: 'ErrorResource_ErrClosingBracketExpected_HowToFix_1',
      value: 'Edit your formula so that it includes a bracket.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrEmptyInvalidIdentifier_ShortMessage',
      value: 'The identifier has no valid text.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrEmptyInvalidIdentifier_HowToFix_1',
      value: 'Ensure you have text for your identifier. This error occurs when the identifier is all blanks or spaces.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrIncompatibleTypesForEquality_Left_Right_ShortMessage',
      value: "Incompatible types for comparison. These types can't be compared: {0}, {1}.",
      comment:
        'Error message when the user attempts to check equality between two values that don\'t make sense together. {0} and {1} will be canonical type representations like "Number" or "Boolean".',
    },
    {
      name: 'ErrorResource_ErrIncompatibleTypesForEquality_Left_Right_LongMessage',
      value: "We can't evaluate your formula because the values being compared in the formula aren’t the same type.",
    },
    {
      name: 'ErrorResource_ErrIncompatibleTypesForEquality_Left_Right_HowToFix_1',
      value:
        'You might need to convert the value to be the same type, such as converting a date string (e.g., "12/31/2018") to a date value.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrIncompatibleTypesForEquality_Left_Right_HowToFix_2',
      value: 'If you’re comparing records or tables, the field or column types must match exactly.',
      comment: '2 How to fix the error.',
    },
    {
      name: 'ErrorResource_ErrIncompatibleTypesForEquality_Left_Right_Link_1',
      value: 'Module: Use basic formulas',
      comment: '3 crown link on basic formulas',
    },
    {
      name: 'ErrorResource_ErrIncompatibleTypesForEquality_Left_Right_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132396',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrIncompatibleTypesForEquality_Left_Right_Link_2',
      value: 'Module: Author basic formulas with tables and records',
      comment: '3 crown link on tables and records',
    },
    {
      name: 'ErrorResource_ErrIncompatibleTypesForEquality_Left_Right_Link_2_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132700',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrServiceFunctionUnknownOptionalParam_Name_ShortMessage',
      value: "No parameter. This function has no optional parameter named '{0}'.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrServiceFunctionUnknownOptionalParam_Name_HowToFix_1',
      value: 'How to fix: Remove or rename the parameter in your formula.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrServiceFunctionUnknownOptionalParam_Name_Link_1',
      value: 'Article: Formula reference for Power Apps',
      comment: 'Article: Formula reference for Power Apps',
    },
    {
      name: 'ErrorResource_ErrServiceFunctionUnknownOptionalParam_Name_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132478',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrColumnTypeMismatch_ColName_ExpectedType_ActualType_ShortMessage',
      value:
        "Incompatible type. The '{0}' column in the data source you’re updating expects a '{1}' type and you’re using a '{2}' type.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrColumnTypeMismatch_ColName_ExpectedType_ActualType_HowToFix_1',
      value:
        'You might need to convert the value to the same type, such as converting a date string (e.g., "12/31/2018") to a date value or a string to a number.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrColumnTypeMismatch_ColName_ExpectedType_ActualType_Link_1',
      value: 'Module: Use basic formulas',
      comment: '3 crown link on basic formulas',
    },
    {
      name: 'ErrorResource_ErrColumnTypeMismatch_ColName_ExpectedType_ActualType_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132396',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrColumnTypeMismatch_ColName_ExpectedType_ActualType_Link_2',
      value: 'Module: Author basic formulas with tables and records',
      comment: '3 crown link on tables and records',
    },
    {
      name: 'ErrorResource_ErrColumnTypeMismatch_ColName_ExpectedType_ActualType_Link_2_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132700',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrColumnMissing_ColName_ExpectedType_ShortMessage',
      value: "Missing column. Your formula is missing a column '{0}' with a type of '{1}'.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrColumnMissing_ColName_ExpectedType_HowToFix_1',
      value: 'Add a column to your formula.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrColumnMissing_ColName_ExpectedType_Link_1',
      value: 'Article: Formula reference for Power Apps',
      comment: 'Article: Formula reference for Power Apps',
    },
    {
      name: 'ErrorResource_ErrColumnMissing_ColName_ExpectedType_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132478',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrTableDoesNotAcceptThisType_ShortMessage',
      value:
        'Incompatible type. The item you are trying to put into a table has a type that is not compatible with the table.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrTableDoesNotAcceptThisType_HowToFix_1',
      value:
        'Ensure that the type of the item you want to push into the table is compatible with the table. You may need to convert the type of the item, for instance, to a record.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrTableDoesNotAcceptThisType_Link_1',
      value: 'Module: Use basic formulas',
      comment: '3 crown link on basic formulas',
    },
    {
      name: 'ErrorResource_ErrTableDoesNotAcceptThisType_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132396',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrTableDoesNotAcceptThisType_Link_2',
      value: 'Module: Author basic formulas with tables and records',
      comment: '3 crown link on tables and records',
    },
    {
      name: 'ErrorResource_ErrTableDoesNotAcceptThisType_Link_2_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132700',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrTypeError_ShortMessage',
      value: "Incompatible type. We can't evaluate your formula because of a type error.",
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrTypeError_LongMessage',
      value: 'The data may not match the expected type. (text, number, date, table, record.)',
    },
    {
      name: 'ErrorResource_ErrTypeError_HowToFix_1',
      value: 'Check the types of the values involved in the formula and ensure the types match.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrTypeError_Link_1',
      value: 'Module: Use basic formulas',
      comment: '3 crown link on basic formulas',
    },
    {
      name: 'ErrorResource_ErrTypeError_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132396',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrTypeError_Link_2',
      value: 'Module: Author basic formulas with tables and records',
      comment: '3 crown link on tables and records',
    },
    {
      name: 'ErrorResource_ErrTypeError_Link_2_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132700',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrDateExpected_ShortMessage',
      value: 'Expected date. We expect a date at this point in the formula.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrDateExpected_LongMessage',
      value:
        'This error will occur if you use a function that requires a date but you supply, for example, text instead.',
    },
    {
      name: 'ErrorResource_ErrDateExpected_HowToFix_1',
      value: 'Edit your formula so that it evaluates to a date at this point in the formula.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_ErrDateExpected_Link_1',
      value: 'Article: Formula reference for Power Apps',
      comment: 'Article: Formula reference for Power Apps',
    },
    {
      name: 'ErrorResource_ErrDateExpected_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132478',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_ShortMessage',
      value: 'Delegation warning. The "{0}" part of this formula might not work correctly on large data sets.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_LongMessage',
      value:
        'The data source might not be able to process the formula and might return an incomplete data set. Your application might not return correct results or behave correctly if the data set is incomplete.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_HowToFix_1',
      value:
        'If your data set exceeds the 500 record limit but contains less than 2,000 records, try resetting the limit.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_HowToFix_2',
      value: 'Try simplifying the formula.',
      comment: '2 How to fix the error.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_HowToFix_3',
      value: 'Try moving your data to a different data source.',
      comment: '3 How to fix the error.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_Link_1',
      value: 'Article: Understand delegation in a canvas app',
      comment: 'Article on delegation',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132701',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_Link_2',
      value: 'Blog: Data row limits for delegation',
      comment: 'Blog: Data row limits for delegation',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_Link_2_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132702',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByColumn_ShortMessage',
      value:
        'Delegation warning. The highlighted part of this formula might not work correctly with column "{0}" on large data sets.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByColumn_LongMessage',
      value:
        'The data source might not be able to process the formula and might return an incomplete data set. Your application might not return correct results or behave correctly if the data set is incomplete.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByColumn_HowToFix_1',
      value:
        'If your data set exceeds the 500 record limit but contains less than 2,000 records, try resetting the limit.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByColumn_HowToFix_2',
      value: 'Try simplifying the formula.',
      comment: '2 How to fix the error.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByColumn_HowToFix_3',
      value: 'Try moving your data to a different data source.',
      comment: '3 How to fix the error.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByColumn_Link_1',
      value: 'Article: Understand delegation in a canvas app',
      comment: 'Article on delegation',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByColumn_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132701',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByColumn_Link_2',
      value: 'Blog: Data row limits for delegation',
      comment: 'Blog: Data row limits for delegation',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByColumn_Link_2_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132702',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpRhs_ShortMessage',
      value: 'Delegation warning. The highlighted part of this formula might not work correctly on large data sets.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpRhs_LongMessage',
      value:
        ' The right side of the "in" operator should be a column name from the correct data source. The data source might not be able to process the formula and might return an incomplete data set. Your application might not return correct results or behave correctly if the data set is incomplete.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpRhs_HowToFix_1',
      value: 'Change the item to the right of the "in" operator to be a column from the correct data source.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpRhs_HowToFix_2',
      value:
        'If your data set exceeds the 500 record limit but contains less than 2,000 records, try resetting the limit.',
      comment: '2 How to fix the error. ',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpRhs_HowToFix_3',
      value: 'Try simplifying the formula.',
      comment: '3 How to fix the error.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpRhs_HowToFix_4',
      value: 'Try moving your data to a different data source.',
      comment: '4 How to fix the error.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpRhs_Link_1',
      value: 'Article: Understand delegation in a canvas app',
      comment: 'Article on delegation',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpRhs_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132701',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpRhs_Link_2',
      value: 'Blog: Data row limits for delegation',
      comment: 'Blog: Data row limits for delegation',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpRhs_Link_2_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132702',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpInvalidColumn_ShortMessage',
      value: 'The highlighted part of this formula might not work correctly on large data sets. ',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpInvalidColumn_LongMessage',
      value:
        'The right side of the "in" operator is not a column from the correct data source . The data source might not be able to process the formula and might return an incomplete data set. Your application might not return correct results or behave correctly if the data set is incomplete.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpInvalidColumn_HowToFix_1',
      value: 'Change the item to the right of the "in" operator to be a column from the correct data source.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpInvalidColumn_HowToFix_2',
      value:
        'If your data set exceeds the 500 record limit but contains less than 2,000 records, try resetting the limit.',
      comment: '2 How to fix the error. ',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpInvalidColumn_HowToFix_3',
      value: 'Try simplifying the formula.',
      comment: '3 How to fix the error.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpInvalidColumn_HowToFix_4',
      value: 'Try moving your data to a different data source.',
      comment: '4 How to fix the error.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpInvalidColumn_Link_1',
      value: 'Article: Understand delegation in a canvas app',
      comment: 'Article on delegation',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpInvalidColumn_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132701',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpInvalidColumn_Link_2',
      value: 'Blog: Data row limits for delegation',
      comment: 'Blog: Data row limits for delegation',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_InOpInvalidColumn_Link_2_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132702',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByService_ShortMessage',
      value:
        'Delegation warning. The highlighted part of this formula might not work correctly on large data sets. The "{0}" operation is not supported by this connector.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByService_LongMessage',
      value:
        'The data source might not be able to process the formula and might return an incomplete data set. Your application might not return correct results or behave correctly if the data set is incomplete.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByService_HowToFix_1',
      value:
        'If your data set exceeds the 500 record limit but contains less than 2,000 records, try resetting the limit.',
      comment: '1 How to fix the error. ',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByService_HowToFix_2',
      value: 'Try simplifying the formula.',
      comment: '2 How to fix the error.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByService_HowToFix_3',
      value: 'Try moving your data to a different data source.',
      comment: '3 How to fix the error.',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByService_Link_1',
      value: 'Article: Understand delegation in a canvas app',
      comment: 'Article on delegation',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByService_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132701',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByService_Link_2',
      value: 'Blog: Data row limits for delegation',
      comment: 'Blog: Data row limits for delegation',
    },
    {
      name: 'ErrorResource_SuggestRemoteExecutionHint_OpNotSupportedByService_Link_2_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132702',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrOnlyOneViewExpected_ShortMessage',
      value: 'Expected only one view. We expect only one view at this point in the formula.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrOnlyOneViewExpected_HowToFix_1',
      value: 'Edit your formula so that it only has one view at this point in the formula.',
      comment: 'How to fix the error.',
    },
    {
      name: 'ErrorResource_ErrViewFromCurrentTableExpected_ShortMessage',
      value: 'Expected a view from data source {0}.',
      comment: 'Error Message.',
    },
    {
      name: 'ErrorResource_ErrViewFromCurrentTableExpected_HowToFix_1',
      value: 'Edit your formula so that it has view from data source {0}.',
      comment: 'How to fix the error.',
    },
    {
      name: 'ErrorResource_ErrInvalidControlReference_ShortMessage',
      value: 'This control reference cannot be used in this property',
      comment: 'Error message.',
    },
    {
      name: 'ErrorResource_ErrInvalidControlReference_HowToFix_1',
      value:
        'This property only supports references to global variables, collections, and some control and screen properties. See the link for a list of supported control properties.',
      comment: 'How to fix message for an error',
    },
    {
      name: 'ErrorResource_ErrInvalidControlReference_Link_1',
      value: 'Reference: ConfirmExit for Canvas Apps',
      comment: 'Reference: ConfirmExit for Canvas Apps',
    },
    {
      name: 'ErrorResource_ErrInvalidControlReference_Link_1_URL',
      value: 'https://go.microsoft.com/fwlink/?linkid=2132703',
      comment: '{Locked}',
    },
    {
      name: 'ErrorResource_ErrAsNotInContext_ShortMessage',
      value: 'As is not permitted in this context',
      comment: '{Locked=As} This is an error message that shows up when the As keyword is used but is not valid',
    },
    {
      name: 'ErrNamedFormula_MissingSemicolon',
      value: 'Named formula must end with a semicolon.',
      comment: 'A semicolon must terminate named formulas. For example, a=10;',
    },
  ],
}
