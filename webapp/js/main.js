var Upperlim, affalltext, affeditmode, affgrabtext, afflower, affnode, affpageoffset, affpgcount, affupper, curoffpage, curpage, currpg, curselend, editmode, entereditmode, extendaff, getnextline, lowerlim, maxchar, maxpgrenum, newaffpage, placenextline, pnnum, pnrenum, pxtopt;

lowerlim = 10;

afflower = 12;

affupper = 14;

Upperlim = 12;

maxchar = 4600;

affpgcount = 1;

currpg = 1;

affalltext = "";

editmode = false;

curoffpage = 0;

curselend = 0;

affpageoffset = 0;

curpage = 1;

entereditmode = false;

affnode = null;

pxtopt = function(pixel) {
  return Math.round(pixel / ((.35146 / 25.4) * 96));
};

maxpgrenum = function() {
  $("[name='mpage']").each(function() {
    return $(this).val(affpgcount);
  });
};

pnrenum = function() {
  currpg = 1;
  $("[name='pn']").each(pnnum);
};

pnnum = function() {
  $(this).val(currpg);
  currpg = currpg + 1;
};

newaffpage = function(priorpage, ext) {
  var newpage, npchild;
  newpage = priorpage.clone(true);
  affpgcount++;
  npchild = newpage.find("[name='aff-f-1']");
  priorpage.after(newpage);
  npchild.val("");
  if (ext.length > maxchar) {
    npchild.val(ext.substring(0, maxchar));
    newaffpage(newpage, ext.substring(maxchar));
  } else {
    npchild.focus();
    maxpgrenum;
    pnrenum;
  }
};

getnextline = function(text) {
  var exp, result;
  exp = new RegExp("(\n|([^\n]*)(\.){1,})");
  result = exp.exec(text);
  if (result[0] === null) {
    console.log("Error: Null Regex Value");
    return "";
  }
  return result[0];
};

placenextline = function(page, text) {
  var affta, fs, newtext, nline, oldval;
  nline = getnextline(text);
  affta = page.find("[name='aff-f-1']");
  oldval = String(affta.val());
  newtext = text.substring(nline.length);
  affta.val(affta.val() + nline);
  if (affta.prop('scrollHeight') > affta.outerHeight()) {
    fs = pxtopt(parseInt($(this).css('font-size')));
    while (this.scrollHeight > $(this).outerHeight() && fs !== afflower) {
      $(this).css('font-size', fs + 'pt');
      fs--;
      if (fs < afflower) {
        fs = afflower;
      }
    }
    affta.val(oldval);
    if (affta.prop('scrollHeight') > affta.outerHeight()) {
      console.log("Error: Page Capacity Exceeded");
    }
    return text;
  } else {
    if (newtext.length === 0) {
      return newtext;
    } else {
      return placenextline(page, newtext);
    }
  }
};

affgrabtext = function(page) {
  var affta;
  affta = page.find("[name='aff-f-1']");
  affalltext += affta.val();
  if (page.find("[name='pn']").val() < curpage) {
    affpageoffset += affta.val().length;
  } else if (page.find("[name='pn']").val() === curpage) {
    curoffpage = affta.prop("selectionStart");
    curselend = affta.prop("selectionEnd");
  }
  if (page.find("[name='pn']").val() !== "1") {
    page.remove();
  }
};

affeditmode = function() {
  affpageoffset = 0;
  affalltext = "";
  affpgcount = 1;
  $("[name='aff-1']").each(function() {
    return affgrabtext($(this));
  });
  maxpgrenum();
  $("[name='aff-f-1']").val(affalltext);
  $("[name='aff-f-1']").focus();
  $(document).scrollTop($("[name='aff-f-1']").position().top);
  $("[name='aff-f-1']").prop("selectionStart", curoffpage + affpageoffset);
  $("[name='aff-f-1']").prop("selectionEnd", curselend + affpageoffset);
};

extendaff = function(extra, priorpage) {
  var leftovers, newpage, npchild, temp;
  newpage = priorpage.clone(true);
  affpgcount++;
  newpage.attr("name", "aff-1");
  newpage.find("[name='pn']").val(affpgcount);
  temp = newpage.find("[name='paffi']");
  temp.attr('name', temp.attr('name'));
  temp = newpage.find("[name='affsig']");
  temp.attr('name', temp.attr('name'));
  temp = newpage.find("[name='date']");
  temp.attr('name', temp.attr('name'));
  temp = newpage.find("[name='affsig2']");
  temp.attr('name', temp.attr('name'));
  temp = newpage.find("[name='tcourt']");
  temp.attr('name', temp.attr('name'));
  npchild = newpage.find("[name='aff-f-1']");
  npchild.attr('name', "aff-f-1");
  priorpage.after(newpage);
  leftovers = placenextline(newpage, extra);
  console.log("Extending");
  maxpgrenum();
  if (leftovers.length > 0) {
    console.log("Go the distance");
    extendaff(leftovers, newpage);
  }
};

