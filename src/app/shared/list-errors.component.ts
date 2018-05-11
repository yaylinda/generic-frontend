import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-list-errors',
  templateUrl: './list-errors.component.html'
})
export class ListErrorsComponent {
  formattedErrors: Array<string> = [];

  @Input()
  set errors(errorList: string[]) {
    this.formattedErrors = errorList;
  }

  get errorList() {
    return this.formattedErrors;
  }
}
