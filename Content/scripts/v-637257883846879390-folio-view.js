var exitCallback,
  totalSlides,
  _window = window,
  config = _window.config,
  doc = document,
  idleHider = null,
  outer = $("body")[0],
  $presentButtons = $("#presentation-buttons"),
  $leftBtn = $presentButtons.find(".left-btn"),
  $rightBtn = $presentButtons.find(".right-btn"),
  $exit = $presentButtons.find(".exit"),
  $homePage = $("#home-page"),
  fullScreen =
    outer.requestFullscreen ||
    outer.mozRequestFullScreen ||
    outer.webkitRequestFullscreen,
  isBusy = !1,
  $present = $(".present"),
  maxAttempts = 3,
  attempts = 0,
  isTemplate = !1;
function start(e) {
  (exitCallback = e),
    $("html").css({ backgroundColor: "#fff", "overflow-y": "auto" }),
    $("body, .preview-div").addClass("present"),
    $(".preview-div:first-child").addClass("current"),
    fullScreen && fullScreen.call(outer),
    $(doc).on("keydown.present", presentationKeys),
    setTimeout(function () {
      $presentButtons.show(),
        isTemplate && $("#tmp-copy-template-topbar").hide(),
        processPresentationPage();
    }, 100),
    $(".preview-available").addClass("hidden"),
    $(doc).on("mousemove.idleMouse", function () {
      clearTimeout(idleHider),
        $("body").removeClass("idle"),
        (idleHider = setTimeout(function () {
          $("body").addClass("idle");
        }, 2e3));
    }),
    $leftBtn.click(function () {
      processPresentationPage(-1);
    }),
    $rightBtn.click(function () {
      processPresentationPage(1);
    }),
    $exit.click(stop),
    $(window).on("resize.presentFix", processPresentationPage),
    (totalSlides = $(".preview-div").length),
    console.log("totalSlides", totalSlides);
}
function processPresentationPage(e) {
  if (!isBusy) {
    (isBusy = !0),
      (e = e || 0),
      (document.body.scrollTop = document.documentElement.scrollTop = 0);
    var t = $(".preview-div.current").css("min-height", ""),
      o = t.index(),
      n = totalSlides - 1;
    console.log("index", o),
      0 < e && o < n
        ? t.add(t.next()).toggleClass("current")
        : e < 0 && 0 < o && t.add(t.prev()).toggleClass("current"),
      (o += e),
      (t = $(".preview-div.current").css("min-height", window.innerHeight)),
      $leftBtn.toggleClass("disable", o <= 0),
      $rightBtn.toggleClass("disable", n <= o),
      setTimeout(function () {
        $(document).scrollTop(0),
          (isBusy = !1),
          $homePage.prop("tabIndex", $homePage.prop("tabIndex")),
          $homePage.focus();
      }, 10);
  }
}
function stop() {
  if (doc.fullscreenElement || doc.mozFullScreen || doc.webkitIsFullScreen) {
    var e =
      doc.cancelFullscreen ||
      doc.mozCancelFullScreen ||
      doc.webkitCancelFullScreen;
    e && e.call(doc);
  }
  $presentButtons.hide(),
    $("html").css({ backgroundColor: "", "overflow-y": "" }),
    $(".preview-div").css("min-height", ""),
    $(".preview-available").removeClass("hidden"),
    $(window).off(".presentFix"),
    $("body, .preview-div").removeClass("present current"),
    clearTimeout(idleHider),
    $("body").removeClass("idle"),
    $(doc).off(".idleMouse .present"),
    isTemplate && $("#tmp-copy-template-topbar").show(),
    exitCallback && exitCallback();
}
function presentationKeys(e) {
  var t = e.which;
  32 == t || 39 == t
    ? processPresentationPage(1)
    : 37 == t
    ? processPresentationPage(-1)
    : 27 == t && stop();
}
function moveStyles() {
  $presentButtons.hide(),
    $present.hide(),
    $(".watermark-on-free-shared").hide(),
    $("style").appendTo("head");
}
function initBtns() {
  config.presentationMode ? $present.show() : $present.hide(),
    $present.on("click", function () {
      $present.hide();
      var e = $("#home-page").css("paddingTop");
      $("#home-page").css({ paddingTop: "0px" }),
        start(function () {
          $present.show(), $("#home-page").css({ paddingTop: e });
        });
    });
}
function initTemplate() {
  var e = $("#tmp-copy-template-topbar"),
    t = e.find(".ok.edit-preview-template"),
    o = e.find(".present"),
    n = e.find(".white-curved-arrow"),
    i = e.find(".try-xtensio-text");
  if (
    ($("body").prepend(e),
    "false" !== config.EditTemplate ||
      config.isUserTemplate ||
      config.isTeamTemplate)
  ) {
    if (
      ((isTemplate = !0),
      "" !== config.userName
        ? (t.text("Edit this Folio"),
          n.css("display", "none"),
          i.text("").css("display", "none"))
        : (n.css("display", "inline-block"),
          i
            .html(
              "Start editing your " +
                config.FolioName.toLowerCase() +
                " and other collateral"
            )
            .css("display", "inline-block"),
          t.text("Get Started - Free")),
      "true" == config.EditTemplate ||
        config.isUserTemplate ||
        config.isTeamTemplate)
    ) {
      if (
        (config.isUserTemplate || config.isTeamTemplate) &&
        0 < config.Team.Id
      ) {
        var a = config.Team.LogoUrl
          ? '<img src ="'
              .concat(config.Team.LogoUrl, '" title="')
              .concat(
                config.Team.Name,
                '" style="max-height:35px;margin-top: -12px;">'
              )
          : config.Team.Name;
        e.find("i.icon-Logo").remove(),
          e.find(".app-title a").append(a),
          e.find(".text").text(config.FolioName);
      }
      (config.isUserTemplate || config.isTeamTemplate) &&
        t.text("Use This Template"),
        0 < $("#antiForgeryContainer").length
          ? $("#antiForgeryContainer").after(e)
          : $("body").prepend(e),
        $("#home-page").css({ paddingTop: "50px" });
    } else $("body").append($present.addClass("fly"));
    config.presentationMode || $present.hide(),
      "dash-explore" == config.EditTemplate &&
        $present.addClass("fly").css({ top: "55px" }).show();
    var r = config.lastTeamUrl || "https://app.xtensio.com";
    e.find(".user-info a").attr("href", r),
      t.on("click", function () {
        if (config.userName) {
          var e = ""
            .concat(config.lastTeamUrl, "/?t=")
            .concat(config.token, "&name=")
            .concat(encodeURI(config.FolioName), "#use-template");
          window.location.href = e;
        } else redirectFromContent();
      }),
      o.click(function () {
        $present.trigger("click");
      });
  } else e.hide();
}
function addToken(e) {
  return (
    "__RequestVerificationToken=" +
    config.verificationToken +
    (e ? "&" + e : "")
  );
}
function ajaxCall(n) {
  $.ajax({
    type: "POST",
    url: n.url,
    data: addToken(n.data),
    xhr: function () {
      var e = $.ajaxSettings.xhr();
      return e;
    },
    success: function (e, t, o) {
      1 == e.StatusCode && n.success && n.success(e);
    },
    error: function (e, t, o) {
      "abort" != t && n.error && n.error(e, t, o);
    },
    complete: function (e, t) {
      n.complete(e, t);
    },
  });
}
function saveModuleRecord(e) {
  ajaxCall({
    url: "/Apiv1/SaveModuleRecord",
    data: $.param({
      token: config.token,
      moduleId: e.moduleId,
      data: JSON.stringify(e.dataObj),
    }),
    success: e.success,
    error: e.error,
    complete: e.complete,
  });
}
function verticalBarTooltip() {
  0 < $(".graph-type-Bar").length &&
    $(".graph-type-Bar").each(function () {
      $(this)
        .find(".slider-inner")
        .each(function () {
          var e = $(this).find(".slider-bar").height();
          $(this)
            .find(".slider-tooltip")
            .css("bottom", "".concat(e + 10, "px"));
        });
    });
}
function lineChartTooltip() {
  0 < $(".graph-type-Line").length &&
    $(".graph-type-Line").each(function () {
      var a = $(this),
        r = a.find(".pairs").height();
      a.find("circle").each(function (e) {
        var t = this,
          o = a.find(".slider-outer").eq(e),
          n = $(this).attr("cy"),
          i = r - parseFloat(n);
        $(this).hover(
          function () {
            o.find(".slider-tooltip").css("bottom", "".concat(i + 10, "px")),
              o.find(".slider-tooltip").show(),
              $(t).attr("r", 7);
          },
          function () {
            o.find(".slider-tooltip").hide(), $(t).attr("r", 4);
          }
        );
      });
    });
}
function initDataCollection() {
  0 < $(".dc-module").length &&
    $(".dc-module").each(function () {
      var e = $(this),
        t = e.find(".dc-join-us"),
        o = e.find(".dc-email-input"),
        n = e.find(".module-info").data("module"),
        i = e.find(".module-info").data("text"),
        a = e.find("#spinner-container > .loading-animation");
      n &&
        t.on("click", function () {
          var e = o.val();
          e && validator.isEmail(e)
            ? (t.prop("disabled", !0),
              o.removeClass("email-invalid"),
              a.show(),
              saveModuleRecord({
                moduleId: n,
                dataObj: { email: e },
                success: function () {
                  o.val(""), t.text("Submitted");
                },
                error: function () {
                  t.text("Error. Try again."),
                    t.prop("disabled", !1),
                    setTimeout(function () {
                      t.text(i);
                    }, 3e3);
                },
                complete: function () {
                  a.hide();
                },
              }))
            : o.addClass("email-invalid");
        });
    });
}
function cleanupImageAnchor() {
  0 < $(".image-inner").length &&
    $(".image-inner").each(function () {
      "https://" === $(this).find("a").attr("href") &&
        $(this).find("a > img").unwrap();
    });
}
function initModules() {
  verticalBarTooltip(),
    lineChartTooltip(),
    initDataCollection(),
    cleanupImageAnchor();
}
function doPasswordProtect() {
  var t,
    e = $("#tmp-get-fpass"),
    o = e.find(".pass"),
    n = e.find(".agree-box"),
    i = e.find(".agree"),
    a = e.find(".folio-msg"),
    r = e.find(".project-msg"),
    s = e.find("form"),
    c = e.find(".error-msg").text(config.passError),
    l = e.find("button");
  e.find(".token").val(config.verificationToken),
    config.isProject &&
      (a.hide(),
      r.removeClass("hidden"),
      i.prop("checked", !config.disclaimer),
      config.disclaimer && n.removeClass("hidden")),
    o.on("keyup", function (e) {
      (t = !o.val()), l.prop("disabled", t);
    }),
    s.submit(function () {
      return o.val()
        ? config.isProject && !0 !== i[0].checked
          ? (c.text("You must agree with the Disclaimer first."), !1)
          : void 0
        : (c.text("No password given."), !1);
    }),
    $("body").append(e.addClass("show"));
}
function getUrlVars() {
  var n = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (e, t, o) {
    n[t] = o;
  });
  return n;
}
function getUrlVars() {
  var n = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (e, t, o) {
    n[t] = o;
  });
  return n;
}
function redirectFromContent() {
  var e = "https://app.xtensio.com/account/signup?t=" + config.t,
    t = getUrlVars()._ga;
  t && (e = e + "&_ga=" + t), (window.location.href = e);
}
$(document).ready(function () {
  moveStyles(),
    $("#templates").load(
      "/index.html",
      function (e, t, o) {
        if ("error" != t) {
          var n = config.Team && 0 < config.Team.Id,
            i = n && (0 == config.Team.ST || 34 == config.Team.ST);
          config.passExists
            ? doPasswordProtect()
            : ($homePage.show(),
              0 === config.banner || (n && !i)
                ? $(".watermark-on-free-shared").hide()
                : ($(".watermark-on-free-shared").show(),
                  $homePage.append($("#tmp-power-by-footer")),
                  $("#tmp-power-by-footer").removeClass("hidden")),
              initBtns(),
              initTemplate(),
              initModules());
        } else
          setTimeout(function () {
            location.reload();
          }, 2e3);
      }
    );
});
