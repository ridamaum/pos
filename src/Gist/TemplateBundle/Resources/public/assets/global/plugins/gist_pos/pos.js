function addToCart(product_name, srp, min_price, id)
{
    //id = erp product id
    var row_id = Math.round(new Date().getTime() + (Math.random() * 100));
    var field = '<tr class=\"row_prod_'+row_id+'\">';     
        field += '<input type=\"hidden\" name=\"product_id[]\" class=\"product_id\" value=\"'+row_id+'\" >';
        field += '<input type=\"hidden\" name=\"min_price[]\" class=\"min_price\" value=\"'+min_price+'\" >';
        field += '<input type=\"hidden\" name=\"srp[]\" class=\"srp\" value=\"'+srp+'\" >';
        field += '<input type=\"hidden\" name=\"product_amt[]\" class=\"product_amt\" value=\"'+srp+'\" >';
        field += '<td><input type="text" style=\"font-size: 10px !important;\" value="'+product_name+'" readonly="true" class="form-control item_name"></td>';
        field += '<td><input type="text" style=\"font-size: 10px !important;\" name="display_price[]" class="form-control display_price" readonly="true" value="'+srp+'"></td>';  
        field += '<td ><a href="javascript:void(0)" class="btn btn-xs default red remove_row"><i class="fa fa-times" aria-hidden="true"></i></a><a href="javascript:void(0)" class="btn btn-xs default green indiv_adj"><i class="fa fa-pencil" aria-hidden="true"></i></a></td>'; 
        field += '</tr>';

        $('#cart_items').prepend(field);
        hideItemAdjustment();
        if($('.checkout_btn').is(':visible') && $('.bulk_adj').is(':hidden') && $('#reg_trans_flag').val() != 1) {
            appendPerItemFields();
        } else {
            computeCart();
        }
        
        computeCartMinimum();
}


function ajaxGetVAT()
{
    // var url = "http://dev.gisterp2/inventory/pos/get/vat";
    var url = "http://erp.cilanthropist.co/inventory/pos/get/vat";
    var vat = 0;
    $.getJSON(url, function(json){  
        $('#session_vat').val(json)
    });

}


function computeExtraAmount()
{
    var cart_min_price = parseInt($("#cart_min_price").val());
    var cart_price = parseInt($("#cart_int_price").val());
    var extra_amt = cart_price - cart_min_price;
    var extra_amt_disp = addDashes(extra_amt.toString());
    $('#cart_min_pricex').text(addCommas(cart_min_price.toString()));
    $('#cart_pricex').text(addCommas(cart_price.toString()));
    $('#ea_amt').text(extra_amt_disp);
}


function hideItemAdjustment()
{
    $('.indiv_adj').each(function() {
        $(this).hide();
    });
}
function showItemAdjustment()
{
    $('.indiv_adj').each(function() {
        $(this).show();
    });
}

function addCommas(nStr)
{
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function addDashes(nStr)
{
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + '-' + '$2');
    }
    return x1 + x2;
}

function appendPerItemColumns()
{
    $('#cart_table').find('tr').each(function(){
        $(this).find('th').eq(1).after('<th>Discount Type</th>');
    });

    $('#cart_table').find('tr').each(function(){
        $(this).find('th').eq(2).after('<th>Value</th>');
    });

    $('#cart_table').find('tr').each(function(){
        $(this).find('th').eq(3).after('<th>Adjusted Price</th>');
    });
    var ths = $('th');
    var element = ths.eq(0);
    element.width(170);
    var element2 = ths.eq(1);
    element2.width(75);
    var element2 = ths.eq(3);
    element2.width(75);
    var element2 = ths.eq(4);
    element2.width(75);
}




function hideBulkAmounts()
{
    $('#cform-discount_amount').val('');
    $('#cgroup-discount_amount').hide();
    $('#cform-discount_pct').val('');
    $('#cgroup-discount_pct').hide();
    $('#cform-new_total').val('');
    $('#cgroup-new_total').hide();
}

