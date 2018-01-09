frappe.provide("erpnext.financial_statements");

erpnext.financial_statements = {
    "filters": get_filters(),
    "formatter": function(row, cell, value, columnDef, dataContext, default_formatter) {
        if (columnDef.df.fieldname == "account") {
            value = dataContext.account_name;

            columnDef.df.link_onclick =
                "erpnext.financial_statements.open_general_ledger(" + JSON.stringify(dataContext) + ")";
            columnDef.df.is_tree = true;
        }

        //get default values
        value = default_formatter(row, cell, value, columnDef, dataContext);
        original_value = dataContext[columnDef.df.fieldname];
        if (cur_page.page.query_report.filters[4]) { selected_col = cur_page.page.query_report.filters[4].value; }
        if (cur_page.page.query_report.filters[5]) { show_variance_value = cur_page.page.query_report.filters[5].last_value; }
        if (cur_page.page.query_report.filters[8]) { accumulated_values = cur_page.page.query_report.filters[8].last_value; }

        //set black color
        if (selected_col == null || selected_col == "" || columnDef.df.fieldname == "total" || columnDef.df.fieldname == "account") {
            //make summary values bold
            var $value = $(value).css("color", "black");
            if (!dataContext.parent_account) {
                var $value = $value.css("font-weight", "bold");
            }
            value = $value.wrap("<p></p>").parent().html();

        } else {
            var diff = dataContext[columnDef.df.fieldname] - dataContext[selected_col];

            //set base to blue
            if (columnDef.df.fieldname == selected_col) {
                var $value = $(value).css("color", "dodgerblue");
                if (!dataContext.parent_account) {
                    var $value = $value.css("font-weight", "bold");
                }
                value = $value.wrap("<p></p>").parent().html();
            }

            //set color for target
            if (columnDef.df.fieldname != selected_col) {
                if (dataContext[selected_col] == "" || dataContext[selected_col] == null || diff == 0) {
                    //set target to black
                    var $value = $(value).css("color", "black");
                    if (!dataContext.parent_account) {
                        var $value = $value.css("font-weight", "bold");
                    }
                    value = $value.wrap("<p></p>").parent().html();


                } else if (dataContext[columnDef.df.fieldname] < dataContext[selected_col]) {
                    //set target to red color
                    var $value = $(value).css("color", "palevioletred");
                    if (!dataContext.parent_account) {
                        var $value = $value.css("font-weight", "bold");
                    }
                    value = $value.wrap("<p></p>").parent().html();

                    //set variance target to red color
                    if (show_variance_value == 1 && selected_col != null && dataContext[columnDef.df.fieldname] != 0) {
                        original_value = "<span style='color:palevioletred'><div style='text-align: right'>" + original_value + "<small>  (" + diff + ")</small><i class='fa fa-arrow-down'></i></div></span>";
                        if (!dataContext.parent_account) {
                            original_value = "<span style='color:red;font-weight:bold'><div style='text-align: right'>" + original_value + "<small>  (" + diff + ")</small><i class='fa fa-arrow-down'></i></div></span>";
                        }
                        value = original_value;
                    }

                } else {
                    //set target to green color
                    var $value = $(value).css("color", "darkgreen");
                    if (!dataContext.parent_account) {
                        var $value = $value.css("font-weight", "bold");
                    }
                    value = $value.wrap("<p></p>").parent().html();

                    //set variance target to green color
                    if (show_variance_value == 1 && selected_col != null && dataContext[columnDef.df.fieldname] != 0) {
                        original_value = "<span style='color:darkgreen'><div style='text-align: right'>" + original_value + "<small>  (" + diff + ")</small><i class='fa fa-arrow-up'></i></div></span>";
                        if (!dataContext.parent_account) {
                            original_value = "<span style='color:darkgreen;font-weight:bold'><div style='text-align: right'>" + original_value + "<small>  (" + diff + ")</small><i class='fa fa-arrow-up'></i></div></span>";
                        }
                        value = original_value;
                    }

                }

            }

        }

        return value;
    },
    "open_general_ledger": function(data) {
        if (!data.account) return;
        var project = $.grep(frappe.query_report.filters, function(e) { return e.df.fieldname == 'project'; })

        frappe.route_options = {
            "account": data.account,
            "company": frappe.query_report_filters_by_name.company.get_value(),
            "from_date": data.from_date || data.year_start_date,
            "to_date": data.to_date || data.year_end_date,
            "project": (project && project.length > 0) ? project[0].$input.val() : ""
        };
        frappe.set_route("query-report", "General Ledger");
    },
    "tree": true,
    "name_field": "account",
    "parent_field": "parent_account",
    "initial_depth": 3,
    onload: function(report) {
        // dropdown for links to other financial statements
        erpnext.financial_statements.filters = get_filters()

        report.page.add_inner_button(__("Balance Sheet"), function() {
            var filters = report.get_values();
            frappe.set_route('query-report', 'Balance Sheet', { company: filters.company });
        }, __('Financial Statements'));
        report.page.add_inner_button(__("Profit and Loss"), function() {
            var filters = report.get_values();
            frappe.set_route('query-report', 'Profit and Loss Statement', { company: filters.company });
        }, __('Financial Statements'));
        report.page.add_inner_button(__("Cash Flow Statement"), function() {
            var filters = report.get_values();
            frappe.set_route('query-report', 'Cash Flow', { company: filters.company });
        }, __('Financial Statements'));
//custom code
        var rpt = frappe.query_report;
        var orig_refresh = rpt._refresh;
        rpt._refresh = function() {
            return orig_refresh.apply(rpt).then(() => {
                set_base_columns();
            });
        };
    }
};

