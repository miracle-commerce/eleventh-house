if(!window.initVar){
  window.initVar = {
    apiUrl: "https://cartbite-api.staqlab.com/grow",
    serviceWorkerUrl: "/apps/grow/grow/api/p/js/sw.js",
    subscriberNewUniqueIdUrl: "https://cartbite-api.staqlab.com/grow/api/subscribers/uniqueId",
    clientStatusUrl: "https://cartbite-api.staqlab.com/grow/api/clientStatus",
    clickNotificationUrl: "https://cartbite-api.staqlab.com/grow/api/workflows/event",
    subscribeUrl: "https://cartbite-api.staqlab.com/grow/api/subscriber",
    meta: {},
    vapidKey: "BFpzWmS1_6-qD1qhV6ENqBHZ5wEchAuP9Y5KqX4pCsXfC0_flqbcn48sIUwYAhjswp8Qbn__KR7IBkWkjoU_o24",
    clientId: "4LW6NIURLRR8P1YWQ1EUSNZC",
    pushOptInSetting: {"delay":86400,"message":{"body":"We will notify you about new products and exclusive promotions","title":"Never miss a sale","buttons":[{"label":"Later","order":1},{"label":"Allow","order":2}],"iconUrl":"https://stlf.nyc3.cdn.digitaloceanspaces.com/stq/bell_oprzpo.png"},"isEnabled":false,"showModal":true,"initialDelay":10},
    subscriberId: '',
    stockFulFilledPushCampaign: {
      isActive: true,
      uniqueId: 'LZCZI2KDTXNEK15S7D1CCHCY'
    },
    stockFulFilledEmailCampaign: {
      isActive: true,
      uniqueId: 'SJV2CGBDK5RRC2I2T1HA83H9'
    },
    stockFulFilledSmsCampaign: {
      isActive: true,
      uniqueId: 'LCAW2STL5GRJ14R3ARBHZ6XK'
    },
    priceDropPushCampaign: {
      isActive: true,
      uniqueId: 'E9CYJGHNV7WGTHH2C1FKWQU2',
    },
    priceDropEmailCampaign: {
      isActive: true,
      uniqueId: '6ZW94QDHTTRC6LESL6D5QIDJ',
    },
    priceDropSmsCampaign: {
      isActive: true,
      uniqueId: 'TBP9BA6FT9GL4QG2GBHQKVQ2',
    },
    stockWidget: {
      selector: "gw-stock-fulfilled",
      isEnabled: true,
      popupSelector: "gw-stock-fulfilled-iframe",
      buttonType: "float",
      inlineButtonParentSelector: ``,
      backgroundColor: "#282828",
      textColor: "#f8f4ed",
      subscriptionText: "Notify me when available",
      subscribedText: "We will notify you when the item is back in stock",
      modalHtml: `<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/vue@2.6.12"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue-tel-input"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vue-tel-input/dist/vue-tel-input.css"/>
  <script src="https://cdn.jsdelivr.net/npm/vue-select@3.0.0"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vue-select@3.0.0/dist/vue-select.css">

  <style>
    * {
      color: #353f4d;
    }

    .fade-in {
      background: rgba(0, 0, 0, 0.65)
    }

    .email-input {
      -webkit-text-size-adjust: 100%;
      -webkit-tap-highlight-color: transparent;
      -webkit-font-smoothing: antialiased;
      box-sizing: border-box;
      font: inherit;
      margin: 0 0 10px 0;
      font-family: inherit;
      display: block;
      width: 100%;
      color: #555555;
      /*background-color: #ffffff;*/
      background-image: none;
      /*box-shadow: inset 0 0px 0px rgb(0 0 0 / 8%);*/
      transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
      height: 46px;
      padding: 10px 16px;
      line-height: 1.3333333;
      border-radius: 4px;
      background-color: #eee !important;
      border-color: #eee !important;
      border-style: solid;
      border-width: 1px;
      font-size: 15px;
    }

    .vue-tel-input input {
      font-size: 15px;

    }

    .vue-tel-input, .vue-tel-input:focus-within {
      box-shadow: none;
      height: 46px;
      border-style: solid;
      border-width: 1px;
      border-radius: 4px;
      font-size: 17px;
      margin: 0 0 10px 0;
    }

    .vue-tel-input:focus-within input {
      background-color: #eee !important;
    }

    .vti__dropdown-list.below {
      top: 45px;
    }

    .vue-tel-input:focus-within {
      outline: -webkit-focus-ring-color auto 1px;
      background-color: #eee !important;
    }

    .vti__dropdown.open {
      outline: none;
      background: transparent;
    }

    .modal-container {
      -webkit-text-size-adjust: 100%;
      -webkit-tap-highlight-color: transparent;
      font-size: 14px;
      line-height: 1.42857143;
      -webkit-font-smoothing: antialiased;
      color: #333333;
      box-sizing: border-box;
      border-radius: 5px;
      padding: 30px 40px 20px 40px;
      position: fixed;
      width: 460px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      margin: auto;
      font-family: Helvetica, sans-serif;
      background: #ffffff;
      border-color: #000000;
      border-width: 1px;
      border-style: solid;
    }

    @media only screen and (max-width: 480px) {
      .modal-container {
        width: 370px;
      }
    }

    .modal-title {
      margin: 0;
      font-size: 22px;
      font-weight: 500;
      margin: 0;
      line-height: 1.42857143;
    }

    .notify-button {
      font-weight: bold;
      font-size: 15px;
      padding: 14px;
      color: #ffffff;
      background-color: #000000;
      border-color: #000000;
      border-radius: 25px;
      width: 100%;
      margin-top: 15px;
      cursor: pointer;
    }

    .notification-message {
      margin-top: 3px;
    }

    .close-icon {
      -webkit-text-size-adjust: 100%;
      -webkit-tap-highlight-color: transparent;
      -webkit-font-smoothing: antialiased;
      box-sizing: border-box;
      font: inherit;
      margin: 0;
      overflow: visible;
      text-transform: none;
      font-family: inherit;
      float: right;
      font-size: 15px;
      font-weight: bold;
      line-height: 1;
      text-shadow: 0 1px 0 #ffffff;
      opacity: 0.5;
      color: #cccccc;
      padding: 0;
      cursor: pointer;
      background: transparent;
      border: 0;
      appearance: none;
      margin-right: -25px;
      margin-top: -20px;
    }

    .close-icon:hover {
      color: #0b0d0f;
      cursor: pointer;
    }

    .privacy-text {
      font-size: 11px;
      margin-bottom: 0;
    }

    /*input[type=checkbox] {*/
    /*  height: 0;*/
    /*  width: 0;*/
    /*  visibility: hidden;*/
    /*}*/

    /*label {*/
    /*  cursor: pointer;*/
    /*  text-indent: -9999px;*/
    /*  width: 40px;*/
    /*  height: 20px;*/
    /*  background: grey;*/
    /*  display: block;*/
    /*  border-radius: 100px;*/
    /*  position: relative;*/
    /*}*/

    /*label:after {*/
    /*  content: '';*/
    /*  position: absolute;*/
    /*  top: 0px;*/
    /*  left: 0px;*/
    /*  width: 20px;*/
    /*  height: 20px;*/
    /*  background: #fff;*/
    /*  border-radius: 90px;*/
    /*  transition: 0.3s;*/
    /*}*/

    /*input:checked + label {*/
    /*  background: #e3f3fc;*/
    /*}*/

    /*input:checked + label:after {*/
    /*  left: calc(100% - 0.5px);*/
    /*  transform: translateX(-100%);*/
    /*  background: #48b0f7*/
    /*}*/

    [v-cloak] {
      display: none;
    }

    .gw-success-message.complete {
      display: block;
    }

    .alert-success {
      background-color: #dff0d8;
      border-color: #dff0d8;
      color: #3c763d;
    }

    .gw-success-message {
      display: none;
    }

    .alert {
      padding: 6px 10px;
      font-size: 13px;
      margin: 15px 0;
    }

    .marketing-container {
      margin-top: 30px;
      display: flex;
    }

    .marketing-container-label {
      margin-left: 5px;
    }

    .gw-branding-powered-by {
      margin-bottom: -10px;
      float: right;
      display: flex;
      align-items: center;
      margin-top: 30px;
      justify-content: center;
      margin-right: -24px;
    }

    .gw-branding-powered-by span img {
      margin-left: 6px;
      width: 100px;
    }

    .channel-selector {
      display: flex;
    }

    .channel-selector .btn-group {
      width: 50%;
    }

    .channel-selector .btn-group button {
      width: 100%;
      font-size: 14px;
      padding: 9px;
      margin-bottom: 30px;
      margin-top: 15px;
      letter-spacing: 0.8px;
      border: none;
    }

    .channel-selector .btn-group button.active {
      background-color: #0b2e13;
      color: white;
    }

    #email-tab {
      border-radius: 4px 0px 0px 4px;
      border-color: transparent;
    }

    #sms-tab {
      border-radius: 0px 4px 4px 0px;
      border-color: transparent;
    }

    #variant-container {
      margin-bottom: 30px;
      margin-top: 25px;
      font-size: 17px;
    }

    .channel-variant-gap {
      margin-top: -15px;
    }

    @media only screen and (max-width: 480px) {
      .modal-title {
        font-size: 18px;
      }
    }

  </style>

  <style>
    .modal-title{
}
.notification-message{
}
.email-input{
}
.notify-button{
}
.privacy-text{
}
.close-icon{
}
  </style>
</head>
<body class="fade-in pop-up-container">
<div class="modal" v-cloak id="el">
  <div class="modal-container">
    <button type="button" class="close-icon action-close"
            data-dismiss="modal"
            @click.prevent="closeModal">X
    </button>
    <h3 class="modal-title">NOTIFY ME WHEN AVAILABLE</h3>
    <p class="notification-message">We will notify you when the product is back in stock</p>

    <div id="variant-container" v-if="showVariantSelectorInput()">
      <div :key="variantKey">
        <v-select
          @input="variantChanged()"
          :options="variants" label="text" :reduce="item => item.value"
          v-model="selectedVariant"
          style="margin-top: 5px"></v-select>
      </div>
    </div>

    <div :class="{'channel-selector':true,'channel-variant-gap':showVariantSelector}" v-if="showChannelSelector()">
      <div class="btn-group">
        <button type="button" :class="'btn btn-default '+ (selectedChannel==='email'?'active':'')" id="email-tab"
                @click="()=>{selectedChannel='email'}"
        >Email
        </button>
      </div>
      <div class="btn-group">
        <button type="button" :class="'btn btn-default '+ (selectedChannel==='sms'?'active':'')" id="sms-tab"
                @click="()=>{selectedChannel='sms';changePhoneNumberPlaceholder()}"
        >SMS
        </button>
      </div>
    </div>
    <template v-if="selectedChannel==='email'">
      <input class="email-input" :placeholder="emailPlaceholder"
             v-model="email" @change="emailChanged()">
      <small style="color: red" v-if="!isEmailValid">Please Provide Valid Email</small>
    </template>
    <template v-if="selectedChannel==='sms'">
      <vue-tel-input v-model="phoneNumber"
                     :default-country="getDefaultCountry()"
                     @input="phoneNumberChanged()"
                     @open="onDropdownOpen(true)"
                     v-on:country-changed="countryChanged"
                     @close="onDropdownOpen(false)">
        <template v-slot:arrow-icon>
          <span v-if="phoneNumberDropDown">▲</span>
          <span v-else>▼</span>
        </template>
      </vue-tel-input>
      <small style="color: red" v-if="!isPhoneNumberValid">Please Provide Valid Contact Number</small>
      <small style="color: red" v-if="!isCountryCodeValid">Please Select Country</small>
    </template>

    <!--    <input type="checkbox" id="switch" /><label for="switch">Toggle</label>-->
    <div style="display: flex;width: 100%;justify-content: center">
      <button class="notify-button"
              @click="notifyButtonClicked">
        Notify Me
      </button>
    </div>
    <div v-if="dataEntered" class="gw-success-message alert alert-success complete"> Your notification has been registered.
      <a href="#"
         class="action-close"
         @click.p.prevent="closeModal">Close</a>
    </div>

    <div class="marketing-container" v-if="shopifyMailingListEnabled">
      <input type="checkbox" class="marketing-container-input" name="accepts_marketing"
             id="accepts_marketing" v-model="optInToMarketing">
      <label class="marketing-container-label" for="accepts_marketing">Signup for newsletter?</label>
    </div>
    <p class="privacy-text">We respect your privacy and do not share your email with anyone.</p>

    <p class="gw-branding-powered-by" v-if="brandingEnabled">Powered By <span><img
      src="https://stlf.nyc3.cdn.digitaloceanspaces.com/stq/logo_cb.svg" width="50px"></span></p>
  </div>
</div>
</body>
<script>
  Vue.component('v-select', VueSelect.VueSelect);
  window.onload = function () {
    window.growCampaignPopUp = new Vue({
      el: "#el",
      data: {
        iFrameId: "gw-stock-fulfilled-iframe",
        heading: "heading",
        subheading: "We will notify you when the product is back in stock",
        notifyButtonTitle: "Notify Me",
        privacyText: "We respect your privacy and do not share your email with anyone.",
        emailWorkflowUniqueId: "SJV2CGBDK5RRC2I2T1HA83H9",
        smsWorkflowUniqueId: "LCAW2STL5GRJ14R3ARBHZ6XK",
        successText: "Your notification has been registered.",
        successCloseText: "Close",
        optInMarketingText: "Signup for newsletter?",
        email: "",
        phoneNumber: '',
        phoneNumberCountryDetails: {},
        phoneNumberDropDown: false,
        dataEntered: false,
        isEmailValid: true,
        isPhoneNumberValid: true,
        isCountryCodeValid: true,
        optInToMarketing: true,
        shopifyMailingListEnabled: false,
        brandingEnabled: true,
        emailInputEnabled: true,
        smsInputEnabled: false,
        selectedChannel: 'email',
        variants: [],
        variantKey: "vk-",
        selectedVariant: '',
        showVariantSelector: false,
        emailPlaceholder: 'Email Address',
        phoneNumberPlaceholder: 'Enter a phone number'
      },
      methods: {
        closeModal() {
          parent.initVar.closePopUp(this.iFrameId)
        },
        emailChanged() {
          this.isEmailValid = true
        },
        phoneNumberChanged() {
          this.isPhoneNumberValid = true
        },
        checkEmail(email) {
          return parent.initVar.checkEmail(email)
        },
        checkPhoneNumber(phoneNumber) {
          return parent.initVar.checkPhoneNumber(phoneNumber)
        },
        notifyButtonClicked() {
          if (this.selectedChannel === 'email' && !this.checkEmail(this.email)) {
            this.isEmailValid = false;
            return;
          }
          let countryCode = this.phoneNumberCountryDetails.dialCode
          if (this.selectedChannel === 'sms') {
            if (!this.checkPhoneNumber(this.phoneNumber)) {
              this.isPhoneNumberValid = false;
              return
            }
            if (!countryCode) {
              console.error("Invalid Country Data", this.phoneNumberCountryDetails)
              this.isCountryCodeValid = false;
              return
            }
          }
          if (this.successText && this.successCloseText) {
            this.dataEntered = true;
            setTimeout(() => {
              this.closeModal()
            }, 2900);
          } else {
            this.closeModal()
          }
          if (this.selectedChannel === 'email') {
            parent.initVar.campaignPopUpNotifyButtonClicked(this.iFrameId, this.emailWorkflowUniqueId,
              this.email, this.optInToMarketing)
          }
          if (this.selectedChannel === 'sms') {
            parent.initVar.campaignPopUpNotifyButtonClicked(this.iFrameId, this.smsWorkflowUniqueId,
              {
                smsTarget: this.phoneNumber,
                smsDialCode: countryCode,
              }, this.optInToMarketing)
          }
        },
        onDropdownOpen(value) {
          this.phoneNumberDropDown = value
        },
        changePhoneNumberPlaceholder() {
          let count = 0;
          let interval = setInterval(() => {
            console.log("Changing SMS Placeholder")
            if (count === 100) {
              clearInterval(interval)
            }
            count++;
            if (document.querySelector('[name=telephone]')) {
              document.querySelector('[name=telephone]').placeholder = this.phoneNumberPlaceholder;
              clearInterval(interval)
            }
          }, 50)
        },
        showChannelSelector() {
          if (this.emailInputEnabled && this.smsInputEnabled) {
            return true
          }
          return false
        },
        countryChanged(country) {
          this.phoneNumberCountryDetails = country;
          this.isCountryCodeValid = true;
          console.log(country)
        },
        variantChanged() {
          parent.initVar.variantChangedFromModal(this.selectedVariant)
        },
        showVariantSelectorInput() {
          if (!this.showVariantSelector) {
            return false
          }
          if (this.variants.length === 1 && this.variants[0].text.toLowerCase() === "default title") {
            return false
          }
          return true
        },
        getDefaultCountry() {
          return parent.initVar.defaultCountry;
        }
      }
    });
    parent.growCampaignPopUps = parent.parent.growCampaignPopUps || {};
    parent.growCampaignPopUps[window.growCampaignPopUp.iFrameId] = window.growCampaignPopUp;
    if (window.growCampaignPopUp.selectedChannel === 'sms') {
      window.growCampaignPopUp.changePhoneNumberPlaceholder();
    }
  };
  window.addEventListener('click', function (e) {
    if (e && e.path && !e.path.some(x => x.className && x.className.includes && x.className.includes('modal-container'))) {
      if (parent.initVar.closeCampaignPopUpOnOutSideClick)
        window.growCampaignPopUp.closeModal()
    }
  }, true)
</script>
</html>
`,
      showIfAnyVariantIsOutOfStock: false,
    },
    priceDropWidget: {
      selector: "gw-price-drop",
      isEnabled: false,
      popupSelector: "gw-price-drop-iframe",
      buttonType: "float",
      inlineButtonParentSelector: ``,
      backgroundColor: "#000000",
      textColor: "#ffffff",
      subscriptionText: "Notify me when price drops",
      subscribedText: "We will notify you when price drops",
      modalHtml: `{priceDropModalHtml}`
    },
    customJs: `null`,
    customCss: `null`,
    dataVariantId: "data-variant-id",
    dataProductId: "data-product-id",
    dataProductHandle: "data-product-handle",
    clickedProductId: null,
    clickedProductHandle: null,
    clickedVariantId: null,
    defaultCountry:'',


    addFloatWidget: function (text, dataAttribute, onClickFunction, productId, variantId, productHandle) {
      let button = document.createElement("button");
      button.setAttribute(dataAttribute, '')
      button.classList = "btn button Button gw-float-widget"
      button.type = "button";
      button.innerText = text;
      button.setAttribute(initVar.dataProductId, productId)
      button.setAttribute(initVar.dataVariantId, variantId)
      button.setAttribute(initVar.dataProductHandle, productHandle)
      button.onclick = (e) => onClickFunction(e);
      document.body.appendChild(button);
    },
    setStockFulFilledVariantOptions: async function () {
      let modalData = window.growCampaignPopUps[initVar.stockWidget.popupSelector].$data;
      if (!initVar.clickedProductId) {
        return -1
      } else {
        let product = await this.getProduct(initVar.clickedProductHandle);
        modalData.variants = product.variants.filter(x => !initVar.checkIfInStock(x, product)).map(x => {
          return {
            text: x.title,
            value: x.id
          }
        });
        let isSelectedVariantIsOutOfStock = modalData.variants.find(x => x.value === initVar.clickedVariantId)
        if (!isSelectedVariantIsOutOfStock) {
          let firstOutOfStockVariant = initVar.getValueIfExist(() => modalData.variants[0].value);
          if (firstOutOfStockVariant) {
            initVar.clickedVariantId = firstOutOfStockVariant;
          }
        }
        modalData.selectedVariant = initVar.clickedVariantId;
        modalData.variantKey = "vk-" + (new Date().valueOf())
      }
    },
    setPriceDropVariantOptions: async function () {
      let modalData = window.growCampaignPopUps[initVar.priceDropWidget.popupSelector].$data;
      if (!initVar.clickedProductId) {
        return -1
      } else {
        let product = await this.getProduct(initVar.clickedProductHandle);
        modalData.variants = product.variants.map(x => {
          return {
            text: x.title,
            value: x.id
          }
        });
        modalData.selectedVariant = initVar.clickedVariantId;
        modalData.variantKey = "vk-" + (new Date().valueOf())
      }
    },
    variantChangedFromModal: function (variantId) {
      initVar.clickedVariantId = variantId
    },
    stockWidgetClicked: async function (event) {
      growConfig.performTranslation();
      initVar.clickedProductId = initVar.getValueIfExist(() => Number(event.target.attributes[initVar.dataProductId].value))
      initVar.clickedProductHandle = initVar.getValueIfExist(() => (event.target.attributes[initVar.dataProductHandle].value))
      initVar.clickedVariantId = initVar.getValueIfExist(() => Number(event.target.attributes[initVar.dataVariantId].value))
      //check if email campaign is enabled
      // if (initVar.stockFulFilledEmailCampaign.isActive)
      document.getElementById(initVar.stockWidget.popupSelector).style.display = "block";
      initVar.setStockFulFilledVariantOptions();
      if (await growClient.isPushConsentGiven())
        await initVar.sendSubscriptionRequest(initVar.stockFulFilledPushCampaign.uniqueId)
    },
    waitForEvent: async function (ms, conditionCheck, times) {
      let c = 0;
      while (c < times) {
        let isSatsfied = await conditionCheck()
        if (isSatsfied) {
          return isSatsfied;
        }
        await new Promise(res => {
          setTimeout(() => {
            res()
          }, ms)
        })
        c++;
      }
      return false;
    },
    addToCartClicked: async function (event) {
      console.log("cart clicked")
      let cart;
      let isSatisfied = await initVar.waitForEvent(100, async () => {
        cart = await initVar.getCart()
        return cart.items && cart.items.length
      }, 10)
      if (!isSatisfied) {
        return
      }
      const url = `${initVar.apiUrl}/api/subscribers/cartMapping`;
      const mapping = {
        clientId: initVar.clientId,
        cartToken: cart.token,
        subscriberUniqueId: initVar.subscriberId,
        cartJson: {
          token: cart.token,
          items: cart.items.map(item => {
            return {
              product_id: item.product_id,
              product_title: item.product_title,
              image: initVar.getValueIfExist(() => item.image.split("?")[0]),
              variant_id: item.variant_id,
              variant_title: item.variant_title,
              price: item.price
            }
          })
        }
      };
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mapping)
      });
    },
    checkEmail: function (email) {
      return /\S+@\S+\.\S+/.test(email)
    },
    checkPhoneNumber: function (phoneNumber) {
      phoneNumber = phoneNumber.replace(/-/g, "").replace(/ /g, "")
        .replace(/\(/g, "").replace(/\)/g, "")
      if (Number.isNaN(phoneNumber)) {
        return false
      }
      if (parseInt(phoneNumber) !== Number(phoneNumber)) {
        return false
      }
      if (parseInt(phoneNumber) < 100) {
        return false
      }
      return true
    },
    priceDropClicked: async function (event) {
      growConfig.performTranslation();
      //  if (initVar.priceDropEmailCampaign.isActive)
      // console.log("setting growClickedProduct")
      initVar.clickedProductId = initVar.getValueIfExist(() => Number(event.target.attributes[initVar.dataProductId].value))
      initVar.clickedProductHandle = initVar.getValueIfExist(() => (event.target.attributes[initVar.dataProductHandle].value))
      initVar.clickedVariantId = initVar.getValueIfExist(() => Number(event.target.attributes[initVar.dataVariantId].value))
      document.getElementById(initVar.priceDropWidget.popupSelector).style.display = "block";
      initVar.setPriceDropVariantOptions();

      if (await growClient.isPushConsentGiven())
        await initVar.sendSubscriptionRequest(initVar.priceDropPushCampaign.uniqueId)
      document.querySelectorAll(`[${initVar.priceDropWidget.selector}]`)[0].innerText =
        initVar.priceDropWidget.subscribedText
    },

    sendSubscriptionRequest: async function (campaignId, adHocData) {
      let product = null
      let variant = null
      try {
        if (initVar.clickedProductHandle && initVar.clickedProductHandle !== "undefined") {
          let clickedProduct = (await (await fetch(`${initVar.clickedProductHandle}.js`)).json())
          initVar.processProduct(clickedProduct)
          let clickedVariant = clickedProduct.variants.find(x => x.id === initVar.clickedVariantId)
          if (clickedVariant) {
            console.log("Clicked Variant Found")
            product = clickedProduct;
            variant = clickedVariant;
          }
        }

      } catch (e) {
        console.log(e)
      }
      if (!product || !variant) {
        console.error("Parsing Variant from Url")
        product = await initVar.getProduct()
        variant = await initVar.getSelectedVariant(product)
      }

      let subscriptionEvent = {
        productId: Number(product.id),
        productPrice: Number(variant.price),
        variantId: variant.id,
        variantPrice: Number(variant.price),
        productTitle: product.title,
        variantTitle: variant.title
      }


      if (product.id !== initVar.clickedProductId) {
        console.error("Error in check product id attribute")
      }

      if (variant.id !== initVar.clickedVariantId) {
        console.error("Error in check variant id attribute")
      }


      const mapping = {
        campaignUniqueId: campaignId,
        subscriberUniqueId: initVar.subscriberId,
        email: adHocData && adHocData.email,
        smsTarget: adHocData && adHocData.smsTarget,
        smsDialCode: adHocData && adHocData.smsDialCode,
        optInToMarketing: adHocData && adHocData.optInToMarketing,
        subscriptionEvent: subscriptionEvent
      };


      const url = `${initVar.apiUrl}/api/subscribers/campaignMapping`;
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mapping)
      });
    },


    getSubscriptionEvent: async function (campaignId, variantId) {
      const url = `${initVar.apiUrl}/api/subscribers/campaignMapping?campaignUniqueId=${campaignId}&subscriberUniqueId=${initVar.subscriberId}&variantId=${variantId}`;
      return (await (await fetch(url)).json())
    },


    getProduct: async function (handle) {
      //if(window.product)
      if (!window.product || window.product.id !== product.id || !window.product.variants || !window.product.length) {
        let product;
        try {
          handle = handle || window.location.href.split("?")[0].split("#")[0]
          product = (await (await fetch(`${handle}.js`)).json())
        } catch (e) {
          console.log("Error in fetching product", e)
        }
        window.product = product;
        initVar.processProduct(window.product)
      }
      return window.product;
    },
    processProduct: function (product) {
      product.variants.forEach(x => {
        x.price = x.price / 100
      })
      return product;
    },
    getCart: async function () {
      let cart;
      try {
        cart = (await (await fetch(`/cart.js`)).json())
        cart.items.forEach(x => {
          x.price = x.price / 100
        })
        return cart;
      } catch (e) {
        console.log("Error in fetching product", e)
      }
    },
    getQueryParam: function (name) {
      let queryStringToJSON = (qs) => {
        qs = qs || location.search.slice(1);

        let pairs = qs.split('&');
        let result = {};
        pairs.forEach(function (p) {
          let pair = p.split('=');
          let key = pair[0];
          let value = decodeURIComponent(pair[1] || '');

          if (result[key]) {
            if (Object.prototype.toString.call(result[key]) === '[object Array]') {
              result[key].push(value);
            } else {
              result[key] = [result[key], value];
            }
          } else {
            result[key] = value;
          }
        });

        return JSON.parse(JSON.stringify(result));
      }

      let queryJson = queryStringToJSON(location.search.slice(1))
      return queryJson[name];
    },
    getOptionValue: async function (index) {
      let value = this.getValueIfExist(() => initVar.getVariantSelector(index).find(x => {
        return (x.type === "radio" && x.checked === true) || x.type !== "radio"
      }).value)
      if (!value) {
        value = this.getValueIfExist(() => {
          let item = initVar.getVariantSelector(index).find(x => {
            if (x.tagName === "LI") {
              return x.className.includes("is-selected")
            }
          })
          if (item) {
            //add or condition here in future
            return item.getAttribute("data-escape")
          }
        })
      }

      return value;
    },
    getSelectedVariant: async function (product) {
      let variantId = ""
      if (!variantId) {
        let op1 = await initVar.getOptionValue(1) || null
        let op2 = await initVar.getOptionValue(2) || null
        let op3 = await initVar.getOptionValue(3) || null
        console.log(op1, op2, op3)
        let variant = product.variants.find(x => x.option1 === op1 && x.option2 === op2 && x.option3 === op3)
        if (variant) {
          variantId = variant.id
        }
      }
      console.log(variantId, "by options")
      if (!variantId)
        variantId = parseInt(initVar.getQueryParam('variant'))
      if (!variantId) {
        variantId = parseInt(ShopifyAnalytics && ShopifyAnalytics.meta && ShopifyAnalytics.meta.selectedVariantId)
        let variant = product.variants.find(x => Number(x.id) === Number(variantId))
        if (!variant)
          variantId = null
      }

      if (!variantId && product.variants.length === 1)
        variantId = product.variants[0].id

      if (!variantId) {
        if (!(initVar.selectFirstVariant === false)) {
          variantId = (product.variants.find(x=>x.available) || product.variants[0]).id
        }
      }

      let variant = product.variants.find(x => Number(x.id) === Number(variantId))
      // if(!variantFromUrl){
      //   variantFromUrl=product.
      // }


      return variant;
    },
    getValueIfExist: function (fn) {
      try {
        return fn();
      } catch (e) {
        return;
      }
    },
    closePopUp: function (id) {
      document.getElementById(id).style.display = "none";
    },
    campaignPopUpNotifyButtonClicked: async function (id, workFlowId, inptData, optInToMarketing) {
      // setTimeout(x=>{
      //   document.getElementById(id).style.display = "none";
      // },2500);
      if ([initVar.stockFulFilledEmailCampaign.uniqueId, initVar.priceDropEmailCampaign.uniqueId].some(x => x === workFlowId)) {
        await initVar.sendSubscriptionRequest(workFlowId, {
          email: inptData,
          optInToMarketing: optInToMarketing
        })
      }
      if ([initVar.stockFulFilledSmsCampaign.uniqueId, initVar.priceDropSmsCampaign.uniqueId].some(x => x === workFlowId)) {
        await initVar.sendSubscriptionRequest(workFlowId, {
          smsTarget: inptData.smsTarget,
          smsDialCode: inptData.smsDialCode,
          optInToMarketing: optInToMarketing
        })
      }
      if ([initVar.stockFulFilledEmailCampaign.uniqueId, initVar.stockFulFilledSmsCampaign.uniqueId].some(x => x === workFlowId))
        document.querySelectorAll(`[${initVar.stockWidget.selector}]`)[0].innerText =
          initVar.stockWidget.subscribedText
      // if ([initVar.priceDropEmailCampaign.uniqueId,initVar.priceDropSmsCampaign.uniqueId].some(x=>x===workFlowId))
      //   document.querySelectorAll(`[${initVar.priceDropWidget.selector}]`)[0].innerText =
      //     initVar.priceDropWidget.subscribedText
      console.log(id, inptData, workFlowId)
    },
    addPopUp: function (idSelector, html) {
      console.log("addPopup")
      if (!document.getElementById(idSelector)) {
        let iframe = document.createElement('iframe');
        iframe.style.display = "hidden";
        iframe.id = idSelector;
        iframe.className = "gw-modal"
        iframe.srcdoc = html
        document.body.appendChild(iframe);
      }
    },

    renderStockWidget: async function (product, variant) {
      this.addPopUp(initVar.stockWidget.popupSelector, initVar.stockWidget.modalHtml)
      while (document.querySelectorAll(`[${initVar.stockWidget.selector}]`).length > 0) {
        document.querySelectorAll(`[${initVar.stockWidget.selector}]`)[0].parentNode
          .removeChild(document.querySelectorAll(`[${initVar.stockWidget.selector}]`)[0])
      }
      if (!initVar.stockWidget.isEnabled) {
        return;
      }
      let showWidgetEvenIfCurrentVariantIsInStock = false
      if (initVar.stockWidget.showIfAnyVariantIsOutOfStock) {
        showWidgetEvenIfCurrentVariantIsInStock = product.variants.some(x => !initVar.checkIfInStock(x, product))
      }

      if (!initVar.checkIfInStock(variant, product) || showWidgetEvenIfCurrentVariantIsInStock) {
        // let event = await this.getSubscriptionEvent
        // (initVar.stockFulFilledPushCampaign.uniqueId, variant.id)
        // let text = event.uniqueId && !event.lastMessageSentAt ? initVar.stockWidget.subscribedText :
        //   initVar.stockWidget.subscriptionText
        let text=initVar.stockWidget.subscriptionText;
        if (initVar.stockWidget.buttonType === 'float') {
          initVar.addFloatWidget(text,
            initVar.stockWidget.selector, initVar.stockWidgetClicked, product && product.id, variant && variant.id,
            product && product.handle)
        }

        if (window["addStockFulfilledButton"]) {
          window["addStockFulfilledButton"]()
        } else {
          initVar.addStockFulfilledButton(product && product.id, variant && variant.id,
            product && product.handle)
        }
      }

    },

    renderPriceDropWidget: async function (product, variant) {
      this.addPopUp(initVar.priceDropWidget.popupSelector, initVar.priceDropWidget.modalHtml)

      while (document.querySelectorAll(`[${initVar.priceDropWidget.selector}]`).length > 0) {
        document.querySelectorAll(`[${initVar.priceDropWidget.selector}]`)[0].parentNode
          .removeChild(document.querySelectorAll(`[${initVar.priceDropWidget.selector}]`)[0])
      }
      if (!initVar.priceDropWidget.isEnabled) {
        return;
      }
      if (initVar.checkIfInStock(variant, product)) {
        // let event = await this.getSubscriptionEvent
        // (initVar.priceDropPushCampaign.uniqueId, variant.id)
        // let text = event.uniqueId && !event.lastMessageSentAt ? initVar.priceDropWidget.subscribedText :
        //   initVar.priceDropWidget.subscriptionText
        let text = initVar.priceDropWidget.subscriptionText
        if (initVar.priceDropWidget.buttonType === 'float') {
          initVar.addFloatWidget(text,
            initVar.priceDropWidget.selector, initVar.priceDropClicked, product && product.id,
            variant && variant.id, product && product.handle)
        }
        if (window["addPriceDropButton"]) {
          window["addPriceDropButton"]()
        } else {
          initVar.addPriceDropButton(product && product.id, variant && variant.id, product && product.handle)
        }
      }
    },

    checkIfInStock: function (variant, product) {
      if (variant.available) {
        return true;
      }
      return false;
    },
    afterVariantChangeFn:function (){
    },
    onVariantChange: async function () {
      try {
        if (!initVar.processingOnVariantChange) {
          initVar.processingOnVariantChange = true;
          let product = await initVar.getProduct()
          let variant = await initVar.getSelectedVariant(product)
          await initVar.renderStockWidget(product, variant)
          await initVar.renderPriceDropWidget(product, variant)
          initVar.processingOnVariantChange = false;
          console.log("Grow Variant Change title", variant.title)
          initVar.getValueIfExist(()=>initVar.afterVariantChangeFn())
          //alert("variant"+variant.id)
        }
      } catch (e) {
        console.log(e)
        initVar.processingOnVariantChange = false;
      }

    },
    performTranslation: function () {
      if (growConfig.translateContent) {
        growConfig.translateContent()
      }
    },
    registerOnVariantChange: function () {
      let firstTimeUrl = document.URL;
      document.addEventListener('change', function () {
        let currentPageUrl = document.URL;
        let url = new URL(currentPageUrl);
        let isVariantUrl = url.searchParams.get("variant");
        currentPageUrl = isVariantUrl ? currentPageUrl : isVariantUrl;
        if (currentPageUrl && firstTimeUrl !== currentPageUrl) {
          firstTimeUrl = currentPageUrl;
          console.log('Grow Url Variant change variant_id: ' + isVariantUrl + '');
          window.growConfig.onVariantChange();
        }
      });
      [1, 2, 3].forEach(index => {

        initVar.getValueIfExist(() => {
          initVar.getVariantSelector(index).forEach(x => {
            x.addEventListener('change', window.growConfig.onVariantChange)
            if (x.tagName === "LI") {
              x.addEventListener('click', () => {
                setTimeout(() => {
                  window.growConfig.onVariantChange()
                }, 500)
              })
            }
          })
        })
      })
    },

    getVariantSelector: function (index) {
      let ele = document.querySelectorAll(`[data-index=\"option${index}\"]`) ||
        document.querySelectorAll(`#Option-product-${index - 1}`)
      if (!ele || !ele.length || ele.length === 0)
        ele = document.querySelectorAll(`#Option-product-${index - 1}`)
      if (!ele || !ele.length || ele.length === 0)
        ele = document.querySelectorAll(`#nt_select_ppr_${index - 1} li`)
      return [...ele]
    },


    registerAddToCartChange: function () {
      initVar.getValueIfExist(() => {
        let ele = document.querySelector("[name=\"add\"]") ||
          document.querySelector("[data-action=\"add-to-cart\"]") ||
          document.querySelector("[data-add-to-cart]")
        ele.addEventListener('click', window.growConfig.addToCartClicked)
      })

    },
    isPostPurchasePage: function () {
      return window.Shopify && (Shopify.Checkout) && (Shopify.Checkout.page === "thank_you" || Shopify.Checkout.isOrderStatusPage)
    },
    isCartPage: function () {
      return (window.location.href.includes("cart"))
    },
    sendOrderPurchaseEvent: async function (client) {
      let json = await client.getNotificationsClicked()
      if (json.length) {
        const url = `${initVar.apiUrl}/api/workflows/event`;
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clientUniqueId: initVar.clientId,
            notificationWorkFlowUniqueId: null,
            subscriberUniqueId: initVar.subscriberId,
            eventData: {
              amount: Number(Shopify.checkout.subtotal_price),
              name: "purchase",
              notificationsClicked: json,
              checkoutToken: Shopify && Shopify.Checkout && Shopify.Checkout.token,
              orderStatusUrl: window.location.href,
              orderId: Shopify.checkout && Shopify.checkout.order_id
            },
          })
        });
      }

    },
