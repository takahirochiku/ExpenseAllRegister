import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';

import * as encoding from 'encoding-japanese';

import { ExpenseService } from '../../../service/expense/expense.service';
import { OwnerService } from '../../../service/owner/owner.service';
import { SalesGroupOwnerService } from '../../../service/sales-group-owner/sales-group-owner.service';
import { CommonService } from '../../../service/common/common.service';
import { DialogsService } from '../../../../component/dialog/dialogs.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'ExpenseAllRegister.component.html',
  styleUrls: ['ExpenseAllRegister.component.css']
})

export class ExpenseAllRegisterComponent {
  public componentTitle = 'WA8013:諸掛一括登録';

  public working = false;
  public height = 500;
  public production = environment.production;
  public backgroundColor: string;

  // drop down list
  public owners: any;
  public salesgroups: any;
  public salesgroupowners: any;

  // detail
  public details: [Detail];

  constructor(
    private router: Router,
    private builder: FormBuilder,
    private expenseService: ExpenseService,
    private ownerService: OwnerService,
    private salesGroupOwnerService: SalesGroupOwnerService,
    private commonService: CommonService,
    private dialogsService: DialogsService,
  ) {
    this.height = window.innerHeight - 80;
    if (this.production) {
      this.backgroundColor = 'primary';
    } else {
      this.backgroundColor = 'warn';
    }
    this.details = [new Detail(
      ownerService,
      salesGroupOwnerService,
      commonService,
      dialogsService
    )];
  }

  onResize(event) {
    this.height = event.target.innerHeight - 80;
  }

  addDetail() {
    let errors = false;
    for (const detail of this.details) {
      if (detail.bookDt.value === '') {
        detail.bookDt.enable({ onlySelf: true });
        detail.bookDt.markAsTouched({ onlySelf: true });
        errors = true;
      }
      if (detail.ownerdisplayTx.value === '') {
        detail.ownerdisplayTx.enable({ onlySelf: true });
        detail.ownerdisplayTx.markAsTouched({ onlySelf: true });
        errors = true;
      }
      if (detail.salesgroupdisplayTx.value === '') {
        detail.salesgroupdisplayTx.enable({ onlySelf: true });
        detail.salesgroupdisplayTx.markAsTouched({ onlySelf: true });
        errors = true;
      }
      if (detail.pcsNr.errors !== null) {
        detail.pcsNr.enable({ onlySelf: true });
        detail.pcsNr.markAsTouched({ onlySelf: true });
        errors = true;
      }
    }

    if (!errors) {
      let detailNum = this.details.length
      const newDetail = new Detail(
        this.ownerService,
        this.salesGroupOwnerService,
        this.commonService,
        this.dialogsService,
        this.details[detailNum - 1].bookDt.value,
        this.details[detailNum - 1].ownerId,
        this.details[detailNum - 1].ownerdisplayTx.value,
        this.details[detailNum - 1].salesgroupId,
        this.details[detailNum - 1].salesgroupdisplayTx.value,
      );
      this.details.push(newDetail);
      console.log('newDetail:', newDetail)
    }
  }

