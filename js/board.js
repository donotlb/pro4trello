var boardId;
var boardSettings;

function updateSettings() {
  // handle checkboxes
  $('input[type="checkbox"]').each(function () {
    let checkbox = jQuery(this);
    boardSettings[checkbox.attr('name')] = checkbox.prop('checked');
  });

  // handle text inputs
  $('textarea,input[type="text"]').each(function () {
    let textarea = jQuery(this);
    boardSettings[textarea.attr('name')] = textarea.val();
  });

  // handle select/radio buttons
  $('.radio-group').each(function () {
    let radio = jQuery(this).find('input').filter(':checked');
    boardSettings[radio.attr('name')] = radio.val();
  });

  let storage = {};
  storage[boardId] = boardSettings;
  chrome.storage.sync.set(storage);
}

function loadSettings() {
  boardId = window.location.hash.replace('#b=','');
  chrome.storage.sync.get(['defaults',boardId], function (globalSettings) {
    boardSettings = globalSettings[boardId];
    if(boardSettings) {
      applySettings(boardSettings);
    } else {
      boardSettings = {};
    }
  });
}

function applySettings(settings) {
  for (let key in settings) {
    // try checkbox
    let checkbox = $('input[type="checkbox"][name="' + key + '"]');
    if (checkbox.length != 0) {
      if (settings[key]) {
        checkbox.attr('checked', true);
        checkbox.parents('.checklist-item').addClass('checklist-item-state-complete');
      }
      else {
        checkbox.removeAttr('checked');
        checkbox.parents('.checklist-item').removeClass('checklist-item-state-complete');
      }
      continue;
    }

    // try textarea, text input
    let textarea = $('[name="' + key + '"]');
    if (textarea.length != 0) {
      textarea.val(settings[key]);
      continue;
    }

    // try radio
    let radio = $('input[type="radio"][name="' + key + '"][value="' + settings[key] + '"]');
    if(radio.length != 0) {
      radio.attr('checked',true);
      continue;
    }
  }
}

$(function(){

  loadSettings();

  $('input[type="checkbox"],input[type="radio"]').on('change',updateSettings);
  $('tinput[type="text"],extarea').on('input',updateSettings);

  $('#btnExport').on('click', function(e){
    e.preventDefault();
    let $tmp = $('<textarea style="position: fixed; height: 0px; width: 0px;"></textarea>').text(JSON.stringify(boardSettings)).appendTo($('body'));
    $tmp.focus().select();    
    
    let success = document.execCommand('Copy');
    if(success) {
      alert('Board settings copied to clipboard!');
    } else {
      alert('Oooops... copying to clipboard failed...');
    }    
    
    $tmp.remove();
    return false;
  });

  $('#btnImport').on('click', function(e) {
    e.preventDefault();
    let $container = $('#clipboard-container').show();
    
    let $tmp = $('<textarea style="position: fixed; height: 0px; width: 0px;"></textarea>').appendTo($('body'));
    $tmp.focus();
    $tmp.on('blur', function(){ $tmp.focus(); });
    $tmp.on('paste', function(evt) {
      setTimeout(function(){        
        try {
          let settings = JSON.parse($tmp.val());          
          applySettings(settings);
          updateSettings();
          alert('Board settings imported from clipboard!');
        }
        catch (err) {
          alert('Oooops... bad JSON in clipboard...');
        }
        $tmp.remove();
        $container.hide();
      }, 100);
    });

    return false;
  });

});