//   openModal: async function (html, styles, modalSelector, onclose) {
//     let styleSheet = document.createElement("style")
//     styleSheet.type = "text/css"
//     styleSheet.innerText = styles
//     document.head.appendChild(styleSheet)
//     let modal = document.getElementById("af-modal")
//     if (!modal)
//       document.body.innerHTML = document.body.innerHTML + html
//
//     modal = document.getElementById(modalSelector)
//     modal.style.display = "block"
//     let close = document.getElementsByClassName("close")[0];
// // When the user clicks on <span> (x), close the modal
//     close.onclick = function () {
//       modal.style.display = "none";
//     }
//   },
    registerUtmParameter: async function () {
      if (this.getQueryParam("cbn_campaign")) {
        await growClient.registerNotificationClick(this.getQueryParam("message_process_id"),
          this.getQueryParam("cbn_campaign"), this.getQueryParam("cbn_medium"))
      }
    },

    addPriceDropButton: function (productId, variantId, productHandle) {
      if (initVar.addPriceDropButtonV2Enabled === true) {
        return initVar.addPriceDropButtonV2(productId, variantId, productHandle);
      }
      let parentElement = window.priceDropButtonParent
      if (initVar.priceDropWidget.buttonType !== 'inline') {
        return
      }
      if (!parentElement) {
        if (initVar.priceDropWidget.inlineButtonParentSelector) {
          parentElement = document.querySelector(initVar.priceDropWidget.inlineButtonParentSelector)
          if (!parentElement) {
            return
          }
        }
      }

      let btn = document.createElement("button");
      btn.innerHTML = growConfig.priceDropWidget.subscriptionText;
      btn.className = 'btn btn-success gw-button-widget'
      btn.setAttribute('gw-price-drop', '')
      btn.setAttribute(initVar.dataProductId, productId)
      btn.setAttribute(initVar.dataVariantId, variantId)
      btn.setAttribute(initVar.dataProductHandle, productHandle)
      btn.style.backgroundColor = growConfig.priceDropWidget.backgroundColor
      btn.style.color = growConfig.priceDropWidget.textColor
      btn.onclick = (e) => {
        e.preventDefault();
        growConfig.priceDropClicked(e)
      }
      parentElement.appendChild(btn)
    },

    addStockFulfilledButton: function (productId, variantId, productHandle) {
      if (initVar.addStockFulfilledButtonV2Enabled === true) {
        return initVar.addStockFulfilledButtonV2(productId, variantId, productHandle);
      }
      let parentElement = window.stockWidgetButtonParent;
      if (initVar.stockWidget.buttonType !== 'inline') {
        return
      }
      if (!parentElement) {
        if (initVar.stockWidget.inlineButtonParentSelector) {
          parentElement = document.querySelector(initVar.stockWidget.inlineButtonParentSelector)
          if (!parentElement) {
            return
          }
        }
      }
      let btn = document.createElement("button");
      btn.innerHTML = growConfig.stockWidget.subscriptionText;
      btn.className = 'btn btn-success gw-button-widget'
      btn.setAttribute('gw-stock-fulfilled', '')
      btn.setAttribute(initVar.dataProductId, productId)
      btn.setAttribute(initVar.dataVariantId, variantId)
      btn.setAttribute(initVar.dataProductHandle, productHandle)
      btn.style.backgroundColor = growConfig.stockWidget.backgroundColor
      btn.style.color = growConfig.stockWidget.textColor
      btn.onclick = (e) => {
        e.preventDefault();
        growConfig.stockWidgetClicked(e)
      }
      parentElement.appendChild(btn)
      this.campaignInlineButtonAddedEvent('gw-stock-fulfilled')
    },

    addStockFulfilledButtonV2: async function (productId, variantId, productHandle) {
      console.log("Placing Inline Button")
      if (initVar.stockWidget.buttonType !== 'inline') {
        return
      }
      // let addToCartButtonClasses;
      if (initVar.addToCartSelector === undefined)
        initVar.addToCartSelector = "[name=add]"
      if (initVar.addAddToCartClasses === undefined)
        initVar.addAddToCartClasses = true;
      if (initVar.addToCartButtonClasses === undefined)
        initVar.addToCartButtonClasses = "btn btn-success"
      if (initVar.addAddToCartClassesIgnoreList === undefined) {
        initVar.addAddToCartClassesIgnoreList = "disabled"
      }

      let addToCartButton = document.querySelector(initVar.addToCartSelector)
      let parentElement = window.stockWidgetButtonParent;
      if (addToCartButton && initVar.addAddToCartClasses) {
        initVar.addToCartButtonClasses = addToCartButton.className.split(" ")
          .filter(x => !initVar.addAddToCartClassesIgnoreList.split(" ").some(y => y == x)).join(" ")
      }
      if (!parentElement) {
        if (initVar.stockWidget.inlineButtonParentSelector) {
          parentElement = document.querySelector(initVar.stockWidget.inlineButtonParentSelector)
        } else {
          if (addToCartButton)
            parentElement = addToCartButton.parentNode
        }
      }
      let btn = document.createElement("button");
      btn.innerHTML = growConfig.stockWidget.subscriptionText;
      btn.className = 'gw-button-widget gw-button-widget-v2' + " " + initVar.addToCartButtonClasses
      btn.setAttribute('gw-stock-fulfilled', '')
      btn.setAttribute(initVar.dataProductId, productId)
      btn.setAttribute(initVar.dataVariantId, variantId)
      btn.setAttribute(initVar.dataProductHandle, productHandle)
      btn.style.backgroundColor = growConfig.stockWidget.backgroundColor
      btn.style.color = growConfig.stockWidget.textColor
      btn.onclick = (e) => {
        e.preventDefault();
        growConfig.stockWidgetClicked(e)
      }

      if (!parentElement) {
        await initVar.waitForEvent(200, async () => {
          console.log("Waiting for rendering of parent element of Inline button")
          return parentElement
        }, 10)
      }
      parentElement.appendChild(btn)
      this.campaignInlineButtonAddedEvent('gw-stock-fulfilled')
    },
    campaignInlineButtonAddedEvent:function (buttonAttribute){

    },
    addPriceDropButtonV2: function (productId, variantId, productHandle) {
      console.log("Placing Inline Button")
      if (initVar.priceDropWidget.buttonType !== 'inline') {
        return
      }
      // let addToCartButtonClasses;
      if (initVar.addToCartSelector === undefined)
        initVar.addToCartSelector = "[name=add]"
      if (initVar.addAddToCartClasses === undefined)
        initVar.addAddToCartClasses = true;
      if (initVar.addToCartButtonClasses === undefined)
        initVar.addToCartButtonClasses = "btn btn-success"
      if (initVar.addAddToCartClassesIgnoreList === undefined) {
        initVar.addAddToCartClassesIgnoreList = "disabled"
      }

      let addToCartButton = document.querySelector(initVar.addToCartSelector)
      let parentElement = window.priceDropButtonParent
      if (addToCartButton && initVar.addAddToCartClasses) {
        initVar.addToCartButtonClasses = addToCartButton.className.split(" ")
          .filter(x => !initVar.addAddToCartClassesIgnoreList.split(" ").some(y => y == x)).join(" ")
      }
      if (!parentElement) {
        if (initVar.priceDropWidget.inlineButtonParentSelector) {
          parentElement = document.querySelector(initVar.priceDropWidget.inlineButtonParentSelector)
        } else {
          if (addToCartButton)
            parentElement = addToCartButton.parentNode
        }
      }
      let btn = document.createElement("button");
      btn.innerHTML = growConfig.priceDropWidget.subscriptionText;
      btn.className = 'gw-button-widget gw-button-widget-v2' + " " + initVar.addToCartButtonClasses
      btn.setAttribute('gw-price-drop', '')
      btn.setAttribute(initVar.dataProductId, productId)
      btn.setAttribute(initVar.dataVariantId, variantId)
      btn.setAttribute(initVar.dataProductHandle, productHandle)
      btn.style.backgroundColor = growConfig.priceDropWidget.backgroundColor
      btn.style.color = growConfig.priceDropWidget.textColor
      btn.onclick = (e) => {
        e.preventDefault();
        growConfig.priceDropClicked(e)
      }
      parentElement.appendChild(btn)
    }
  }
  if (!window.growClient) {
    window.GrowClient=function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=1)}([function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(i,o){function a(e){try{u(r.next(e))}catch(e){o(e)}}function s(e){try{u(r.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(a,s)}u((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.DbKeys=t.DbManager=void 0;const i=n(2),o=n(3);class a extends i.default{constructor(){super("grow-db"),this.version(1).stores({configs:"++id,key,value"}),this.configs=this.table("configs")}static Instance(){return r(this,void 0,void 0,(function*(){return a.instance||(a.instance=new a,yield a.instance.open().catch(e=>o.default.error(e))),a.instance}))}save(e,t){return r(this,void 0,void 0,(function*(){let n=yield this.find(e);n=n||{key:e,value:t},n.value=t;const r=yield this.configs.put(n);return this.configs.get(r)}))}find(e){return r(this,void 0,void 0,(function*(){return this.configs.where({key:e}).first()}))}findValue(e){return r(this,void 0,void 0,(function*(){let t=yield this.configs.where({key:e}).first();return t?t.value:null}))}clear(e){return r(this,void 0,void 0,(function*(){return this.configs.where({key:e}).delete()}))}}t.DbManager=a;class s{}t.DbKeys=s,s.SubscriberId="subId",s.ClientId="clientId",s.NotificationsClicked="notifications-clicked",s.PushData="push",s.VapidPublicKey="vapid-public",s.IsActive="isActive-"+parseInt((new Date).valueOf()-(new Date).valueOf()%6e5),s.LastOptInAt="lastOptInAt"},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(i,o){function a(e){try{u(r.next(e))}catch(e){o(e)}}function s(e){try{u(r.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(a,s)}u((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.GrowClient=void 0;const i=n(0),o=n(4);class a{constructor(){console.log("Init GrowClient")}init(e){return r(this,void 0,void 0,(function*(){if(this.initVars=e,yield this.getClientStatus()){if(this.db=yield i.DbManager.Instance(),yield this.db.save(i.DbKeys.ClientId,this.initVars.clientId),!(yield this.db.findValue(i.DbKeys.SubscriberId))){let e=yield this.getUniqueId();yield this.db.save(i.DbKeys.SubscriberId,e)}if(this.swRegistration=yield this.registerServiceWorker(),this.pushManager=new o.GrowPushManager(this.initVars,this.swRegistration),this.db.save(i.DbKeys.VapidPublicKey,e.vapidKey),!(yield this.checkNotificationSupport()))return Promise.reject("Notification Not Supported");if(!(yield this.checkServiceWorkerSupport()))return Promise.reject("Service Worker Not Supported");yield this.pushManager.init(),this.onInit&&(yield this.processOnInit())}}))}processOnInit(){return r(this,void 0,void 0,(function*(){let e=yield this.db.find(i.DbKeys.SubscriberId);e&&(yield this.onInit(e.value))}))}registerServiceWorker(){return r(this,void 0,void 0,(function*(){return yield navigator.serviceWorker.register(this.initVars.serviceWorkerUrl||"/sw.js").catch(e=>(console.error("Grow",e),Promise.reject(e)))}))}checkServiceWorkerSupport(){return r(this,void 0,void 0,(function*(){return"serviceWorker"in navigator?Promise.resolve(!0):Promise.resolve(!1)}))}checkNotificationSupport(){return r(this,void 0,void 0,(function*(){return"Notification"in window?Promise.resolve(!0):Promise.resolve(!1)}))}getNotificationsClicked(){return r(this,void 0,void 0,(function*(){this.db||(this.db=yield i.DbManager.Instance());let e=yield this.db.find(i.DbKeys.NotificationsClicked);return e?JSON.parse(e.value):[]}))}getUniqueId(){return r(this,void 0,void 0,(function*(){return yield fetch(this.initVars.subscriberNewUniqueIdUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({})}).then(e=>r(this,void 0,void 0,(function*(){return(yield e.json()).uniqueId})))}))}getClientStatus(){return r(this,void 0,void 0,(function*(){this.db||(this.db=yield i.DbManager.Instance());let e=yield this.db.findValue(i.DbKeys.IsActive);if(!e){try{e=yield fetch(this.initVars.clientStatusUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({clientUniqueId:this.initVars.clientId})}).then(e=>r(this,void 0,void 0,(function*(){return(yield e.json()).isActive+""})))}catch(t){console.log("Error getting client status",t),e="true"}return yield this.db.save(i.DbKeys.IsActive,e+""),"true"===e}return"true"===e}))}registerNotificationClick(e,t,n){return r(this,void 0,void 0,(function*(){this.db||(this.db=yield i.DbManager.Instance());let r=yield this.getSubscriberId(),o=yield this.db.find(i.DbKeys.NotificationsClicked),a=[];o&&(a=JSON.parse(o.value)||[]);let s={notificationWorkFlowUniqueId:t,notificationType:n,subscriberId:r,timestamp:(new Date).valueOf()};a.push(s),yield this.db.save(i.DbKeys.NotificationsClicked,JSON.stringify(a)),yield fetch(this.initVars.clickNotificationUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({uniqueId:e+"-"+r,clientUniqueId:this.initVars.clientId,notificationWorkFlowUniqueId:t,subscriberUniqueId:r,eventData:{name:"click",notificationType:n}})}).catch(e=>{console.error("error in sending click notification url",e)})}))}getSubscriberId(){return r(this,void 0,void 0,(function*(){return this.db||(this.db=yield i.DbManager.Instance()),yield this.db.findValue(i.DbKeys.SubscriberId)}))}saveDbValue(e,t){return r(this,void 0,void 0,(function*(){this.db||(this.db=yield i.DbManager.Instance());yield this.db.save(e,t);return this.db.findValue(e)}))}getDbValue(e){return r(this,void 0,void 0,(function*(){return this.db||(this.db=yield i.DbManager.Instance()),yield this.db.findValue(e)}))}isPushConsentGiven(){return r(this,void 0,void 0,(function*(){return this.db||(this.db=yield i.DbManager.Instance()),yield this.db.findValue(i.DbKeys.PushData)}))}}t.GrowClient=a;let s=new a;t.default=s},function(e,t,n){"use strict";n.r(t),n.d(t,"Dexie",(function(){return An}));var r=function(){return(r=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var i in t=arguments[n])Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e}).apply(this,arguments)};function i(){for(var e=0,t=0,n=arguments.length;t<n;t++)e+=arguments[t].length;var r=Array(e),i=0;for(t=0;t<n;t++)for(var o=arguments[t],a=0,s=o.length;a<s;a++,i++)r[i]=o[a];return r}var o=Object.keys,a=Array.isArray,s="undefined"!=typeof self?self:"undefined"!=typeof window?window:global;function u(e,t){return"object"!=typeof t||o(t).forEach((function(n){e[n]=t[n]})),e}"undefined"==typeof Promise||s.Promise||(s.Promise=Promise);var c=Object.getPrototypeOf,l={}.hasOwnProperty;function f(e,t){return l.call(e,t)}function d(e,t){"function"==typeof t&&(t=t(c(e))),o(t).forEach((function(n){p(e,n,t[n])}))}var h=Object.defineProperty;function p(e,t,n,r){h(e,t,u(n&&f(n,"get")&&"function"==typeof n.get?{get:n.get,set:n.set,configurable:!0}:{value:n,configurable:!0,writable:!0},r))}function y(e){return{from:function(t){return e.prototype=Object.create(t.prototype),p(e.prototype,"constructor",e),{extend:d.bind(null,e.prototype)}}}}var v=Object.getOwnPropertyDescriptor;function m(e,t){var n;return v(e,t)||(n=c(e))&&m(n,t)}var g=[].slice;function b(e,t,n){return g.call(e,t,n)}function w(e,t){return t(e)}function _(e){if(!e)throw new Error("Assertion Failed")}function k(e){s.setImmediate?setImmediate(e):setTimeout(e,0)}function x(e,t){return e.reduce((function(e,n,r){var i=t(n,r);return i&&(e[i[0]]=i[1]),e}),{})}function S(e,t){if(f(e,t))return e[t];if(!t)return e;if("string"!=typeof t){for(var n=[],r=0,i=t.length;r<i;++r){var o=S(e,t[r]);n.push(o)}return n}var a=t.indexOf(".");if(-1!==a){var s=e[t.substr(0,a)];return void 0===s?void 0:S(s,t.substr(a+1))}}function O(e,t,n){if(e&&void 0!==t&&(!("isFrozen"in Object)||!Object.isFrozen(e)))if("string"!=typeof t&&"length"in t){_("string"!=typeof n&&"length"in n);for(var r=0,i=t.length;r<i;++r)O(e,t[r],n[r])}else{var o=t.indexOf(".");if(-1!==o){var s=t.substr(0,o),u=t.substr(o+1);if(""===u)void 0===n?a(e)&&!isNaN(parseInt(s))?e.splice(s,1):delete e[s]:e[s]=n;else{var c=e[s];c||(c=e[s]={}),O(c,u,n)}}else void 0===n?a(e)&&!isNaN(parseInt(t))?e.splice(t,1):delete e[t]:e[t]=n}}function I(e,t){"string"==typeof t?O(e,t,void 0):"length"in t&&[].map.call(t,(function(t){O(e,t,void 0)}))}function C(e){var t={};for(var n in e)f(e,n)&&(t[n]=e[n]);return t}var P=[].concat;function E(e){return P.apply([],e)}var j="Boolean,String,Date,RegExp,Blob,File,FileList,ArrayBuffer,DataView,Uint8ClampedArray,ImageData,Map,Set".split(",").concat(E([8,16,32,64].map((function(e){return["Int","Uint","Float"].map((function(t){return t+e+"Array"}))})))).filter((function(e){return s[e]})),A=j.map((function(e){return s[e]})),T=x(j,(function(e){return[e,!0]}));function D(e){if(!e||"object"!=typeof e)return e;var t;if(a(e)){t=[];for(var n=0,r=e.length;n<r;++n)t.push(D(e[n]))}else if(A.indexOf(e.constructor)>=0)t=e;else for(var i in t=e.constructor?Object.create(e.constructor.prototype):{},e)f(e,i)&&(t[i]=D(e[i]));return t}var K={}.toString;function M(e){return K.call(e).slice(8,-1)}var N=function(e,t){return"Array"===t?""+e.map((function(e){return N(e,M(e))})):"ArrayBuffer"===t?""+new Uint8Array(e):"Date"===t?e.getTime():ArrayBuffer.isView(e)?""+new Uint8Array(e.buffer):e};function R(e,t,n,r){return n=n||{},r=r||"",o(e).forEach((function(i){if(f(t,i)){var o=e[i],a=t[i];if("object"==typeof o&&"object"==typeof a&&o&&a){var s=M(o),u=M(a);s===u?T[s]?N(o,s)!==N(a,u)&&(n[r+i]=t[i]):R(o,a,n,r+i+"."):n[r+i]=t[i]}else o!==a&&(n[r+i]=t[i])}else n[r+i]=void 0})),o(t).forEach((function(i){f(e,i)||(n[r+i]=t[i])})),n}var B="undefined"!=typeof Symbol&&Symbol.iterator,F=B?function(e){var t;return null!=e&&(t=e[B])&&t.apply(e)}:function(){return null},q={};function U(e){var t,n,r,i;if(1===arguments.length){if(a(e))return e.slice();if(this===q&&"string"==typeof e)return[e];if(i=F(e)){for(n=[];!(r=i.next()).done;)n.push(r.value);return n}if(null==e)return[e];if("number"==typeof(t=e.length)){for(n=new Array(t);t--;)n[t]=e[t];return n}return[e]}for(t=arguments.length,n=new Array(t);t--;)n[t]=arguments[t];return n}var V="undefined"!=typeof Symbol?function(e){return"AsyncFunction"===e[Symbol.toStringTag]}:function(){return!1},L="undefined"!=typeof location&&/^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);function W(e,t){L=e,z=t}var z=function(){return!0},H=!new Error("").stack;function G(){if(H)try{throw new Error}catch(e){return e}return new Error}function Y(e,t){var n=e.stack;return n?(t=t||0,0===n.indexOf(e.name)&&(t+=(e.name+e.message).split("\n").length),n.split("\n").slice(t).filter(z).map((function(e){return"\n"+e})).join("")):""}var J=["Unknown","Constraint","Data","TransactionInactive","ReadOnly","Version","NotFound","InvalidState","InvalidAccess","Abort","Timeout","QuotaExceeded","Syntax","DataClone"],Q=["Modify","Bulk","OpenFailed","VersionChange","Schema","Upgrade","InvalidTable","MissingAPI","NoSuchDatabase","InvalidArgument","SubTransaction","Unsupported","Internal","DatabaseClosed","PrematureCommit","ForeignAwait"].concat(J),X={VersionChanged:"Database version changed by other database connection",DatabaseClosed:"Database has been closed",Abort:"Transaction aborted",TransactionInactive:"Transaction has already completed or failed"};function $(e,t){this._e=G(),this.name=e,this.message=t}function Z(e,t){return e+". Errors: "+Object.keys(t).map((function(e){return t[e].toString()})).filter((function(e,t,n){return n.indexOf(e)===t})).join("\n")}function ee(e,t,n,r){this._e=G(),this.failures=t,this.failedKeys=r,this.successCount=n,this.message=Z(e,t)}function te(e,t){this._e=G(),this.name="BulkError",this.failures=t,this.message=Z(e,t)}y($).from(Error).extend({stack:{get:function(){return this._stack||(this._stack=this.name+": "+this.message+Y(this._e,2))}},toString:function(){return this.name+": "+this.message}}),y(ee).from($),y(te).from($);var ne=Q.reduce((function(e,t){return e[t]=t+"Error",e}),{}),re=$,ie=Q.reduce((function(e,t){var n=t+"Error";function r(e,r){this._e=G(),this.name=n,e?"string"==typeof e?(this.message=e+(r?"\n "+r:""),this.inner=r||null):"object"==typeof e&&(this.message=e.name+" "+e.message,this.inner=e):(this.message=X[t]||n,this.inner=null)}return y(r).from(re),e[t]=r,e}),{});ie.Syntax=SyntaxError,ie.Type=TypeError,ie.Range=RangeError;var oe=J.reduce((function(e,t){return e[t+"Error"]=ie[t],e}),{});var ae=Q.reduce((function(e,t){return-1===["Syntax","Type","Range"].indexOf(t)&&(e[t+"Error"]=ie[t]),e}),{});function se(){}function ue(e){return e}function ce(e,t){return null==e||e===ue?t:function(n){return t(e(n))}}function le(e,t){return function(){e.apply(this,arguments),t.apply(this,arguments)}}function fe(e,t){return e===se?t:function(){var n=e.apply(this,arguments);void 0!==n&&(arguments[0]=n);var r=this.onsuccess,i=this.onerror;this.onsuccess=null,this.onerror=null;var o=t.apply(this,arguments);return r&&(this.onsuccess=this.onsuccess?le(r,this.onsuccess):r),i&&(this.onerror=this.onerror?le(i,this.onerror):i),void 0!==o?o:n}}function de(e,t){return e===se?t:function(){e.apply(this,arguments);var n=this.onsuccess,r=this.onerror;this.onsuccess=this.onerror=null,t.apply(this,arguments),n&&(this.onsuccess=this.onsuccess?le(n,this.onsuccess):n),r&&(this.onerror=this.onerror?le(r,this.onerror):r)}}function he(e,t){return e===se?t:function(n){var r=e.apply(this,arguments);u(n,r);var i=this.onsuccess,o=this.onerror;this.onsuccess=null,this.onerror=null;var a=t.apply(this,arguments);return i&&(this.onsuccess=this.onsuccess?le(i,this.onsuccess):i),o&&(this.onerror=this.onerror?le(o,this.onerror):o),void 0===r?void 0===a?void 0:a:u(r,a)}}function pe(e,t){return e===se?t:function(){return!1!==t.apply(this,arguments)&&e.apply(this,arguments)}}function ye(e,t){return e===se?t:function(){var n=e.apply(this,arguments);if(n&&"function"==typeof n.then){for(var r=this,i=arguments.length,o=new Array(i);i--;)o[i]=arguments[i];return n.then((function(){return t.apply(r,o)}))}return t.apply(this,arguments)}}ae.ModifyError=ee,ae.DexieError=$,ae.BulkError=te;var ve={},me="undefined"==typeof Promise?[]:function(){var e=Promise.resolve();if("undefined"==typeof crypto||!crypto.subtle)return[e,e.__proto__,e];var t=crypto.subtle.digest("SHA-512",new Uint8Array([0]));return[t,t.__proto__,e]}(),ge=me[0],be=me[1],we=me[2],_e=be&&be.then,ke=ge&&ge.constructor,xe=!!we,Se=!1,Oe=we?function(){we.then(Ge)}:s.setImmediate?setImmediate.bind(null,Ge):s.MutationObserver?function(){var e=document.createElement("div");new MutationObserver((function(){Ge(),e=null})).observe(e,{attributes:!0}),e.setAttribute("i","1")}:function(){setTimeout(Ge,0)},Ie=function(e,t){Me.push([e,t]),Pe&&(Oe(),Pe=!1)},Ce=!0,Pe=!0,Ee=[],je=[],Ae=null,Te=ue,De={id:"global",global:!0,ref:0,unhandleds:[],onunhandled:mt,pgp:!1,env:{},finalize:function(){this.unhandleds.forEach((function(e){try{mt(e[0],e[1])}catch(e){}}))}},Ke=De,Me=[],Ne=0,Re=[];function Be(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");this._listeners=[],this.onuncatched=se,this._lib=!1;var t=this._PSD=Ke;if(L&&(this._stackHolder=G(),this._prev=null,this._numPrev=0),"function"!=typeof e){if(e!==ve)throw new TypeError("Not a function");return this._state=arguments[1],this._value=arguments[2],void(!1===this._state&&Ve(this,this._value))}this._state=null,this._value=null,++t.ref,Ue(this,e)}var Fe={get:function(){var e=Ke,t=rt;function n(n,r){var i=this,o=!e.global&&(e!==Ke||t!==rt),a=o&&!st(),s=new Be((function(t,s){We(i,new qe(yt(n,e,o,a),yt(r,e,o,a),t,s,e))}));return L&&He(s,this),s}return n.prototype=ve,n},set:function(e){p(this,"then",e&&e.prototype===ve?Fe:{get:function(){return e},set:Fe.set})}};function qe(e,t,n,r,i){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.resolve=n,this.reject=r,this.psd=i}function Ue(e,t){try{t((function(t){if(null===e._state){if(t===e)throw new TypeError("A promise cannot be resolved with itself.");var n=e._lib&&Ye();t&&"function"==typeof t.then?Ue(e,(function(e,n){t instanceof Be?t._then(e,n):t.then(e,n)})):(e._state=!0,e._value=t,Le(e)),n&&Je()}}),Ve.bind(null,e))}catch(t){Ve(e,t)}}function Ve(e,t){if(je.push(t),null===e._state){var n=e._lib&&Ye();t=Te(t),e._state=!1,e._value=t,L&&null!==t&&"object"==typeof t&&!t._promise&&function(e,t,n){try{e.apply(null,n)}catch(e){t&&t(e)}}((function(){var n=m(t,"stack");t._promise=e,p(t,"stack",{get:function(){return Se?n&&(n.get?n.get.apply(t):n.value):e.stack}})})),function(e){Ee.some((function(t){return t._value===e._value}))||Ee.push(e)}(e),Le(e),n&&Je()}}function Le(e){var t=e._listeners;e._listeners=[];for(var n=0,r=t.length;n<r;++n)We(e,t[n]);var i=e._PSD;--i.ref||i.finalize(),0===Ne&&(++Ne,Ie((function(){0==--Ne&&Qe()}),[]))}function We(e,t){if(null!==e._state){var n=e._state?t.onFulfilled:t.onRejected;if(null===n)return(e._state?t.resolve:t.reject)(e._value);++t.psd.ref,++Ne,Ie(ze,[n,e,t])}else e._listeners.push(t)}function ze(e,t,n){try{Ae=t;var r,i=t._value;t._state?r=e(i):(je.length&&(je=[]),r=e(i),-1===je.indexOf(i)&&function(e){var t=Ee.length;for(;t;)if(Ee[--t]._value===e._value)return void Ee.splice(t,1)}(t)),n.resolve(r)}catch(e){n.reject(e)}finally{Ae=null,0==--Ne&&Qe(),--n.psd.ref||n.psd.finalize()}}function He(e,t){var n=t?t._numPrev+1:0;n<100&&(e._prev=t,e._numPrev=n)}function Ge(){Ye()&&Je()}function Ye(){var e=Ce;return Ce=!1,Pe=!1,e}function Je(){var e,t,n;do{for(;Me.length>0;)for(e=Me,Me=[],n=e.length,t=0;t<n;++t){var r=e[t];r[0].apply(null,r[1])}}while(Me.length>0);Ce=!0,Pe=!0}function Qe(){var e=Ee;Ee=[],e.forEach((function(e){e._PSD.onunhandled.call(null,e._value,e)}));for(var t=Re.slice(0),n=t.length;n;)t[--n]()}function Xe(e){return new Be(ve,!1,e)}function $e(e,t){var n=Ke;return function(){var r=Ye(),i=Ke;try{return ft(n,!0),e.apply(this,arguments)}catch(e){t&&t(e)}finally{ft(i,!1),r&&Je()}}}d(Be.prototype,{then:Fe,_then:function(e,t){We(this,new qe(null,null,e,t,Ke))},catch:function(e){if(1===arguments.length)return this.then(null,e);var t=arguments[0],n=arguments[1];return"function"==typeof t?this.then(null,(function(e){return e instanceof t?n(e):Xe(e)})):this.then(null,(function(e){return e&&e.name===t?n(e):Xe(e)}))},finally:function(e){return this.then((function(t){return e(),t}),(function(t){return e(),Xe(t)}))},stack:{get:function(){if(this._stack)return this._stack;try{Se=!0;var e=function e(t,n,r){if(n.length===r)return n;var i="";if(!1===t._state){var o,a,s=t._value;null!=s?(o=s.name||"Error",a=s.message||s,i=Y(s,0)):(o=s,a=""),n.push(o+(a?": "+a:"")+i)}L&&((i=Y(t._stackHolder,2))&&-1===n.indexOf(i)&&n.push(i),t._prev&&e(t._prev,n,r));return n}(this,[],20).join("\nFrom previous: ");return null!==this._state&&(this._stack=e),e}finally{Se=!1}}},timeout:function(e,t){var n=this;return e<1/0?new Be((function(r,i){var o=setTimeout((function(){return i(new ie.Timeout(t))}),e);n.then(r,i).finally(clearTimeout.bind(null,o))})):this}}),"undefined"!=typeof Symbol&&Symbol.toStringTag&&p(Be.prototype,Symbol.toStringTag,"Dexie.Promise"),De.env=dt(),d(Be,{all:function(){var e=U.apply(null,arguments).map(ut);return new Be((function(t,n){0===e.length&&t([]);var r=e.length;e.forEach((function(i,o){return Be.resolve(i).then((function(n){e[o]=n,--r||t(e)}),n)}))}))},resolve:function(e){if(e instanceof Be)return e;if(e&&"function"==typeof e.then)return new Be((function(t,n){e.then(t,n)}));var t=new Be(ve,!0,e);return He(t,Ae),t},reject:Xe,race:function(){var e=U.apply(null,arguments).map(ut);return new Be((function(t,n){e.map((function(e){return Be.resolve(e).then(t,n)}))}))},PSD:{get:function(){return Ke},set:function(e){return Ke=e}},totalEchoes:{get:function(){return rt}},newPSD:ot,usePSD:ht,scheduler:{get:function(){return Ie},set:function(e){Ie=e}},rejectionMapper:{get:function(){return Te},set:function(e){Te=e}},follow:function(e,t){return new Be((function(n,r){return ot((function(t,n){var r=Ke;r.unhandleds=[],r.onunhandled=n,r.finalize=le((function(){var e=this;!function(e){Re.push((function t(){e(),Re.splice(Re.indexOf(t),1)})),++Ne,Ie((function(){0==--Ne&&Qe()}),[])}((function(){0===e.unhandleds.length?t():n(e.unhandleds[0])}))}),r.finalize),e()}),t,n,r)}))}}),ke&&(ke.allSettled&&p(Be,"allSettled",(function(){var e=U.apply(null,arguments).map(ut);return new Be((function(t){0===e.length&&t([]);var n=e.length,r=new Array(n);e.forEach((function(e,i){return Be.resolve(e).then((function(e){return r[i]={status:"fulfilled",value:e}}),(function(e){return r[i]={status:"rejected",reason:e}})).then((function(){return--n||t(r)}))}))}))})),ke.any&&"undefined"!=typeof AggregateError&&p(Be,"any",(function(){var e=U.apply(null,arguments).map(ut);return new Be((function(t,n){0===e.length&&n(new AggregateError([]));var r=e.length,i=new Array(r);e.forEach((function(e,o){return Be.resolve(e).then((function(e){return t(e)}),(function(e){i[o]=e,--r||n(new AggregateError(i))}))}))}))})));var Ze={awaits:0,echoes:0,id:0},et=0,tt=[],nt=0,rt=0,it=0;function ot(e,t,n,r){var i=Ke,o=Object.create(i);o.parent=i,o.ref=0,o.global=!1,o.id=++it;var a=De.env;o.env=xe?{Promise:Be,PromiseProp:{value:Be,configurable:!0,writable:!0},all:Be.all,race:Be.race,allSettled:Be.allSettled,any:Be.any,resolve:Be.resolve,reject:Be.reject,nthen:vt(a.nthen,o),gthen:vt(a.gthen,o)}:{},t&&u(o,t),++i.ref,o.finalize=function(){--this.parent.ref||this.parent.finalize()};var s=ht(o,e,n,r);return 0===o.ref&&o.finalize(),s}function at(){return Ze.id||(Ze.id=++et),++Ze.awaits,Ze.echoes+=100,Ze.id}function st(){return!!Ze.awaits&&(0==--Ze.awaits&&(Ze.id=0),Ze.echoes=100*Ze.awaits,!0)}function ut(e){return Ze.echoes&&e&&e.constructor===ke?(at(),e.then((function(e){return st(),e}),(function(e){return st(),gt(e)}))):e}function ct(e){++rt,Ze.echoes&&0!=--Ze.echoes||(Ze.echoes=Ze.id=0),tt.push(Ke),ft(e,!0)}function lt(){var e=tt[tt.length-1];tt.pop(),ft(e,!1)}function ft(e,t){var n=Ke;if((t?!Ze.echoes||nt++&&e===Ke:!nt||--nt&&e===Ke)||pt(t?ct.bind(null,e):lt),e!==Ke&&(Ke=e,n===De&&(De.env=dt()),xe)){var r=De.env.Promise,i=e.env;be.then=i.nthen,r.prototype.then=i.gthen,(n.global||e.global)&&(Object.defineProperty(s,"Promise",i.PromiseProp),r.all=i.all,r.race=i.race,r.resolve=i.resolve,r.reject=i.reject,i.allSettled&&(r.allSettled=i.allSettled),i.any&&(r.any=i.any))}}function dt(){var e=s.Promise;return xe?{Promise:e,PromiseProp:Object.getOwnPropertyDescriptor(s,"Promise"),all:e.all,race:e.race,allSettled:e.allSettled,any:e.any,resolve:e.resolve,reject:e.reject,nthen:be.then,gthen:e.prototype.then}:{}}function ht(e,t,n,r,i){var o=Ke;try{return ft(e,!0),t(n,r,i)}finally{ft(o,!1)}}function pt(e){_e.call(ge,e)}function yt(e,t,n,r){return"function"!=typeof e?e:function(){var i=Ke;n&&at(),ft(t,!0);try{return e.apply(this,arguments)}finally{ft(i,!1),r&&pt(st)}}}function vt(e,t){return function(n,r){return e.call(this,yt(n,t),yt(r,t))}}-1===(""+_e).indexOf("[native code]")&&(at=st=se);function mt(e,t){var n;try{n=t.onuncatched(e)}catch(e){}if(!1!==n)try{var r,i={promise:t,reason:e};if(s.document&&document.createEvent?((r=document.createEvent("Event")).initEvent("unhandledrejection",!0,!0),u(r,i)):s.CustomEvent&&u(r=new CustomEvent("unhandledrejection",{detail:i}),i),r&&s.dispatchEvent&&(dispatchEvent(r),!s.PromiseRejectionEvent&&s.onunhandledrejection))try{s.onunhandledrejection(r)}catch(e){}L&&r&&!r.defaultPrevented&&console.warn("Unhandled rejection: "+(e.stack||e))}catch(e){}}var gt=Be.reject;var bt=String.fromCharCode(65535),wt="Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.",_t=[],kt="undefined"!=typeof navigator&&/(MSIE|Trident|Edge)/.test(navigator.userAgent),xt=kt,St=kt,Ot=function(e){return!/(dexie\.js|dexie\.min\.js)/.test(e)};function It(e,t){return e?t?function(){return e.apply(this,arguments)&&t.apply(this,arguments)}:e:t}var Ct={type:3,lower:-1/0,lowerOpen:!1,upper:[[]],upperOpen:!1};function Pt(e){return function(t){return void 0===S(t,e)&&I(t=D(t),e),t}}var Et=function(){function e(){}return e.prototype._trans=function(e,t,n){var r=this._tx||Ke.trans,i=this.name;function o(e,n,r){if(!r.schema[i])throw new ie.NotFound("Table "+i+" not part of transaction");return t(r.idbtrans,r)}var a=Ye();try{return r&&r.db===this.db?r===Ke.trans?r._promise(e,o,n):ot((function(){return r._promise(e,o,n)}),{trans:r,transless:Ke.transless||Ke}):function e(t,n,r,i){if(t._state.openComplete||Ke.letThrough){var o=t._createTransaction(n,r,t._dbSchema);try{o.create()}catch(e){return gt(e)}return o._promise(n,(function(e,t){return ot((function(){return Ke.trans=o,i(e,t,o)}))})).then((function(e){return o._completion.then((function(){return e}))}))}if(!t._state.isBeingOpened){if(!t._options.autoOpen)return gt(new ie.DatabaseClosed);t.open().catch(se)}return t._state.dbReadyPromise.then((function(){return e(t,n,r,i)}))}(this.db,e,[this.name],o)}finally{a&&Je()}},e.prototype.get=function(e,t){var n=this;return e&&e.constructor===Object?this.where(e).first(t):this._trans("readonly",(function(t){return n.core.get({trans:t,key:e}).then((function(e){return n.hook.reading.fire(e)}))})).then(t)},e.prototype.where=function(e){if("string"==typeof e)return new this.db.WhereClause(this,e);if(a(e))return new this.db.WhereClause(this,"["+e.join("+")+"]");var t=o(e);if(1===t.length)return this.where(t[0]).equals(e[t[0]]);var n=this.schema.indexes.concat(this.schema.primKey).filter((function(e){return e.compound&&t.every((function(t){return e.keyPath.indexOf(t)>=0}))&&e.keyPath.every((function(e){return t.indexOf(e)>=0}))}))[0];if(n&&this.db._maxKey!==bt)return this.where(n.name).equals(n.keyPath.map((function(t){return e[t]})));!n&&L&&console.warn("The query "+JSON.stringify(e)+" on "+this.name+" would benefit of a compound index ["+t.join("+")+"]");var r=this.schema.idxByName,i=this.db._deps.indexedDB;function s(e,t){try{return 0===i.cmp(e,t)}catch(e){return!1}}var u=t.reduce((function(t,n){var i=t[0],o=t[1],u=r[n],c=e[n];return[i||u,i||!u?It(o,u&&u.multi?function(e){var t=S(e,n);return a(t)&&t.some((function(e){return s(c,e)}))}:function(e){return s(c,S(e,n))}):o]}),[null,null]),c=u[0],l=u[1];return c?this.where(c.name).equals(e[c.keyPath]).filter(l):n?this.filter(l):this.where(t).equals("")},e.prototype.filter=function(e){return this.toCollection().and(e)},e.prototype.count=function(e){return this.toCollection().count(e)},e.prototype.offset=function(e){return this.toCollection().offset(e)},e.prototype.limit=function(e){return this.toCollection().limit(e)},e.prototype.each=function(e){return this.toCollection().each(e)},e.prototype.toArray=function(e){return this.toCollection().toArray(e)},e.prototype.toCollection=function(){return new this.db.Collection(new this.db.WhereClause(this))},e.prototype.orderBy=function(e){return new this.db.Collection(new this.db.WhereClause(this,a(e)?"["+e.join("+")+"]":e))},e.prototype.reverse=function(){return this.toCollection().reverse()},e.prototype.mapToClass=function(e){this.schema.mappedClass=e;var t=function(t){if(!t)return t;var n=Object.create(e.prototype);for(var r in t)if(f(t,r))try{n[r]=t[r]}catch(e){}return n};return this.schema.readHook&&this.hook.reading.unsubscribe(this.schema.readHook),this.schema.readHook=t,this.hook("reading",t),e},e.prototype.defineClass=function(){return this.mapToClass((function(e){u(this,e)}))},e.prototype.add=function(e,t){var n=this,r=this.schema.primKey,i=r.auto,o=r.keyPath,a=e;return o&&i&&(a=Pt(o)(e)),this._trans("readwrite",(function(e){return n.core.mutate({trans:e,type:"add",keys:null!=t?[t]:null,values:[a]})})).then((function(e){return e.numFailures?Be.reject(e.failures[0]):e.lastResult})).then((function(t){if(o)try{O(e,o,t)}catch(e){}return t}))},e.prototype.update=function(e,t){if("object"!=typeof t||a(t))throw new ie.InvalidArgument("Modifications must be an object.");if("object"!=typeof e||a(e))return this.where(":id").equals(e).modify(t);o(t).forEach((function(n){O(e,n,t[n])}));var n=S(e,this.schema.primKey.keyPath);return void 0===n?gt(new ie.InvalidArgument("Given object does not contain its primary key")):this.where(":id").equals(n).modify(t)},e.prototype.put=function(e,t){var n=this,r=this.schema.primKey,i=r.auto,o=r.keyPath,a=e;return o&&i&&(a=Pt(o)(e)),this._trans("readwrite",(function(e){return n.core.mutate({trans:e,type:"put",values:[a],keys:null!=t?[t]:null})})).then((function(e){return e.numFailures?Be.reject(e.failures[0]):e.lastResult})).then((function(t){if(o)try{O(e,o,t)}catch(e){}return t}))},e.prototype.delete=function(e){var t=this;return this._trans("readwrite",(function(n){return t.core.mutate({trans:n,type:"delete",keys:[e]})})).then((function(e){return e.numFailures?Be.reject(e.failures[0]):void 0}))},e.prototype.clear=function(){var e=this;return this._trans("readwrite",(function(t){return e.core.mutate({trans:t,type:"deleteRange",range:Ct})})).then((function(e){return e.numFailures?Be.reject(e.failures[0]):void 0}))},e.prototype.bulkGet=function(e){var t=this;return this._trans("readonly",(function(n){return t.core.getMany({keys:e,trans:n}).then((function(e){return e.map((function(e){return t.hook.reading.fire(e)}))}))}))},e.prototype.bulkAdd=function(e,t,n){var r=this,i=Array.isArray(t)?t:void 0,o=(n=n||(i?void 0:t))?n.allKeys:void 0;return this._trans("readwrite",(function(t){var n=r.schema.primKey,a=n.auto,s=n.keyPath;if(s&&i)throw new ie.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");if(i&&i.length!==e.length)throw new ie.InvalidArgument("Arguments objects and keys must have the same length");var u=e.length,c=s&&a?e.map(Pt(s)):e;return r.core.mutate({trans:t,type:"add",keys:i,values:c,wantResults:o}).then((function(e){var t=e.numFailures,n=e.results,i=e.lastResult,a=e.failures;if(0===t)return o?n:i;throw new te(r.name+".bulkAdd(): "+t+" of "+u+" operations failed",Object.keys(a).map((function(e){return a[e]})))}))}))},e.prototype.bulkPut=function(e,t,n){var r=this,i=Array.isArray(t)?t:void 0,o=(n=n||(i?void 0:t))?n.allKeys:void 0;return this._trans("readwrite",(function(t){var n=r.schema.primKey,a=n.auto,s=n.keyPath;if(s&&i)throw new ie.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");if(i&&i.length!==e.length)throw new ie.InvalidArgument("Arguments objects and keys must have the same length");var u=e.length,c=s&&a?e.map(Pt(s)):e;return r.core.mutate({trans:t,type:"put",keys:i,values:c,wantResults:o}).then((function(e){var t=e.numFailures,n=e.results,i=e.lastResult,a=e.failures;if(0===t)return o?n:i;throw new te(r.name+".bulkPut(): "+t+" of "+u+" operations failed",Object.keys(a).map((function(e){return a[e]})))}))}))},e.prototype.bulkDelete=function(e){var t=this,n=e.length;return this._trans("readwrite",(function(n){return t.core.mutate({trans:n,type:"delete",keys:e})})).then((function(e){var r=e.numFailures,i=e.lastResult,o=e.failures;if(0===r)return i;throw new te(t.name+".bulkDelete(): "+r+" of "+n+" operations failed",o)}))},e}();function jt(e){var t={},n=function(n,r){if(r){for(var i=arguments.length,o=new Array(i-1);--i;)o[i-1]=arguments[i];return t[n].subscribe.apply(null,o),e}if("string"==typeof n)return t[n]};n.addEventType=s;for(var r=1,i=arguments.length;r<i;++r)s(arguments[r]);return n;function s(e,r,i){if("object"==typeof e)return u(e);r||(r=pe),i||(i=se);var o={subscribers:[],fire:i,subscribe:function(e){-1===o.subscribers.indexOf(e)&&(o.subscribers.push(e),o.fire=r(o.fire,e))},unsubscribe:function(e){o.subscribers=o.subscribers.filter((function(t){return t!==e})),o.fire=o.subscribers.reduce(r,i)}};return t[e]=n[e]=o,o}function u(e){o(e).forEach((function(t){var n=e[t];if(a(n))s(t,e[t][0],e[t][1]);else{if("asap"!==n)throw new ie.InvalidArgument("Invalid event config");var r=s(t,ue,(function(){for(var e=arguments.length,t=new Array(e);e--;)t[e]=arguments[e];r.subscribers.forEach((function(e){k((function(){e.apply(null,t)}))}))}))}}))}}function At(e,t){return y(t).from({prototype:e}),t}function Tt(e,t){return!(e.filter||e.algorithm||e.or)&&(t?e.justLimit:!e.replayFilter)}function Dt(e,t){e.filter=It(e.filter,t)}function Kt(e,t,n){var r=e.replayFilter;e.replayFilter=r?function(){return It(r(),t())}:t,e.justLimit=n&&!r}function Mt(e,t){if(e.isPrimKey)return t.primaryKey;var n=t.getIndexByKeyPath(e.index);if(!n)throw new ie.Schema("KeyPath "+e.index+" on object store "+t.name+" is not indexed");return n}function Nt(e,t,n){var r=Mt(e,t.schema);return t.openCursor({trans:n,values:!e.keysOnly,reverse:"prev"===e.dir,unique:!!e.unique,query:{index:r,range:e.range}})}function Rt(e,t,n,r){var i=e.replayFilter?It(e.filter,e.replayFilter()):e.filter;if(e.or){var o={},a=function(e,n,r){if(!i||i(n,r,(function(e){return n.stop(e)}),(function(e){return n.fail(e)}))){var a=n.primaryKey,s=""+a;"[object ArrayBuffer]"===s&&(s=""+new Uint8Array(a)),f(o,s)||(o[s]=!0,t(e,n,r))}};return Promise.all([e.or._iterate(a,n),Bt(Nt(e,r,n),e.algorithm,a,!e.keysOnly&&e.valueMapper)])}return Bt(Nt(e,r,n),It(e.algorithm,i),t,!e.keysOnly&&e.valueMapper)}function Bt(e,t,n,r){var i=$e(r?function(e,t,i){return n(r(e),t,i)}:n);return e.then((function(e){if(e)return e.start((function(){var n=function(){return e.continue()};t&&!t(e,(function(e){return n=e}),(function(t){e.stop(t),n=se}),(function(t){e.fail(t),n=se}))||i(e.value,e,(function(e){return n=e})),n()}))}))}var Ft=function(){function e(){}return e.prototype._read=function(e,t){var n=this._ctx;return n.error?n.table._trans(null,gt.bind(null,n.error)):n.table._trans("readonly",e).then(t)},e.prototype._write=function(e){var t=this._ctx;return t.error?t.table._trans(null,gt.bind(null,t.error)):t.table._trans("readwrite",e,"locked")},e.prototype._addAlgorithm=function(e){var t=this._ctx;t.algorithm=It(t.algorithm,e)},e.prototype._iterate=function(e,t){return Rt(this._ctx,e,t,this._ctx.table.core)},e.prototype.clone=function(e){var t=Object.create(this.constructor.prototype),n=Object.create(this._ctx);return e&&u(n,e),t._ctx=n,t},e.prototype.raw=function(){return this._ctx.valueMapper=null,this},e.prototype.each=function(e){var t=this._ctx;return this._read((function(n){return Rt(t,e,n,t.table.core)}))},e.prototype.count=function(e){var t=this;return this._read((function(e){var n=t._ctx,r=n.table.core;if(Tt(n,!0))return r.count({trans:e,query:{index:Mt(n,r.schema),range:n.range}}).then((function(e){return Math.min(e,n.limit)}));var i=0;return Rt(n,(function(){return++i,!1}),e,r).then((function(){return i}))})).then(e)},e.prototype.sortBy=function(e,t){var n=e.split(".").reverse(),r=n[0],i=n.length-1;function o(e,t){return t?o(e[n[t]],t-1):e[r]}var a="next"===this._ctx.dir?1:-1;function s(e,t){var n=o(e,i),r=o(t,i);return n<r?-a:n>r?a:0}return this.toArray((function(e){return e.sort(s)})).then(t)},e.prototype.toArray=function(e){var t=this;return this._read((function(e){var n=t._ctx;if("next"===n.dir&&Tt(n,!0)&&n.limit>0){var r=n.valueMapper,i=Mt(n,n.table.core.schema);return n.table.core.query({trans:e,limit:n.limit,values:!0,query:{index:i,range:n.range}}).then((function(e){var t=e.result;return r?t.map(r):t}))}var o=[];return Rt(n,(function(e){return o.push(e)}),e,n.table.core).then((function(){return o}))}),e)},e.prototype.offset=function(e){var t=this._ctx;return e<=0||(t.offset+=e,Tt(t)?Kt(t,(function(){var t=e;return function(e,n){return 0===t||(1===t?(--t,!1):(n((function(){e.advance(t),t=0})),!1))}})):Kt(t,(function(){var t=e;return function(){return--t<0}}))),this},e.prototype.limit=function(e){return this._ctx.limit=Math.min(this._ctx.limit,e),Kt(this._ctx,(function(){var t=e;return function(e,n,r){return--t<=0&&n(r),t>=0}}),!0),this},e.prototype.until=function(e,t){return Dt(this._ctx,(function(n,r,i){return!e(n.value)||(r(i),t)})),this},e.prototype.first=function(e){return this.limit(1).toArray((function(e){return e[0]})).then(e)},e.prototype.last=function(e){return this.reverse().first(e)},e.prototype.filter=function(e){var t,n;return Dt(this._ctx,(function(t){return e(t.value)})),t=this._ctx,n=e,t.isMatch=It(t.isMatch,n),this},e.prototype.and=function(e){return this.filter(e)},e.prototype.or=function(e){return new this.db.WhereClause(this._ctx.table,e,this)},e.prototype.reverse=function(){return this._ctx.dir="prev"===this._ctx.dir?"next":"prev",this._ondirectionchange&&this._ondirectionchange(this._ctx.dir),this},e.prototype.desc=function(){return this.reverse()},e.prototype.eachKey=function(e){var t=this._ctx;return t.keysOnly=!t.isMatch,this.each((function(t,n){e(n.key,n)}))},e.prototype.eachUniqueKey=function(e){return this._ctx.unique="unique",this.eachKey(e)},e.prototype.eachPrimaryKey=function(e){var t=this._ctx;return t.keysOnly=!t.isMatch,this.each((function(t,n){e(n.primaryKey,n)}))},e.prototype.keys=function(e){var t=this._ctx;t.keysOnly=!t.isMatch;var n=[];return this.each((function(e,t){n.push(t.key)})).then((function(){return n})).then(e)},e.prototype.primaryKeys=function(e){var t=this._ctx;if("next"===t.dir&&Tt(t,!0)&&t.limit>0)return this._read((function(e){var n=Mt(t,t.table.core.schema);return t.table.core.query({trans:e,values:!1,limit:t.limit,query:{index:n,range:t.range}})})).then((function(e){return e.result})).then(e);t.keysOnly=!t.isMatch;var n=[];return this.each((function(e,t){n.push(t.primaryKey)})).then((function(){return n})).then(e)},e.prototype.uniqueKeys=function(e){return this._ctx.unique="unique",this.keys(e)},e.prototype.firstKey=function(e){return this.limit(1).keys((function(e){return e[0]})).then(e)},e.prototype.lastKey=function(e){return this.reverse().firstKey(e)},e.prototype.distinct=function(){var e=this._ctx,t=e.index&&e.table.schema.idxByName[e.index];if(!t||!t.multi)return this;var n={};return Dt(this._ctx,(function(e){var t=e.primaryKey.toString(),r=f(n,t);return n[t]=!0,!r})),this},e.prototype.modify=function(e){var t=this,n=this._ctx;return this._write((function(r){var i;if("function"==typeof e)i=e;else{var a=o(e),s=a.length;i=function(t){for(var n=!1,r=0;r<s;++r){var i=a[r],o=e[i];S(t,i)!==o&&(O(t,i,o),n=!0)}return n}}var u=n.table.core,c=u.schema.primaryKey,l=c.outbound,f=c.extractKey,d="testmode"in An?1:2e3,h=t.db.core.cmp,p=[],y=0,v=[],m=function(e,t){var n=t.failures,r=t.numFailures;y+=e-r;for(var i=0,a=o(n);i<a.length;i++){var s=a[i];p.push(n[s])}};return t.clone().primaryKeys().then((function(e){var t=function(n){var o=Math.min(d,e.length-n);return u.getMany({trans:r,keys:e.slice(n,n+o)}).then((function(a){for(var s=[],c=[],p=l?[]:null,y=[],v=0;v<o;++v){var g=a[v],b={value:D(g),primKey:e[n+v]};!1!==i.call(b,b.value,b)&&(null==b.value?y.push(e[n+v]):l||0===h(f(g),f(b.value))?(c.push(b.value),l&&p.push(e[n+v])):(y.push(e[n+v]),s.push(b.value)))}return Promise.resolve(s.length>0&&u.mutate({trans:r,type:"add",values:s}).then((function(e){for(var t in e.failures)y.splice(parseInt(t),1);m(s.length,e)}))).then((function(e){return c.length>0&&u.mutate({trans:r,type:"put",keys:p,values:c}).then((function(e){return m(c.length,e)}))})).then((function(){return y.length>0&&u.mutate({trans:r,type:"delete",keys:y}).then((function(e){return m(y.length,e)}))})).then((function(){return e.length>n+o&&t(n+d)}))}))};return t(0).then((function(){if(p.length>0)throw new ee("Error modifying one or more objects",p,y,v);return e.length}))}))}))},e.prototype.delete=function(){var e=this._ctx,t=e.range;return Tt(e)&&(e.isPrimKey&&!St||3===t.type)?this._write((function(n){var r=e.table.core.schema.primaryKey,i=t;return e.table.core.count({trans:n,query:{index:r,range:i}}).then((function(t){return e.table.core.mutate({trans:n,type:"deleteRange",range:i}).then((function(e){var n=e.failures,r=(e.lastResult,e.results,e.numFailures);if(r)throw new ee("Could not delete some values",Object.keys(n).map((function(e){return n[e]})),t-r);return t-r}))}))})):this.modify((function(e,t){return t.value=null}))},e}();function qt(e,t){return e<t?-1:e===t?0:1}function Ut(e,t){return e>t?-1:e===t?0:1}function Vt(e,t,n){var r=e instanceof Yt?new e.Collection(e):e;return r._ctx.error=n?new n(t):new TypeError(t),r}function Lt(e){return new e.Collection(e,(function(){return Gt("")})).limit(0)}function Wt(e,t,n,r,i,o){for(var a=Math.min(e.length,r.length),s=-1,u=0;u<a;++u){var c=t[u];if(c!==r[u])return i(e[u],n[u])<0?e.substr(0,u)+n[u]+n.substr(u+1):i(e[u],r[u])<0?e.substr(0,u)+r[u]+n.substr(u+1):s>=0?e.substr(0,s)+t[s]+n.substr(s+1):null;i(e[u],c)<0&&(s=u)}return a<r.length&&"next"===o?e+n.substr(e.length):a<e.length&&"prev"===o?e.substr(0,n.length):s<0?null:e.substr(0,s)+r[s]+n.substr(s+1)}function zt(e,t,n,r){var i,o,a,s,u,c,l,f=n.length;if(!n.every((function(e){return"string"==typeof e})))return Vt(e,"String expected.");function d(e){i=function(e){return"next"===e?function(e){return e.toUpperCase()}:function(e){return e.toLowerCase()}}(e),o=function(e){return"next"===e?function(e){return e.toLowerCase()}:function(e){return e.toUpperCase()}}(e),a="next"===e?qt:Ut;var t=n.map((function(e){return{lower:o(e),upper:i(e)}})).sort((function(e,t){return a(e.lower,t.lower)}));s=t.map((function(e){return e.upper})),u=t.map((function(e){return e.lower})),c=e,l="next"===e?"":r}d("next");var h=new e.Collection(e,(function(){return Ht(s[0],u[f-1]+r)}));h._ondirectionchange=function(e){d(e)};var p=0;return h._addAlgorithm((function(e,n,r){var i=e.key;if("string"!=typeof i)return!1;var d=o(i);if(t(d,u,p))return!0;for(var h=null,y=p;y<f;++y){var v=Wt(i,d,s[y],u[y],a,c);null===v&&null===h?p=y+1:(null===h||a(h,v)>0)&&(h=v)}return n(null!==h?function(){e.continue(h+l)}:r),!1})),h}function Ht(e,t,n,r){return{type:2,lower:e,upper:t,lowerOpen:n,upperOpen:r}}function Gt(e){return{type:1,lower:e,upper:e}}var Yt=function(){function e(){}return Object.defineProperty(e.prototype,"Collection",{get:function(){return this._ctx.table.db.Collection},enumerable:!0,configurable:!0}),e.prototype.between=function(e,t,n,r){n=!1!==n,r=!0===r;try{return this._cmp(e,t)>0||0===this._cmp(e,t)&&(n||r)&&(!n||!r)?Lt(this):new this.Collection(this,(function(){return Ht(e,t,!n,!r)}))}catch(e){return Vt(this,wt)}},e.prototype.equals=function(e){return null==e?Vt(this,wt):new this.Collection(this,(function(){return Gt(e)}))},e.prototype.above=function(e){return null==e?Vt(this,wt):new this.Collection(this,(function(){return Ht(e,void 0,!0)}))},e.prototype.aboveOrEqual=function(e){return null==e?Vt(this,wt):new this.Collection(this,(function(){return Ht(e,void 0,!1)}))},e.prototype.below=function(e){return null==e?Vt(this,wt):new this.Collection(this,(function(){return Ht(void 0,e,!1,!0)}))},e.prototype.belowOrEqual=function(e){return null==e?Vt(this,wt):new this.Collection(this,(function(){return Ht(void 0,e)}))},e.prototype.startsWith=function(e){return"string"!=typeof e?Vt(this,"String expected."):this.between(e,e+bt,!0,!0)},e.prototype.startsWithIgnoreCase=function(e){return""===e?this.startsWith(e):zt(this,(function(e,t){return 0===e.indexOf(t[0])}),[e],bt)},e.prototype.equalsIgnoreCase=function(e){return zt(this,(function(e,t){return e===t[0]}),[e],"")},e.prototype.anyOfIgnoreCase=function(){var e=U.apply(q,arguments);return 0===e.length?Lt(this):zt(this,(function(e,t){return-1!==t.indexOf(e)}),e,"")},e.prototype.startsWithAnyOfIgnoreCase=function(){var e=U.apply(q,arguments);return 0===e.length?Lt(this):zt(this,(function(e,t){return t.some((function(t){return 0===e.indexOf(t)}))}),e,bt)},e.prototype.anyOf=function(){var e=this,t=U.apply(q,arguments),n=this._cmp;try{t.sort(n)}catch(e){return Vt(this,wt)}if(0===t.length)return Lt(this);var r=new this.Collection(this,(function(){return Ht(t[0],t[t.length-1])}));r._ondirectionchange=function(r){n="next"===r?e._ascending:e._descending,t.sort(n)};var i=0;return r._addAlgorithm((function(e,r,o){for(var a=e.key;n(a,t[i])>0;)if(++i===t.length)return r(o),!1;return 0===n(a,t[i])||(r((function(){e.continue(t[i])})),!1)})),r},e.prototype.notEqual=function(e){return this.inAnyRange([[-1/0,e],[e,this.db._maxKey]],{includeLowers:!1,includeUppers:!1})},e.prototype.noneOf=function(){var e=U.apply(q,arguments);if(0===e.length)return new this.Collection(this);try{e.sort(this._ascending)}catch(e){return Vt(this,wt)}var t=e.reduce((function(e,t){return e?e.concat([[e[e.length-1][1],t]]):[[-1/0,t]]}),null);return t.push([e[e.length-1],this.db._maxKey]),this.inAnyRange(t,{includeLowers:!1,includeUppers:!1})},e.prototype.inAnyRange=function(e,t){var n=this,r=this._cmp,i=this._ascending,o=this._descending,a=this._min,s=this._max;if(0===e.length)return Lt(this);if(!e.every((function(e){return void 0!==e[0]&&void 0!==e[1]&&i(e[0],e[1])<=0})))return Vt(this,"First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower",ie.InvalidArgument);var u=!t||!1!==t.includeLowers,c=t&&!0===t.includeUppers;var l,f=i;function d(e,t){return f(e[0],t[0])}try{(l=e.reduce((function(e,t){for(var n=0,i=e.length;n<i;++n){var o=e[n];if(r(t[0],o[1])<0&&r(t[1],o[0])>0){o[0]=a(o[0],t[0]),o[1]=s(o[1],t[1]);break}}return n===i&&e.push(t),e}),[])).sort(d)}catch(e){return Vt(this,wt)}var h=0,p=c?function(e){return i(e,l[h][1])>0}:function(e){return i(e,l[h][1])>=0},y=u?function(e){return o(e,l[h][0])>0}:function(e){return o(e,l[h][0])>=0};var v=p,m=new this.Collection(this,(function(){return Ht(l[0][0],l[l.length-1][1],!u,!c)}));return m._ondirectionchange=function(e){"next"===e?(v=p,f=i):(v=y,f=o),l.sort(d)},m._addAlgorithm((function(e,t,r){for(var o=e.key;v(o);)if(++h===l.length)return t(r),!1;return!!function(e){return!p(e)&&!y(e)}(o)||(0===n._cmp(o,l[h][1])||0===n._cmp(o,l[h][0])||t((function(){f===i?e.continue(l[h][0]):e.continue(l[h][1])})),!1)})),m},e.prototype.startsWithAnyOf=function(){var e=U.apply(q,arguments);return e.every((function(e){return"string"==typeof e}))?0===e.length?Lt(this):this.inAnyRange(e.map((function(e){return[e,e+bt]}))):Vt(this,"startsWithAnyOf() only works with strings")},e}();function Jt(e){return 1===e.length?e[0]:e}function Qt(e){try{return e.only([[]]),[[]]}catch(e){return bt}}function Xt(e){return $e((function(t){return $t(t),e(t.target.error),!1}))}function $t(e){e.stopPropagation&&e.stopPropagation(),e.preventDefault&&e.preventDefault()}var Zt=function(){function e(){}return e.prototype._lock=function(){return _(!Ke.global),++this._reculock,1!==this._reculock||Ke.global||(Ke.lockOwnerFor=this),this},e.prototype._unlock=function(){if(_(!Ke.global),0==--this._reculock)for(Ke.global||(Ke.lockOwnerFor=null);this._blockedFuncs.length>0&&!this._locked();){var e=this._blockedFuncs.shift();try{ht(e[1],e[0])}catch(e){}}return this},e.prototype._locked=function(){return this._reculock&&Ke.lockOwnerFor!==this},e.prototype.create=function(e){var t=this;if(!this.mode)return this;var n=this.db.idbdb,r=this.db._state.dbOpenError;if(_(!this.idbtrans),!e&&!n)switch(r&&r.name){case"DatabaseClosedError":throw new ie.DatabaseClosed(r);case"MissingAPIError":throw new ie.MissingAPI(r.message,r);default:throw new ie.OpenFailed(r)}if(!this.active)throw new ie.TransactionInactive;return _(null===this._completion._state),(e=this.idbtrans=e||n.transaction(Jt(this.storeNames),this.mode)).onerror=$e((function(n){$t(n),t._reject(e.error)})),e.onabort=$e((function(n){$t(n),t.active&&t._reject(new ie.Abort(e.error)),t.active=!1,t.on("abort").fire(n)})),e.oncomplete=$e((function(){t.active=!1,t._resolve()})),this},e.prototype._promise=function(e,t,n){var r=this;if("readwrite"===e&&"readwrite"!==this.mode)return gt(new ie.ReadOnly("Transaction is readonly"));if(!this.active)return gt(new ie.TransactionInactive);if(this._locked())return new Be((function(i,o){r._blockedFuncs.push([function(){r._promise(e,t,n).then(i,o)},Ke])}));if(n)return ot((function(){var e=new Be((function(e,n){r._lock();var i=t(e,n,r);i&&i.then&&i.then(e,n)}));return e.finally((function(){return r._unlock()})),e._lib=!0,e}));var i=new Be((function(e,n){var i=t(e,n,r);i&&i.then&&i.then(e,n)}));return i._lib=!0,i},e.prototype._root=function(){return this.parent?this.parent._root():this},e.prototype.waitFor=function(e){var t=this._root(),n=Be.resolve(e);if(t._waitingFor)t._waitingFor=t._waitingFor.then((function(){return n}));else{t._waitingFor=n,t._waitingQueue=[];var r=t.idbtrans.objectStore(t.storeNames[0]);!function e(){for(++t._spinCount;t._waitingQueue.length;)t._waitingQueue.shift()();t._waitingFor&&(r.get(-1/0).onsuccess=e)}()}var i=t._waitingFor;return new Be((function(e,r){n.then((function(n){return t._waitingQueue.push($e(e.bind(null,n)))}),(function(e){return t._waitingQueue.push($e(r.bind(null,e)))})).finally((function(){t._waitingFor===i&&(t._waitingFor=null)}))}))},e.prototype.abort=function(){this.active&&this._reject(new ie.Abort),this.active=!1},e.prototype.table=function(e){var t=this._memoizedTables||(this._memoizedTables={});if(f(t,e))return t[e];var n=this.schema[e];if(!n)throw new ie.NotFound("Table "+e+" not part of transaction");var r=new this.db.Table(e,n,this);return r.core=this.db.core.table(e),t[e]=r,r},e}();function en(e,t,n,r,i,o,a){return{name:e,keyPath:t,unique:n,multi:r,auto:i,compound:o,src:(n&&!a?"&":"")+(r?"*":"")+(i?"++":"")+tn(t)}}function tn(e){return"string"==typeof e?e:e?"["+[].join.call(e,"+")+"]":""}function nn(e,t,n){return{name:e,primKey:t,indexes:n,mappedClass:null,idxByName:x(n,(function(e){return[e.name,e]}))}}function rn(e){return null==e?function(){}:"string"==typeof e?function(e){return 1===e.split(".").length?function(t){return t[e]}:function(t){return S(t,e)}}(e):function(t){return S(t,e)}}function on(e,t){return"delete"===t.type?t.keys:t.keys||t.values.map(e.extractKey)}function an(e){return[].slice.call(e)}var sn=0;function un(e){return null==e?":id":"string"==typeof e?e:"["+e.join("+")+"]"}function cn(e,t,n,r){var o=t.cmp.bind(t);function s(e){if(3===e.type)return null;if(4===e.type)throw new Error("Cannot convert never type to IDBKeyRange");var t=e.lower,r=e.upper,i=e.lowerOpen,o=e.upperOpen;return void 0===t?void 0===r?null:n.upperBound(r,!!o):void 0===r?n.lowerBound(t,!!i):n.bound(t,r,!!i,!!o)}var u=function(e,t){var n=an(e.objectStoreNames);return{schema:{name:e.name,tables:n.map((function(e){return t.objectStore(e)})).map((function(e){var t=e.keyPath,n=e.autoIncrement,r=a(t),i=null==t,o={},s={name:e.name,primaryKey:{name:null,isPrimaryKey:!0,outbound:i,compound:r,keyPath:t,autoIncrement:n,unique:!0,extractKey:rn(t)},indexes:an(e.indexNames).map((function(t){return e.index(t)})).map((function(e){var t=e.name,n=e.unique,r=e.multiEntry,i=e.keyPath,s={name:t,compound:a(i),keyPath:i,unique:n,multiEntry:r,extractKey:rn(i)};return o[un(i)]=s,s})),getIndexByKeyPath:function(e){return o[un(e)]}};return o[":id"]=s.primaryKey,null!=t&&(o[un(t)]=s.primaryKey),s}))},hasGetAll:n.length>0&&"getAll"in t.objectStore(n[0])&&!("undefined"!=typeof navigator&&/Safari/.test(navigator.userAgent)&&!/(Chrome\/|Edge\/)/.test(navigator.userAgent)&&[].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1]<604)}}(e,r),c=u.schema,l=u.hasGetAll,f=c.tables.map((function(e){return function(e){var t=e.name;return{name:t,schema:e,mutate:function(n){var r=n.trans,o=n.type,a=n.keys,u=n.values,c=n.range,l=n.wantResults;return new Promise((function(n,f){n=$e(n);var d=r.objectStore(t),h=null==d.keyPath,p="put"===o||"add"===o;if(!p&&"delete"!==o&&"deleteRange"!==o)throw new Error("Invalid operation type: "+o);var y=(a||u||{length:1}).length;if(a&&u&&a.length!==u.length)throw new Error("Given keys array must have same length as given values array.");if(0===y)return n({numFailures:0,failures:{},results:[],lastResult:void 0});var v,m=l&&i(a||on(e.primaryKey,{type:o,keys:a,values:u})),g=[],b=0,w=function(e){++b,$t(e),m&&(m[e.target._reqno]=void 0),g[e.target._reqno]=e.target.error},_=function(e){var t=e.target;m[t._reqno]=t.result};if("deleteRange"===o){if(4===c.type)return n({numFailures:b,failures:g,results:m,lastResult:void 0});v=3===c.type?d.clear():d.delete(s(c))}else{var k=p?h?[u,a]:[u,null]:[a,null],x=k[0],S=k[1];if(p)for(var O=0;O<y;++O)(v=S&&void 0!==S[O]?d[o](x[O],S[O]):d[o](x[O]))._reqno=O,m&&void 0===m[O]&&(v.onsuccess=_),v.onerror=w;else for(O=0;O<y;++O)(v=d[o](x[O]))._reqno=O,v.onerror=w}var I=function(e){var t=e.target.result;m&&(m[y-1]=t),n({numFailures:b,failures:g,results:m,lastResult:t})};v.onerror=function(e){w(e),I(e)},v.onsuccess=I}))},getMany:function(e){var n=e.trans,r=e.keys;return new Promise((function(e,i){e=$e(e);for(var o,a=n.objectStore(t),s=r.length,u=new Array(s),c=0,l=0,f=function(t){var n=t.target;null!=(u[n._pos]=n.result)&&0,++l===c&&e(u)},d=Xt(i),h=0;h<s;++h){null!=r[h]&&((o=a.get(r[h]))._pos=h,o.onsuccess=f,o.onerror=d,++c)}0===c&&e(u)}))},get:function(e){var n=e.trans,r=e.key;return new Promise((function(e,i){e=$e(e);var o=n.objectStore(t).get(r);o.onsuccess=function(t){return e(t.target.result)},o.onerror=Xt(i)}))},query:function(e){return function(n){return new Promise((function(r,i){r=$e(r);var o=n.trans,a=n.values,u=n.limit,c=n.query,l=u===1/0?void 0:u,f=c.index,d=c.range,h=o.objectStore(t),p=f.isPrimaryKey?h:h.index(f.name),y=s(d);if(0===u)return r({result:[]});if(e){var v=a?p.getAll(y,l):p.getAllKeys(y,l);v.onsuccess=function(e){return r({result:e.target.result})},v.onerror=Xt(i)}else{var m=0,g=a||!("openKeyCursor"in p)?p.openCursor(y):p.openKeyCursor(y),b=[];g.onsuccess=function(e){var t=g.result;return t?(b.push(a?t.value:t.primaryKey),++m===u?r({result:b}):void t.continue()):r({result:b})},g.onerror=Xt(i)}}))}}(l),openCursor:function(e){var n=e.trans,r=e.values,i=e.query,o=e.reverse,a=e.unique;return new Promise((function(e,u){e=$e(e);var c=i.index,l=i.range,f=n.objectStore(t),d=c.isPrimaryKey?f:f.index(c.name),h=o?a?"prevunique":"prev":a?"nextunique":"next",p=r||!("openKeyCursor"in d)?d.openCursor(s(l),h):d.openKeyCursor(s(l),h);p.onerror=Xt(u),p.onsuccess=$e((function(t){var r=p.result;if(r){r.___id=++sn,r.done=!1;var i=r.continue.bind(r),o=r.continuePrimaryKey;o&&(o=o.bind(r));var a=r.advance.bind(r),s=function(){throw new Error("Cursor not stopped")};r.trans=n,r.stop=r.continue=r.continuePrimaryKey=r.advance=function(){throw new Error("Cursor not started")},r.fail=$e(u),r.next=function(){var e=this,t=1;return this.start((function(){return t--?e.continue():e.stop()})).then((function(){return e}))},r.start=function(e){var t=new Promise((function(e,t){e=$e(e),p.onerror=Xt(t),r.fail=t,r.stop=function(t){r.stop=r.continue=r.continuePrimaryKey=r.advance=s,e(t)}})),n=function(){if(p.result)try{e()}catch(e){r.fail(e)}else r.done=!0,r.start=function(){throw new Error("Cursor behind last entry")},r.stop()};return p.onsuccess=$e((function(e){p.onsuccess=n,n()})),r.continue=i,r.continuePrimaryKey=o,r.advance=a,n(),t},e(r)}else e(null)}),u)}))},count:function(e){var n=e.query,r=e.trans,i=n.index,o=n.range;return new Promise((function(e,n){var a=r.objectStore(t),u=i.isPrimaryKey?a:a.index(i.name),c=s(o),l=c?u.count(c):u.count();l.onsuccess=$e((function(t){return e(t.target.result)})),l.onerror=Xt(n)}))}}}(e)})),d={};return f.forEach((function(e){return d[e.name]=e})),{stack:"dbcore",transaction:e.transaction.bind(e),table:function(e){if(!d[e])throw new Error("Table '"+e+"' not found");return d[e]},cmp:o,MIN_KEY:-1/0,MAX_KEY:Qt(n),schema:c}}function ln(e,t,n,i){var o=n.IDBKeyRange;return{dbcore:function(e,t){return t.reduce((function(e,t){var n=t.create;return r(r({},e),n(e))}),e)}(cn(t,n.indexedDB,o,i),e.dbcore)}}function fn(e,t){var n=t.db,r=ln(e._middlewares,n,e._deps,t);e.core=r.dbcore,e.tables.forEach((function(t){var n=t.name;e.core.schema.tables.some((function(e){return e.name===n}))&&(t.core=e.core.table(n),e[n]instanceof e.Table&&(e[n].core=t.core))}))}function dn(e,t,n,r){n.forEach((function(n){var i=r[n];t.forEach((function(t){var r=m(t,n);(!r||"value"in r&&void 0===r.value)&&(t===e.Transaction.prototype||t instanceof e.Transaction?p(t,n,{get:function(){return this.table(n)},set:function(e){h(this,n,{value:e,writable:!0,configurable:!0,enumerable:!0})}}):t[n]=new e.Table(n,i))}))}))}function hn(e,t){t.forEach((function(t){for(var n in t)t[n]instanceof e.Table&&delete t[n]}))}function pn(e,t){return e._cfg.version-t._cfg.version}function yn(e,t,n,r){var i=e._dbSchema,a=e._createTransaction("readwrite",e._storeNames,i);a.create(n),a._completion.catch(r);var s=a._reject.bind(a),u=Ke.transless||Ke;ot((function(){Ke.trans=a,Ke.transless=u,0===t?(o(i).forEach((function(e){mn(n,e,i[e].primKey,i[e].indexes)})),fn(e,n),Be.follow((function(){return e.on.populate.fire(a)})).catch(s)):function(e,t,n,r){var i=[],a=e._versions,s=e._dbSchema=bn(e,e.idbdb,r),u=!1;function c(){return i.length?Be.resolve(i.shift()(n.idbtrans)).then(c):Be.resolve()}return a.filter((function(e){return e._cfg.version>=t})).forEach((function(a){i.push((function(){var i=s,c=a._cfg.dbschema;wn(e,i,r),wn(e,c,r),s=e._dbSchema=c;var l=vn(i,c);l.add.forEach((function(e){mn(r,e[0],e[1].primKey,e[1].indexes)})),l.change.forEach((function(e){if(e.recreate)throw new ie.Upgrade("Not yet support for changing primary key");var t=r.objectStore(e.name);e.add.forEach((function(e){return gn(t,e)})),e.change.forEach((function(e){t.deleteIndex(e.name),gn(t,e)})),e.del.forEach((function(e){return t.deleteIndex(e)}))}));var f=a._cfg.contentUpgrade;if(f&&a._cfg.version>t){fn(e,r),n._memoizedTables={},u=!0;var d=C(c);l.del.forEach((function(e){d[e]=i[e]})),hn(e,[e.Transaction.prototype]),dn(e,[e.Transaction.prototype],o(d),d),n.schema=d;var h,p=V(f);p&&at();var y=Be.follow((function(){if((h=f(n))&&p){var e=st.bind(null,null);h.then(e,e)}}));return h&&"function"==typeof h.then?Be.resolve(h):y.then((function(){return h}))}})),i.push((function(t){u&&xt||function(e,t){for(var n=0;n<t.db.objectStoreNames.length;++n){var r=t.db.objectStoreNames[n];null==e[r]&&t.db.deleteObjectStore(r)}}(a._cfg.dbschema,t);hn(e,[e.Transaction.prototype]),dn(e,[e.Transaction.prototype],e._storeNames,e._dbSchema),n.schema=e._dbSchema}))})),c().then((function(){var e,t;t=r,o(e=s).forEach((function(n){t.db.objectStoreNames.contains(n)||mn(t,n,e[n].primKey,e[n].indexes)}))}))}(e,t,a,n).catch(s)}))}function vn(e,t){var n,r={del:[],add:[],change:[]};for(n in e)t[n]||r.del.push(n);for(n in t){var i=e[n],o=t[n];if(i){var a={name:n,def:o,recreate:!1,del:[],add:[],change:[]};if(""+(i.primKey.keyPath||"")!=""+(o.primKey.keyPath||"")||i.primKey.auto!==o.primKey.auto&&!kt)a.recreate=!0,r.change.push(a);else{var s=i.idxByName,u=o.idxByName,c=void 0;for(c in s)u[c]||a.del.push(c);for(c in u){var l=s[c],f=u[c];l?l.src!==f.src&&a.change.push(f):a.add.push(f)}(a.del.length>0||a.add.length>0||a.change.length>0)&&r.change.push(a)}}else r.add.push([n,o])}return r}function mn(e,t,n,r){var i=e.db.createObjectStore(t,n.keyPath?{keyPath:n.keyPath,autoIncrement:n.auto}:{autoIncrement:n.auto});return r.forEach((function(e){return gn(i,e)})),i}function gn(e,t){e.createIndex(t.name,t.keyPath,{unique:t.unique,multiEntry:t.multi})}function bn(e,t,n){var r={};return b(t.objectStoreNames,0).forEach((function(e){for(var t=n.objectStore(e),i=t.keyPath,o=en(tn(i),i||"",!1,!1,!!t.autoIncrement,i&&"string"!=typeof i,!0),a=[],s=0;s<t.indexNames.length;++s){var u=t.index(t.indexNames[s]);i=u.keyPath;var c=en(u.name,i,!!u.unique,!!u.multiEntry,!1,i&&"string"!=typeof i,!1);a.push(c)}r[e]=nn(e,o,a)})),r}function wn(e,t,n){for(var r=n.db.objectStoreNames,i=0;i<r.length;++i){var o=r[i],a=n.objectStore(o);e._hasGetAll="getAll"in a;for(var u=0;u<a.indexNames.length;++u){var c=a.indexNames[u],l=a.index(c).keyPath,f="string"==typeof l?l:"["+b(l).join("+")+"]";if(t[o]){var d=t[o].idxByName[f];d&&(d.name=c,delete t[o].idxByName[f],t[o].idxByName[c]=d)}}}"undefined"!=typeof navigator&&/Safari/.test(navigator.userAgent)&&!/(Chrome\/|Edge\/)/.test(navigator.userAgent)&&s.WorkerGlobalScope&&s instanceof s.WorkerGlobalScope&&[].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1]<604&&(e._hasGetAll=!1)}var _n,kn=function(){function e(){}return e.prototype._parseStoresSpec=function(e,t){o(e).forEach((function(n){if(null!==e[n]){var r=e[n].split(",").map((function(e,t){var n=(e=e.trim()).replace(/([&*]|\+\+)/g,""),r=/^\[/.test(n)?n.match(/^\[(.*)\]$/)[1].split("+"):n;return en(n,r||null,/\&/.test(e),/\*/.test(e),/\+\+/.test(e),a(r),0===t)})),i=r.shift();if(i.multi)throw new ie.Schema("Primary key cannot be multi-valued");r.forEach((function(e){if(e.auto)throw new ie.Schema("Only primary key can be marked as autoIncrement (++)");if(!e.keyPath)throw new ie.Schema("Index must have a name and cannot be an empty string")})),t[n]=nn(n,i,r)}}))},e.prototype.stores=function(e){var t=this.db;this._cfg.storesSource=this._cfg.storesSource?u(this._cfg.storesSource,e):e;var n=t._versions,r={},i={};return n.forEach((function(e){u(r,e._cfg.storesSource),i=e._cfg.dbschema={},e._parseStoresSpec(r,i)})),t._dbSchema=i,hn(t,[t._allTables,t,t.Transaction.prototype]),dn(t,[t._allTables,t,t.Transaction.prototype,this._cfg.tables],o(i),i),t._storeNames=o(i),this},e.prototype.upgrade=function(e){return this._cfg.contentUpgrade=e,this},e}();function xn(e){return ot((function(){return Ke.letThrough=!0,e()}))}function Sn(e){var t=e._state,n=e._deps.indexedDB;if(t.isBeingOpened||e.idbdb)return t.dbReadyPromise.then((function(){return t.dbOpenError?gt(t.dbOpenError):e}));L&&(t.openCanceller._stackHolder=G()),t.isBeingOpened=!0,t.dbOpenError=null,t.openComplete=!1;var r=t.dbReadyResolve,i=null;return Be.race([t.openCanceller,new Be((function(r,a){if(!n)throw new ie.MissingAPI("indexedDB API not found. If using IE10+, make sure to run your code on a server URL (not locally). If using old Safari versions, make sure to include indexedDB polyfill.");var s=e.name,u=t.autoSchema?n.open(s):n.open(s,Math.round(10*e.verno));if(!u)throw new ie.MissingAPI("IndexedDB API not available");u.onerror=Xt(a),u.onblocked=$e(e._fireOnBlocked),u.onupgradeneeded=$e((function(r){if(i=u.transaction,t.autoSchema&&!e._options.allowEmptyDB){u.onerror=$t,i.abort(),u.result.close();var o=n.deleteDatabase(s);o.onsuccess=o.onerror=$e((function(){a(new ie.NoSuchDatabase("Database "+s+" doesnt exist"))}))}else{i.onerror=Xt(a);var c=r.oldVersion>Math.pow(2,62)?0:r.oldVersion;e.idbdb=u.result,yn(e,c/10,i,a)}}),a),u.onsuccess=$e((function(){i=null;var n=e.idbdb=u.result,a=b(n.objectStoreNames);if(a.length>0)try{var c=n.transaction(Jt(a),"readonly");t.autoSchema?function(e,t,n){e.verno=t.version/10;var r=e._dbSchema=bn(0,t,n);e._storeNames=b(t.objectStoreNames,0),dn(e,[e._allTables],o(r),r)}(e,n,c):(wn(e,e._dbSchema,c),function(e,t){var n=vn(bn(0,e.idbdb,t),e._dbSchema);return!(n.add.length||n.change.some((function(e){return e.add.length||e.change.length})))}(e,c)||console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Some queries may fail.")),fn(e,c)}catch(e){}_t.push(e),n.onversionchange=$e((function(n){t.vcFired=!0,e.on("versionchange").fire(n)})),_n.add(s),r()}),a)}))]).then((function(){return t.onReadyBeingFired=[],Be.resolve(xn(e.on.ready.fire)).then((function e(){if(t.onReadyBeingFired.length>0){var n=t.onReadyBeingFired.reduce(ye,se);return t.onReadyBeingFired=[],Be.resolve(xn(n)).then(e)}}))})).finally((function(){t.onReadyBeingFired=null})).then((function(){return t.isBeingOpened=!1,e})).catch((function(n){try{i&&i.abort()}catch(e){}return t.isBeingOpened=!1,e.close(),t.dbOpenError=n,gt(t.dbOpenError)})).finally((function(){t.openComplete=!0,r()}))}function On(e){var t=function(t){return e.next(t)},n=i(t),r=i((function(t){return e.throw(t)}));function i(e){return function(t){var i=e(t),o=i.value;return i.done?o:o&&"function"==typeof o.then?o.then(n,r):a(o)?Promise.all(o).then(n,r):n(o)}}return i(t)()}function In(e,t,n){var r=arguments.length;if(r<2)throw new ie.InvalidArgument("Too few arguments");for(var i=new Array(r-1);--r;)i[r-1]=arguments[r];n=i.pop();var o=E(i);return[e,o,n]}function Cn(e,t,n,r,i){return Be.resolve().then((function(){var o=Ke.transless||Ke,a=e._createTransaction(t,n,e._dbSchema,r),s={trans:a,transless:o};r?a.idbtrans=r.idbtrans:a.create();var u,c=V(i);c&&at();var l=Be.follow((function(){if(u=i.call(a,a))if(c){var e=st.bind(null,null);u.then(e,e)}else"function"==typeof u.next&&"function"==typeof u.throw&&(u=On(u))}),s);return(u&&"function"==typeof u.then?Be.resolve(u).then((function(e){return a.active?e:gt(new ie.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"))})):l.then((function(){return u}))).then((function(e){return r&&a._resolve(),a._completion.then((function(){return e}))})).catch((function(e){return a._reject(e),gt(e)}))}))}function Pn(e,t,n){for(var r=a(e)?e.slice():[e],i=0;i<n;++i)r.push(t);return r}var En={stack:"dbcore",name:"VirtualIndexMiddleware",level:1,create:function(e){return r(r({},e),{table:function(t){var n=e.table(t),i=n.schema,o={},a=[];function s(e,t,n){var i=un(e),u=o[i]=o[i]||[],c=null==e?0:"string"==typeof e?1:e.length,l=t>0,f=r(r({},n),{isVirtual:l,isPrimaryKey:!l&&n.isPrimaryKey,keyTail:t,keyLength:c,extractKey:rn(e),unique:!l&&n.unique});(u.push(f),f.isPrimaryKey||a.push(f),c>1)&&s(2===c?e[0]:e.slice(0,c-1),t+1,n);return u.sort((function(e,t){return e.keyTail-t.keyTail})),f}var u=s(i.primaryKey.keyPath,0,i.primaryKey);o[":id"]=[u];for(var c=0,l=i.indexes;c<l.length;c++){var f=l[c];s(f.keyPath,0,f)}function d(t){var n,i,o=t.query.index;return o.isVirtual?r(r({},t),{query:{index:o,range:(n=t.query.range,i=o.keyTail,{type:1===n.type?2:n.type,lower:Pn(n.lower,n.lowerOpen?e.MAX_KEY:e.MIN_KEY,i),lowerOpen:!0,upper:Pn(n.upper,n.upperOpen?e.MIN_KEY:e.MAX_KEY,i),upperOpen:!0})}}):t}return r(r({},n),{schema:r(r({},i),{primaryKey:u,indexes:a,getIndexByKeyPath:function(e){var t=o[un(e)];return t&&t[0]}}),count:function(e){return n.count(d(e))},query:function(e){return n.query(d(e))},openCursor:function(t){var r=t.query.index,i=r.keyTail,o=r.isVirtual,a=r.keyLength;if(!o)return n.openCursor(t);return n.openCursor(d(t)).then((function(n){return n&&function(n){return Object.create(n,{continue:{value:function(r){null!=r?n.continue(Pn(r,t.reverse?e.MAX_KEY:e.MIN_KEY,i)):t.unique?n.continue(Pn(n.key,t.reverse?e.MIN_KEY:e.MAX_KEY,i)):n.continue()}},continuePrimaryKey:{value:function(t,r){n.continuePrimaryKey(Pn(t,e.MAX_KEY,i),r)}},key:{get:function(){var e=n.key;return 1===a?e[0]:e.slice(0,a)}},value:{get:function(){return n.value}}})}(n)}))}})}})}},jn={stack:"dbcore",name:"HooksMiddleware",level:2,create:function(e){return r(r({},e),{table:function(t){var n=e.table(t),o=n.schema.primaryKey;return r(r({},n),{mutate:function(e){var a=Ke.trans,s=a.table(t).hook,u=s.deleting,c=s.creating,l=s.updating;switch(e.type){case"add":if(c.fire===se)break;return a._promise("readwrite",(function(){return d(e)}),!0);case"put":if(c.fire===se&&l.fire===se)break;return a._promise("readwrite",(function(){return d(e)}),!0);case"delete":if(u.fire===se)break;return a._promise("readwrite",(function(){return d(e)}),!0);case"deleteRange":if(u.fire===se)break;return a._promise("readwrite",(function(){return function(e){return function e(t,i,a){return n.query({trans:t,values:!1,query:{index:o,range:i},limit:a}).then((function(n){var o=n.result;return d({type:"delete",keys:o,trans:t}).then((function(n){return n.numFailures>0?Promise.reject(n.failures[0]):o.length<a?{failures:[],numFailures:0,lastResult:void 0}:e(t,r(r({},i),{lower:o[o.length-1],lowerOpen:!0}),a)}))}))}(e.trans,e.range,1e4)}(e)}),!0)}return n.mutate(e);function d(e){var t=Ke.trans,a=e.keys||on(o,e);if(!a)throw new Error("Keys missing");return"delete"!==(e="add"===e.type||"put"===e.type?r(r({},e),{keys:a,wantResults:!0}):r({},e)).type&&(e.values=i(e.values)),e.keys&&(e.keys=i(e.keys)),function(e,t,n){return"add"===t.type?Promise.resolve(new Array(t.values.length)):e.getMany({trans:t.trans,keys:n})}(n,e,a).then((function(r){var i=a.map((function(n,i){var a=r[i],s={onerror:null,onsuccess:null};if("delete"===e.type)u.fire.call(s,n,a,t);else if("add"===e.type||void 0===a){var d=c.fire.call(s,n,e.values[i],t);null==n&&null!=d&&(n=d,e.keys[i]=n,o.outbound||O(e.values[i],o.keyPath,n))}else{var h=R(a,e.values[i]),p=l.fire.call(s,h,n,a,t);if(p){var y=e.values[i];Object.keys(p).forEach((function(e){f(y,e)?y[e]=p[e]:O(y,e,p[e])}))}}return s}));return n.mutate(e).then((function(t){for(var n=t.failures,o=t.results,s=t.numFailures,u=t.lastResult,c=0;c<a.length;++c){var l=o?o[c]:a[c],f=i[c];null==l?f.onerror&&f.onerror(n[c]):f.onsuccess&&f.onsuccess("put"===e.type&&r[c]?e.values[c]:l)}return{failures:n,results:o,numFailures:s,lastResult:u}})).catch((function(e){return i.forEach((function(t){return t.onerror&&t.onerror(e)})),Promise.reject(e)}))}))}}})}})}},An=function(){function e(t,n){var i=this;this._middlewares={},this.verno=0;var o=e.dependencies;this._options=n=r({addons:e.addons,autoOpen:!0,indexedDB:o.indexedDB,IDBKeyRange:o.IDBKeyRange},n),this._deps={indexedDB:n.indexedDB,IDBKeyRange:n.IDBKeyRange};var a=n.addons;this._dbSchema={},this._versions=[],this._storeNames=[],this._allTables={},this.idbdb=null;var s,u={dbOpenError:null,isBeingOpened:!1,onReadyBeingFired:null,openComplete:!1,dbReadyResolve:se,dbReadyPromise:null,cancelOpen:se,openCanceller:null,autoSchema:!0};u.dbReadyPromise=new Be((function(e){u.dbReadyResolve=e})),u.openCanceller=new Be((function(e,t){u.cancelOpen=t})),this._state=u,this.name=t,this.on=jt(this,"populate","blocked","versionchange",{ready:[ye,se]}),this.on.ready.subscribe=w(this.on.ready.subscribe,(function(t){return function(n,r){e.vip((function(){var e=i._state;if(e.openComplete)e.dbOpenError||Be.resolve().then(n),r&&t(n);else if(e.onReadyBeingFired)e.onReadyBeingFired.push(n),r&&t(n);else{t(n);var o=i;r||t((function e(){o.on.ready.unsubscribe(n),o.on.ready.unsubscribe(e)}))}}))}})),this.Collection=(s=this,At(Ft.prototype,(function(e,t){this.db=s;var n=Ct,r=null;if(t)try{n=t()}catch(e){r=e}var i=e._ctx,o=i.table,a=o.hook.reading.fire;this._ctx={table:o,index:i.index,isPrimKey:!i.index||o.schema.primKey.keyPath&&i.index===o.schema.primKey.name,range:n,keysOnly:!1,dir:"next",unique:"",algorithm:null,filter:null,replayFilter:null,justLimit:!0,isMatch:null,offset:0,limit:1/0,error:r,or:i.or,valueMapper:a!==ue?a:null}}))),this.Table=function(e){return At(Et.prototype,(function(t,n,r){this.db=e,this._tx=r,this.name=t,this.schema=n,this.hook=e._allTables[t]?e._allTables[t].hook:jt(null,{creating:[fe,se],reading:[ce,ue],updating:[he,se],deleting:[de,se]})}))}(this),this.Transaction=function(e){return At(Zt.prototype,(function(t,n,r,i){var o=this;this.db=e,this.mode=t,this.storeNames=n,this.schema=r,this.idbtrans=null,this.on=jt(this,"complete","error","abort"),this.parent=i||null,this.active=!0,this._reculock=0,this._blockedFuncs=[],this._resolve=null,this._reject=null,this._waitingFor=null,this._waitingQueue=null,this._spinCount=0,this._completion=new Be((function(e,t){o._resolve=e,o._reject=t})),this._completion.then((function(){o.active=!1,o.on.complete.fire()}),(function(e){var t=o.active;return o.active=!1,o.on.error.fire(e),o.parent?o.parent._reject(e):t&&o.idbtrans&&o.idbtrans.abort(),gt(e)}))}))}(this),this.Version=function(e){return At(kn.prototype,(function(t){this.db=e,this._cfg={version:t,storesSource:null,dbschema:{},tables:{},contentUpgrade:null}}))}(this),this.WhereClause=function(e){return At(Yt.prototype,(function(t,n,r){this.db=e,this._ctx={table:t,index:":id"===n?null:n,or:r};var i=e._deps.indexedDB;if(!i)throw new ie.MissingAPI("indexedDB API missing");this._cmp=this._ascending=i.cmp.bind(i),this._descending=function(e,t){return i.cmp(t,e)},this._max=function(e,t){return i.cmp(e,t)>0?e:t},this._min=function(e,t){return i.cmp(e,t)<0?e:t},this._IDBKeyRange=e._deps.IDBKeyRange}))}(this),this.on("versionchange",(function(e){e.newVersion>0?console.warn("Another connection wants to upgrade database '"+i.name+"'. Closing db now to resume the upgrade."):console.warn("Another connection wants to delete database '"+i.name+"'. Closing db now to resume the delete request."),i.close()})),this.on("blocked",(function(e){!e.newVersion||e.newVersion<e.oldVersion?console.warn("Dexie.delete('"+i.name+"') was blocked"):console.warn("Upgrade '"+i.name+"' blocked by other connection holding version "+e.oldVersion/10)})),this._maxKey=Qt(n.IDBKeyRange),this._createTransaction=function(e,t,n,r){return new i.Transaction(e,t,n,r)},this._fireOnBlocked=function(e){i.on("blocked").fire(e),_t.filter((function(e){return e.name===i.name&&e!==i&&!e._state.vcFired})).map((function(t){return t.on("versionchange").fire(e)}))},this.use(En),this.use(jn),a.forEach((function(e){return e(i)}))}return e.prototype.version=function(e){if(isNaN(e)||e<.1)throw new ie.Type("Given version is not a positive number");if(e=Math.round(10*e)/10,this.idbdb||this._state.isBeingOpened)throw new ie.Schema("Cannot add version when database is open");this.verno=Math.max(this.verno,e);var t=this._versions,n=t.filter((function(t){return t._cfg.version===e}))[0];return n||(n=new this.Version(e),t.push(n),t.sort(pn),n.stores({}),this._state.autoSchema=!1,n)},e.prototype._whenReady=function(e){var t=this;return this._state.openComplete||Ke.letThrough?e():new Be((function(e,n){if(!t._state.isBeingOpened){if(!t._options.autoOpen)return void n(new ie.DatabaseClosed);t.open().catch(se)}t._state.dbReadyPromise.then(e,n)})).then(e)},e.prototype.use=function(e){var t=e.stack,n=e.create,r=e.level,i=e.name;i&&this.unuse({stack:t,name:i});var o=this._middlewares[t]||(this._middlewares[t]=[]);return o.push({stack:t,create:n,level:null==r?10:r,name:i}),o.sort((function(e,t){return e.level-t.level})),this},e.prototype.unuse=function(e){var t=e.stack,n=e.name,r=e.create;return t&&this._middlewares[t]&&(this._middlewares[t]=this._middlewares[t].filter((function(e){return r?e.create!==r:!!n&&e.name!==n}))),this},e.prototype.open=function(){return Sn(this)},e.prototype.close=function(){var e=_t.indexOf(this),t=this._state;if(e>=0&&_t.splice(e,1),this.idbdb){try{this.idbdb.close()}catch(e){}this.idbdb=null}this._options.autoOpen=!1,t.dbOpenError=new ie.DatabaseClosed,t.isBeingOpened&&t.cancelOpen(t.dbOpenError),t.dbReadyPromise=new Be((function(e){t.dbReadyResolve=e})),t.openCanceller=new Be((function(e,n){t.cancelOpen=n}))},e.prototype.delete=function(){var e=this,t=arguments.length>0,n=this._state;return new Be((function(r,i){var o=function(){e.close();var t=e._deps.indexedDB.deleteDatabase(e.name);t.onsuccess=$e((function(){_n.remove(e.name),r()})),t.onerror=Xt(i),t.onblocked=e._fireOnBlocked};if(t)throw new ie.InvalidArgument("Arguments not allowed in db.delete()");n.isBeingOpened?n.dbReadyPromise.then(o):o()}))},e.prototype.backendDB=function(){return this.idbdb},e.prototype.isOpen=function(){return null!==this.idbdb},e.prototype.hasBeenClosed=function(){var e=this._state.dbOpenError;return e&&"DatabaseClosed"===e.name},e.prototype.hasFailed=function(){return null!==this._state.dbOpenError},e.prototype.dynamicallyOpened=function(){return this._state.autoSchema},Object.defineProperty(e.prototype,"tables",{get:function(){var e=this;return o(this._allTables).map((function(t){return e._allTables[t]}))},enumerable:!0,configurable:!0}),e.prototype.transaction=function(){var e=In.apply(this,arguments);return this._transaction.apply(this,e)},e.prototype._transaction=function(e,t,n){var r=this,i=Ke.trans;i&&i.db===this&&-1===e.indexOf("!")||(i=null);var o,a,s=-1!==e.indexOf("?");e=e.replace("!","").replace("?","");try{if(a=t.map((function(e){var t=e instanceof r.Table?e.name:e;if("string"!=typeof t)throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");return t})),"r"==e||"readonly"===e)o="readonly";else{if("rw"!=e&&"readwrite"!=e)throw new ie.InvalidArgument("Invalid transaction mode: "+e);o="readwrite"}if(i){if("readonly"===i.mode&&"readwrite"===o){if(!s)throw new ie.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");i=null}i&&a.forEach((function(e){if(i&&-1===i.storeNames.indexOf(e)){if(!s)throw new ie.SubTransaction("Table "+e+" not included in parent transaction.");i=null}})),s&&i&&!i.active&&(i=null)}}catch(e){return i?i._promise(null,(function(t,n){n(e)})):gt(e)}var u=Cn.bind(null,this,o,a,i,n);return i?i._promise(o,u,"lock"):Ke.trans?ht(Ke.transless,(function(){return r._whenReady(u)})):this._whenReady(u)},e.prototype.table=function(e){if(!f(this._allTables,e))throw new ie.InvalidTable("Table "+e+" does not exist");return this._allTables[e]},e}(),Tn=An;d(Tn,r(r({},ae),{delete:function(e){return new Tn(e).delete()},exists:function(e){return new Tn(e,{addons:[]}).open().then((function(e){return e.close(),!0})).catch("NoSuchDatabaseError",(function(){return!1}))},getDatabaseNames:function(e){return _n?_n.getDatabaseNames().then(e):Be.resolve([])},defineClass:function(){return function(e){u(this,e)}},ignoreTransaction:function(e){return Ke.trans?ht(Ke.transless,e):e()},vip:xn,async:function(e){return function(){try{var t=On(e.apply(this,arguments));return t&&"function"==typeof t.then?t:Be.resolve(t)}catch(e){return gt(e)}}},spawn:function(e,t,n){try{var r=On(e.apply(n,t||[]));return r&&"function"==typeof r.then?r:Be.resolve(r)}catch(e){return gt(e)}},currentTransaction:{get:function(){return Ke.trans||null}},waitFor:function(e,t){var n=Be.resolve("function"==typeof e?Tn.ignoreTransaction(e):e).timeout(t||6e4);return Ke.trans?Ke.trans.waitFor(n):n},Promise:Be,debug:{get:function(){return L},set:function(e){W(e,"dexie"===e?function(){return!0}:Ot)}},derive:y,extend:u,props:d,override:w,Events:jt,getByKeyPath:S,setByKeyPath:O,delByKeyPath:I,shallowClone:C,deepClone:D,getObjectDiff:R,asap:k,minKey:-1/0,addons:[],connections:_t,errnames:ne,dependencies:function(){try{return{indexedDB:s.indexedDB||s.mozIndexedDB||s.webkitIndexedDB||s.msIndexedDB,IDBKeyRange:s.IDBKeyRange||s.webkitIDBKeyRange}}catch(e){return{indexedDB:null,IDBKeyRange:null}}}(),semVer:"3.0.3",version:"3.0.3".split(".").map((function(e){return parseInt(e)})).reduce((function(e,t,n){return e+t/Math.pow(10,2*n)})),default:Tn,Dexie:Tn})),Tn.maxKey=Qt(Tn.dependencies.IDBKeyRange),function(e){try{_n=function(e){var t,n=e&&"function"==typeof e.databases;if(!n){var r=new An("__dbnames",{addons:[]});r.version(1).stores({dbnames:"name"}),t=r.table("dbnames")}return{getDatabaseNames:function(){return n?Be.resolve(e.databases()).then((function(e){return e.map((function(e){return e.name})).filter((function(e){return"__dbnames"!==e}))})):t.toCollection().primaryKeys()},add:function(e){return!n&&"__dbnames"!==e&&t.put({name:e}).catch(se)},remove:function(e){return!n&&"__dbnames"!==e&&t.delete(e).catch(se)}}}(e)}catch(e){}}(An.dependencies.indexedDB),Be.rejectionMapper=function(e,t){if(!e||e instanceof $||e instanceof TypeError||e instanceof SyntaxError||!e.name||!oe[e.name])return e;var n=new oe[e.name](t||e.message,e);return"stack"in e&&p(n,"stack",{get:function(){return this.inner.stack}}),n},W(L,Ot),t.default=An},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.default=class{static debug(...e){console.debug(e)}static info(...e){console.info(e)}static error(...e){console.error(e)}static warn(...e){console.warn(e)}}},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(i,o){function a(e){try{u(r.next(e))}catch(e){o(e)}}function s(e){try{u(r.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(a,s)}u((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.GrowPushManager=void 0;const i=n(0),o=n(5),a=n(6),s=n(13);t.GrowPushManager=class{constructor(e,t){this.initVars=e,this.swRegistration=t,this.initVars=e}init(){return r(this,void 0,void 0,(function*(){if(this.db=yield i.DbManager.Instance(),!this.initVars.pushOptInSetting.isEnabled)return;if((yield this.showConsentPopup())&&this.initVars.pushOptInSetting.isEnabled){const e=new a.PopupManager(this.initVars),t=yield e.show(this.initVars.pushOptInSetting.showModal);if(yield this.db.save(i.DbKeys.LastOptInAt,(new Date).getTime()/1e3),!t)return void(yield this.db.save(i.DbKeys.LastOptInAt,(new Date).getTime()/1e3));if(console.log("requesting prompt"),this.notificationStatus=yield this.requestNotificationPermission(),!this.notificationStatus)return;yield this.saveSubscription()}}))}saveSubscription(){return r(this,void 0,void 0,(function*(){const e=yield this.createPushSubscription(),t=yield this.saveToServer(e);if(200===t.status){const n=yield t.json().then(e=>e.uniqueId),r=yield i.DbManager.Instance();return yield r.save(i.DbKeys.SubscriberId,n),yield r.save(i.DbKeys.ClientId,this.initVars.clientId),yield r.save(i.DbKeys.PushData,JSON.stringify(e.toJSON())),e}return null}))}requestNotificationPermission(){return r(this,void 0,void 0,(function*(){return"granted"===(yield Notification.requestPermission().catch(e=>(console.error(e,"Grow Notification Prompt"),Promise.reject(e))))}))}showConsentPopup(){return r(this,void 0,void 0,(function*(){if(void 0!==window.safari)return!1;const e=yield this.db.find(i.DbKeys.LastOptInAt),t=Number.parseInt((null==e?void 0:e.value)||"0");if(!Number.isNaN(t)&&(new Date).getTime()/1e3<t+(this.initVars.pushOptInSetting.delay||o.Constants.DefaultOptinTimeout))return!1;let n="granted"!==Notification.permission&&"denied"!==Notification.permission;if(!n){let e=yield this.swRegistration.pushManager.getSubscription(),t=e?e.toJSON():{},r=yield this.db.findValue(i.DbKeys.PushData),o=yield s.HelperUtils.getValueIfExist(()=>JSON.parse(r));if(!o||!s.HelperUtils.isPushSimilar(o,t)){(yield this.tryReSubscribingToGrow())||(yield this.removeSubscription(),n=!0)}}return n&&(console.log("subscriptionDoesNotExist"),yield s.HelperUtils.sleep(1e3*this.initVars.pushOptInSetting.initialDelay||0)),n}))}tryReSubscribingToGrow(){return r(this,void 0,void 0,(function*(){try{return yield this.saveSubscription(),!0}catch(e){return console.error(e.message),!1}}))}removeSubscription(){return r(this,void 0,void 0,(function*(){let e=yield this.swRegistration.pushManager.getSubscription();if(e){const t=yield i.DbManager.Instance();return yield t.clear(i.DbKeys.ClientId),yield t.clear(i.DbKeys.SubscriberId),yield e.unsubscribe()}return!1}))}createPushSubscription(){return r(this,void 0,void 0,(function*(){const e={userVisibleOnly:!0,applicationServerKey:s.HelperUtils.urlBase64ToUint8Array(this.initVars.vapidKey)};return yield this.swRegistration.pushManager.subscribe(e)}))}saveToServer(e){return r(this,void 0,void 0,(function*(){const t=Object.assign({userAgent:navigator.userAgent},this.initVars.meta),n={push:e,clientId:this.initVars.clientId,subscriberUniqueId:yield this.db.findValue(i.DbKeys.SubscriberId),meta:t};return yield fetch(this.initVars.subscribeUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})}))}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.Constants=void 0;class r{}t.Constants=r,r.DefaultOptinTimeout=86400},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(i,o){function a(e){try{u(r.next(e))}catch(e){o(e)}}function s(e){try{u(r.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(a,s)}u((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.PopupManager=void 0,n(7);const i=n(11),o=n(12);t.PopupManager=class{constructor(e){this.modalId="grow-consent-modal";const t={modalId:this.modalId,iconUrl:e.pushOptInSetting.message.iconUrl||"",title:e.pushOptInSetting.message.title||"Subscribe to Notifications",body:e.pushOptInSetting.message.body||"",closeText:e.pushOptInSetting.message.buttons.find(e=>1===e.order).label||"Later",subscribeText:e.pushOptInSetting.message.buttons.find(e=>2===e.order).label||"Subscribe"};let n='<div class="grow_modal micromodal-slide" id="{{modalId}}" aria-hidden="true"><div class="grow_modal__overlay" tabindex="-1"><div class="grow_modal__container" role="dialog" aria-modal="true"> <main class="grow_modal__content"> <img class="grow_modal__icon" src="{{iconUrl}}"><div class="grow_modal__content_text"><h4 class="grow_modal_title">{{title}}</h4><p class="grow_modal_para"> {{body}}</p></div></main> <footer class="grow_modal__footer"> <a class="grow_modal__btn grow_modal__btn-cancel" aria-label="Close this dialog window">{{closeText}}</a> <button class="grow_modal__btn grow_modal__btn-primary">{{subscribeText}}</button> </footer></div></div></div>';n=n.replace(/{{modalId}}/g,this.modalId),n=n.replace(/{{iconUrl}}/g,t.iconUrl),n=n.replace(/{{title}}/g,t.title),n=n.replace(/{{body}}/g,t.body),n=n.replace(/{{closeText}}/g,t.closeText),n=n.replace(/{{subscribeText}}/g,t.subscribeText);const r=o.render(n,t);let a=document.createElement("div");a.innerHTML=r,a=a.firstChild||a;const s=a.querySelector(".grow_modal__btn-primary"),u=a.querySelector(".grow_modal__btn-cancel");s&&s.addEventListener("click",()=>this.subscribeClick(!0)),u&&u.addEventListener("click",()=>this.subscribeClick(!1)),document.body.appendChild(a),i.default.init({awaitCloseAnimation:!0})}show(e){return r(this,void 0,void 0,(function*(){return!e||(i.default.show(this.modalId),new Promise(e=>this.confirmationResolve=e))}))}subscribeClick(e){return i.default.close(this.modalId),this.confirmationResolve(e)}}},function(e,t,n){var r=n(8),i=n(9);"string"==typeof(i=i.__esModule?i.default:i)&&(i=[[e.i,i,""]]);var o={insert:"head",singleton:!1};r(i,o);e.exports=i.locals||{}},function(e,t,n){"use strict";var r,i=function(){return void 0===r&&(r=Boolean(window&&document&&document.all&&!window.atob)),r},o=function(){var e={};return function(t){if(void 0===e[t]){var n=document.querySelector(t);if(window.HTMLIFrameElement&&n instanceof window.HTMLIFrameElement)try{n=n.contentDocument.head}catch(e){n=null}e[t]=n}return e[t]}}(),a=[];function s(e){for(var t=-1,n=0;n<a.length;n++)if(a[n].identifier===e){t=n;break}return t}function u(e,t){for(var n={},r=[],i=0;i<e.length;i++){var o=e[i],u=t.base?o[0]+t.base:o[0],c=n[u]||0,l="".concat(u," ").concat(c);n[u]=c+1;var f=s(l),d={css:o[1],media:o[2],sourceMap:o[3]};-1!==f?(a[f].references++,a[f].updater(d)):a.push({identifier:l,updater:v(d,t),references:1}),r.push(l)}return r}function c(e){var t=document.createElement("style"),r=e.attributes||{};if(void 0===r.nonce){var i=n.nc;i&&(r.nonce=i)}if(Object.keys(r).forEach((function(e){t.setAttribute(e,r[e])})),"function"==typeof e.insert)e.insert(t);else{var a=o(e.insert||"head");if(!a)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");a.appendChild(t)}return t}var l,f=(l=[],function(e,t){return l[e]=t,l.filter(Boolean).join("\n")});function d(e,t,n,r){var i=n?"":r.media?"@media ".concat(r.media," {").concat(r.css,"}"):r.css;if(e.styleSheet)e.styleSheet.cssText=f(t,i);else{var o=document.createTextNode(i),a=e.childNodes;a[t]&&e.removeChild(a[t]),a.length?e.insertBefore(o,a[t]):e.appendChild(o)}}function h(e,t,n){var r=n.css,i=n.media,o=n.sourceMap;if(i?e.setAttribute("media",i):e.removeAttribute("media"),o&&"undefined"!=typeof btoa&&(r+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(o))))," */")),e.styleSheet)e.styleSheet.cssText=r;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(r))}}var p=null,y=0;function v(e,t){var n,r,i;if(t.singleton){var o=y++;n=p||(p=c(t)),r=d.bind(null,n,o,!1),i=d.bind(null,n,o,!0)}else n=c(t),r=h.bind(null,n,t),i=function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(n)};return r(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;r(e=t)}else i()}}e.exports=function(e,t){(t=t||{}).singleton||"boolean"==typeof t.singleton||(t.singleton=i());var n=u(e=e||[],t);return function(e){if(e=e||[],"[object Array]"===Object.prototype.toString.call(e)){for(var r=0;r<n.length;r++){var i=s(n[r]);a[i].references--}for(var o=u(e,t),c=0;c<n.length;c++){var l=s(n[c]);0===a[l].references&&(a[l].updater(),a.splice(l,1))}n=o}}}},function(e,t,n){(t=n(10)(!1)).push([e.i,'.grow_modal{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif}.grow_modal *{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif;font-size:0.875rem;opacity:1}.grow_modal__overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:flex-start;z-index:10000}.grow_modal__container{background-color:#fff;padding:15px;width:470px;max-height:100vh;border-radius:0 0 4px 4px;overflow-y:auto;box-sizing:border-box;box-shadow:rgba(0,0,0,0.21) 0px 12px 13px !important}.grow_modal__content{margin-bottom:1rem;line-height:1.5;color:rgba(0,0,0,0.8);flex-direction:row;display:flex}.grow_modal__content .grow_modal__icon{height:76px;width:76px;margin-right:5px;border-radius:4px}.grow_modal__content h4{margin:0 0 1rem;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif;font-size:14px;letter-spacing:1.4px;font-weight:bolder}.grow_modal__content p{margin-top:0;font-size:14px;margin-bottom:1rem;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif}.grow_modal__content .grow_modal__content_text{display:flex;flex-direction:column;margin-left:1rem;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif}.grow_modal__btn,.grow_modal__btn:focus-visible{outline:none;box-shadow:none !important}.grow_modal__btn:focus,.grow_modal__btn:hover{-webkit-transform:scale(1.02)}.grow_modal__btn{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif;padding:.5rem 1rem;background:none;color:rgba(0,0,0,0.8);border-radius:.25rem;border-style:none;border-width:0;cursor:pointer;-webkit-appearance:button;text-transform:none;overflow:visible;line-height:1.15;margin:0;will-change:transform;-moz-osx-font-smoothing:grayscale;-webkit-backface-visibility:hidden;backface-visibility:hidden;-webkit-transform:translateZ(0);transform:translateZ(0);transition:-webkit-transform .25s ease-out;transition:transform .25s ease-out;width:auto;height:auto}.grow_modal__footer{display:flex;justify-content:flex-end;margin-top:0;padding-top:0;border:none;background:transparent}.grow_modal__btn-cancel,.grow_modal__btn-cancel:focus{border:none !important;background-color:white !important;font-size:12.8px;margin-right:5px}.grow_modal__btn-primary{background-color:#2e5fdc;color:#fff;font-size:14px;border:none;border-radius:4px;padding:4px 16px}@keyframes mmfadeIn{from{opacity:0}to{opacity:1}}@keyframes mmfadeOut{from{opacity:1}to{opacity:0}}@keyframes mmslideIn{from{transform:translateY(-15%)}to{transform:translateY(0)}}@keyframes mmslideOut{from{transform:translateY(0)}to{transform:translateY(-10%)}}.micromodal-slide{display:none}.micromodal-slide.is-open{display:block}.micromodal-slide[aria-hidden="false"] .grow_modal__overlay{animation:mmfadeIn 0.3s cubic-bezier(0, 0, 0.2, 1)}.micromodal-slide[aria-hidden="false"] .grow_modal__container{animation:mmslideIn 0.3s cubic-bezier(0, 0, 0.2, 1)}.micromodal-slide[aria-hidden="true"] .grow_modal__overlay{animation:mmfadeOut 0.3s cubic-bezier(0, 0, 0.2, 1)}.micromodal-slide[aria-hidden="true"] .grow_modal__container{animation:mmslideOut 0.3s cubic-bezier(0, 0, 0.2, 1)}.micromodal-slide .grow_modal__container,.micromodal-slide .grow_modal__overlay{will-change:transform}\n',""]),e.exports=t},function(e,t,n){"use strict";e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n=function(e,t){var n=e[1]||"",r=e[3];if(!r)return n;if(t&&"function"==typeof btoa){var i=(a=r,s=btoa(unescape(encodeURIComponent(JSON.stringify(a)))),u="sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(s),"/*# ".concat(u," */")),o=r.sources.map((function(e){return"/*# sourceURL=".concat(r.sourceRoot||"").concat(e," */")}));return[n].concat(o).concat([i]).join("\n")}var a,s,u;return[n].join("\n")}(t,e);return t[2]?"@media ".concat(t[2]," {").concat(n,"}"):n})).join("")},t.i=function(e,n,r){"string"==typeof e&&(e=[[null,e,""]]);var i={};if(r)for(var o=0;o<this.length;o++){var a=this[o][0];null!=a&&(i[a]=!0)}for(var s=0;s<e.length;s++){var u=[].concat(e[s]);r&&i[u[0]]||(n&&(u[2]?u[2]="".concat(n," and ").concat(u[2]):u[2]=n),t.push(u))}},t}},function(e,t,n){"use strict";function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function i(e){return function(e){if(Array.isArray(e))return o(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||function(e,t){if(!e)return;if("string"==typeof e)return o(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(n);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return o(e,t)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function o(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}n.r(t);var a,s,u,c,l,f=(a=["a[href]","area[href]",'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',"select:not([disabled]):not([aria-hidden])","textarea:not([disabled]):not([aria-hidden])","button:not([disabled]):not([aria-hidden])","iframe","object","embed","[contenteditable]",'[tabindex]:not([tabindex^="-"])'],s=function(){function e(t){var n=t.targetModal,r=t.triggers,o=void 0===r?[]:r,a=t.onShow,s=void 0===a?function(){}:a,u=t.onClose,c=void 0===u?function(){}:u,l=t.openTrigger,f=void 0===l?"data-micromodal-trigger":l,d=t.closeTrigger,h=void 0===d?"data-micromodal-close":d,p=t.openClass,y=void 0===p?"is-open":p,v=t.disableScroll,m=void 0!==v&&v,g=t.disableFocus,b=void 0!==g&&g,w=t.awaitCloseAnimation,_=void 0!==w&&w,k=t.awaitOpenAnimation,x=void 0!==k&&k,S=t.debugMode,O=void 0!==S&&S;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.modal=document.getElementById(n),this.config={debugMode:O,disableScroll:m,openTrigger:f,closeTrigger:h,openClass:y,onShow:s,onClose:c,awaitCloseAnimation:_,awaitOpenAnimation:x,disableFocus:b},o.length>0&&this.registerTriggers.apply(this,i(o)),this.onClick=this.onClick.bind(this),this.onKeydown=this.onKeydown.bind(this)}var t,n,o;return t=e,(n=[{key:"registerTriggers",value:function(){for(var e=this,t=arguments.length,n=new Array(t),r=0;r<t;r++)n[r]=arguments[r];n.filter(Boolean).forEach((function(t){t.addEventListener("click",(function(t){return e.showModal(t)}))}))}},{key:"showModal",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;if(this.activeElement=document.activeElement,this.modal.setAttribute("aria-hidden","false"),this.modal.classList.add(this.config.openClass),this.scrollBehaviour("disable"),this.addEventListeners(),this.config.awaitOpenAnimation){var n=function t(){e.modal.removeEventListener("animationend",t,!1),e.setFocusToFirstNode()};this.modal.addEventListener("animationend",n,!1)}else this.setFocusToFirstNode();this.config.onShow(this.modal,this.activeElement,t)}},{key:"closeModal",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=this.modal;if(this.modal.setAttribute("aria-hidden","true"),this.removeEventListeners(),this.scrollBehaviour("enable"),this.activeElement&&this.activeElement.focus&&this.activeElement.focus(),this.config.onClose(this.modal,this.activeElement,e),this.config.awaitCloseAnimation){var n=this.config.openClass;this.modal.addEventListener("animationend",(function e(){t.classList.remove(n),t.removeEventListener("animationend",e,!1)}),!1)}else t.classList.remove(this.config.openClass)}},{key:"closeModalById",value:function(e){this.modal=document.getElementById(e),this.modal&&this.closeModal()}},{key:"scrollBehaviour",value:function(e){if(this.config.disableScroll){var t=document.querySelector("body");switch(e){case"enable":Object.assign(t.style,{overflow:""});break;case"disable":Object.assign(t.style,{overflow:"hidden"})}}}},{key:"addEventListeners",value:function(){this.modal.addEventListener("touchstart",this.onClick),this.modal.addEventListener("click",this.onClick),document.addEventListener("keydown",this.onKeydown)}},{key:"removeEventListeners",value:function(){this.modal.removeEventListener("touchstart",this.onClick),this.modal.removeEventListener("click",this.onClick),document.removeEventListener("keydown",this.onKeydown)}},{key:"onClick",value:function(e){e.target.hasAttribute(this.config.closeTrigger)&&this.closeModal(e)}},{key:"onKeydown",value:function(e){27===e.keyCode&&this.closeModal(e),9===e.keyCode&&this.retainFocus(e)}},{key:"getFocusableNodes",value:function(){var e=this.modal.querySelectorAll(a);return Array.apply(void 0,i(e))}},{key:"setFocusToFirstNode",value:function(){var e=this;if(!this.config.disableFocus){var t=this.getFocusableNodes();if(0!==t.length){var n=t.filter((function(t){return!t.hasAttribute(e.config.closeTrigger)}));n.length>0&&n[0].focus(),0===n.length&&t[0].focus()}}}},{key:"retainFocus",value:function(e){var t=this.getFocusableNodes();if(0!==t.length)if(t=t.filter((function(e){return null!==e.offsetParent})),this.modal.contains(document.activeElement)){var n=t.indexOf(document.activeElement);e.shiftKey&&0===n&&(t[t.length-1].focus(),e.preventDefault()),!e.shiftKey&&t.length>0&&n===t.length-1&&(t[0].focus(),e.preventDefault())}else t[0].focus()}}])&&r(t.prototype,n),o&&r(t,o),e}(),u=null,c=function(e){if(!document.getElementById(e))return console.warn("MicroModal: ❗Seems like you have missed %c'".concat(e,"'"),"background-color: #f8f9fa;color: #50596c;font-weight: bold;","ID somewhere in your code. Refer example below to resolve it."),console.warn("%cExample:","background-color: #f8f9fa;color: #50596c;font-weight: bold;",'<div class="modal" id="'.concat(e,'"></div>')),!1},l=function(e,t){if(function(e){e.length<=0&&(console.warn("MicroModal: ❗Please specify at least one %c'micromodal-trigger'","background-color: #f8f9fa;color: #50596c;font-weight: bold;","data attribute."),console.warn("%cExample:","background-color: #f8f9fa;color: #50596c;font-weight: bold;",'<a href="#" data-micromodal-trigger="my-modal"></a>'))}(e),!t)return!0;for(var n in t)c(n);return!0},{init:function(e){var t=Object.assign({},{openTrigger:"data-micromodal-trigger"},e),n=i(document.querySelectorAll("[".concat(t.openTrigger,"]"))),r=function(e,t){var n=[];return e.forEach((function(e){var r=e.attributes[t].value;void 0===n[r]&&(n[r]=[]),n[r].push(e)})),n}(n,t.openTrigger);if(!0!==t.debugMode||!1!==l(n,r))for(var o in r){var a=r[o];t.targetModal=o,t.triggers=i(a),u=new s(t)}},show:function(e,t){var n=t||{};n.targetModal=e,!0===n.debugMode&&!1===c(e)||(u&&u.removeEventListeners(),(u=new s(n)).showModal())},close:function(e){e?u.closeModalById(e):u.closeModal()}});window.MicroModal=f,t.default=f},function(e,t,n){e.exports=function(){"use strict";
/*!
   * mustache.js - Logic-less {{mustache}} templates with JavaScript
   * http://github.com/janl/mustache.js
   */var e=Object.prototype.toString,t=Array.isArray||function(t){return"[object Array]"===e.call(t)};function n(e){return"function"==typeof e}function r(e){return e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\'{GrowClientJs}'")}function i(e,t){return null!=e&&"object"==typeof e&&t in e}var o=RegExp.prototype.test,a=/\S/;function s(e){return!function(e,t){return o.call(e,t)}(a,e)}var u={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"},c=/\s*/,l=/\s+/,f=/\s*=/,d=/\s*\}/,h=/#|\^|\/|>|\{|&|=|!/;function p(e){this.string=e,this.tail=e,this.pos=0}function y(e,t){this.view=e,this.cache={".":this.view},this.parent=t}function v(){this.templateCache={_cache:{},set:function(e,t){this._cache[e]=t},get:function(e){return this._cache[e]},clear:function(){this._cache={}}}}p.prototype.eos=function(){return""===this.tail},p.prototype.scan=function(e){var t=this.tail.match(e);if(!t||0!==t.index)return"";var n=t[0];return this.tail=this.tail.substring(n.length),this.pos+=n.length,n},p.prototype.scanUntil=function(e){var t,n=this.tail.search(e);switch(n){case-1:t=this.tail,this.tail="";break;case 0:t="";break;default:t=this.tail.substring(0,n),this.tail=this.tail.substring(n)}return this.pos+=t.length,t},y.prototype.push=function(e){return new y(e,this)},y.prototype.lookup=function(e){var t,r,o,a=this.cache;if(a.hasOwnProperty(e))t=a[e];else{for(var s,u,c,l=this,f=!1;l;){if(e.indexOf(".")>0)for(s=l.view,u=e.split("."),c=0;null!=s&&c<u.length;)c===u.length-1&&(f=i(s,u[c])||(r=s,o=u[c],null!=r&&"object"!=typeof r&&r.hasOwnProperty&&r.hasOwnProperty(o))),s=s[u[c++]];else s=l.view[e],f=i(l.view,e);if(f){t=s;break}l=l.parent}a[e]=t}return n(t)&&(t=t.call(this.view)),t},v.prototype.clearCache=function(){void 0!==this.templateCache&&this.templateCache.clear()},v.prototype.parse=function(e,n){var i=this.templateCache,o=e+":"+(n||m.tags).join(":"),a=void 0!==i,u=a?i.get(o):void 0;return null==u&&(u=function(e,n){if(!e)return[];var i,o,a,u=!1,y=[],v=[],g=[],b=!1,w=!1,_="",k=0;function x(){if(b&&!w)for(;g.length;)delete v[g.pop()];else g=[];b=!1,w=!1}function S(e){if("string"==typeof e&&(e=e.split(l,2)),!t(e)||2!==e.length)throw new Error("Invalid tags: "+e);i=new RegExp(r(e[0])+"\\s*"),o=new RegExp("\\s*"+r(e[1])),a=new RegExp("\\s*"+r("}"+e[1]))}S(n||m.tags);for(var O,I,C,P,E,j,A=new p(e);!A.eos();){if(O=A.pos,C=A.scanUntil(i))for(var T=0,D=C.length;T<D;++T)s(P=C.charAt(T))?(g.push(v.length),_+=P):(w=!0,u=!0,_+=" "),v.push(["text",P,O,O+1]),O+=1,"\n"===P&&(x(),_="",k=0,u=!1);if(!A.scan(i))break;if(b=!0,I=A.scan(h)||"name",A.scan(c),"="===I?(C=A.scanUntil(f),A.scan(f),A.scanUntil(o)):"{"===I?(C=A.scanUntil(a),A.scan(d),A.scanUntil(o),I="&"):C=A.scanUntil(o),!A.scan(o))throw new Error("Unclosed tag at "+A.pos);if(E=">"==I?[I,C,O,A.pos,_,k,u]:[I,C,O,A.pos],k++,v.push(E),"#"===I||"^"===I)y.push(E);else if("/"===I){if(!(j=y.pop()))throw new Error('Unopened section "'+C+'" at '+O);if(j[1]!==C)throw new Error('Unclosed section "'+j[1]+'" at '+O)}else"name"===I||"{"===I||"&"===I?w=!0:"="===I&&S(C)}if(x(),j=y.pop())throw new Error('Unclosed section "'+j[1]+'" at '+A.pos);return function(e){for(var t,n=[],r=n,i=[],o=0,a=e.length;o<a;++o)switch((t=e[o])[0]){case"#":case"^":r.push(t),i.push(t),r=t[4]=[];break;case"/":i.pop()[5]=t[2],r=i.length>0?i[i.length-1][4]:n;break;default:r.push(t)}return n}(function(e){for(var t,n,r=[],i=0,o=e.length;i<o;++i)(t=e[i])&&("text"===t[0]&&n&&"text"===n[0]?(n[1]+=t[1],n[3]=t[3]):(r.push(t),n=t));return r}(v))}(e,n),a&&i.set(o,u)),u},v.prototype.render=function(e,t,n,r){var i=this.getConfigTags(r),o=this.parse(e,i),a=t instanceof y?t:new y(t,void 0);return this.renderTokens(o,a,n,e,r)},v.prototype.renderTokens=function(e,t,n,r,i){for(var o,a,s,u="",c=0,l=e.length;c<l;++c)s=void 0,"#"===(a=(o=e[c])[0])?s=this.renderSection(o,t,n,r,i):"^"===a?s=this.renderInverted(o,t,n,r,i):">"===a?s=this.renderPartial(o,t,n,i):"&"===a?s=this.unescapedValue(o,t):"name"===a?s=this.escapedValue(o,t,i):"text"===a&&(s=this.rawValue(o)),void 0!==s&&(u+=s);return u},v.prototype.renderSection=function(e,r,i,o,a){var s=this,u="",c=r.lookup(e[1]);if(c){if(t(c))for(var l=0,f=c.length;l<f;++l)u+=this.renderTokens(e[4],r.push(c[l]),i,o,a);else if("object"==typeof c||"string"==typeof c||"number"==typeof c)u+=this.renderTokens(e[4],r.push(c),i,o,a);else if(n(c)){if("string"!=typeof o)throw new Error("Cannot use higher-order sections without the original template");null!=(c=c.call(r.view,o.slice(e[3],e[5]),(function(e){return s.render(e,r,i,a)})))&&(u+=c)}else u+=this.renderTokens(e[4],r,i,o,a);return u}},v.prototype.renderInverted=function(e,n,r,i,o){var a=n.lookup(e[1]);if(!a||t(a)&&0===a.length)return this.renderTokens(e[4],n,r,i,o)},v.prototype.indentPartial=function(e,t,n){for(var r=t.replace(/[^ \t]/g,""),i=e.split("\n"),o=0;o<i.length;o++)i[o].length&&(o>0||!n)&&(i[o]=r+i[o]);return i.join("\n")},v.prototype.renderPartial=function(e,t,r,i){if(r){var o=this.getConfigTags(i),a=n(r)?r(e[1]):r[e[1]];if(null!=a){var s=e[6],u=e[5],c=e[4],l=a;0==u&&c&&(l=this.indentPartial(a,c,s));var f=this.parse(l,o);return this.renderTokens(f,t,r,l,i)}}},v.prototype.unescapedValue=function(e,t){var n=t.lookup(e[1]);if(null!=n)return n},v.prototype.escapedValue=function(e,t,n){var r=this.getConfigEscape(n)||m.escape,i=t.lookup(e[1]);if(null!=i)return"number"==typeof i&&r===m.escape?String(i):r(i)},v.prototype.rawValue=function(e){return e[1]},v.prototype.getConfigTags=function(e){return t(e)?e:e&&"object"==typeof e?e.tags:void 0},v.prototype.getConfigEscape=function(e){return e&&"object"==typeof e&&!t(e)?e.escape:void 0};var m={name:"mustache.js",version:"4.2.0",tags:["{{","}}"],clearCache:void 0,escape:void 0,parse:void 0,render:void 0,Scanner:void 0,Context:void 0,Writer:void 0,set templateCache(e){g.templateCache=e},get templateCache(){return g.templateCache}},g=new v;return m.clearCache=function(){return g.clearCache()},m.parse=function(e,t){return g.parse(e,t)},m.render=function(e,n,r,i){if("string"!=typeof e)throw new TypeError('Invalid template! Template should be a "string" but "'+(t(o=e)?"array":typeof o)+'" was given as the first argument for mustache#render(template, view, partials)');var o;return g.render(e,n,r,i)},m.escape=function(e){return String(e).replace(/[&<>"'`=\/]/g,(function(e){return u[e]}))},m.Scanner=p,m.Context=y,m.Writer=v,m}()},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.HelperUtils=void 0;t.HelperUtils=class{static urlBase64ToUint8Array(e){const t=(e+"=".repeat((4-e.length%4)%4)).replace(/\-/g,"+").replace(/_/g,"/"),n=window.atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;++e)r[e]=n.charCodeAt(e);return r}static sleep(e){return new Promise(t=>{setTimeout(()=>{t()},e)})}static getValueIfExist(e){try{return e()}catch(e){return}}static isPushSimilar(e,t){return e.endpoint===t.endpoint&&e.keys.p256dh===t.keys.p256dh&&e.keys.auth===t.keys.auth}}}]);
//# sourceMappingURL=client.min.js.map;

    (async function () {
      let styles = `.gw-float-widget {
  border-radius: 5px 5px 0px 0px;
  top: 50% ;
  position: fixed !important;
  right: 0px ;
  z-index: 1000;
  border: none ;
  padding: 10px 20px;
  font-size: 14px ;
  cursor: pointer ;
  font-weight:  bold ;
  margin-right: 8px;
  transform: translate(45%, -50%) rotate(-90deg);
  -webkit-transform: translate(45%, -50%) rotate(-90deg) ;
  -moz-transform: translate(45%, -50%) rotate(-90deg) ;
  -o-transform: translate(45%, -50%) rotate(-90deg) ;
  -ms-transform: translate(45%, -50%) rotate(-90deg) ;
}

.gw-float-widget[gw-stock-fulfilled] {
  color: #f8f4ed;
  background-color: #282828;
}

.gw-float-widget[gw-price-drop] {
  color: #ffffff;
  background-color: #000000;
}

.gw-float-widget {
        width: fit-content;
        }
.gw-float-widget[gw-price-drop] {
}
.gw-float-widget[gw-stock-fulfilled] {
}



.gw-modal {
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  z-index: 99999;
  overflow: hidden;
  display: none;
}
.gw-button-widget{
  width:100%;
}
`
      let styleSheet = document.createElement("style")
      styleSheet.type = "text/css"
      let inlineCode = document.createTextNode(styles);
      styleSheet.appendChild(inlineCode);
      document.head.appendChild(styleSheet)

      let client = GrowClient.default;

      if (initVar.isPostPurchasePage()) {
        initVar.sendOrderPurchaseEvent(client)
      }
      client.onInit = (subId) => {
        console.log("subId" + subId)
        initVar.subscriberId = subId
        // window.growConfig.cartMappingFn()
      }
      client.init(initVar)

      window["growClient"] = client
      if (!(await client.getClientStatus())) {
        console.log("Client is not active")
        return;
      }

      initVar.subscriberId = await client.getSubscriberId()
      //try with subscriber id, it can take time to get subscriber id
      if (initVar.isPostPurchasePage()) {
        initVar.sendOrderPurchaseEvent(client)
      }
      window["growConfig"] = initVar
      window["initVar"] = initVar
      // window.growConfig.cartMappingFn = async function () {
      //   let cartResponse = await fetch('/cart.js')
      //     .then(x => x.json())
      //     .catch(x => console.log(x.status));
      //   if (cartResponse && cartResponse.token) {
      //
      //   }
      // };

      growConfig.registerUtmParameter();

      if (initVar.isCartPage()) {
        window.growConfig.addToCartClicked()
      }

      if (initVar.customJs) {
        let scriptElm = document.createElement('script');
        scriptElm.type = "text/javascript"
        let inlineCode = document.createTextNode(initVar.customJs);
        // scriptElm.innerText = initVar.customJs
        scriptElm.appendChild(inlineCode);
        document.head.appendChild(scriptElm)
      }
      if (initVar.customCss) {
        let styleElm = document.createElement('style');
        let inlineCode = document.createTextNode(initVar.customCss);
        styleElm.appendChild(inlineCode);
        document.head.appendChild(styleElm)
      }

      initVar.getValueIfExist(() => {
        fetch('https://www.cloudflare.com/cdn-cgi/trace', {method: "GET"}).then(async (res) => {
          let loc = await res.text();
          initVar.defaultCountry = loc.split('\n').find(x => x.includes('loc')).split('=')[1].trim();
        })
      })

      lastPage = null;

      window.productChangeIntervalSet = false;
      if (!window.productChangeIntervalSet) {
        setInterval(async () => {
          window.productChangeIntervalSet = true;
          if (window.location.href.includes("products") && window.location.href !== lastPage) {
            // console.log("Checking Product Data");
            lastPage = window.location.href
            await initVar.registerOnVariantChange()
            await initVar.registerAddToCartChange()
            await initVar.onVariantChange()
          }
        }, 500)
      }


    })();
  }
}
