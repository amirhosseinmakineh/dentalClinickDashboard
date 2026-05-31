import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface CrudGridOption {
  label: string;
  value: string | number | boolean;
}

export interface CrudGridColumn {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'password' | 'checkbox' | 'select' | 'hidden';
  required?: boolean;
  hiddenInGrid?: boolean;
  hiddenInForm?: boolean;
  createOnly?: boolean;
  updateOnly?: boolean;
  defaultValue?: CrudGridValue;
  options?: CrudGridOption[];
}

export type CrudGridValue = string | number | boolean | null | undefined;
export type CrudGridRow = Record<string, CrudGridValue> & { id: string | number };

export interface CrudGridQueryChange {
  pageNumber: number;
  pageSize: number;
  search: string;
}

type DialogMode = 'create' | 'update' | 'delete' | null;

@Component({
  selector: 'app-crud-grid',
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-grid.component.html',
  styleUrl: './crud-grid.component.scss'
})
export class CrudGridComponent implements OnChanges {
  @Input({ required: true }) title = '';
  @Input() description = '';
  @Input({ required: true }) columns: CrudGridColumn[] = [];
  @Input({ required: true }) rows: CrudGridRow[] = [];
  @Input() remoteMode = false;
  @Input() loading = false;
  @Input() totalCount = 0;
  @Input() serverPageNumber = 1;
  @Input() serverPageSize = 5;
  @Output() queryChange = new EventEmitter<CrudGridQueryChange>();
  @Output() createRow = new EventEmitter<CrudGridRow>();
  @Output() updateRow = new EventEmitter<CrudGridRow>();
  @Output() deleteRow = new EventEmitter<CrudGridRow>();

  workingRows: CrudGridRow[] = [];
  searchTerm = '';
  pageNumber = 1;
  pageSize = 5;
  pageSizeOptions = [5, 10, 20];
  viewMode: 'table' | 'cards' = 'table';
  gridDensity: 'comfortable' | 'compact' = 'comfortable';
  dialogMode: DialogMode = null;
  formModel: CrudGridRow = { id: 0 };
  selectedRow: CrudGridRow | null = null;

  get visibleColumns(): CrudGridColumn[] {
    return this.columns.filter((column) => !column.hiddenInGrid && column.type !== 'hidden');
  }

  get formColumns(): CrudGridColumn[] {
    return this.columns.filter((column) => {
      if (column.type === 'hidden' || column.hiddenInForm) {
        return false;
      }

      if (this.dialogMode === 'create') {
        return !column.updateOnly;
      }

      if (this.dialogMode === 'update') {
        return !column.createOnly;
      }

      return false;
    });
  }

  get filteredRows(): CrudGridRow[] {
    if (this.remoteMode) {
      return this.workingRows;
    }

    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return this.workingRows;
    }

    return this.workingRows.filter((row) =>
      this.visibleColumns.some((column) => String(row[column.key] ?? '').toLowerCase().includes(normalizedSearch))
    );
  }

  get resolvedTotalCount(): number {
    return this.remoteMode ? this.totalCount : this.filteredRows.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.resolvedTotalCount / this.pageSize));
  }

  get pagedRows(): CrudGridRow[] {
    this.ensureValidPage();

    if (this.remoteMode) {
      return this.workingRows;
    }

    const startIndex = (this.pageNumber - 1) * this.pageSize;

    return this.filteredRows.slice(startIndex, startIndex + this.pageSize);
  }

  get isFormDialogOpen(): boolean {
    return this.dialogMode === 'create' || this.dialogMode === 'update';
  }

  get dialogTitle(): string {
    return this.dialogMode === 'update' ? `ویرایش ${this.title}` : `افزودن ${this.title}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows']) {
      this.workingRows = this.rows.map((row) => ({ ...row }));
    }

    if (changes['serverPageNumber'] && this.remoteMode) {
      this.pageNumber = this.serverPageNumber;
    }

    if (changes['serverPageSize'] && this.remoteMode) {
      this.pageSize = this.serverPageSize;
    }
  }

  openCreateDialog(): void {
    this.dialogMode = 'create';
    this.formModel = this.createEmptyRow();
  }

  openUpdateDialog(row: CrudGridRow): void {
    this.dialogMode = 'update';
    this.selectedRow = row;
    this.formModel = { ...this.createEmptyRow(), ...row };
  }

  openDeleteDialog(row: CrudGridRow): void {
    this.dialogMode = 'delete';
    this.selectedRow = row;
  }

  closeDialog(): void {
    this.dialogMode = null;
    this.formModel = { id: 0 };
    this.selectedRow = null;
  }

  saveForm(): void {
    if (this.dialogMode === 'create') {
      if (this.remoteMode) {
        this.createRow.emit({ ...this.formModel });
      } else {
        this.workingRows = [{ ...this.formModel, id: this.getNextId() }, ...this.workingRows];
        this.pageNumber = 1;
      }
    }

    if (this.dialogMode === 'update' && this.selectedRow) {
      const updatedRow = { ...this.formModel, id: this.selectedRow.id };

      if (this.remoteMode) {
        this.updateRow.emit(updatedRow);
      } else {
        this.workingRows = this.workingRows.map((row) => (row.id === this.selectedRow?.id ? updatedRow : row));
      }
    }

    this.closeDialog();
  }

  confirmDelete(): void {
    if (this.selectedRow) {
      if (this.remoteMode) {
        this.deleteRow.emit(this.selectedRow);
      } else {
        this.workingRows = this.workingRows.filter((row) => row.id !== this.selectedRow?.id);
        this.ensureValidPage();
      }
    }

    this.closeDialog();
  }

  onSearchChange(): void {
    this.pageNumber = 1;
    this.emitQueryIfRemote();
  }

  onPageSizeChange(): void {
    this.pageNumber = 1;
    this.emitQueryIfRemote();
  }

  goToPage(page: number): void {
    this.pageNumber = Math.min(Math.max(page, 1), this.totalPages);
    this.emitQueryIfRemote();
  }

  onPageNumberChange(): void {
    this.goToPage(this.pageNumber);
  }

  private createEmptyRow(): CrudGridRow {
    return this.columns.reduce<CrudGridRow>(
      (row, column) => ({ ...row, [column.key]: column.defaultValue ?? this.getDefaultValue(column) }),
      { id: 0 }
    );
  }

  private getDefaultValue(column: CrudGridColumn): CrudGridValue {
    if (column.type === 'checkbox') {
      return false;
    }

    return '';
  }

  private getNextId(): number {
    const maxId = this.workingRows.reduce((max, row) => {
      const numericId = typeof row.id === 'number' ? row.id : Number(row.id);

      return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
    }, 0);

    return maxId + 1;
  }

  private ensureValidPage(): void {
    if (this.pageNumber > this.totalPages) {
      this.pageNumber = this.totalPages;
    }
  }

  private emitQueryIfRemote(): void {
    if (!this.remoteMode) {
      return;
    }

    this.queryChange.emit({
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      search: this.searchTerm.trim()
    });
  }
}
