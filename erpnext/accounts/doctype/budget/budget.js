// Copyright (c) 2016, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt
// #client: saudiflexsoft task:monthly budget in amount
frappe.ui.form.on("Budget Account", "account", function(frm, cdt, cdn){
	frm.refresh_fields();
})
frappe.ui.form.on("Budget Account", "budget_amount", function(frm, cdt, cdn){
	frm.refresh_fields();
})
// #client: saudiflexsoft task:monthly budget in amount

frappe.ui.form.on('Budget', {
	onload: function(frm) {
// #client: saudiflexsoft task:monthly budget in amount
		$(".grid-add-row").hide();
// #client: saudiflexsoft task:monthly budget in amount
		frm.set_query("cost_center", function() {
			return {
				filters: {
					company: frm.doc.company
				}
			}
		})

		frm.set_query("project", function() {
			return {
				filters: {
					company: frm.doc.company
				}
			}
		})
		
		frm.set_query("account", "accounts", function() {
			return {
				filters: {
					company: frm.doc.company,
					report_type: "Profit and Loss",
					is_group: 0
				}
			}
		})
		
		frm.set_query("monthly_distribution", function() {
			return {
				filters: {
					fiscal_year: frm.doc.fiscal_year
				}
			}
		})
	},

// #client: saudiflexsoft task:monthly budget in amount
	monthly_distribution:function(frm){		
		if (frm.doc.monthly_distribution==undefined) {
			if((frm.doc.accounts[0].budget_amount!=undefined)&&(frm.doc.fiscal_year!=undefined)&&(frm.doc.accounts[0].account!=undefined)) {
				frappe.session.parent_budget_amount= frm.doc.accounts[0].budget_amount	
				frappe.session.parent_budget_account=frm.doc.accounts[0].account
				frappe.session.parent_fiscal_year=frm.doc.fiscal_year
			}else
			{				
	            frappe.msgprint(__("Please fill mandatory fields"));
	            throw "cannot create";
	            validated = false;
	            return false
			}
		}
	},
// #client: saudiflexsoft task:monthly budget in amount

	refresh: function(frm) {
		frm.trigger("toggle_reqd_fields")
	},

	budget_against: function(frm) {
		frm.trigger("set_null_value")
		frm.trigger("toggle_reqd_fields")
	},

	set_null_value: function(frm) {
		if(frm.doc.budget_against == 'Cost Center') {
			frm.set_value('project', null)
		} else {
			frm.set_value('cost_center', null)
		}
	},

	toggle_reqd_fields: function(frm) {
		frm.toggle_reqd("cost_center", frm.doc.budget_against=="Cost Center");
		frm.toggle_reqd("project", frm.doc.budget_against=="Project");
	}
});
