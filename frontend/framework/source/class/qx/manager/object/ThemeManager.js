/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_core)

************************************************************************ */

qx.Class.define("qx.manager.object.ThemeManager",
{
  type : "singleton",
  extend : qx.core.Target,



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Meta theme. Applies the defined color, border, widget, ... themes to
     * the corresponding managers.
     */
    theme :
    {
      check : "Theme",
      nullable : true,
      apply : "_applyTheme"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _applyTheme : function(value, old)
    {
      var color = null;
      var border = null;
      var widget = null;
      var icon = null;
      var appearance = null;

      if (value)
      {
        color = value.meta.color || null;
        border = value.meta.border || null;
        widget = value.meta.widget || null;
        icon = value.meta.icon || null;
        appearance = value.meta.appearance || null;
      }

      qx.manager.object.ColorManager.getInstance().setColorTheme(color);
      qx.manager.object.BorderManager.getInstance().setBorderTheme(border);
      qx.manager.object.ImageManager.getInstance().setWidgetTheme(widget);
      qx.manager.object.ImageManager.getInstance().setIconTheme(icon);
      qx.manager.object.AppearanceManager.getInstance().setAppearanceTheme(appearance);
    },

    /**
     * Initialize the themes which were selected using the settings. Should only
     * be called from qooxdoo based application.
     *
     * @type static
     */
    initialize : function()
    {
      var setting = qx.core.Setting;
      var theme, obj;

      theme = setting.get("qx.theme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The meta theme to use is not available: " + theme);
        }

        this.setTheme(obj);
      }

      theme = setting.get("qx.colorTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The color theme to use is not available: " + theme);
        }

        qx.manager.object.ColorManager.getInstance().setColorTheme(obj);
      }

      theme = setting.get("qx.borderTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The border theme to use is not available: " + theme);
        }

        qx.manager.object.BorderManager.getInstance().setBorderTheme(obj);
      }

      theme = setting.get("qx.widgetTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The widget theme to use is not available: " + theme);
        }

        qx.manager.object.ImageManager.getInstance().setWidgetTheme(obj);
      }

      theme = setting.get("qx.iconTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The icon theme to use is not available: " + theme);
        }

        qx.manager.object.ImageManager.getInstance().setIconTheme(obj);
      }

      theme = setting.get("qx.appearanceTheme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The appearance theme to use is not available: " + theme);
        }

        qx.manager.object.AppearanceManager.getInstance().setAppearanceTheme(obj);
      }
    },

    /**
     * Query the theme list to get all themes the given key
     *
     * @param key {String} the key to look for
     * @return {Theme[]} list of matching themes
     */
    __queryThemes : function(key)
    {
      var reg = qx.Theme.getAll();
      var theme;
      var list = [];

      for (var name in reg)
      {
        theme = reg[name];
        if (theme[key]) {
          list.push(theme);
        }
      }

      return list;
    },


    /**
     * Returns a list of all registered meta themes
     *
     * @type static
     * @return {Theme[]} list of meta themes
     */
    getMetaThemes : function() {
      return this.__queryThemes("meta");
    },


    /**
     * Returns a list of all registered color themes
     *
     * @type static
     * @return {Theme[]} list of color themes
     */
    getColorThemes : function() {
      return this.__queryThemes("colors");
    },


    /**
     * Returns a list of all registered color themes
     *
     * @type static
     * @return {Theme[]} list of color themes
     */
    getBorderThemes : function() {
      return this.__queryThemes("borders");
    },


    /**
     * Returns a list of all registered font themes
     *
     * @type static
     * @return {Theme[]} list of font themes
     */
    getFontThemes : function() {
      return this.__queryThemes("fonts");
    },


    /**
     * Returns a list of all registered color themes
     *
     * @type static
     * @return {Theme[]} list of color themes
     */
    getWidgetThemes : function() {
      return this.__queryThemes("widgets");
    },


    /**
     * Returns a list of all registered color themes
     *
     * @type static
     * @return {Theme[]} list of color themes
     */
    getIconThemes : function() {
      return this.__queryThemes("icons");
    },


    /**
     * Returns a list of all registered color themes
     *
     * @type static
     * @return {Theme[]} list of color themes
     */
    getAppearanceThemes : function() {
      return this.__queryThemes("appearance");
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings :
  {
    "qx.theme"           : "qx.theme.ClassicRoyale",
    "qx.colorTheme"      : null,
    "qx.borderTheme"     : null,
    "qx.widgetTheme"     : null,
    "qx.appearanceTheme" : null,
    "qx.iconTheme"       : null
  }
});