  onSubmit() {
    let errors = false;
    for (const detail of this.details) {
      if (detail.bookDt.value === '') {
        detail.bookDt.enable({ onlySelf: true });
        detail.bookDt.markAsTouched({ onlySelf: true });
        errors = true;
      }
      if (detail.ownerdisplayTx.value === '') {
        detail.ownerdisplayTx.enable({ onlySelf: true });
        detail.ownerdisplayTx.markAsTouched({ onlySelf: true });
        errors = true;
      }
      if (detail.salesgroupdisplayTx.value === '') {
        detail.salesgroupdisplayTx.enable({ onlySelf: true });
        detail.salesgroupdisplayTx.markAsTouched({ onlySelf: true });
        errors = true;
      }
      if (detail.pcsNr.errors !== null) {
        detail.pcsNr.markAsTouched({ onlySelf: true });
        errors = true;
      }
    }
    if (errors) {
      return;
    }

    this.working = true;
    for (const detail of this.details) {
      var salesgroup = detail.salesgroups.filter((item, index) => {
        if (item.salesgroupId == detail.salesgroupId) return true;
      });
      detail.salesgroupdisplayTx.setValue(salesgroup[0].salesgroupdisplayTx);
      var salesgroupowner = detail.salesgroupowners.filter((item, index) => {
        if (item.salesgroupId == detail.salesgroupId) return true;
      });
      detail.typetaxCd = salesgroupowner[0].typetaxCd;
      this.expenseService
        .post(
        detail.ownerId,
        new Date(detail.bookDt.value),
        +(detail.salesgroupId),
        detail.unitpricedispNr,
        detail.pcsNr.value,
        detail.pricedispNr,
        detail.typetaxCd,
        'wa8013'
        )
        .then(outputJson => {
          this.working = false;
          this.router.navigate(['wa8010']);
        })
        .catch(error => {
          this.working = false;
          console.log(this.commonService.getErrorMessage(error));
          this.dialogsService
            .info('エラー', this.commonService.getErrorMessage(error));
        });
    }
  }
}


class Detail {
  // drop down list
  public owners: any;
  public salesgroups: any;
  public salesgroupowners: any;
  public allsalesgroupowners: any;
  //
  public bookDt: FormControl;
  public ownerId: number;
  public ownerdisplayTx: FormControl;
  public salesgroupId: number;
  public salesgroupdisplayTx: FormControl;
  public salesgroupunitTx: string;
  public unitpricedispNr: number;
  public pcsNr: FormControl;
  public typetaxCd: string;
  public typetaxTx: string;
  public pricedispNr: number;

  public ownerdisplayTxList = new Array();
  public filteredOwnerOptions: Observable<string[]>;
  public filteredSalesgroupOptions: Observable<string[]>;

  constructor(
    private ownerService: OwnerService,
    private salesGroupOwnerService: SalesGroupOwnerService,
    private commonService: CommonService,
    private dialogsService: DialogsService,
    private selectedbookDt?: string,
    private selectedOwnerId?: number,
    private selectedOwnerdisplayTx?: string,
    private selectedSalesgroupId?: number,
    private selectedsalesgroupdisplayTx?: string,
  ) {
    // Define each input element (initial value and validation rule)
    if (selectedbookDt !== undefined) {
      this.bookDt = new FormControl(selectedbookDt);
    }
    else {
      this.bookDt = new FormControl('', [
        Validators.required
      ]);
    }

    this.ownerdisplayTx = new FormControl('',
      Validators.required
    );

    this.salesgroupdisplayTx = new FormControl('',
      Validators.required
    );

    this.pcsNr = new FormControl(1, [
      Validators.pattern(/^[+,-]?([1-9]\d*)$/),
      Validators.min(-99999),
      Validators.max(99999)
    ]);

    this.ownerService
      .get()
      .then(outputJson => {
        console.log('ownerService.outputJson:', JSON.stringify(outputJson));
        this.owners = outputJson.owners;
        if (selectedOwnerdisplayTx !== undefined) {
          this.ownerId = this.selectedOwnerId;
          this.ownerdisplayTx.setValue(this.selectedOwnerdisplayTx);
        }

        this.salesGroupOwnerService
          .get()
          .then(outputJson => {
            // 単価が定義された売上分類のみ取得するため、売上分類ではなく、荷主別売上分類を利用する
            console.log(JSON.stringify(outputJson));
            this.allsalesgroupowners = outputJson.salesgroupowners;
            this.salesgroups = this.getSalesgroupowners();
            this.salesgroupowners = this.getSalesgroupowners();

            this.filteredOwnerOptions = this.ownerdisplayTx.valueChanges
              .startWith(null)
              .map(val => val ? this.Ownerfilter(val) : this.owners);

            this.filteredSalesgroupOptions = this.salesgroupdisplayTx.valueChanges
              .startWith(null)
              .map(val => val ? this.salesgroupfilter(val) : this.salesgroupowners);
          })
          .catch(error => {
            this.dialogsService
              .info('エラー', this.commonService.getErrorMessage(error));
          });
      })
      .catch(error => {
        this.dialogsService
          .info('エラー', this.commonService.getErrorMessage(error));
      });
  }

