sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
], function (MessageToast, Fragment) {
    'use strict';

    return {
        /**
         * Generated event handler.
         *
         * @param oContext the context of the page on which the event was fired. `undefined` for list report page.
         * @param aSelectedContexts the selected contexts of the table rows.
         */
        loadEmployeeAnalytics: function (oContext, aSelectedContexts) {
            if (!this.EmployeeAnalytics) {
                Fragment.load({
                    name: "myapp.ext.fragment.EmployeeAnalytics",
                    controller: this,
                }).then(
                    async function name(oDialog) {
                        this.EmployeeAnalytics = oDialog;
                        this._view.addDependent(this.EmployeeAnalytics);
                        this.EmployeeAnalytics.open();
                        
                        // const oJsonModel = this.editFlow.getAppComponent().getModel("EmployeeAnalytics");

                        // // Get chart (you must create this in fragment/view)
                        // const oChart = sap.ui.getCore().byId("employeeChart");

                        // // Bind model
                        // oChart.setModel(oJsonModel);

                        // // Dataset binding
                        // const oDataset = new sap.viz.ui5.data.FlattenedDataset({
                        //     dimensions: [{
                        //         name: "Employee",
                        //         value: "{employeeName}"
                        //     }],
                        //     measures: [{
                        //         name: "Total Hours",
                        //         value: "{totalHours}"
                        //     }],
                        //     data: {
                        //         path: "/value"
                        //     }
                        // });

                        // oChart.setDataset(oDataset);
                        // oChart.setVizType("column");
                        // oChart.setVizProperties({
                        //     title: {
                        //         text: "Employee Wise Total Hours"
                        //     }
                        // });

                        // // Show chart section
                        // oChart.setVisible(true);
                    }.bind(this)
                );
            } else {
                this.EmployeeAnalytics.open();
            }
        },

        onCancel: function () {
            this.EmployeeAnalytics.close();
            this.EmployeeAnalytics.destroy();
            this.EmployeeAnalytics = null;
        },

        onCancelStatusOverview: function () {
            this.StatusOverview.close();
            this.StatusOverview.destroy();
            this.StatusOverview = null;
        },
        
        onPressStatusOverview: function() {
             if (!this.StatusOverview) {
                Fragment.load({
                    name: "myapp.ext.fragment.StatusOverview",
                    controller: this,
                }).then(
                    async function name(oDialog) {
                        this.StatusOverview = oDialog;
                        this._view.addDependent(this.StatusOverview);
                        this.StatusOverview.open();
                    }.bind(this)
                );
            } else {
                this.StatusOverview.open();
            }
        },

         onCancelMonthlyTrends: function () {
            this.MonthlyTrends.close();
            this.MonthlyTrends.destroy();
            this.MonthlyTrends = null;
        },
        onPressMonthlyTrends: function() {
           if (!this.MonthlyTrends) {
                Fragment.load({
                    name: "myapp.ext.fragment.MonthlyTrends",
                    controller: this,
                }).then(
                    async function name(oDialog) {
                        this.MonthlyTrends = oDialog;
                        this._view.addDependent(this.MonthlyTrends);
                        this.MonthlyTrends.open();
                    }.bind(this)
                );
            } else {
                this.MonthlyTrends.open();
            }
        },
    };
});
