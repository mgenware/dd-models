import { ActionType } from './tableActions';
import { CoreUpdateAction } from './coreUpdateAction';
import { Table } from '../core/core';

export class InsertAction extends CoreUpdateAction {
  constructor(public ensureOneRowAffected: boolean, public allowUnsetColumns = false) {
    super(ActionType.insert);
  }

  validate(boundTable: Table) {
    super.validate(boundTable);

    const setterCount = this.setters.size;
    const table = this.__table || boundTable;
    // Number of columns = total count - number of auto_increment PKs.
    const colCount = Object.entries(table.__columns).length - table.__aiPKs.length;
    if (
      !this.allowUnsetColumns &&
      // If no wild flags are set.
      !this.autoSetters.size &&
      setterCount < colCount
    ) {
      throw new Error(
        `You only set ${setterCount} of all ${colCount} columns (not including AUTO_INCREMENT columns), you should set all columns or use \`unsafeInsert\` to bypass this check`,
      );
    }
  }
}