function cancelBulkAdjustment()
{
    revertOriginalPrices();
    $('#cgroup-new_total').hide();
    $('#cform-new_total').val('');
    $('#cform-discount_amount').val('');
    $('#cgroup-discount_amount').hide();
    $('#cform-discount_pct').val('');
    $('#cgroup-discount_pct').hide();
    $('.display_price').each(function() {
        if ($(this).val() == "0" || $(this).val() == 0.00) {
            //revert prices only if bulk discount came from gift
            var row = $(this).closest('tr');
            var srp = row.find('.srp').val();
            $(this).val(srp);
        }  
    });
}


function hideCartLastColumn()
{
    $('td:last-child').each(function(){
        if ($(this).closest('table').attr('id') == 'cart_table') {
            $(this).css("display", "none");    
        }
        
    });

    $('th:last-child').each(function(){
        if ($(this).closest('table').attr('id') == 'cart_table') {
            $(this).css("display", "none");
        }
    });
}

function showCartLastColumn()
{
    ('td:last-child').each(function(){
        if ($(this).closest('table').attr('id') == 'cart_table') {
            $(this).css("display", "");
        }
    });

    $('th:last-child').each(function(){
        if ($(this).closest('table').attr('id') == 'cart_table') {
            $(this).css("display", "");
        }
    });
}


function applyIndividualAdjustment()
{   
    var indiv_adj_opt = $('#cform-indiv_adj').val();
    if (indiv_adj_opt != '') {
        var selected_prod_id = $('#item_adjustment_prod_id').val();
        var row = $("#cart_table > tbody > tr.row_prod_"+selected_prod_id);
        var srp = row.find('.srp').val();

        if (indiv_adj_opt == 'gift') {
            row.find('.display_price').val('0.00');
        } else if (indiv_adj_opt == '40p') {
            var discounted_srp = srp * .4;
            row.find('.display_price').val(discounted_srp);
        } else if (indiv_adj_opt == 'chg') {
            row.find('.display_price').val($('#cform-new_price').val());
        } else {
            row.find('.display_price').val(srp);
        }
    } else {

    }
}



function apply_indiv(x)
{
    var row = $(x).closest('tr');
    var srp = row.find('.srp').val();
    var adjusted_price = row.find('.adjusted_price');
    var per_item_discount_amt = row.find('.per_item_discount_amt');
    //adjusted_price.val(parseInt(srp)+100);

    if ($(x).val() == 'gift') {
        adjusted_price.val(0);
        per_item_discount_amt.attr("readonly", true); 
        per_item_discount_amt.val('');
    } else if ($(x).val() == 'disc') {
        adjusted_price.val(srp);
        per_item_discount_amt.val('');
        per_item_discount_amt.attr("readonly", false); 
    } else if ($(x).val() == 'chg') {
        adjusted_price.val(srp);
        per_item_discount_amt.val('');
        per_item_discount_amt.attr("readonly", false); 
    } else {
        adjusted_price.val(srp);
        per_item_discount_amt.attr("readonly", true); 
        per_item_discount_amt.val('');
    }

    computeCart();
    computeCartMinimum();
}


function proceedToTransaction(x)
{
    var select_trans = x;
    if (select_trans != '') {
        // $("#prods").addClass("disabledbutton");
        // $("#prod_cats").addClass("disabledbutton");
        if (select_trans == 'reg') {
            $('.next_step_btn').hide();
            $('.checkout_btn').show();
            $('#transaction_type_modal').modal('hide');
            // $('.remove_row').hide();
            // $('.clear_discount').show();
            $('.savings_h4').hide();
            $('.clear_discount').show();
            $('#reg_trans_flag').val(1);
            // hideCartLastColumn();
        } else if (select_trans == 'per') {
            // hideCartLastColumn();
            $('#reg_trans_flag').val(0);
            $('.next_step_btn').hide();
            $('.savings_h4').show();
            $('.checkout_btn').show();
            appendPerItemColumns();
            appendPerItemFields();
            $('#transaction_type_modal').modal('hide');
            $('.orig_totals_row').show();
            $('.orig_price_h3').show();
            $('.clear_discount').show();
        } else if (select_trans == 'bulk') {
            $('.next_step_btn').hide();
            $('#reg_trans_flag').val(0);
            // $('.remove_row').hide();
            $('.savings_h4').show();
            $('.bulk_adj').show();
            $('#proc').show();
            $('#transaction_type_modal').modal('hide');
            $('#bulk_adjustment').modal('show');
            $('.bulk_discount_h4').show();
            $('.checkout_btn').show();
            $('.orig_totals_row').show();
            $('.orig_price_h3').show();
            $('.clear_discount').show();
        } else {
            $('.clear_discount').hide();
            $('#reg_trans_flag').val(0);
        }
    } else {
        $('.clear_discount').hide();
        $('#reg_trans_flag').val(0);
    }
}



