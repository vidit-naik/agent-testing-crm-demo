import angular from 'angular'

angular.module('legacyAdmin', []).controller('AdminCtrl', [
  '$scope',
  '$timeout',
  function ($scope: any, $timeout: any) {
    const vm = this
    vm.name = 'Acme Corp'
    vm.region = 'us'
    vm.sso = false
    vm.audit = true
    vm.log = ['Initial load at ' + new Date().toLocaleTimeString()]
    vm.saving = false
    vm.savedAt = null

    const initial = JSON.stringify({ name: vm.name, region: vm.region, sso: vm.sso, audit: vm.audit })

    vm.dirty = () =>
      JSON.stringify({ name: vm.name, region: vm.region, sso: vm.sso, audit: vm.audit }) !== initial

    vm.save = () => {
      vm.saving = true
      $timeout(() => {
        vm.saving = false
        vm.savedAt = new Date().toLocaleTimeString()
        vm.log.unshift(`Saved: region=${vm.region}, sso=${vm.sso}, audit=${vm.audit}`)
        renderSummary()
      }, 600)
    }

    // Mock react2angular bridge: render a fake summary into DOM after digest.
    function renderSummary() {
      $timeout(() => {
        const el = document.getElementById('r2a-summary')
        if (!el) return
        el.innerHTML = `
          <div style="padding:12px;border-radius:6px;background:#f1f5f9;font-size:13px;">
            <strong>${vm.name}</strong> · region=${vm.region}
            · SSO=${vm.sso ? 'on' : 'off'}
            · Audit=${vm.audit ? 'on' : 'off'}
          </div>
        `
      })
    }

    renderSummary()
  },
])
