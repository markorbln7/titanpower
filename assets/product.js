/* eslint-disable no-useless-constructor */
console.log('PRODUCT TEMPLATE IS HERE')

const plus = document.querySelector('.js-plus')
const minus = document.querySelector('.js-minus')
const qtySelector = document.querySelector('.js-qty')
console.log(qtySelector, 'qtySelector')
plus.addEventListener('click', function () {
  const oldValue = parseInt(qtySelector.value)
  qtySelector.value = oldValue + 1
})
minus.addEventListener('click', function () {
  const oldValue = parseInt(qtySelector.value)
  if (oldValue === 1) {
    qtySelector.value = 1
  } else {
    qtySelector.value = oldValue - 1
  }
})

class VariantSelects extends HTMLElement {
  constructor () {
    super()
    this.addEventListener('change', this.onVariantChange)
  }

  onVariantChange () {
    this.updateOptions()
    this.updateMasterId()

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true)
      this.setUnavailable()
    } else {
      this.updateURL()
      this.updateVariantInput()
    }
  }

  updateOptions () {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value)
  }

  updateMasterId () {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option
      }).includes(false)
    })
  }

  updateMedia () {
    if (!this.currentVariant) return
    if (!this.currentVariant.featured_media) return

    const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`)
    mediaGalleries.forEach(mediaGallery => mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true))

    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`)
    if (!modalContent) return
    const newMediaModal = modalContent.querySelector(`[data-media-id="${this.currentVariant.featured_media.id}"]`)
    modalContent.prepend(newMediaModal)
  }

  updateURL () {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`)
  }

  updateShareUrl () {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`)
    if (!shareButton || !shareButton.updateUrl) return
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`)
  }

  updateVariantInput () {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`)
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]')
      input.value = this.currentVariant.id
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }

  updateVariantStatuses () {
    const selectedOptionOneVariants = this.variantData.filter(variant => this.querySelector(':checked').value === variant.option1)
    const inputWrappers = [...this.querySelectorAll('.product-form__input')]
    inputWrappers.forEach((option, index) => {
      if (index === 0) return
      const optionInputs = [...option.querySelectorAll('input[type="radio"], option')]
      const previousOptionSelected = inputWrappers[index - 1].querySelector(':checked').value
      const availableOptionInputsValue = selectedOptionOneVariants.filter(variant => variant.available && variant[`option${index}`] === previousOptionSelected).map(variantOption => variantOption[`option${index + 1}`])
      this.setInputAvailability(optionInputs, availableOptionInputsValue)
    })
  }

  getVariantData () {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent)
    return this.variantData
  }
}

customElements.define('variant-selects', VariantSelects)