function revertDiscounts()
{
    $('#cart_table').find('tr').each(function(){
        if ($(this).children('th').length > 5) {
            $(this).find('th').eq(2).remove();
            $(this).find('th').eq(2).remove();
            $(this).find('th').eq(2).remove();
        }

        if ($(this).children('td').length > 5) {
            $(this).find('td').eq(2).remove();
            $(this).find('td').eq(2).remove();
            $(this).find('td').eq(2).remove();
        }
    });

    //alert($('#cart_int_orig_price').val());
    $('.cart_price_h3').css({'color': 'black'});
    $('#cgroup-new_total').hide();
    $('#cform-new_total').val('');
    $('#cform-discount_amount').val('');
    $('#cgroup-discount_amount').hide();
    $('#cform-discount_pct').val('');
    $('#cgroup-discount_pct').hide();
    $('#cart_price').text(addCommas($('#cart_int_orig_price').val()));
    $('#cart_int_price').val($('#cart_int_orig_price').val());
    computeCartMinimum();
    $('.orig_totals_row').hide();
    $('.orig_price_h3').hide();
    $('.bulk_discount_h4').hide();
    $('#applied_bulk_discount').val('');
    $('.checkout_btn').hide();
    $('.bulk_adj').hide();
    $('.next_step_btn').show();
    $('.clear_discount').hide();

    var vat = parseInt($('#session_vat').val())/100;
    var tax_coverage = $('#tax_coverage').val();
    var total = parseInt($('#cart_int_orig_price').val());
    var orig_total = parseInt($('#cart_int_orig_price').val());

    var new_amt = $('#cart_int_orig_price').val();
    if ($('#tax_coverage').val() == 'incl') {
        $('#transaction_amt_to_pay').val(new_amt);
        $('#transaction_balance').val(new_amt);
    } else if ($('#tax_coverage').val() == 'excl') {
        var vat_amt = $('#cart_new_amt_vat').text();
        $('#transaction_amt_to_pay').val(vat_amt);
        $('#transaction_balance').val(vat_amt);
    }


    if (tax_coverage == 'incl') {
        var vat_amt = (total * vat).toFixed(2);
        var amt_net_of_vat = (total-vat_amt).toFixed(2);
        $("#cart_new_amt_vat").text(addCommas(amt_net_of_vat.toString()));
        $("#cart_new_vat").text(addCommas(vat_amt.toString()));
    } else if (tax_coverage == 'excl') {
        var vat_amt = parseInt(total * vat).toFixed(2);
        var amt_net_of_vat = (parseInt(total) + parseInt(vat_amt)).toFixed(2);
        $("#cart_new_amt_vat").text(addCommas(amt_net_of_vat.toString()));
        $("#cart_new_vat").text(addCommas(vat_amt.toString()));
    } else {
        $("#cart_new_amt_vat").text("No vat set in ERP");
        $("#cart_new_vat").text("No vat set in ERP");
    }
}



