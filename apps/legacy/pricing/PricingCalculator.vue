<template>
  <div class="container">
    <h1>Pricing calculator</h1>
    <p class="sub">Vue 2 options-API SFC. Custom VSelect / VInputNumber primitives.</p>

    <div class="card">
      <h3>Plan</h3>
      <label>Tier</label>
      <v-select v-model="tier" :options="tierOptions" />

      <label>Seats</label>
      <v-input-number v-model="seats" :min="1" :max="500" />

      <label>Billing cycle</label>
      <v-select v-model="cycle" :options="cycleOptions" />

      <label>
        <input type="checkbox" v-model="addons.analytics" /> + Advanced analytics
      </label>
      <label>
        <input type="checkbox" v-model="addons.premiumSupport" /> + Premium support
      </label>
    </div>

    <div class="card">
      <div class="totals"><span>Base</span><span>${{ base }}</span></div>
      <div class="totals"><span>Add-ons</span><span>${{ addonCost }}</span></div>
      <div class="totals"><span>Cycle discount</span><span>-${{ cycleDiscount }}</span></div>
      <div class="totals total-final"><span>Monthly total</span><span>${{ total }}</span></div>
    </div>
  </div>
</template>

<script>
// Custom primitive: VSelect (drop-in, no a11y id)
// Uses render function to avoid needing the Vue runtime template compiler.
const VSelect = {
  props: ['value', 'options'],
  data() { return { open: false } },
  computed: {
    selectedLabel() {
      const found = this.options.find(o => o.value === this.value)
      return found ? found.label : ''
    },
  },
  methods: {
    choose(opt) {
      this.$emit('input', opt.value)
      this.open = false
    },
  },
  render(h) {
    const self = this
    return h('div', { class: { 'v-select': true, open: self.open } }, [
      h('button', {
        class: 'v-select-trigger',
        attrs: { type: 'button' },
        on: { click() { self.open = !self.open } },
      }, [self.selectedLabel || 'Select']),
      h('ul', {
        class: 'v-select-menu',
        style: { display: self.open ? '' : 'none' },
      }, (self.options || []).map(opt =>
        h('li', {
          key: opt.value,
          class: 'v-select-item',
          on: { click() { self.choose(opt) } },
        }, [opt.label])
      )),
    ])
  },
}

// Custom primitive: VInputNumber with +/- steppers
// Uses render function to avoid needing the Vue runtime template compiler.
const VInputNumber = {
  props: ['value', 'min', 'max'],
  methods: {
    onInput(e) {
      const v = Number(e.target.value)
      if (!Number.isFinite(v)) return
      this.$emit('input', Math.max(this.min ?? 0, Math.min(this.max ?? v, v)))
    },
    inc() { this.$emit('input', Math.min(this.max ?? (this.value + 1), this.value + 1)) },
    dec() { this.$emit('input', Math.max(this.min ?? 0, this.value - 1)) },
  },
  render(h) {
    const self = this
    return h('div', { class: 'v-input-number' }, [
      h('button', {
        class: 'v-input-number-step',
        attrs: { type: 'button' },
        on: { click() { self.dec() } },
      }, ['-']),
      h('input', {
        domProps: { type: 'number', value: self.value },
        on: { input(e) { self.onInput(e) } },
      }),
      h('button', {
        class: 'v-input-number-step',
        attrs: { type: 'button' },
        on: { click() { self.inc() } },
      }, ['+']),
    ])
  },
}

const PRICE = { starter: 12, growth: 29, enterprise: 59 }

export default {
  name: 'PricingCalculator',
  components: { VSelect, VInputNumber },
  data() {
    return {
      tier: 'growth',
      seats: 10,
      cycle: 'monthly',
      addons: { analytics: false, premiumSupport: false },
      tierOptions: [
        { value: 'starter', label: 'Starter — $12/seat' },
        { value: 'growth', label: 'Growth — $29/seat' },
        { value: 'enterprise', label: 'Enterprise — $59/seat' },
      ],
      cycleOptions: [
        { value: 'monthly', label: 'Monthly' },
        { value: 'annual', label: 'Annual (15% off)' },
      ],
    }
  },
  computed: {
    base() { return PRICE[this.tier] * this.seats },
    addonCost() {
      let c = 0
      if (this.addons.analytics) c += 120
      if (this.addons.premiumSupport) c += 200
      return c
    },
    cycleDiscount() {
      return this.cycle === 'annual' ? Math.round((this.base + this.addonCost) * 0.15) : 0
    },
    total() { return this.base + this.addonCost - this.cycleDiscount },
  },
}
</script>
