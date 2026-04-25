sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    'use strict';

    return {
        /**
         * Generated event handler.
         *
         * @param oEvent the event object provided by the event provider.
         */
        onPress: function (oEvent) {
            var oDatePicker = this.byId("dpWorkDate");
            // var oCalendar = oDatePicker._oPopup.getContent()[0]; // access calendar
            let holidayData = this.editFlow.getAppComponent().getModel("holidayModel").getData().value;
            var aHolidays = holidayData.map(oItem => ({
                            date: new Date(oItem.holidayDate),
                            name: oItem.name
                        }));
            aHolidays.forEach(function (oDate) {
                oDatePicker.addSpecialDate(new sap.ui.unified.DateTypeRange({
                    startDate: oDate.date,
                    type: "Type01", // red highlight
                    tooltip: oDate.name
                }));
            });
        },

        onDateChange: function (oEvent) {
            var selectedDate = oEvent.getSource().getDateValue();
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "yyyy-MM-dd"
            });
            var formatted = oDateFormat.format(selectedDate);
            let holidayData = this.editFlow.getAppComponent().getModel("holidayModel").getData().value;
            var holidays = holidayData.map(oItem => oItem.holidayDate);
            if (holidays.includes(formatted)) {
                sap.m.MessageToast.show("Selected date is a holiday");
            }
        }
    };
});