function applyBulkAdjustment()
{   
    var bulk_adj_opt = $('#bulk_opt_sel').val();
    if (bulk_adj_opt != '') {
        if (bulk_adj_opt == 'bgift') {
            $('#cart_price').text(0);
            $('#cart_int_price').val(0);
            $('#applied_bulk_discount').text('Gift');
            $('#customer_savings').text(addCommas($('#cart_int_orig_price').val()));

        } else if (bulk_adj_opt == 'bdiscamt') {
            var new_cart_total = $('#cart_int_orig_price').val() - $('#cform-discount_amount').val();
            if (new_cart_total >= 0) {
                $('#cart_price').text(addCommas(new_cart_total));
                $('#cart_int_price').val(new_cart_total);
                $('#applied_bulk_discount').text('Less Php '+$('#cform-discount_amount').val()+'');
                $('#customer_savings').text(addCommas($('#cform-discount_amount').val()));
            } else {
                toastr['error']('Invalid discount amount.', 'Error');
            }
        } else if (bulk_adj_opt == 'bdisc') {
            var new_cart_total = $('#cart_int_orig_price').val() - ($('#cart_int_orig_price').val() * ($('#cform-discount_pct').val()/100));
            var savings = $('#cart_int_orig_price').val() * ($('#cform-discount_pct').val()/100);
            if (new_cart_total >= 0) {
                $('#cart_price').text(addCommas(new_cart_total));
                $('#cart_int_price').val(new_cart_total);
                $('#applied_bulk_discount').text('Less '+$('#cform-discount_pct').val()+'% off');
                $('#customer_savings').text(addCommas(savings.toString()));
            } else {
                toastr['error']('Invalid discount.', 'Error');
            }
        } else if (bulk_adj_opt == 'bamt') {
            var savings = $('#cart_int_price').val() - $('#cform-new_total').val();
            $('#cart_int_price').val($('#cform-new_total').val());
            $('#cart_price').text(addCommas($('#cform-new_total').val()));
            $('#applied_bulk_discount').text('Change Amount');
            $('#customer_savings').text(addCommas(savings.toString()));
        } else {
            $('.display_price').each(function() {
                if ($(this).val() == "0" || $(this).val() == "0.00") {
                    //revert prices only if bulk discount came from gift
                    var row = $(this).closest('tr');
                    var srp = row.find('.srp').val();
                    $(this).val(srp);
                }
                
            });
            $('#applied_bulk_discount').text('');
            computeCart();
            computeCartMinimum();
        }
    } else {

    }

    var vat = parseInt($('#session_vat').val())/100;
    var tax_coverage = $('#tax_coverage').val();
    var total = parseInt($('#cart_int_price').val());
    var orig_total = parseInt($('#cart_int_orig_price').val());

    var new_amt = $('#cart_int_price').val();
    if ($('#tax_coverage').val() == 'incl') {
        $('#transaction_amt_to_pay').val(new_amt);
        $('#transaction_balance').val(new_amt);
    } else if ($('#tax_coverage').val() == 'excl') {
        var vat_amt = $('#cart_new_amt_vat').text();
        $('#transaction_amt_to_pay').val(vat_amt);
        $('#transaction_balance').val(vat_amt);
    }


    if (tax_coverage == 'incl') {
        var vat_amt = (total * vat).toFixed(2);
        var amt_net_of_vat = (total - vat_amt).toFixed(2);;
        $("#cart_new_amt_vat").text(addCommas(amt_net_of_vat.toString()));
        $("#cart_new_vat").text(addCommas(vat_amt.toString()));

        var vat_amt = (orig_total * vat).toFixed(2);
        var amt_net_of_vat = (orig_total-vat_amt).toFixed(2);;
        $("#cart_orig_amt_vat").text(addCommas(amt_net_of_vat.toString()));
        $("#cart_orig_vat").text(addCommas(vat_amt.toString()));
    } else if (tax_coverage == 'excl') {
        var vat_amt = parseInt(total * vat).toFixed(2);
        var amt_net_of_vat = (parseInt(total) + parseInt(vat_amt)).toFixed(2);
        $("#cart_new_amt_vat").text(addCommas(amt_net_of_vat.toString()));
        $("#cart_new_vat").text(addCommas(vat_amt.toString()));

        var vat_amt = parseInt(orig_total * vat).toFixed(2);
        var amt_net_of_vat = (parseInt(orig_total) + parseInt(vat_amt)).toFixed(2);
        $("#cart_orig_amt_vat").text(addCommas(amt_net_of_vat.toString()));
        $("#cart_orig_vat").text(addCommas(vat_amt.toString()));
    } else {
        $("#cart_new_amt_vat").text("No vat set in ERP");
        $("#cart_new_vat").text("No vat set in ERP");
    }
}

function revertOriginalPrices()
{
    $('.display_price').each(function() {
        if ($(this).val() == "0" || $(this).val() == 0.00) {
            //revert prices only if bulk discount came from gift
            var row = $(this).closest('tr');
            var srp = row.find('.srp').val();
            $(this).val(srp);
        }
        
    });
    computeCart();
    computeCartMinimum();
}