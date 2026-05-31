import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface CrudGridColumn {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'date';
  required?: boolean;
}

export type CrudGridRow = Record<string, string | number> & { id: number };

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

  get filteredRows(): CrudGridRow[] {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return this.workingRows;
    }

    return this.workingRows.filter((row) =>
      this.columns.some((column) => String(row[column.key] ?? '').toLowerCase().includes(normalizedSearch))
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
  }

  get pagedRows(): CrudGridRow[] {
    this.ensureValidPage();
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
      this.pageNumber = 1;
      this.closeDialog();
    }
  }

  openCreateDialog(): void {
    this.dialogMode = 'create';
    this.formModel = this.createEmptyRow();
  }

  openUpdateDialog(row: CrudGridRow): void {
    this.dialogMode = 'update';
    this.selectedRow = row;
    this.formModel = { ...row };
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
      this.workingRows = [{ ...this.formModel, id: this.getNextId() }, ...this.workingRows];
      this.pageNumber = 1;
    }

    if (this.dialogMode === 'update' && this.selectedRow) {
      this.workingRows = this.workingRows.map((row) => (row.id === this.selectedRow?.id ? { ...this.formModel } : row));
    }

    this.closeDialog();
  }

  confirmDelete(): void {
    if (this.selectedRow) {
      this.workingRows = this.workingRows.filter((row) => row.id !== this.selectedRow?.id);
      this.ensureValidPage();
    }

    this.closeDialog();
  }

  onSearchChange(): void {
    this.pageNumber = 1;
  }

  onPageSizeChange(): void {
    this.pageNumber = 1;
  }

  goToPage(page: number): void {
    this.pageNumber = Math.min(Math.max(page, 1), this.totalPages);
  }

  private createEmptyRow(): CrudGridRow {
    return this.columns.reduce<CrudGridRow>(
      (row, column) => ({ ...row, [column.key]: '' }),
      { id: 0 }
    );
  }

  private getNextId(): number {
    const maxId = this.workingRows.reduce((max, row) => Math.max(max, row.id), 0);

    return maxId + 1;
  }

  private ensureValidPage(): void {
    if (this.pageNumber > this.totalPages) {
      this.pageNumber = this.totalPages;
    }
  }
}
