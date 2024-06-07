import { trackEvent } from "modules/analytics";

export const EVENTS = {
  REQUEST_QUOTE_BUTTON_CLICKED: "request_quote_button_clicked",
  SEND_PURCHASE_ORDER_BUTTON_CLICKED: "send_purchase_order_button_clicked",
};

export function trackRequestQuoteButtonClicked() {
  trackEvent(EVENTS.REQUEST_QUOTE_BUTTON_CLICKED);
}
export function trackSendPurhcaseOrderButtonClicked() {
  trackEvent(EVENTS.SEND_PURCHASE_ORDER_BUTTON_CLICKED);
}
