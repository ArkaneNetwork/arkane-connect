!function(n){var t={};function e(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return n[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}e.m=n,e.c=t,e.d=function(n,t,r){e.o(n,t)||Object.defineProperty(n,t,{enumerable:!0,get:r})},e.r=function(n){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},e.t=function(n,t){if(1&t&&(n=e(n)),8&t)return n;if(4&t&&"object"==typeof n&&n&&n.__esModule)return n;var r=Object.create(null);if(e.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:n}),2&t&&"string"!=typeof n)for(var o in n)e.d(r,o,function(t){return n[t]}.bind(null,o));return r},e.n=function(n){var t=n&&n.__esModule?function(){return n.default}:function(){return n};return e.d(t,"a",t),t},e.o=function(n,t){return Object.prototype.hasOwnProperty.call(n,t)},e.p="",e(e.s=0)}([function(n,t,e){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=e(1),o=e(2),u=function(){function n(n){this.loc="",this.loc=n}return n.signTransaction=function(t){return r.__awaiter(this,void 0,void 0,function(){var e;return r.__generator(this,function(r){return e=n.getInstance(),console.log(!e.popup),e.popup?(e.popup.focus(),[2,{success:!1,errors:["Popup already open"]}]):[2,new Promise(function(r,o){var u=e.loc+"/sign/transaction";e.popup=n.openWindow(u);var i=e.sendParams(t);e.addEventListener(i,r,o)})]})})},n.getInstance=function(){return this.instance||(this.instance=new n("http://localhost:8081")),this.instance},n.serialize=function(n){var t=[];for(var e in n)n.hasOwnProperty(e)&&t.push(encodeURIComponent(e)+"="+encodeURIComponent(n[e]));return t.join("&")},n.openWindow=function(n,t,e,r){void 0===t&&(t="Arkane Connect"),void 0===e&&(e=300),void 0===r&&(r=500);var o=screen.width/2-e/2,u="toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, ";u+="copyhistory=no, width="+e+", height="+r+", top="+(screen.height/2-r/2)+", left="+o;var i=window.open("",t,u);return i&&(i.location.href=n),i},n.prototype.sendParams=function(n){var t=this,e=setInterval(function(){t.popup?t.popup.postMessage({type:o.EVENT_TYPES.SEND_PARAMS,params:n},t.loc):clearInterval(e)},3e3)},n.prototype.addEventListener=function(n,t,e){var r=this;window.addEventListener("message",function(o){if(o.origin===r.loc){var u=r.messageHandler(o);u&&(clearInterval(n),u&&u.success?t(u):e(u))}},!1)},n.prototype.messageHandler=function(n){var t=n.data&&r.__assign({},n.data.data);switch(n.data&&n.data.type){case o.EVENT_TYPES.TRANSACTION_SIGNED:return t;case o.EVENT_TYPES.POPUP_CLOSED:return delete this.popup,{success:!1,errors:["Popup closed"],result:{}};default:return!1}},n}();t.default=u,window&&(window.ArkaneConnect=u)},function(n,t,e){"use strict";e.r(t),e.d(t,"__extends",function(){return o}),e.d(t,"__assign",function(){return u}),e.d(t,"__rest",function(){return i}),e.d(t,"__decorate",function(){return a}),e.d(t,"__param",function(){return c}),e.d(t,"__metadata",function(){return f}),e.d(t,"__awaiter",function(){return l}),e.d(t,"__generator",function(){return s}),e.d(t,"__exportStar",function(){return p}),e.d(t,"__values",function(){return d}),e.d(t,"__read",function(){return y}),e.d(t,"__spread",function(){return _}),e.d(t,"__await",function(){return v}),e.d(t,"__asyncGenerator",function(){return h}),e.d(t,"__asyncDelegator",function(){return b}),e.d(t,"__asyncValues",function(){return w}),e.d(t,"__makeTemplateObject",function(){return P}),e.d(t,"__importStar",function(){return m}),e.d(t,"__importDefault",function(){return O});
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var r=function(n,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(n,t){n.__proto__=t}||function(n,t){for(var e in t)t.hasOwnProperty(e)&&(n[e]=t[e])})(n,t)};function o(n,t){function e(){this.constructor=n}r(n,t),n.prototype=null===t?Object.create(t):(e.prototype=t.prototype,new e)}var u=function(){return(u=Object.assign||function(n){for(var t,e=1,r=arguments.length;e<r;e++)for(var o in t=arguments[e])Object.prototype.hasOwnProperty.call(t,o)&&(n[o]=t[o]);return n}).apply(this,arguments)};function i(n,t){var e={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&t.indexOf(r)<0&&(e[r]=n[r]);if(null!=n&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(n);o<r.length;o++)t.indexOf(r[o])<0&&(e[r[o]]=n[r[o]])}return e}function a(n,t,e,r){var o,u=arguments.length,i=u<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,e):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(n,t,e,r);else for(var a=n.length-1;a>=0;a--)(o=n[a])&&(i=(u<3?o(i):u>3?o(t,e,i):o(t,e))||i);return u>3&&i&&Object.defineProperty(t,e,i),i}function c(n,t){return function(e,r){t(e,r,n)}}function f(n,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(n,t)}function l(n,t,e,r){return new(e||(e=Promise))(function(o,u){function i(n){try{c(r.next(n))}catch(n){u(n)}}function a(n){try{c(r.throw(n))}catch(n){u(n)}}function c(n){n.done?o(n.value):new e(function(t){t(n.value)}).then(i,a)}c((r=r.apply(n,t||[])).next())})}function s(n,t){var e,r,o,u,i={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return u={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(u[Symbol.iterator]=function(){return this}),u;function a(u){return function(a){return function(u){if(e)throw new TypeError("Generator is already executing.");for(;i;)try{if(e=1,r&&(o=2&u[0]?r.return:u[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,u[1])).done)return o;switch(r=0,o&&(u=[2&u[0],o.value]),u[0]){case 0:case 1:o=u;break;case 4:return i.label++,{value:u[1],done:!1};case 5:i.label++,r=u[1],u=[0];continue;case 7:u=i.ops.pop(),i.trys.pop();continue;default:if(!(o=(o=i.trys).length>0&&o[o.length-1])&&(6===u[0]||2===u[0])){i=0;continue}if(3===u[0]&&(!o||u[1]>o[0]&&u[1]<o[3])){i.label=u[1];break}if(6===u[0]&&i.label<o[1]){i.label=o[1],o=u;break}if(o&&i.label<o[2]){i.label=o[2],i.ops.push(u);break}o[2]&&i.ops.pop(),i.trys.pop();continue}u=t.call(n,i)}catch(n){u=[6,n],r=0}finally{e=o=0}if(5&u[0])throw u[1];return{value:u[0]?u[1]:void 0,done:!0}}([u,a])}}}function p(n,t){for(var e in n)t.hasOwnProperty(e)||(t[e]=n[e])}function d(n){var t="function"==typeof Symbol&&n[Symbol.iterator],e=0;return t?t.call(n):{next:function(){return n&&e>=n.length&&(n=void 0),{value:n&&n[e++],done:!n}}}}function y(n,t){var e="function"==typeof Symbol&&n[Symbol.iterator];if(!e)return n;var r,o,u=e.call(n),i=[];try{for(;(void 0===t||t-- >0)&&!(r=u.next()).done;)i.push(r.value)}catch(n){o={error:n}}finally{try{r&&!r.done&&(e=u.return)&&e.call(u)}finally{if(o)throw o.error}}return i}function _(){for(var n=[],t=0;t<arguments.length;t++)n=n.concat(y(arguments[t]));return n}function v(n){return this instanceof v?(this.v=n,this):new v(n)}function h(n,t,e){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var r,o=e.apply(n,t||[]),u=[];return r={},i("next"),i("throw"),i("return"),r[Symbol.asyncIterator]=function(){return this},r;function i(n){o[n]&&(r[n]=function(t){return new Promise(function(e,r){u.push([n,t,e,r])>1||a(n,t)})})}function a(n,t){try{!function(n){n.value instanceof v?Promise.resolve(n.value.v).then(c,f):l(u[0][2],n)}(o[n](t))}catch(n){l(u[0][3],n)}}function c(n){a("next",n)}function f(n){a("throw",n)}function l(n,t){n(t),u.shift(),u.length&&a(u[0][0],u[0][1])}}function b(n){var t,e;return t={},r("next"),r("throw",function(n){throw n}),r("return"),t[Symbol.iterator]=function(){return this},t;function r(r,o){t[r]=n[r]?function(t){return(e=!e)?{value:v(n[r](t)),done:"return"===r}:o?o(t):t}:o}}function w(n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var t,e=n[Symbol.asyncIterator];return e?e.call(n):(n=d(n),t={},r("next"),r("throw"),r("return"),t[Symbol.asyncIterator]=function(){return this},t);function r(e){t[e]=n[e]&&function(t){return new Promise(function(r,o){(function(n,t,e,r){Promise.resolve(r).then(function(t){n({value:t,done:e})},t)})(r,o,(t=n[e](t)).done,t.value)})}}}function P(n,t){return Object.defineProperty?Object.defineProperty(n,"raw",{value:t}):n.raw=t,n}function m(n){if(n&&n.__esModule)return n;var t={};if(null!=n)for(var e in n)Object.hasOwnProperty.call(n,e)&&(t[e]=n[e]);return t.default=n,t}function O(n){return n&&n.__esModule?n:{default:n}}},function(n,t,e){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(n){n[n.TRANSACTION_SIGNED=0]="TRANSACTION_SIGNED",n[n.SEND_PARAMS=1]="SEND_PARAMS",n[n.POPUP_CLOSED=2]="POPUP_CLOSED"}(t.EVENT_TYPES||(t.EVENT_TYPES={}))}]);