// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

frappe.ready(function () {
    $('[itemscope] td[itemprop_repair]').each(function () {
        var item_code = $(this).text().trim();
        var $tdprice = $(this).next();
        frappe.call({
            type: "POST",
            method: "erpnext.shopping_cart.product_info.get_product_info_for_website",
            args: {
                item_code: item_code
            },
            callback: function (r) {
                $(".item-cart").toggleClass("hide", (!!!r.message.price || !!!r.message.in_stock));
                if (r.message && r.message.price) {
                    $($tdprice).html(r.message.price.formatted_price);
                }
            }
        });
    })
});




// helper function
function get_item_code() {
	var variant_info = window.variant_info;
	if(variant_info) {
		var attributes = get_selected_attributes();
		var no_of_attributes = Object.keys(attributes).length;

		for(var i in variant_info) {
			var variant = variant_info[i];

			if (variant.attributes.length < no_of_attributes) {
				// the case when variant has less attributes than template
				continue;
			}

			var match = true;
			for(var j in variant.attributes) {
				if(attributes[variant.attributes[j].attribute]
					!= variant.attributes[j].attribute_value
				) {
					match = false;
					break;
				}
			}
			if(match) {
				return variant.name;
			}
		}
		throw "Unable to match variant";
	} else {
		return window.item_code;
	}
}



function get_selected_attributes() {
	var attributes = {};
	$('[itemscope]').find(".item-view-attribute .form-control").each(function() {
		attributes[$(this).attr('data-attribute')] = $(this).val();
	});
	return attributes;
}