$(document).ready(function() {
  maxpgrenum();
  $(":input").focusout(function() {
    var ghost;
    if ($(this).attr('name') !== "aff-f-1") {
      ghost = $(":input[name=" + $(this).attr('name') + "]");
      ghost.val($(this).val());
      ghost.css('font-size', $(this).css('font-size'));
    }
  });
  $(":checkbox").click(function() {
    var ghost;
    ghost = $(":checkbox[name=" + $(this).attr('name') + "]");
    ghost.prop("checked", $(this).prop("checked"));
  });
  $(":checkbox[name^=cr]").click(function() {
    var c2, nametemp, temp;
    nametemp = $(this).attr('name');
    if (nametemp.indexOf("-c") >= 0) {
      $(this).prop("checked", true);
      nametemp = $(this).attr('name');
      nametemp = nametemp.substring(0, 3);
      $("[name=" + nametemp + "]").prop('checked', false);
    } else {
      temp = $(this).attr('name');
      c2 = $("[name=" + temp + "-c]");
      c2.prop("checked", false);
      $(this).prop("checked", true);
    }
  });
  $(":input").keydown(function() {
    var fontsize;
    if ($(this).attr('name') === "aff-f-1") {
      if (this.scrollHeight > $(this).outerHeight() || this.scrollWidth > $(this).outerWidth()) {
        fontsize = parseInt($(this).css("font-size"), 10);
        fontsize = pxtopt(fontsize);
        if (fontsize > afflower) {
          $(this).css('font-size', (fontsize - 1) + "pt");
        }
      } else if (this.scrollHeight <= $(this).outerHeight() || this.scrollWidth < $(this).outerWidth()) {
        fontsize = parseInt($(this).css("font-size"), 10);
        fontsize = pxtopt(fontsize);
        if (fontsize < affupper || ($(this).hasClass('taform') && fontsize < 12)) {
          $(this).css('font-size', (fontsize + 1) + "pt");
        }
        if (this.scrollWidth > $(this).outerWidth() || this.scrollHeight > $(this).outerHeight()) {
          fontsize = parseInt($(this).css("font-size"), 10);
          fontsize = pxtopt(fontsize);
          if (fontsize > afflower) {
            $(this).css('font-size', (fontsize - 1) + "pt");
          }
        }
      }
    } else {
      if (this.scrollHeight > $(this).outerHeight() || this.scrollWidth > $(this).outerWidth()) {
        fontsize = parseInt($(this).css("font-size"), 10);
        fontsize = pxtopt(fontsize);
        if (fontsize > lowerlim) {
          $(this).css('font-size', (fontsize - 1) + "pt");
        }
      } else if (this.scrollHeight <= $(this).outerHeight() || this.scrollWidth < $(this).outerWidth()) {
        fontsize = parseInt($(this).css("font-size"), 10);
        fontsize = pxtopt(fontsize);
        if (fontsize < Upperlim || ($(this).hasClass('taform') && fontsize < 12)) {
          $(this).css('font-size', (fontsize + 1) + "pt");
        }
        if (this.scrollWidth > $(this).outerWidth() || this.scrollHeight > $(this).outerHeight()) {
          fontsize = parseInt($(this).css("font-size"), 10);
          fontsize = pxtopt(fontsize);
          if (fontsize > lowerlim) {
            $(this).css('font-size', (fontsize - 1) + "pt");
          }
        }
      }
    }
    if (this.scrollHeight > $(this).outerHeight() || this.scrollWidth > $(this).outerWidth() + 1) {
      console.log(fontsize);
      console.log(lowerlim);
      console.log(this.scrollWidth);
      console.log($(this).outerWidth());
      if (fontsize <= lowerlim && $(this).attr('name') !== "aff-f-1") {
        $(this).val($(this).val().substring(0, $(this).val().length - 1));
      }
    }
  });
  $("[name='aff-f-1']").focusout(function() {
    var extra, fs, i, startingpage, _i;
    for (i = _i = 0; _i <= 1; i = ++_i) {
      fs = pxtopt(parseInt($(this).css('font-size')));
      console.log("before extend");
      while (this.scrollHeight > $(this).outerHeight() && fs !== afflower) {
        fs--;
        $(this).css('font-size', fs + 'pt');
        if (fs < afflower) {
          fs = afflower;
        }
      }
      if (this.scrollHeight > $(this).outerHeight()) {
        affalltext = $(this).val();
        $(this).val("");
        startingpage = $("[name='aff-1']");
        extra = placenextline(startingpage, affalltext);
        if (extra.length > 0) {
          extendaff(extra, startingpage);
        }
      }
      console.log("after extend");
      editmode = false;
      entereditmode = false;
    }
  });
  $("[name='aff-f-1']").mousedown(function() {
    if (editmode === false) {
      entereditmode = true;
      affnode = $(this);
    }
  });
  $(document).mouseup(function() {
    if (entereditmode === true && editmode === false) {
      editmode = true;
      curpage = affnode.parent().parent().find("[name='pn']").val();
      affeditmode();
      console.log("end mouseupif");
    }
  });
  $(document).keydown(function() {
    if (event.which === 8 && !$(event.target).is("input, textarea")) {
      return e.preventDefault;
    }
  });
});
