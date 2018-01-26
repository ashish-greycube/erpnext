# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals
import frappe
from frappe.utils import flt
from frappe import _
from frappe.model.document import Document

class MonthlyDistribution(Document):
	def get_months(self):
		month_list = ['January','February','March','April','May','June','July','August','September',
		'October','November','December']
		idx =1
		for m in month_list:
			mnth = self.append('percentages')
			mnth.month = m
			mnth.percentage_allocation = 100.0/12
#client: saudiflexsoft desc:monthly budget in amount
			if self.budget_amount is not None:
				#self.budget_amount=0
				mnth.amount_allocation=self.budget_amount/12.0
#client: saudiflexsoft desc:monthly budget in amount
			mnth.idx = idx
			idx += 1

	def validate(self):
#client: saudiflexsoft task:monthly budget in amount
		self.validate_amount_allocation()
#client: saudiflexsoft task:monthly budget in amount
		total = sum([flt(d.percentage_allocation) for d in self.get("percentages")])
		if (flt(total, 2) != 100.0):
			frappe.throw(_("Percentage Allocation should be equal to 100%") + \
				" ({0}%)".format(str(flt(total, 3))))

#client: saudiflexsoft task:monthly budget in amount
	def validate_amount_allocation(self):
		total_mnth_amount = sum([flt(d.amount_allocation) for d in self.get("percentages")])
		if (flt(total_mnth_amount,3) != self.budget_amount):
			frappe.throw(_("Amount Allocation ")+" ({0})".format(str(flt(total_mnth_amount, 3)))+"\t"+_("should be equal to total budget amount")+" ({0})".format(str(flt(self.budget_amount, 3))))
		else:
			for d in self.get("percentages"):
				d.percentage_allocation=(flt(d.amount_allocation,3)/flt(total_mnth_amount,3))*100
#client: saudiflexsoft task:monthly budget in amount