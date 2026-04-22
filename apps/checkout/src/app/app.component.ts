import { Component, computed, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

type Step = 'terms' | 'payment' | 'review'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="card">
        <h1>Checkout</h1>
        <p class="sub">Angular 17 standalone component. Three-step cross-stack quote flow.</p>

        <div class="steps">
          <div class="step" [class.active]="step() === 'terms'" [class.done]="isDone('terms')">1. Terms</div>
          <div class="step" [class.active]="step() === 'payment'" [class.done]="isDone('payment')">2. Payment</div>
          <div class="step" [class.active]="step() === 'review'" [class.done]="isDone('review')">3. Review</div>
        </div>

        <ng-container *ngIf="step() === 'terms'">
          <div class="field">
            <label>Billing company</label>
            <input type="text" [(ngModel)]="company" />
          </div>
          <div class="field">
            <label>PO reference (optional)</label>
            <input type="text" [(ngModel)]="po" />
          </div>
          <label>
            <input type="checkbox" [(ngModel)]="acceptedTerms" />
            Accept master service agreement
          </label>
          <div class="actions">
            <button class="primary" [disabled]="!termsValid()" (click)="go('payment')">Continue</button>
          </div>
        </ng-container>

        <ng-container *ngIf="step() === 'payment'">
          <div class="field">
            <label>Cardholder name</label>
            <input type="text" [(ngModel)]="cardName" />
          </div>
          <div class="field">
            <label>Card number</label>
            <input type="text" [(ngModel)]="cardNumber" placeholder="4242 4242 4242 4242" />
          </div>
          <div class="field">
            <label>Expiry</label>
            <input type="text" [(ngModel)]="cardExpiry" placeholder="MM / YY" />
          </div>
          <div class="actions">
            <button (click)="go('terms')">Back</button>
            <button class="primary" [disabled]="!paymentValid()" (click)="go('review')">Continue</button>
          </div>
        </ng-container>

        <ng-container *ngIf="step() === 'review'">
          <div class="totals"><span>Subtotal</span><span>\${{ subtotal | number }}</span></div>
          <div class="totals"><span>Tax ({{ taxRate * 100 }}%)</span><span>\${{ tax() | number }}</span></div>
          <div class="totals total-final"><span>Total</span><span>\${{ total() | number }}</span></div>
          <div class="actions">
            <button (click)="go('payment')">Back</button>
            <button class="primary" [disabled]="submitting()" (click)="confirm()">
              {{ submitting() ? 'Signing...' : 'Confirm & return' }}
            </button>
          </div>
        </ng-container>
      </div>
    </div>
  `,
})
export class AppComponent {
  step = signal<Step>('terms')
  company = ''
  po = ''
  acceptedTerms = false
  cardName = ''
  cardNumber = ''
  cardExpiry = ''
  submitting = signal(false)

  subtotal = 12500
  taxRate = 0.08
  tax = computed(() => Math.round(this.subtotal * this.taxRate))
  total = computed(() => this.subtotal + this.tax())

  termsValid() {
    return this.acceptedTerms && this.company.trim().length > 1
  }
  paymentValid() {
    return this.cardName.trim().length > 2 && this.cardNumber.replace(/\s/g, '').length >= 14
  }

  isDone(s: Step) {
    const order: Step[] = ['terms', 'payment', 'review']
    return order.indexOf(this.step()) > order.indexOf(s)
  }

  go(s: Step) {
    this.step.set(s)
  }

  confirm() {
    this.submitting.set(true)
    setTimeout(() => {
      window.location.href = '/lab/quote?status=signed&total=' + this.total()
    }, 900)
  }
}
