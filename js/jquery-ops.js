/* ── jquery-ops.js: jQuery selectors, AJAX, DOM modifications, filtering with result count ── */
'use strict';

$(document).ready(function() {

  /* ── 1. jQuery Filter by Category ── */
  $(document).on('click', '.jq-filter-btn', function() {
    const cat = $(this).data('category');
    $('.jq-filter-btn').removeClass('active');
    $(this).addClass('active');

    if (cat === 'all') {
      $('.product-card').show();
    } else {
      $('.product-card').each(function() {
        $(this).data('category') === cat ? $(this).show() : $(this).hide();
      });
    }

    const visible = $('.product-card:visible').length;
    $('#jquery-filter-result').text(`${visible} product${visible !== 1 ? 's' : ''} match your selected criteria.`);
  });

  /* ── 2. jQuery Price Range Highlight ── */
  $(document).on('change', '#jq-price-max', function() {
    const max = parseInt($(this).val());
    $('#jq-price-label').text('₹' + max.toLocaleString('en-IN'));
    let matched = 0;
    $('.product-card').each(function() {
      const price = parseInt($(this).data('price'));
      if (price <= max) {
        $(this).removeClass('opacity-dim').css('opacity','1');
        matched++;
      } else {
        $(this).css('opacity','0.35');
      }
    });
    $('#jquery-filter-result').text(`${matched} product${matched !== 1 ? 's' : ''} match your selected criteria.`);
  });

  /* ── 3. jQuery Brand Filter ── */
  $(document).on('change', '.jq-brand-cb', function() {
    const checked = $('.jq-brand-cb:checked').map(function(){ return $(this).val(); }).get();
    if (!checked.length) { $('.product-card').show(); }
    else {
      $('.product-card').each(function() {
        checked.includes($(this).data('brand')) ? $(this).show() : $(this).hide();
      });
    }
    const visible = $('.product-card:visible').length;
    $('#jquery-filter-result').text(`${visible} products match your selected criteria.`);
  });

  /* ── 4. jQuery DOM Manipulation ── */
  // a) Add CSS class on high-rated product cards
  $('.product-card').each(function() {
    if (parseFloat($(this).data('rating')) >= 4.7) {
      $(this).find('.product-name').before('<span class="tag tag-success" style="display:inline-block;margin-bottom:0.25rem;">⭐ Top Rated</span>');
    }
  });

  // b) Animate Add-to-Cart buttons on hover
  $(document).on('mouseenter', '.btn-cart', function() {
    $(this).stop(true).css({ transform:'scale(1.04)' });
  }).on('mouseleave', '.btn-cart', function() {
    $(this).stop(true).css({ transform:'scale(1)' });
  });

  // c) Show discount tag as tooltip on mouseover
  $(document).on('mouseover', '.product-discount', function() {
    $(this).attr('title', 'You save ₹' + (parseInt($(this).closest('.product-card').data('price')) * parseInt($(this).text()) / 100).toLocaleString('en-IN'));
  });

  /* ── 5. jQuery AJAX Demo (from products.json with success/error/loading) ── */
  $(document).on('click', '#ajax-load-btn', function() {
    // Note: main loading is done in products.js; this is additional jQuery chaining demo
    const $btn = $(this);
    $btn.prop('disabled', true).text('⏳ Loading...');
    $.ajax({
      url: 'data/products.json',
      type: 'GET',
      dataType: 'json',
      beforeSend: function() {
        $('#ajax-status').html('<div class="spinner"></div><div class="loading-text">Fetching product data via jQuery AJAX...</div>');
      },
      success: function(data) {
        $('#ajax-status').html(`<div class="success-msg" style="margin-bottom:1rem;">✅ Loaded ${data.length} products via jQuery AJAX!</div>`);
        if (window.renderProducts) window.renderProducts(data, 'ajax-products');
        $btn.prop('disabled', false).text('🔄 Reload (AJAX)');
      },
      error: function(xhr, status, error) {
        $('#ajax-status').html(`<div class="error-msg" style="margin-bottom:1rem;">❌ Error: ${error || status} — <button id="ajax-retry" class="btn btn-danger btn-sm" style="margin-left:0.5rem;">🔄 Retry</button></div>`);
        $btn.prop('disabled', false).text('🔄 Load Products (AJAX)');
      }
    });
  });

  /* Retry button via delegation */
  $(document).on('click', '#ajax-retry', function() { $('#ajax-load-btn').trigger('click'); });

  /* ── 6. Enable/Disable sort on zero results ── */
  const checkSortDisable = () => {
    const visible = $('.product-card:visible').length;
    const sortEl = $('#sort-select, #jq-sort');
    visible === 0 ? sortEl.prop('disabled', true) : sortEl.prop('disabled', false);
  };
  $(document).on('click', '.jq-filter-btn, .jq-brand-cb', checkSortDisable);

  /* ── 7. Highlight search keyword in product names ── */
  $(document).on('input', '#home-search, #product-search', function() {
    const q = $(this).val().toLowerCase();
    if (!q) {
      $('.product-name').each(function() {
        $(this).html($(this).text());
      });
      return;
    }
    $('.product-name').each(function() {
      const text = $(this).text();
      const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
      $(this).html(text.replace(regex, '<mark style="background:rgba(108,99,255,0.35);color:var(--text-strong);border-radius:2px;padding:0 2px;">$1</mark>'));
    });
  });

  /* ── 8. jQuery Rating Star Interaction ── */
  $(document).on('mouseenter', '.star', function() {
    const val = $(this).data('value');
    $(this).closest('.star-rating').find('.star').each(function() {
      $(this).css('color', $(this).data('value') <= val ? 'var(--secondary)' : 'var(--border)');
    });
  }).on('mouseleave', '.star-rating', function() {
    const selected = $(this).data('selected') || 0;
    $(this).find('.star').each(function() {
      $(this).css('color', $(this).data('value') <= selected ? 'var(--secondary)' : 'var(--border)');
    });
  }).on('click', '.star', function() {
    const val = $(this).data('value');
    const ratingEl = $(this).closest('.star-rating');
    ratingEl.data('selected', val).attr('data-selected', val);
    ratingEl.siblings('.selected-rating-val').text(`You rated: ${val}/5`);
    $(this).closest('.star-rating').find('.star').each(function() {
      $(this).css('color', $(this).data('value') <= val ? 'var(--secondary)' : 'var(--border)');
    });
  });

  console.log('[FreshKart] jQuery operations loaded. Version:', $.fn.jquery);
});

