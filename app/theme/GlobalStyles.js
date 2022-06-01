import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.colors.body};
    color: ${({ theme }) => theme.colors.text};
    transition: all 0.50s linear;
    font-size: 0.75rem;
  }
  .form-control {
    font-size: 0.75rem;
  }
  .btn {
    font-size: 0.75rem;
  }
  div#mui-component-select-supplierCode {
    font-size: 0.75rem!important;
  }
  .MuiMenuItem-root {
    font-size: 0.75rem!important;
  }

  .button.MuiButtonBase-root.MuiButton-root.MuiButton-text.mr-1.btn.btn-primary.custom-button.MuiButton-textPrimary {
    text-transform: none;
    font-size: 0.75rem!important;
    right: 16px;
    top: 5px;
  }
  
  a {
    cursor: pointer;
  }

  button.btn-primary, button.btn-primary:hover, button.btn-primary:disabled, button.btn-primary:checked {
    background-color: ${({ theme }) => theme.colors.primary}; 
    border-color: ${({ theme }) => theme.colors.primary};     
    color: ${({ theme }) => theme.colors.button.text};
  }

  .custom-checkbox .custom-control-input:checked~.custom-control-label::before {
    background-color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  .custom-checkbox .custom-control-input:disabled~.custom-control-label::after {
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  .ag-theme-alpine {
    --ag-checkbox-checked-color: ${({ theme }) => theme.colors.primary};
    --ag-border-color: ${({ theme }) => theme.colors.secondary};
  }

  .ag-theme-alpine .ag-root-wrapper {
    border-radius: 4px 4px 0px 0px;
  }

  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    background: transparent;
    background-image: url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSdibGFjaycgaGVpZ2h0PScyNCcgdmlld0JveD0nMCAwIDI0IDI0JyB3aWR0aD0nMjQnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHBhdGggZD0nTTcgMTBsNSA1IDUtNXonLz48cGF0aCBkPSdNMCAwaDI0djI0SDB6JyBmaWxsPSdub25lJy8+PC9zdmc+); 
    background-repeat: no-repeat;
    background-position-x: 100%;
    background-position-y: 5px;
    border: 1px solid #dfdfdf;
    border-radius: 2px;
    margin-right: 2rem;
    padding: 1rem;
    padding-right: 2rem;
  }

  select::-ms-expand { display: none; }

  .dropdown-toggle {
    color: ${({ theme }) => theme.colors.secondary};
  }

  .doxa-sidebar-menu-item-icon {
    width: 18px
  }

  .ag-header-row {
    height: 44px !important;
  }

  .modal {
    overflow: inherit !important;
    padding-right:0 !important;
  }

  .modal-open {
    overflow: inherit !important;
    padding-right:0 !important;
  }

  .modal.fade.show {
    overflow:inherit !important;
    padding-right:0 !important;
  }

  .label-required label::after {
    content: " *";
    color: red;
    white-space: nowrap;
  }

  .label-required span::after {
    content: " *";
    color: red;
    white-space: nowrap;
  }

  button.btn-primary {
    background-color: ${({ theme }) => theme.colors["primary-500"]};
    color: ${({ theme }) => theme.colors.white};
    border-radius: 4px;
    border: unset;
    box-shadow: unset;
  }

  button.btn-primary:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors["primary-400"]};
  }

  button.btn-primary:focus:not(:disabled),
  button.btn-primary:active:not(:disabled),
  button.btn-primary:target:not(:disabled) {
    background-color: ${({ theme }) => theme.colors["primary-600"]} !important;
    border: unset;
    box-shadow: unset !important;
  }

  button.btn-primary:disabled {
    background-color: ${({ theme }) => theme.colors["primary-100"]};
    cursor: not-allowed;
  }

  button.btn-danger {
    background-color: ${({ theme }) => theme.colors["red-500"]};
    color: ${({ theme }) => theme.colors.white};
    border-radius: 4px;
    border: unset;
    box-shadow: unset;
  }

  button.btn-danger:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors["red-400"]};
    border: unset;
  }

  button.btn-danger:focus:not(:disabled),
  button.btn-danger:active:not(:disabled),
  button.btn-danger:target:not(:disabled) {
    background-color: ${({ theme }) => theme.colors["red-600"]} !important;
    border: unset;
    box-shadow: unset !important;
  }

  button.btn-danger:disabled {
    background-color: ${({ theme }) => theme.colors["red-100"]};
    cursor: not-allowed;
  }

  button.btn-warning {
    background-color: ${({ theme }) => theme.colors["warning-500"]};
    color: ${({ theme }) => theme.colors.white};
    border-radius: 4px;
    border: unset;
    box-shadow: unset;
  }

  button.btn-warning:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors["warning-400"]};
  }

  button.btn-warning:focus:not(:disabled),
  button.btn-warning:active:not(:disabled),
  button.btn-warning:target:not(:disabled) {
    background-color: ${({ theme }) => theme.colors["warning-600"]} !important;
    border: unset;
    box-shadow: unset !important;
  }

  button.btn-warning:disabled {
    background-color: ${({ theme }) => theme.colors["warning-100"]};
    cursor: not-allowed;
  }

  button.btn {
    min-width: 80px;
  }

  select < option:checked[value=""] {
    color: ${({ theme }) => theme.colors["dark-400"]} !important;
  }

  .p-inputnumber {
    width: 100%;
  }

  .p-inputtext {
    display: block;
    width: 100%;
    height: calc(1.6em + 0.75rem + 2px);
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.6;
    color: #5D636D;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #DEE2E6;
    border-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .p-inputtext.is-invalid {
    border-color: #ED1C24;
    padding-right: calc(1.6em + 0.75rem);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='%23ED1C24' viewBox='-2 -2 7 7'%3e%3cpath stroke='%23ED1C24' d='M0 0l3 3m0-3L0 3'/%3e%3ccircle r='.5'/%3e%3ccircle cx='3' r='.5'/%3e%3ccircle cy='3' r='.5'/%3e%3ccircle cx='3' cy='3' r='.5'/%3e%3c/svg%3E");
    background-repeat: no-repeat;
    background-position: right calc(0.4em + 0.1875rem) center;
    background-size: calc(0.8em + 0.375rem) calc(0.8em + 0.375rem);
}

  .p-inputtext:enabled:hover {
    border-color: ${({ theme }) => theme.colors["primary-600"]} !important;
  }

  .p-inputtext:focus:not(.is-invalid),
  p-inputtext:focus.is-untouched {
    --box-shadow-color: ${({ theme }) => theme.colors["primary-100"]};
    box-shadow: 0 0 0 0.2rem var(--box-shadow-color) !important;
    border: 1px solid;
    border-color: ${({ theme }) => theme.colors["primary-600"]} !important;
  }

  input.p-inputtext:disabled {
    background-color: #F9FAFC;
    opacity: 1;
    cursor: not-allowed !important;
  }

  .p-inputtext:enabled:focus:not(.is-invalid) {
    --box-shadow-color: ${({ theme }) => theme.colors["primary-100"]};
    outline: 0 none;
    outline-offset: 0;
    box-shadow: 0 0 0 0.2rem var(--box-shadow-color) !important;
    border-color: ${({ theme }) => theme.colors["primary-600"]} !important;
  }

  .form-control:focus:not(.is-invalid),
  form-control:focus.is-untouched {
    --box-shadow-color: ${({ theme }) => theme.colors["primary-100"]};
    box-shadow: 0 0 0 0.2rem var(--box-shadow-color) !important;
    border: 1px solid;
    border-color: ${({ theme }) => theme.colors["primary-600"]} !important;
  }

  .form-control:disabled {
    cursor: not-allowed;
  }

  ::-webkit-calendar-picker-indicator {
    color: rgba(0, 0, 0, 0);
    opacity: 1;
  }

  ::-webkit-calendar-picker-indicator::after {
    content: '';
    display: block;
    background: url('https://cdn3.iconfinder.com/data/icons/linecons-free-vector-icons-pack/32/calendar-128.png') no-repeat;
    background-size: 10%;
    width: 100px;
    height: 100px;
    position: absolute;
    transform: translateX(-2%);
  }

  input[type=time]::-webkit-datetime-edit-hour-field:focus {
    background-color: ${({ theme }) => theme.colors["primary-600"]};
  }

  input[type=time]::-webkit-datetime-edit-minute-field:focus {
    background-color: ${({ theme }) => theme.colors["primary-600"]};
  }

  input[type=time]::-webkit-datetime-edit-second-field:focus {
    background-color: ${({ theme }) => theme.colors["primary-600"]};
  }

  input[type=time]::-webkit-datetime-edit-ampm-field:focus {
    background-color: ${({ theme }) => theme.colors["primary-600"]};
  }

  input.form-control::-webkit-input-placeholder {
    text-transform: none !important;
  }

  .p-checkbox {
    width: 16px;
    height: 16px;
  }

  .p-checkbox .p-checkbox-box {
    width: 16px;
    height: 16px;
  }

  .p-checkbox .p-checkbox-box .p-checkbox-icon {
    font-size: 10px;
  }

  .p-checkbox .p-checkbox-box.p-highlight {
    border-color: ${({ theme }) => theme.colors["primary-600"]} !important;
    background: ${({ theme }) => theme.colors["primary-500"]} !important;
  }

  .p-checkbox:not(.p-checkbox-disabled) .p-checkbox-box.p-highlight:hover {
    border-color: ${({ theme }) => theme.colors["primary-600"]};
    background: ${({ theme }) => theme.colors["primary-500"]};
  }

  .p-checkbox:not(.p-checkbox-disabled) .p-checkbox-box:hover {
    border-color: ${({ theme }) => theme.colors["primary-600"]};
  }

  .p-checkbox:not(.p-checkbox-disabled) .p-checkbox-box.p-focus {
    --box-shadow-color: ${({ theme }) => theme.colors["primary-100"]};
    box-shadow: 0 0 0 0.2rem var(--box-shadow-color) !important;
    border-color: ${({ theme }) => theme.colors["primary-600"]};
  }

  .MuiInput-underline::before {
    display: none !important;
  }

  .MuiSelect-select:focus {
    background-color: #F9FAFC !important;
  }

  .MuiInput-underline:after {
    display: none !important;
  }

  .MuiSelect-selectMenu {
    min-height: unset !important;
    font-size: 0.875em !important;
    color: #5D636D !important;
  }

  .p-radiobutton {
    width: 16px;
    height: 16px;
  }

  .p-radiobutton .p-radiobutton-box {
    width: 16px;
    height: 16px;
  }

  .p-radiobutton .p-radiobutton-box .p-radiobutton-icon {
    width: 8px;
    height: 8px;
  }

  .p-radiobutton .p-radiobutton-box.p-highlight {
    border-color: ${({ theme }) => theme.colors["primary-600"]} !important;
    background: ${({ theme }) => theme.colors["primary-500"]} !important;
    box-shadow: unset !important;
  }

  .p-radiobutton .p-radiobutton-box:not(.p-disabled):not(.p-highlight):hover {
    border-color: ${({ theme }) => theme.colors["primary-600"]};
  }

  .p-radiobutton .p-radiobutton-box.p-highlight:not(.p-disabled):hover {
    border-color: ${({ theme }) => theme.colors["primary-600"]};
    background: ${({ theme }) => theme.colors["primary-500"]};
  }
  
  .activeButton {
    color: red;
    cursor: pointer;
  }

  .activeButton > i {
      font-size: 15px;
      color: red;
  }

  .deactiveButton {
      color: navy;
      cursor: pointer;
  }

  .deactiveButton > i {
      font-size: 15px;
      color: navy;
  }

  .doxa-navbar {
    flex-wrap: nowrap !important;
  }

  .doxa-navbar-link {
    white-space: nowrap;
  }

  .nav-bar-sub-tool {
    flex-direction: row;
    flex-wrap: nowrap;
  }

  .horizntal-scroll {
    margin: 0 10px;
    overflow: hidden;
    position: relative;

    &:after, &:before {
      content: "<";
      left: 0;
      top: 10px;
      z-index: 1;
      width: 26px;
      height: 30px;
      display: flex;
      background: #fff;
      visibility: hidden;
      position: absolute;
      align-items: center;
      justify-content: center;
      box-shadow: 5px 0px 5px -3px #888;
    }
    
    &:after {
      content: ">";
      right: 0;
      left: unset;
      box-shadow: -5px 0px 5px -3px #888;
    }

    .horizntal-scroll__active {
      ul, a {
        pointer-events: none;
      }
    }
  }

  .horizntal-scroll-active-right {
    &.horizntal-scroll::after {
      visibility: visible;
    }
  }
  
  .horizntal-scroll-active-left {
    &.horizntal-scroll::before {
      visibility: visible;
    }
  }
  .custom-checkbox .custom-control-input:disabled~.custom-control-label::after {
    background-color: #E6E9ED!important;
  }
  .custom-control-input:checked ~ .custom-control-label::before {
    background-color: #AEC57D!important;
  }
  .accordion-border-head {
    border-top: 8px solid #AEC57D
  }
  .custom-tooltip {
    position: absolute;
    width: 300px;
    height: 210px;
    border: 1px solid #babfc7;
    overflow: hidden;
    pointer-events: none;
    transition: opacity 1s;
    padding: 0;
  }
  .custom-tooltip-div {
    background-color: #f8f8f8;
    padding: 10px;
  }
  .custom-des {
    border: 1px solid #babfc7;
    padding: 7px;
    background-color: #ffffff;
    height: 190px
  }

  .custom-tooltip.ag-tooltip-hiding {
    opacity: 0;
  }
  
  .custom-tooltip p {
    margin: 5px;
    white-space: nowrap;
  }
  
  .custom-tooltip p:first-of-type {
    font-weight: bold;
  }
  
  .p-dialog .p-dialog-header {
    padding: 5px;
  }
  .p-dialog .p-dialog-content {
    padding: 0 5px 10px 5px!important;
  }
  .reason {
    width: 100%;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #ED1C24;
  }
  .ag-theme-custom-react .ag-ltr .ag-has-focus .ag-cell-focus:not(.ag-cell-range-selected).descriptionStyle {
    height: 210px !important;
    width: 300px !important;
  }
  .pe-auto {
    cursor: pointer;
  }
  .form-control {
    background-color: #ffffff;
  }
  .linkDetail {
    text-decoration: underline;
    color: #4472C4!important;
  }
  .linkDetail:hover {
    color: #4472C4;
    textDecoration: underline;
    cursor: pointer;
  }
  .button-danger {
    background-color: rgb(248, 134, 134);
    border-color: transparent;
  }
  .button-danger:hover {
    background-color: rgb(248, 134, 134);
    border-color: transparent;
    opacity: 0.8;
  }
  .app-crop {
    /* position: absolute; */
    /* top: 0;
    left: 0;
    right: 0;
    bottom: 0; */
  }
  .crop-container {
    margin: 30px;
    height: 250px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    /* bottom: 100px; */
  }
  
  .crop-container-company {
    margin: 30px;
    height: 250px;
    position: absolute;
    top: 0;
    left: 25%;
    right: 25%;
    /* bottom: 100px; */
  }
  
  .controls {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 50%;
    transform: translateX(-50%);
    height: 50px;
    display: flex;
    align-items: center;
  }
  .controls-logo {
    position: absolute;
    margin-top: 5px;
    left: 50%;
    width: 50%;
    transform: translateX(-50%);
    height: 0;
    display: flex;
    align-items: center;
  }
  
  .slider {
    padding: 22px 0px;
  }
  // Drop Zone
  .dropzone {
    text-align: center;
    padding: 20px;
    border: 1px dashed #eeeeee;
    background-color: #fafafa;
    color: #bdbdbd;
    margin-bottom: 20px;
  }
  
  .accept-drop-zone {
    border-color: #107c10 !important;
  }
  
  .reject-drop-zone {
    border-color: #d83b01 !important;
  }
  .avatar-drop {
    height: 200px;
    object-fit: cover;
    border: 1px solid #e2e4e6;
  }
  .MuiInputBase-root.MuiInput-root.MuiInput-underline.form-control {
    height: 33px;
  }
  .avatar__content {
    border-radius: 100%;
    background-color: white;
    border: 1px solid #e8e9eb;
  }
  .wrapTextPreview {
    max-width: 250px;
    overflow-wrap: break-word;
  }
  .button-paging {
    opacity: 0.2;
    cursor: pointer;
  }
  .active-submit {
    opacity: 1;
  }
  .dragItem {
    border: 1px solid grey;
    margin-bottom: 8px;
    border-radius: 4px;
  }
}
`;

export default GlobalStyles;
