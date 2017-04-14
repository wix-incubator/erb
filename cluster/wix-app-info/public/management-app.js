/* eslint-disable */

$(document).ready(function () {
  $('#make-cpu-profile').click(function (e) {
    e.preventDefault()
    const duration = $('#duration-options').val();
    $.ajax({
      type: 'POST',
      url: 'cpu-profile/api/generate?duration=' + duration
    }).then(refreshTable).then(refreshTableIfHavePendingItems);
  });

  $('#make-heap-dump').click(function (e) {
    e.preventDefault();
    $.ajax({
      type: 'POST',
      url: 'heap-dump/api/generate'
    }).then(refreshTable).then(refreshTableIfHavePendingItems);
  });

  function refreshTable() {
    return $.get('').then(function(response) {
      $('table.items-table').replaceWith($(response).find('table.items-table'));
    });
  }

  var refreshTimeout;
  function refreshTableIfHavePendingItems() {
    var items = $('[data-status="PENDING"]');
    if (items.length > 0) {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      refreshTimeout = setTimeout(function () {
        refreshTable().then(refreshTableIfHavePendingItems);
      }, 1000);
    }
  }
  refreshTableIfHavePendingItems();
});