  Ownerfilter(val: string): string[] {
    return this.owners.filter(owner =>
      owner.ownerdisplayTx.indexOf(val) != -1);
  }

  salesgroupfilter(val: string): string[] {
    this.ownerId = this.getOwnerId();
    this.salesgroupowners = this.getSalesgroupowners();
    if (this.salesgroupowners !== undefined) {
      return this.salesgroupowners.filter(salesgroup =>
        salesgroup.salesgroupdisplayTx.indexOf(val) != -1);
    }
  }

  getSalesgroupowners(): any[] {
    if (this.ownerId !== undefined && this.allsalesgroupowners !== undefined) {
      var salesgroupowners = this.allsalesgroupowners.filter((item, index) => {
        if (item.ownerId == this.ownerId) return true;
      });
    }
    return salesgroupowners;
  }

  changeOwner(event: string) {
    this.ownerId = this.getOwnerId();
    this.salesgroups = this.getSalesgroupowners();
    this.salesgroupowners = this.getSalesgroupowners();
    this.salesgroupId = undefined;
    this.salesgroupdisplayTx.setValue('');
  }

  changeSalesgroup(event: number) {
    this.salesgroupId = this.getSalesgroupId();
  }

  getOwnerId(): number {
    if (this.owners != undefined && this.ownerdisplayTx.value.trim() !== '') {
      var selectedOwners = this.owners.filter((item, index) => {
        if (item.ownerdisplayTx == this.ownerdisplayTx.value.trim()) return true;
      });
      if (selectedOwners.length > 0) {
        return selectedOwners[0]["ownerId"];
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  }

  getSalesgroupId(): number {
    this.salesgroups = this.getSalesgroupowners();
    if (this.salesgroups != undefined && this.salesgroupdisplayTx.value.trim() !== '') {
      var selectedSalesgroups = this.salesgroups.filter((item, index) => {
        if (item.salesgroupdisplayTx == this.salesgroupdisplayTx.value.trim()) return true;
      });
      if (selectedSalesgroups.length > 0) {
        return selectedSalesgroups[0]["salesgroupId"]
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  }

  getSalesgroupunitTx(): string {
    if (this.salesgroups !== undefined && this.salesgroupId !== undefined) {
      var selectedSalesgroups = this.salesgroups.filter((item, index) => {
        if (item.salesgroupId == this.salesgroupId) return true;
      });
      if (selectedSalesgroups.length > 0) {
        return selectedSalesgroups[0]["salesgroupunitTx"]
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  }

  getUnitpricedispNr(): number {
    if (this.salesgroupowners !== undefined && this.salesgroupId !== undefined) {
      var salesgroupowner = this.salesgroupowners.filter((item, index) => {
        if (item.salesgroupId == this.salesgroupId) return true;
      });
      if (salesgroupowner.length > 0) {
        this.unitpricedispNr = salesgroupowner[0]["unitpricedispNr"];
        return this.unitpricedispNr
      } else {
        return 0
      }
    } else {
      return undefined
    }
  }

  getTypetaxTx(): string {
    if (this.salesgroups !== undefined && this.salesgroupId !== undefined) {
      var salesgroupowner = this.salesgroupowners.filter((item, index) => {
        if (item.salesgroupId == this.salesgroupId) return true;
      });
      if (salesgroupowner.length > 0) {
        return salesgroupowner[0]["typetaxTx"];
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  }

  getPricedispNr(): number {
    if (this.salesgroupowners !== undefined && this.salesgroupId !== undefined) {
      var salesgroupowner = this.salesgroupowners.filter((item, index) => {
        if (item.salesgroupId == this.salesgroupId) return true;
      });
      if (salesgroupowner.length > 0) {
        this.pricedispNr = salesgroupowner[0]["unitpricedispNr"] * this.pcsNr.value;
        return this.pricedispNr
      } else {
        return 0
      }
    } else {
      return undefined
    }
  }
}
