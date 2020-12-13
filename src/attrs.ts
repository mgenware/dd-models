export enum ColumnAttribute {
  // Whether this column is excluded in JSON serialization.
  isPrivate = 1,

  // Whether this column is excluded in JSON serialization if it's empty.
  // NOTE: 0, false, nil, empty string, empty collection are all considered empty values.
  excludeEmptyValue,
}

export enum ActionAttribute {
  // Specifies the interface name this action belongs to.
  groupTypeName = 1,

  // Specifies the resulting type name of a SELECT action.
  resultTypeName,

  // Whether this action is private in its belonging scope.
  isPrivate,
}
