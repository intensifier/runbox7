// --------- BEGIN RUNBOX LICENSE ---------
// Copyright (C) 2016-2019 Runbox Solutions AS (runbox.com).
//
// This file is part of Runbox 7.
//
// Runbox 7 is free software: You can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the
// Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
//
// Runbox 7 is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Runbox 7. If not, see <https://www.gnu.org/licenses/>.
// ---------- END RUNBOX LICENSE ----------

import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';

import { Cart } from './cart';
import { BitpayPaymentDialogComponent } from './bitpay-payment-dialog.component';
import { PaypalPaymentDialogComponent } from './paypal-payment-dialog.component';
import { StripePaymentDialogComponent } from './stripe-payment-dialog.component';
import { PaymentsService } from './payments.service';
import { ProductOrder } from './product-order';

@Component({
    selector: 'app-shopping-cart',
    templateUrl: './shopping-cart.component.html',
})
export class ShoppingCartComponent {
    products = {}; // pid => Product

    cart: Cart;
    currency: string;

    constructor(
        private dialog:          MatDialog,
        public  paymentsservice: PaymentsService,
        private router:          Router,
    ) {
        this.paymentsservice.currency.subscribe(c => this.currency = c);
        this.paymentsservice.products.subscribe(products => {
            for (const p of products) {
                this.products[p.pid] = p;
            }
        });
        this.cart = this.paymentsservice.cart;
    }

    remove(p: ProductOrder) {
        this.cart.remove(p);
    }

    initiatePayment(method: string) {
        this.paymentsservice.orderProducts(this.cart.items, method, this.currency).subscribe(tx => {
            console.log("Transaction:", tx);
            let dialogRef: MatDialogRef<any>;
            if (method === 'stripe') {
                dialogRef = this.dialog.open(StripePaymentDialogComponent, {
                    data: { tx: tx, currency: this.currency, method: method }
                });
            } else if (method === 'bitpay') {
                dialogRef = this.dialog.open(BitpayPaymentDialogComponent, {
                    data: { tx: tx }
                });
            } else if (method === 'paypal') {
                dialogRef = this.dialog.open(PaypalPaymentDialogComponent, {
                    data: { tx: tx }
                });
            } else if (method === 'giro') {
                this.router.navigateByUrl('/account/receipt/' + tx.tid);
                this.cart.clear();
                return;
            }

            dialogRef.afterClosed().subscribe(paid => {
                if (paid) {
                    this.cart.clear();
                }
            });
        });
    }
}