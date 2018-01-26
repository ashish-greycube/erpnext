// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

cur_frm.cscript.onload = function(doc,cdt,cdn){
	if(doc.__islocal){
		var callback1 = function(r,rt){
			refresh_field('percentages');
		}
		// #client: saudiflexsoft task:monthly budget in amount
		if (frappe.get_prev_route()[1] == "Budget") {
		    parent_budget_amount = frappe.session.parent_budget_amount;
		    parent_budget_account = frappe.session.parent_budget_account;
		    parent_fiscal_year = frappe.session.parent_fiscal_year;

		    doc.budget_amount = 0;
		    doc.budget_amount = parent_budget_amount;
		    doc.fiscal_year = parent_fiscal_year;
		    if (parent_budget_account!= undefined) {
		    	doc.distribution_id = parent_budget_account +"_"+parent_fiscal_year+ "_distribution"}
		    parent_budget_amount = "";
		    parent_budget_account = "";
		    parent_fiscal_year = "";
		    frappe.session.parent_budget_amount="";
		    frappe.session.parent_budget_account="";
		    frappe.session.parent_fiscal_year="";
		    refresh_field('budget_amount')
		    refresh_field('fiscal_year')
		    refresh_field('distribution_id');
		    cur_frm.set_df_property("budget_amount","read_only",1)
		    cur_frm.set_df_property("fiscal_year","read_only",1)
		    cur_frm.set_df_property("distribution_id","read_only",1)
		}
		// #client: saudiflexsoft task:monthly budget in amount
		return $c('runserverobj', {'method':'get_months', 'docs':doc}, callback1);
	}
}

cur_frm.cscript.refresh = function(doc,cdt,cdn){
	cur_frm.toggle_display('distribution_id', doc.__islocal);
}