function set_base_columns() {
    const columns = frappe.query_report.columns;
    cols = [];

    $.map(cur_page.page.query_report.columns, c => {
        if ((c.fieldname) && (c.fieldname != "account" && c.fieldname != "total")) {
            cols.push({
                label: c.name,
                value: c.fieldname
            });
        }
    });
    const base_filter = frappe.query_report_filters_by_name.base_value;
    base_filter.df.options = cols;
    base_filter.df.default = "";
    base_filter.refresh();
}
// end custom code


function get_filters() {
    return [{
            "fieldname": "company",
            "label": __("Company"),
            "fieldtype": "Link",
            "options": "Company",
            "default": frappe.defaults.get_user_default("Company"),
            "reqd": 1
        },
        {
            "fieldname": "from_fiscal_year",
            "label": __("Start Year"),
            "fieldtype": "Link",
            "options": "Fiscal Year",
            "default": frappe.defaults.get_user_default("fiscal_year"),
            "reqd": 1
        },
        {
            "fieldname": "to_fiscal_year",
            "label": __("End Year"),
            "fieldtype": "Link",
            "options": "Fiscal Year",
            "default": frappe.defaults.get_user_default("fiscal_year"),
            "reqd": 1
        },
        {
            "fieldname": "periodicity",
            "label": __("Periodicity"),
            "fieldtype": "Select",
            "options": [
                { "value": "Monthly", "label": __("Monthly") },
                { "value": "Quarterly", "label": __("Quarterly") },
                { "value": "Half-Yearly", "label": __("Half-Yearly") },
                { "value": "Yearly", "label": __("Yearly") }
            ],
            "default": "Monthly",
            "reqd": 1,
            "on_change": function(query_report) {
                var periodicity = query_report.get_values().periodicity;
                if (!periodicity) {
                    return;
                }

                frappe.query_report_filters_by_name.base_value.set_input("");
                frappe.query_report_filters_by_name.show_variance.set_input("");
                query_report.trigger_refresh();

            }
        },
        {
            "fieldname": "base_value",
            "label": __("Base value"),
            "fieldtype": "Select"

        },
        {
            "fieldname": "show_variance",
            "label": __("Show variance"),
            "fieldtype": "Check"
        }
    ]
}