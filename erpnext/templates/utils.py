# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals

import frappe, json
from frappe import _
from frappe.utils import cint, formatdate

@frappe.whitelist(allow_guest=True)
def send_message(subject="Website Query", message="", sender="", status="Open",source="",repair=""):
	from frappe.www.contact import send_message as website_send_message
	lead = customer = None

	website_send_message(subject, message, sender)

	customer = frappe.db.sql("""select distinct dl.link_name from `tabDynamic Link` dl
		left join `tabContact` c on dl.parent=c.name where dl.link_doctype='Customer'
		and c.email_id='{email_id}'""".format(email_id=sender))

	if not customer:
		lead = frappe.db.get_value('Lead', dict(email_id=sender))
		if not lead:
			new_lead = frappe.get_doc(dict(
				doctype='Lead',
				email_id = sender,
				lead_name = sender.split('@')[0].title()
			)).insert(ignore_permissions=True)

	opportunity = frappe.get_doc(dict(
		doctype ='Opportunity',
		enquiry_from = 'Customer' if customer else 'Lead',
		status = 'Open',
		title = subject,
		contact_email = sender,
		to_discuss = message
	))

	if customer:
		opportunity.customer = customer[0][0]
	elif lead:
		opportunity.lead = lead
	else:
		opportunity.lead = new_lead.name
# quickrepair: add items from webpage
	if (source=='Web Repair Item' and repair != ''):
		opportunity_item = frappe.get_doc(dict(
		doctype ='Opportunity Item',
		item_code = repair,
		qty = 1
		))
		opportunity.with_items=1
		opportunity.append("items",opportunity_item)
		opportunity.insert(ignore_permissions=True)
	else:
		opportunity.insert(ignore_permissions=True)
# quickrepair: add items from webpage
	comm = frappe.get_doc({
		"doctype":"Communication",
		"subject": subject,
		"content": message,
		"sender": sender,
		"sent_or_received": "Received",
		'reference_doctype': 'Opportunity',
		'reference_name': opportunity.name
	})
	comm.insert(ignore_permissions=True)

	return "okay"
